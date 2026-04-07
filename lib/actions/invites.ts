'use server';

import { prisma } from '@/lib/prisma';
import { InviteStatus, UserRole } from '@prisma/client';
import { createNotification } from '@/lib/actions/notifications';

/**
 * Create a team invite for a parent/viewer
 */
export async function createTeamInvite(data: {
  email: string;
  teamId: string;
  sentBy: string;
}) {
  try {
    // Check if invite already exists for this email and team
    const existingInvite = await prisma.invite.findFirst({
      where: {
        email: data.email,
        teamId: data.teamId,
        status: InviteStatus.pending,
      },
    });

    if (existingInvite) {
      return { success: false, error: 'An invite already exists for this email and team' };
    }

    // Create the invite with a unique token
    const invite = await prisma.invite.create({
      data: {
        email: data.email,
        teamId: data.teamId,
        sentBy: data.sentBy,
        role: UserRole.parent, // Always invite as parent role
        isAdmin: false,
        status: InviteStatus.pending,
      },
      include: {
        team: true,
        sentByUser: true,
      },
    });

    // Check if the invited user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    // If user exists, create an INVITE_PENDING notification for them
    if (existingUser) {
      await createNotification({
        userId: existingUser.id,
        teamId: data.teamId,
        type: 'INVITE_PENDING',
        message: `${invite.sentByUser.firstName} ${invite.sentByUser.lastName} invited you to join ${invite.team.name}`,
      });
    }

    // In production, this would send an actual email
    // For now, we'll just return the invite link
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://flagfooty.app'}/join?token=${invite.token}`;

    // TODO: Send email using a service like SendGrid, Resend, or Postmark
    // await sendInviteEmail({
    //   to: invite.email,
    //   inviteLink,
    //   teamName: invite.team.name,
    //   inviterName: `${invite.sentByUser.firstName} ${invite.sentByUser.lastName}`,
    // });

    return {
      success: true,
      invite: {
        id: invite.id,
        email: invite.email,
        token: invite.token,
        inviteLink,
        teamName: invite.team.name,
      },
    };
  } catch (error) {
    console.error('Error creating invite:', error);
    return { success: false, error: 'Failed to create invite' };
  }
}

/**
 * Get invite by token
 */
export async function getInviteByToken(token: string) {
  try {
    const invite = await prisma.invite.findUnique({
      where: { token },
      include: {
        team: true,
        sentByUser: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!invite) {
      return { success: false, error: 'Invite not found' };
    }

    if (invite.status !== InviteStatus.pending) {
      return { success: false, error: 'This invite has already been used or expired' };
    }

    return { success: true, invite };
  } catch (error) {
    console.error('Error fetching invite:', error);
    return { success: false, error: 'Failed to fetch invite' };
  }
}

/**
 * Accept an invite and create team membership
 */
export async function acceptInvite(data: {
  token: string;
  userId: string;
}) {
  try {
    // Get the invite
    const invite = await prisma.invite.findUnique({
      where: { token: data.token },
      include: {
        team: true,
        sentByUser: true,
      },
    });

    if (!invite) {
      return { success: false, error: 'Invite not found' };
    }

    if (invite.status !== InviteStatus.pending) {
      return { success: false, error: 'This invite has already been used or expired' };
    }

    // Get the accepting user's info
    const acceptingUser = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    // Create team membership with VIEWER role
    const membership = await prisma.teamMembership.create({
      data: {
        userId: data.userId,
        teamId: invite.teamId,
        role: 'VIEWER',
      },
    });

    // Update invite status
    await prisma.invite.update({
      where: { id: invite.id },
      data: { status: InviteStatus.accepted },
    });

    // Create notification for the inviting coach
    if (acceptingUser) {
      await createNotification({
        userId: invite.sentBy,
        teamId: invite.teamId,
        type: 'INVITE_ACCEPTED',
        message: `${acceptingUser.firstName} ${acceptingUser.lastName} accepted your invite to join ${invite.team.name}`,
      });
    }

    return {
      success: true,
      membership,
      team: invite.team,
    };
  } catch (error) {
    console.error('Error accepting invite:', error);
    return { success: false, error: 'Failed to accept invite' };
  }
}

/**
 * Get all pending invites for a team
 */
export async function getTeamInvites(teamId: string) {
  try {
    const invites = await prisma.invite.findMany({
      where: {
        teamId,
        status: InviteStatus.pending,
      },
      include: {
        sentByUser: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        sentAt: 'desc',
      },
    });

    return { success: true, invites };
  } catch (error) {
    console.error('Error fetching team invites:', error);
    return { success: false, error: 'Failed to fetch invites' };
  }
}

/**
 * Cancel/delete a pending invite
 */
export async function cancelInvite(inviteId: string) {
  try {
    await prisma.invite.delete({
      where: { id: inviteId },
    });

    return { success: true };
  } catch (error) {
    console.error('Error canceling invite:', error);
    return { success: false, error: 'Failed to cancel invite' };
  }
}

/**
 * Mock email sending function (to be replaced with real email service)
 */
async function sendInviteEmail(data: {
  to: string;
  inviteLink: string;
  teamName: string;
  inviterName: string;
}) {
  // This is a placeholder for actual email sending
  console.log('Sending invite email:', {
    to: data.to,
    subject: 'You\'ve Been Invited to Join a Team on FlagFooty 🏈',
    body: `Hey Coach!\n\n${data.inviterName} has invited you to join ${data.teamName} on FlagFooty — the free platform for managing flag football teams like a pro.\n\nClick the link below to create your account and join the team:\n${data.inviteLink}\n\nSee you on the sideline! 🏆\n— FlagFooty | www.flagfooty.app`,
  });

  // In production, use a service like:
  // - Resend: https://resend.com
  // - SendGrid: https://sendgrid.com
  // - Postmark: https://postmarkapp.com
  // - AWS SES: https://aws.amazon.com/ses/

  return { success: true };
}
