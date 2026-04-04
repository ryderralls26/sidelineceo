# Parent/Viewer System - Quick Start Guide

## 🚀 Your App is Running!

**Access URL**: http://localhost:3000

## Quick Test Flow

### Step 1: Login as Coach
1. Go to http://localhost:3000/login
2. Use the default coach account:
   - Email: `coach@example.com`
   - Password: `coach123`

### Step 2: Create a Team (if needed)
1. Navigate to Coach Dashboard
2. Click "Set Up a Team"
3. Fill in team details
4. Create team

### Step 3: Invite a Parent
1. On any team card, click the **UserPlus icon** (Invite Parent)
2. Enter parent email: `parent@example.com`
3. Click "Send Invite"
4. **Copy the invite link** from the modal

### Step 4: Accept Invite as Parent
1. **Open the invite link** in a new browser window/incognito
2. You'll see the join page with team details
3. Click "Create one" to sign up
4. Fill in:
   - First Name: John
   - Last Name: Doe
   - Email: parent@example.com (pre-filled)
   - Password: password123
5. Click "Create Account & Join Team"

### Step 5: View as Parent
1. You'll be redirected to the dashboard
2. See the team under "Teams I'm Viewing" with VIEWER badge
3. Click the team to access:
   - **Roster**: Names and jersey numbers only
   - **Schedule**: Upcoming and completed games
   - **Archive**: Finalized games with print button

## Key Routes

### Coach Routes
- `/coach-dashboard` - Manage teams and invite parents
- `/roster?teamId=xxx` - Full roster management (coach)
- `/schedule?teamId=xxx` - Full schedule management (coach)

### Parent Routes (Read-Only)
- `/dashboard` - Unified dashboard showing linked teams
- `/teams/[teamId]/roster` - View roster (names/jerseys only)
- `/teams/[teamId]/schedule` - View schedule
- `/teams/[teamId]/archive` - View archived games + print

### Public Routes
- `/join?token=xxx` - Accept team invite

## Features to Test

### Coach Features
- ✅ Create/manage multiple teams
- ✅ Invite parents to specific teams
- ✅ Copy invite links
- ✅ See pending invites
- ✅ Full roster/schedule/archive management

### Parent Features
- ✅ Accept invites via unique link
- ✅ Sign up or login
- ✅ View multiple teams from different coaches
- ✅ Read-only roster (limited data)
- ✅ Read-only schedule
- ✅ Print game cards from archive
- ✅ Cannot access coach-only features

### Security Features
- ✅ Access control on all parent pages
- ✅ Role-based routing
- ✅ Data scoping per team
- ✅ Unique invite tokens
- ✅ Invite status tracking (pending/accepted)

## Database Setup (For Production)

When ready to deploy, you need to:

1. **Set up Vercel Postgres** (or any PostgreSQL database)
2. **Update `.env.local`** with real database credentials
3. **Run migration**:
   ```bash
   npx prisma migrate dev --name add_team_invite_tokens
   ```

## Email Integration (Optional Enhancement)

Currently, invite links are displayed in the modal for manual sharing.

To send automated emails, edit `lib/actions/invites.ts` and integrate:
- Resend
- SendGrid
- Postmark
- AWS SES

The `sendInviteEmail()` function is already structured—just add your API key and email sending logic.

## Troubleshooting

### Issue: Access Denied on Parent Views
- **Cause**: User doesn't have VIEWER membership for that team
- **Fix**: Make sure invite was accepted and membership was created

### Issue: Invite Link Not Working
- **Cause**: Token might be invalid or already used
- **Fix**: Create a new invite; each token can only be used once

### Issue: Can't See Teams on Dashboard
- **Cause**: No team memberships exist for the user
- **Fix**: Accept an invite or create a team (for coaches)

## Architecture Overview

```
Coach                          Parent
  │                              │
  ├─> Create Team                │
  ├─> Invite Parent ──[token]──> │
  │                              ├─> Accept Invite
  │                              ├─> Create VIEWER Membership
  │                              │
  │                              ├─> View Dashboard
  │                              ├─> Click Team
  │                              │
  │                              └─> Access Read-Only Views
  │                                  ├─> Roster (limited)
  │                                  ├─> Schedule
  │                                  └─> Archive + Print
```

## Next Steps

1. ✅ Test the complete invite flow
2. ✅ Verify access control works
3. ✅ Test with multiple teams
4. ✅ Test print functionality
5. 🔄 Deploy to Vercel (production)
6. 🔄 Configure real database
7. 🔄 Add email integration (optional)
8. 🔄 Invite real parents!

## Support

For issues or questions:
- Check the implementation document: `PARENT_VIEWER_SYSTEM_IMPLEMENTATION.md`
- Review the main README: `README.md`
- Check Prisma schema: `prisma/schema.prisma`

---

**Status**: ✅ Development server running on http://localhost:3000

Enjoy testing the Parent/Viewer system! 🎉
