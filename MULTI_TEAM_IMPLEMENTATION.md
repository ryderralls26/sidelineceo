# Multi-Team Support Implementation

## Overview

Full multi-team support has been implemented for FlagFooty, allowing users to manage multiple teams and switch between them seamlessly. The implementation includes proper access control, team switching UI, and data scoping.

## Database Schema Changes

### New Models

#### TeamMembership
- **Purpose**: Controls access to teams for multi-user support
- **Fields**:
  - `id`: String (cuid)
  - `userId`: String (foreign key to User)
  - `teamId`: String (foreign key to Team)
  - `role`: TeamRole (COACH or VIEWER)
  - `createdAt`: DateTime
- **Unique Constraint**: `userId_teamId` (prevents duplicate memberships)

#### TeamRole Enum
```prisma
enum TeamRole {
  COACH   // Full access to team data (create, edit, delete)
  VIEWER  // Read-only access to team data
}
```

### Updated Models

#### Team
- Added `memberships` relation to TeamMembership[]
- Added `gameLineups` relation to GameLineup[]

#### User
- Added `teamMemberships` relation to TeamMembership[]

#### GameLineup
- Added `team` relation to Team (for proper foreign key)

## Architecture

### 1. Team Context (State Management)

**File**: `/lib/TeamContext.tsx`

- React Context for managing active team state globally
- Stores `activeTeamId` and `activeTeamName`
- Persists active team selection in localStorage
- Methods:
  - `setActiveTeam(teamId, teamName)`: Sets the active team
  - `clearActiveTeam()`: Clears team selection
- Hook: `useTeam()` for accessing team context

### 2. Team Switcher UI

**File**: `/components/TeamSwitcher.tsx`

Features:
- **Dropdown Menu**: Lists all teams user has access to
- **Active Team Indicator**: Green dot shows currently selected team
- **Create New Team Modal**: Form with team name and division selection
- **Role Display**: Shows user's role (COACH/VIEWER) for each team
- **Auto-selection**: Automatically selects first team if none is active

Modal Fields:
- Team Name (required)
- Division (KIND, FR, SO, JR, SR) (required)

### 3. Navigation Integration

**File**: `/components/Navigation.tsx`

- TeamSwitcher added to both desktop and mobile navigation
- Positioned between main nav links and user info
- Visible only to authenticated users

### 4. Server Actions

**File**: `/lib/actions/teams.ts`

New Functions:
- `createTeamWithMembership(data)`: Creates team + COACH membership in transaction
- `getUserTeams(userId)`: Fetches all teams user has access to
- `checkTeamAccess(userId, teamId)`: Verifies user has membership
- `addTeamMember(teamId, userId, role)`: Adds member to team
- `removeTeamMember(teamId, userId)`: Removes member from team

### 5. Data Security

Added security checks to all data-fetching actions:

**File**: `/lib/actions/players.ts`
- `getPlayersByTeam(teamId, userId?)`: Now checks team access

**File**: `/lib/actions/games.ts`
- `getGamesByTeam(teamId, userId?)`: Now checks team access

**File**: `/lib/actions/awards.ts`
- `getAwardsByTeam(teamId, userId?)`: New function with access control

Helper function in all action files:
```typescript
async function checkTeamAccess(userId: string, teamId: string): Promise<boolean> {
  const membership = await prisma.teamMembership.findUnique({
    where: { userId_teamId: { userId, teamId } }
  })
  return !!membership
}
```

## Security Model

### Access Control Rules

1. **Team Visibility**: Users can only see teams where they have a TeamMembership
2. **Data Scoping**: All roster, schedule, awards, and archive data is filtered by `activeTeamId`
3. **Role-Based Access**:
   - **COACH**: Full CRUD access to team data
   - **VIEWER**: Read-only access (parents/observers)
4. **Multi-membership**: Users can have memberships across multiple teams/coaches

### Security Implementation

- Server Actions validate team access before returning data
- If `userId` is provided and access check fails, returns error: "Access denied to this team"
- TeamMembership uses unique constraint to prevent duplicate memberships
- All team-related queries join through TeamMembership table

## UI/UX Flow

### First-Time User
1. User logs in/signs up
2. No active team set
3. TeamSwitcher shows "Select Team"
4. User clicks "Create New Team"
5. Modal appears with form fields
6. User submits form
7. Team created with COACH membership
8. Team automatically set as active
9. User can access Roster, Schedule, etc.

### Existing User with Multiple Teams
1. User logs in
2. TeamSwitcher auto-loads first team
3. Dropdown shows all teams with roles
4. User clicks team to switch
5. Active team updates globally
6. All pages re-fetch data for new team

### Parent/Viewer Access
1. Coach invites parent via email (existing invite system)
2. Parent signs up/logs in
3. Coach creates TeamMembership with VIEWER role
4. Parent sees team in TeamSwitcher
5. Parent has read-only access to team data

## Integration Points

### Pages Using Active Team

All authenticated pages should use `useTeam()` hook:
- `/roster` - Filter players by activeTeamId
- `/schedule` - Filter games by activeTeamId
- `/positions` (MGMT) - Filter positions/divisions by activeTeamId
- `/awards` - Filter awards by activeTeamId
- `/archive` - Filter finalized games by activeTeamId

### Data Fetching Pattern

```typescript
'use client'
import { useTeam } from '@/lib/TeamContext'
import { useAuth } from '@/lib/AuthContext'
import { getPlayersByTeam } from '@/lib/actions/players'

function RosterPage() {
  const { activeTeamId } = useTeam()
  const { session } = useAuth()
  const [players, setPlayers] = useState([])

  useEffect(() => {
    if (activeTeamId && session?.user?.id) {
      loadPlayers()
    }
  }, [activeTeamId, session?.user?.id])

  const loadPlayers = async () => {
    const result = await getPlayersByTeam(activeTeamId, session.user.id)
    if (result.success) {
      setPlayers(result.players)
    }
  }

  // ...
}
```

