/**
 * Unified Share & Email Templates for SidelineCEO
 *
 * Provides a centralized handleShare() function that uses:
 * - Native Web Share API on mobile devices (if available)
 * - Mailto fallback on desktop or when Web Share API is not supported
 */

export interface ShareConfig {
  type: 'referral' | 'newCoachInvite' | 'existingCoachInvite';
  coachName?: string;
  teamName?: string;
  inviteLink?: string;
}

/**
 * Email template configurations
 */
const EMAIL_TEMPLATES = {
  referral: {
    subject: 'Your Coaching Game Just Leveled Up 🏈',
    body: `Hey Coach!

I've been using SidelineCEO to manage my flag football team and it's an absolute game changer. We're talking easy rosters, fair play lineups, pro game cards, and tracking player awards — all in one place.

Stop drawing rosters up on napkins and get in the huddle!

👉 Check it out at www.sidelinemgmt.space — it's free to sign up.

See you on the field! 🏆
— Sent via SidelineCEO`,
  },
  newCoachInvite: {
    subject: "You've Been Invited to Join a Team on SidelineCEO 🏈",
    getBody: (coachName: string, teamName: string, inviteLink: string) =>
      `Hey Coach!

${coachName} has invited you to join ${teamName} on SidelineCEO — the free platform for managing flag football teams like a pro.

Click the link below to create your account and join the team:
${inviteLink}

See you on the sideline! 🏆
— SidelineCEO | www.sidelinemgmt.space`,
  },
  existingCoachInvite: {
    subject: '[Coach Name] Wants You on Their Team — SidelineCEO 🏈',
    getSubject: (coachName: string) => `${coachName} Wants You on Their Team — SidelineCEO 🏈`,
    getBody: (coachName: string, teamName: string) =>
      `Hey Coach!

${coachName} has invited you to join ${teamName} on SidelineCEO.

Log in to your account and check your Dashboard to accept or decline this invite:
👉 www.sidelinemgmt.space/login

See you on the sideline! 🏆
— SidelineCEO | www.sidelinemgmt.space`,
  },
};

/**
 * Share configuration for Web Share API (mobile)
 */
const WEB_SHARE_CONFIG = {
  title: 'SidelineCEO — The Coach\'s Playbook for Team Success',
  text: 'Stop drawing rosters up on napkins! Manage your flag football team like a CEO 🏈 Check out SidelineCEO — it\'s free!',
  url: 'https://www.sidelinemgmt.space',
};

/**
 * Main share handler that uses Web Share API with mailto fallback
 */
export async function handleShare(config: ShareConfig = { type: 'referral' }): Promise<void> {
  const { type, coachName, teamName, inviteLink } = config;

  // Try Web Share API first (mobile devices)
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: WEB_SHARE_CONFIG.title,
        text: WEB_SHARE_CONFIG.text,
        url: WEB_SHARE_CONFIG.url,
      });
      return;
    } catch (error) {
      // User cancelled or share failed, fall through to mailto
      if ((error as Error).name !== 'AbortError') {
        console.error('Web Share API error:', error);
      }
    }
  }

  // Fallback to mailto link
  let subject = '';
  let body = '';

  switch (type) {
    case 'referral':
      subject = EMAIL_TEMPLATES.referral.subject;
      body = EMAIL_TEMPLATES.referral.body;
      break;

    case 'newCoachInvite':
      if (!coachName || !teamName || !inviteLink) {
        throw new Error('Missing required parameters for newCoachInvite');
      }
      subject = EMAIL_TEMPLATES.newCoachInvite.subject;
      body = EMAIL_TEMPLATES.newCoachInvite.getBody(coachName, teamName, inviteLink);
      break;

    case 'existingCoachInvite':
      if (!coachName || !teamName) {
        throw new Error('Missing required parameters for existingCoachInvite');
      }
      subject = EMAIL_TEMPLATES.existingCoachInvite.getSubject(coachName);
      body = EMAIL_TEMPLATES.existingCoachInvite.getBody(coachName, teamName);
      break;

    default:
      subject = EMAIL_TEMPLATES.referral.subject;
      body = EMAIL_TEMPLATES.referral.body;
  }

  const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  if (typeof window !== 'undefined') {
    window.location.href = mailtoLink;
  }
}

/**
 * Legacy helper for direct mailto links (for backwards compatibility)
 */
export function getMailtoLink(config: ShareConfig): string {
  const { type, coachName, teamName, inviteLink } = config;

  let subject = '';
  let body = '';

  switch (type) {
    case 'referral':
      subject = EMAIL_TEMPLATES.referral.subject;
      body = EMAIL_TEMPLATES.referral.body;
      break;

    case 'newCoachInvite':
      if (!coachName || !teamName || !inviteLink) {
        throw new Error('Missing required parameters for newCoachInvite');
      }
      subject = EMAIL_TEMPLATES.newCoachInvite.subject;
      body = EMAIL_TEMPLATES.newCoachInvite.getBody(coachName, teamName, inviteLink);
      break;

    case 'existingCoachInvite':
      if (!coachName || !teamName) {
        throw new Error('Missing required parameters for existingCoachInvite');
      }
      subject = EMAIL_TEMPLATES.existingCoachInvite.getSubject(coachName);
      body = EMAIL_TEMPLATES.existingCoachInvite.getBody(coachName, teamName);
      break;

    default:
      subject = EMAIL_TEMPLATES.referral.subject;
      body = EMAIL_TEMPLATES.referral.body;
  }

  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
