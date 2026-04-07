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
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://flagfooty.app'}/join?token=${invite.token}`;\n\n    // TODO: Send email using a service like SendGrid, Resend, or Postmark\n    // await sendInviteEmail({\n    //   to: invite.email,\n    //   inviteLink,\n    //   teamName: invite.team.name,\n    //   inviterName: `${invite.sentByUser.firstName} ${invite.sentByUser.lastName}`,\n    // });\n\n    return {\n      success: true,\n      invite: {\n        id: invite.id,\n        email: invite.email,\n        token: invite.token,\n        inviteLink,\n        teamName: invite.team.name,\n      },\n    };\n  } catch (error) {\n    console.error('Error creating invite:', error);\n    return { success: false, error: 'Failed to create invite' };\n  }\n}\n\n/**\n * Get invite by token\n */\nexport async function getInviteByToken(token: string) {\n  try {\n    const invite = await prisma.invite.findUnique({\n      where: { token },\n      include: {\n        team: true,\n        sentByUser: {\n          select: {\n            firstName: true,\n            lastName: true,\n            email: true,\n          },\n        },\n      },\n    });\n\n    if (!invite) {\n      return { success: false, error: 'Invite not found' };\n    }\n\n    if (invite.status !== InviteStatus.pending) {\n      return { success: false, error: 'This invite has already been used or expired' };\n    }\n\n    return { success: true, invite };\n  } catch (error) {\n    console.error('Error fetching invite:', error);\n    return { success: false, error: 'Failed to fetch invite' };\n  }\n}\n\n/**\n * Accept an invite and create team membership\n */\nexport async function acceptInvite(data: {\n  token: string;\n  userId: string;\n}) {\n  try {\n    // Get the invite\n    const invite = await prisma.invite.findUnique({\n      where: { token: data.token },\n      include: {\n        team: true,\n        sentByUser: true,\n      },\n    });\n\n    if (!invite) {\n      return { success: false, error: 'Invite not found' };\n    }\n\n    if (invite.status !== InviteStatus.pending) {\n      return { success: false, error: 'This invite has already been used or expired' };\n    }\n\n    // Get the accepting user's info\n    const acceptingUser = await prisma.user.findUnique({\n      where: { id: data.userId },\n    });\n\n    // Create team membership with VIEWER role\n    const membership = await prisma.teamMembership.create({\n      data: {\n        userId: data.userId,\n        teamId: invite.teamId,\n        role: 'VIEWER',\n      },\n    });\n\n    // Update invite status\n    await prisma.invite.update({\n      where: { id: invite.id },\n      data: { status: InviteStatus.accepted },\n    });\n\n    // Create notification for the inviting coach\n    if (acceptingUser) {\n      await createNotification({\n        userId: invite.sentBy,\n        teamId: invite.teamId,\n        type: 'INVITE_ACCEPTED',\n        message: `${acceptingUser.firstName} ${acceptingUser.lastName} accepted your invite to join ${invite.team.name}`,\n      });\n    }\n\n    return {\n      success: true,\n      membership,\n      team: invite.team,\n    };\n  } catch (error) {\n    console.error('Error accepting invite:', error);\n    return { success: false, error: 'Failed to accept invite' };\n  }\n}\n\n/**\n * Get all pending invites for a team\n */\nexport async function getTeamInvites(teamId: string) {\n  try {\n    const invites = await prisma.invite.findMany({\n      where: {\n        teamId,\n        status: InviteStatus.pending,\n      },\n      include: {\n        sentByUser: {\n          select: {\n            firstName: true,\n            lastName: true,\n          },\n        },\n      },\n      orderBy: {\n        sentAt: 'desc', \n      },\n    });\n\n    return { success: true, invites };\n  } catch (error) {\n    console.error('Error fetching team invites:', error);\n    return { success: false, error: 'Failed to fetch invites' };\n  }\n}\n\n/**\n * Cancel/delete a pending invite\n */\nexport async function cancelInvite(inviteId: string) {\n  try {\n    await prisma.invite.delete({\n      where: { id: inviteId },\n    });\n\n    return { success: true };\n  } catch (error) {\n    console.error('Error canceling invite:', error);\n    return { success: false, error: 'Failed to cancel invite' };\n  }\n}\n\n/**\n * Mock email sending function (to be replaced with real email service)\n */\nasync function sendInviteEmail(data: {\n  to: string;\n  inviteLink: string;\n  teamName: string;\n  inviterName: string;\n}) {\n  // This is a placeholder for actual email sending\n  console.log('Sending invite email:', {\n    to: data.to,\n    subject: 'You\\'ve Been Invited to Join a Team on FlagFooty 🏈',\n    body: `Hey Coach!\n\n${data.inviterName} has invited you to join ${data.teamName} on FlagFooty — the free platform for managing flag football teams like a pro.\n\nClick the link below to create your account and join the team:\n${data.inviteLink}\n\nSee you on the sideline! 🏆\n— FlagFooty | www.flagfooty.app`,\n  });\n\n  // In production, use a service like:\n  // - Resend: https://resend.com\n  // - SendGrid: https://sendgrid.com\n  // - Postmark: https://postmarkapp.com\n  // - AWS SES: https://aws.amazon.com/ses/\n\n  return { success: true };\n}\n