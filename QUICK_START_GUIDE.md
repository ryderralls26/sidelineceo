# FlagFooty - Quick Start Guide

## Access the Application

The application is now running at: **http://localhost:3000**

## Quick Feature Overview

### 1. Authentication System
- **Sign Up**: `/signup` - Create an account (Coach, Parent, or Player)
- **Login**: `/login` - Sign in with your credentials
- **Password Reset**: `/reset-password` - Reset forgotten password

### 2. User Roles

| Role | Permissions |
|------|------------|
| Coach | Full access - edit everything, manage team, assign awards |
| Parent (Admin) | Can edit team data, view all info |
| Parent (Standard) | Read-only access |
| Player | Read-only access |

### 3. New Features

#### MVP Awards System
1. Go to **Schedule** page
2. Click **MVP** button on any game
3. Select a player by clicking their card (star turns yellow)
4. Choose award type (MVP, Defensive POYG, Offensive POYG)
5. Add notes (optional)
6. Click **Award Player**
7. View all awards in the **Awards** tab

#### Dashboard (Coach Only)
- **Team Invites**: Send email invites to parents/players
- **Awards Management**: Create custom award types
- **Quick Stats**: View team overview

### 4. Getting Started

#### First Time Setup
1. Visit http://localhost:3000
2. Click **Sign In** → **Sign up**
3. Fill in your details:
   - First Name: John
   - Last Name: Doe
   - Email: coach@example.com
   - Password: password123
   - Role: **Coach (Full Access)**
4. Click **Create Account**
5. You're automatically logged in and redirected to the Roster page

#### Add Players
1. Navigate to **Roster**
2. Click **Add Player**
3. Fill in player details
4. Click **Save Changes**

#### Create Games
1. Navigate to **Schedule**
2. Click **Add Game**
3. Enter game details
4. Click **Add Game**

#### Award Players
1. Go to **Schedule**
2. Find a game
3. Click **MVP** button
4. Select player and award type
5. Submit

#### Invite Team Members
1. Go to **Dashboard**
2. Click **Invite Member**
3. Enter email and select role
4. For parents, optionally grant admin access
5. Click **Send Invite**

#### Customize Awards
1. Go to **Dashboard**
2. Scroll to **Awards Management**
3. Click **Add Award Type**
4. Enter award name (e.g., "Best Sportsmanship")
5. Add description (optional)
6. Click **Add Award**

### 5. Navigation

#### Main Menu
- **Home**: Landing page
- **Roster**: Manage players
- **Schedule**: View and manage games
- **Positions**: Configure position types
- **Awards**: View all player awards
- **Archive**: View finalized games
- **Dashboard**: Team management (requires login)

### 6. Testing Different Roles

Create multiple accounts to test role-based permissions:

**Coach Account**
```
Email: coach@test.com
Password: password123
Role: Coach
Result: Full access to everything
```

**Parent Admin Account**
```
Email: parentadmin@test.com
Password: password123
Role: Parent
Admin: ✓ Checked
Result: Can edit team data
```

**Parent Standard Account**
```
Email: parent@test.com
Password: password123
Role: Parent
Admin: ✗ Unchecked
Result: Read-only access
```

**Player Account**
```
Email: player@test.com
Password: password123
Role: Player
Result: Read-only access
```

### 7. Key Features by Page

#### /roster
- View all players
- Add/edit/delete players (Coach only)
- Configure positions
- Preview game cards

#### /schedule
- View season schedule
- Add/edit/delete games (Coach only)
- **NEW**: Award MVP to players
- Generate lineups
- Finalize games

#### /awards
- View all awards history
- Filter by award type
- See player names and game details
- Delete awards (Coach only)

#### /dashboard
- View team statistics
- Send team invites (Coach only)
- Manage award types (Coach only)
- Quick access to all features

### 8. Data Persistence

All data is stored in browser localStorage:
- User accounts
- Sessions
- Games
- Awards
- Invites
- Roster
- Positions

**Note**: Data persists in your browser. Clear browser data to reset.

### 9. Password Reset Flow

1. Click **Forgot password?** on login page
2. Enter your email
3. View simulated email with reset link
4. Click the link (or copy/paste into browser)
5. Enter new password
6. Confirm password
7. Click **Reset Password**
8. Redirected to login

### 10. Troubleshooting

**Can't edit anything?**
- Check your role in Dashboard
- Only Coach and Parent (Admin) can edit

**Don't see MVP button?**
- Make sure you're logged in
- Only visible for non-finalized games

**Invite not showing up?**
- Check Dashboard → Team Invites section
- Only coaches can send invites

**Awards not appearing?**
- Go to Awards page
- Awards must be assigned from Schedule page first

## Development

**Running the server:**
```bash
npm run dev
```

**Building for production:**
```bash
npm run build
npm start
```

## What's Next?

- Explore all pages
- Create test accounts with different roles
- Add players to your roster
- Schedule some games
- Award MVPs to your players
- Invite team members
- Customize award types

Enjoy managing your FlagFooty team!
