/**
 * Unified Share & Email Templates for FlagFooty
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
    body: `Hey Coach!\n\nI've been using FlagFooty to manage my flag football team and it's an absolute game changer. We're talking easy rosters, fair play lineups, pro game cards, and tracking player awards — all in one place.\n\nStop drawing rosters up on napkins and get in the huddle!\n\n👉 Check it out at www.flagfooty.app — it's free to sign up.\n\nSee you on the field! 🏆\n— Sent via FlagFooty`,
  },
  newCoachInvite: {
    subject: \"You've Been Invited to Join a Team on FlagFooty 🏈\",
    getBody: (coachName: string, teamName: string, inviteLink: string) =>
      `Hey Coach!\n\n${coachName} has invited you to join ${teamName} on FlagFooty — the free platform for managing flag football teams like a pro.\n\nClick the link below to create your account and join the team:\n${inviteLink}\n\nSee you on the sideline! 🏆\n— FlagFooty | www.flagfooty.app`,
  },
  existingCoachInvite: {
    subject: '[Coach Name] Wants You on Their Team — FlagFooty 🏈',
    getSubject: (coachName: string) => `${coachName} Wants You on Their Team — FlagFooty 🏈`,
    getBody: (coachName: string, teamName: string) =>
      `Hey Coach!\n\n${coachName} has invited you to join ${teamName} on FlagFooty.\n\nLog in to your account and check your Dashboard to accept or decline this invite:\n👉 www.flagfooty.app/login\n\nSee you on the sideline! 🏆\n— FlagFooty | www.flagfooty.app`,
  },
};

/**
 * Share configuration for Web Share API (mobile)
 */
const WEB_SHARE_CONFIG = {
  title: 'FlagFooty — The Coach\\'s Playbook for Team Success',
  text: 'Stop drawing rosters up on napkins! Manage your flag football team like a CEO 🏈 Check out FlagFooty — it\\'s free!',
  url: 'https://www.flagfooty.app',
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
    } catch (error) {\n      // User cancelled or share failed, fall through to mailto\n      if ((error as Error).name !== 'AbortError') {\n        console.error('Web Share API error:', error);\n      }\n    }\n  }\n\n  // Fallback to mailto link\n  let subject = '';\n  let body = '';\n\n  switch (type) {\n    case 'referral':\n      subject = EMAIL_TEMPLATES.referral.subject;\n      body = EMAIL_TEMPLATES.referral.body;\n      break;\n\n    case 'newCoachInvite':\n      if (!coachName || !teamName || !inviteLink) {\n        throw new Error('Missing required parameters for newCoachInvite');\n      }\n      subject = EMAIL_TEMPLATES.newCoachInvite.subject;\n      body = EMAIL_TEMPLATES.newCoachInvite.getBody(coachName, teamName, inviteLink);\n      break;\n\n    case 'existingCoachInvite':\n      if (!coachName || !teamName) {\n        throw new Error('Missing required parameters for existingCoachInvite');\n      }\n      subject = EMAIL_TEMPLATES.existingCoachInvite.getSubject(coachName);\n      body = EMAIL_TEMPLATES.existingCoachInvite.getBody(coachName, teamName);\n      break;\n\n    default:\n      subject = EMAIL_TEMPLATES.referral.subject;\n      body = EMAIL_TEMPLATES.referral.body;\n  }\n\n  const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;\n\n  if (typeof window !== 'undefined') {\n    window.location.href = mailtoLink;\n  }\n}\n\n/**\n * Legacy helper for direct mailto links (for backwards compatibility)\n */\nexport function getMailtoLink(config: ShareConfig): string {\n  const { type, coachName, teamName, inviteLink } = config;\n\n  let subject = '';\n  let body = '';\n\n  switch (type) {\n    case 'referral':\n      subject = EMAIL_TEMPLATES.referral.subject;\n      body = EMAIL_TEMPLATES.referral.body;\n      break;\n\n    case 'newCoachInvite':\n      if (!coachName || !teamName || !inviteLink) {\n        throw new Error('Missing required parameters for newCoachInvite');\n      }\n      subject = EMAIL_TEMPLATES.newCoachInvite.subject;\n      body = EMAIL_TEMPLATES.newCoachInvite.getBody(coachName, teamName, inviteLink);\n      break;\n\n    case 'existingCoachInvite':\n      if (!coachName || !teamName) {\n        throw new Error('Missing required parameters for existingCoachInvite');\n      }\n      subject = EMAIL_TEMPLATES.existingCoachInvite.getSubject(coachName);\n      body = EMAIL_TEMPLATES.existingCoachInvite.getBody(coachName, teamName);\n      break;\n\n    default:\n      subject = EMAIL_TEMPLATES.referral.subject;\n      body = EMAIL_TEMPLATES.referral.body;\n  }\n\n  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;\n}\n