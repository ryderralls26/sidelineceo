# SidelineCEO Auth & MVP Awards System

## Overview
This document describes the authentication system and MVP awards functionality added to SidelineCEO.

## Features Implemented

### 1. Authentication System

#### User Roles
- **Coach**: Full access to all features (edit, delete, manage)
- **Parent**: Read-only access by default, with optional Admin privileges
- **Player**: Read-only access to view team information

#### Auth Pages
- `/login` - Sign in with email and password
- `/signup` - Create new account with role selection
- `/reset-password` - Request password reset link
- `/reset-password/confirm` - Reset password with token

#### Session Management
- Client-side session storage using localStorage
- `AuthContext` provides authentication state throughout the app
- `useAuth()` hook for accessing current user and permissions

### 2. MVP & Awards System

#### Awards Page (`/awards`)
- View all awards given throughout the season
- Filter by award type (MVP, Defensive POYG, Offensive POYG, etc.)
- Display player names, game details, and award notes
- Delete awards (Coach only)

#### MVP Award Modal (Schedule Page)
- Click "MVP" button on any game card
- Select player from roster
- Choose award type from customizable list
- Add optional notes explaining the award
- Awards are stored and viewable in the Awards tab

#### Awards Management (Dashboard)
- Customize available award types
- Add new award categories
- Delete existing award types
- Default awards: MVP, Defensive POYG, Offensive POYG

### 3. Dashboard (`/dashboard`)

#### Quick Stats
- Team member count
- Total games
- Awards given

#### Coach Features
- **Team Invites**: Send email invites to parents and players
  - Specify role (Parent/Player)
  - Grant admin access to parents
  - View pending invites
  - Delete invites
- **Awards Management**: Create and manage award types

### 4. Role-Based Permissions

#### Read-Only Restrictions
- Parent and Player roles cannot:
  - Edit roster
  - Add/edit/delete games
  - Finalize games
  - Delete awards
  - Save position changes

#### Can Edit Permission
- Coaches: Always can edit
- Parents with Admin: Can edit
- Parents without Admin: Read-only
- Players: Read-only

### 5. Navigation Updates
- Unified navigation component (`Navigation.tsx`)
- Role-based visibility for action buttons
- Dashboard link for authenticated users
- Logout functionality

## Data Storage Structure

### StorageManager Methods

#### Users
- `getAllUsers()` - Get all registered users
- `getUserByEmail(email)` - Find user by email
- `getUserById(id)` - Find user by ID
- `createUser(user)` - Register new user
- `updateUser(userId, updates)` - Update user data

#### Sessions
- `getCurrentSession()` - Get active session
- `setSession(session)` - Create session
- `clearSession()` - Logout

#### Invites
- `getAllInvites()` - Get all team invites
- `createInvite(invite)` - Send new invite
- `updateInvite(id, updates)` - Update invite status
- `deleteInvite(id)` - Remove invite

#### Awards
- `getAllAwards()` - Get all awards
- `getAwardsByGameId(gameId)` - Awards for specific game
- `getAwardsByPlayerId(playerId)` - Awards for specific player
- `createAward(award)` - Give award
- `deleteAward(awardId)` - Remove award

#### Award Types
- `getAwardTypes()` - Get customizable award types
- `saveAwardTypes(types)` - Update award types

#### Password Reset
- `createResetToken(email)` - Generate reset token
- `getResetToken(token)` - Validate token
- `deleteResetToken(token)` - Invalidate token

## Component Architecture

### Core Components
- `AuthContext` - Authentication state provider
- `Navigation` - Role-aware navigation bar
- `MVPModal` - Award assignment interface

### Key Hooks
- `useAuth()` - Access authentication state
  - `session` - Current user session
  - `isAuthenticated` - Login status
  - `isCoach`, `isParent`, `isPlayer` - Role checks
  - `canEdit` - Permission check
  - `login()`, `logout()`, `signup()` - Auth actions

## Usage Examples

### Checking Permissions
```typescript
const { canEdit, isCoach } = useAuth();

// Show button only for users with edit permissions
{canEdit && (
  <button onClick={handleSave}>Save</button>
)}

// Coach-only feature
{isCoach && (
  <button onClick={handleInvite}>Invite Team</button>
)}
```

### Awarding Players
1. Navigate to Schedule page
2. Click "MVP" button on any game
3. Select player from roster grid
4. Choose award type
5. Add optional notes
6. Submit award

### Managing Team
1. Sign up as Coach
2. Go to Dashboard
3. Click "Invite Member"
4. Enter email and select role
5. For parents, optionally grant admin access
6. Invite sent (simulated email shown)

### Customizing Awards
1. Navigate to Dashboard
2. Scroll to "Awards Management"
3. Click "Add Award Type"
4. Enter award name and description
5. Award now available in MVP modal

## Security Notes

**IMPORTANT**: This implementation uses client-side localStorage for demonstration purposes. In a production environment:

1. Use server-side authentication (NextAuth.js, Clerk, Auth0)
2. Hash passwords with bcrypt
3. Implement JWT tokens or secure sessions
4. Add API routes for data operations
5. Use a real database (PostgreSQL, MongoDB)
6. Send actual emails for password reset
7. Implement proper CSRF protection
8. Add rate limiting for auth endpoints

## Testing the System

### Test Accounts (Create via Signup)
1. **Coach Account**
   - Sign up with role "Coach"
   - Full access to all features

2. **Parent (Admin) Account**
   - Sign up with role "Parent"
   - Check "Grant Admin Access"
   - Can edit team data

3. **Parent (Read-only) Account**
   - Sign up with role "Parent"
   - Leave admin unchecked
   - View-only access

4. **Player Account**
   - Sign up with role "Player"
   - View-only access

### Testing Flow
1. Create a Coach account
2. Add players to roster
3. Create games in schedule
4. Award MVP to a player
5. View awards in Awards tab
6. Invite team members
7. Customize award types

## File Structure

```
app/
├── app/
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── reset-password/
│   │   ├── page.tsx
│   │   └── confirm/page.tsx
│   ├── dashboard/page.tsx
│   ├── awards/page.tsx
│   └── schedule/page.tsx (updated)
├── components/
│   ├── Navigation.tsx (new)
│   └── MVPModal.tsx (new)
└── lib/
    ├── AuthContext.tsx (new)
    ├── storage.ts (extended)
    └── types.ts

```

## Next Steps for Production

1. Implement backend API
2. Add database integration
3. Set up email service (SendGrid, Mailgun)
4. Add OAuth providers (Google, Microsoft)
5. Implement team management (multiple teams per coach)
6. Add photo uploads for players
7. Export awards to PDF/CSV
8. Add analytics dashboard
9. Implement real-time updates
10. Mobile app version

## Support

For questions or issues, visit the SidelineCEO repository or contact the development team.