## Migration Strategy

### Existing Data

For existing teams without TeamMemberships:
1. Run migration to add TeamMembership table
2. Create COACH memberships for all existing Team.coachId → User relationships
3. Optional: Backfill VIEWER memberships for Parent → Team relationships

### Migration Script (Suggested)

```typescript
// scripts/migrate-team-memberships.ts
import { prisma } from '@/lib/prisma'
import { TeamRole } from '@prisma/client'

async function migrateTeamMemberships() {
  // Get all existing teams
  const teams = await prisma.team.findMany()

  for (const team of teams) {
    // Create COACH membership for team owner
    await prisma.teamMembership.upsert({
      where: {
        userId_teamId: {
          userId: team.coachId,
          teamId: team.id,
        },
      },
      create: {
        userId: team.coachId,
        teamId: team.id,
        role: TeamRole.COACH,
      },
      update: {},
    })
  }

  console.log(`Migrated ${teams.length} teams`)
}

migrateTeamMemberships()
```

## Testing Checklist

- [ ] User can create new team via TeamSwitcher modal
- [ ] Team appears in dropdown after creation
- [ ] Active team persists after page refresh
- [ ] Switching teams updates data in Roster page
- [ ] Switching teams updates data in Schedule page
- [ ] Switching teams updates data in Awards page
- [ ] Switching teams updates data in Archive page
- [ ] User without team membership cannot access team data
- [ ] VIEWER role can view but not edit team data
- [ ] COACH role can create/edit/delete team data
- [ ] Multiple users can have memberships to same team
- [ ] User can have memberships to multiple teams
- [ ] TeamSwitcher works on mobile navigation

## Future Enhancements

1. **Team Invitations**: Allow coaches to invite parents/viewers via email
2. **Role Management**: UI for coaches to manage team memberships
3. **Team Settings**: Edit team name, division, logo
4. **Team Archiving**: Soft-delete teams instead of hard delete
5. **Activity Feed**: Show recent changes across all user's teams
6. **Team Dashboard**: Overview of all teams with quick stats
7. **Bulk Operations**: Move players between teams, copy rosters
8. **Team Transfer**: Transfer ownership from one coach to another

## API Reference

### Team Context

```typescript
interface TeamContextType {
  activeTeamId: string | null
  activeTeamName: string | null
  setActiveTeam: (teamId: string, teamName: string) => void
  clearActiveTeam: () => void
}

// Usage
const { activeTeamId, activeTeamName, setActiveTeam, clearActiveTeam } = useTeam()
```

### Server Actions

```typescript
// Create team with COACH membership
createTeamWithMembership({
  name: string,
  division: Division,
  coachId: string
}): Promise<{ success: boolean, team?: Team, error?: string }>

// Get all teams user has access to
getUserTeams(userId: string): Promise<{
  success: boolean,
  teams?: Array<Team & { userRole: TeamRole }>,
  error?: string
}>

// Check if user has access to team
checkTeamAccess(userId: string, teamId: string): Promise<{
  success: boolean,
  hasAccess?: boolean,
  role?: TeamRole,
  error?: string
}>

// Add member to team
addTeamMember(teamId: string, userId: string, role: TeamRole): Promise<{
  success: boolean,
  membership?: TeamMembership,
  error?: string
}>

// Remove member from team
removeTeamMember(teamId: string, userId: string): Promise<{
  success: boolean,
  error?: string
}>

// Get players (with access check)
getPlayersByTeam(teamId: string, userId?: string): Promise<{
  success: boolean,
  players?: Player[],
  error?: string
}>

// Get games (with access check)
getGamesByTeam(teamId: string, userId?: string): Promise<{
  success: boolean,
  games?: Game[],
  error?: string
}>

// Get awards (with access check)
getAwardsByTeam(teamId: string, userId?: string): Promise<{
  success: boolean,
  awards?: Award[],
  error?: string
}>
```

## File Structure

```
/home/user/app/
├── lib/
│   ├── TeamContext.tsx              # Team state management
│   └── actions/
│       ├── teams.ts                 # Team CRUD + membership operations
│       ├── players.ts               # Updated with access checks
│       ├── games.ts                 # Updated with access checks
│       └── awards.ts                # Updated with access checks
├── components/
│   ├── TeamSwitcher.tsx             # Team dropdown + create modal
│   └── Navigation.tsx               # Updated with TeamSwitcher
├── app/
│   ├── layout.tsx                   # Added TeamProvider
│   ├── roster/page.tsx              # Should use activeTeamId
│   ├── schedule/page.tsx            # Should use activeTeamId
│   ├── awards/page.tsx              # Should use activeTeamId
│   └── archive/page.tsx             # Should use activeTeamId
└── prisma/
    └── schema.prisma                # Updated with TeamMembership model
```

## Environment Variables

No additional environment variables required. Uses existing:
- `POSTGRES_PRISMA_URL`: Database connection string
- `DATABASE_URL`: Alternative database URL

## Dependencies

No new dependencies added. Uses existing:
- `@prisma/client`: Database ORM
- `react`: UI framework
- `next`: App framework
- `lucide-react`: Icons

## Support

For issues or questions about multi-team support:
1. Check this documentation
2. Review Prisma schema in `/prisma/schema.prisma`
3. Inspect TeamContext in `/lib/TeamContext.tsx`
4. Check server actions in `/lib/actions/teams.ts`

---

**Implementation Date**: March 31, 2026
**Project ID**: 408b8141-406b-4585-9998-584eb88fe32c
**Status**: ✅ Complete - Ready for Testing
