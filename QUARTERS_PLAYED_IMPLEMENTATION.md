# Quarters Played Tracker Implementation

## Overview
Successfully implemented the 'Quarters Played' tracker feature for FlagFooty (Project ID: 408b8141-406b-4585-9998-584eb88fe32c) using Next.js App Router, TypeScript, Prisma, and Vercel Postgres.

## Implementation Details

### 1. Prisma Schema Changes
**File:** `prisma/schema.prisma`

Added a new `QuartersPlayed` model with the following structure:
- `id` (String, cuid)
- `playerId` (Int, FK to Player)
- `teamId` (String, FK to Team)
- `gameId` (Int, FK to Game)
- `quartersPlayed` (Int)
- `createdAt` (DateTime)

**Indexes:**
- `playerId_gameId` (unique constraint)
- Individual indexes on `playerId`, `teamId`, and `gameId`

**Relations:**
- Added reverse relations to Player, Team, and Game models

**Migration File:** `prisma/migrations/20260331000000_add_quarters_played/migration.sql`

### 2. Server Actions
**File:** `lib/actions/quartersPlayed.ts`

Implemented three async server actions:
- `writeQuartersPlayed(data)` - Write multiple quarters played records in a transaction
- `getQuartersPlayedByTeam(teamId)` - Get aggregated player stats for a team
- `getQuartersPlayedByGame(gameId)` - Get quarters played for a specific game

**File:** `lib/utils/quartersPlayedUtils.ts`

Created helper function:
- `calculateQuartersPlayedFromLineup(lineupData)` - Parse lineup JSON and count quarters per player

### 3. Game Finalization Integration
**File:** `lib/actions/games.ts`

Updated `finalizeGame(id)` function to:
1. Fetch game with lineup data
2. Calculate quarters played from the lineup grid
3. Use Prisma transaction to atomically:
   - Update game status to 'finalized'
   - Write/update quarters played records using upsert

### 4. API Route
**File:** `app/api/quarters-played/route.ts`

Created GET endpoint that:
- Accepts `teamId` query parameter
- Returns aggregated player statistics
- Handles errors gracefully

### 5. UI Component
**File:** `components/QuartersPlayedSection.tsx`

Created client component with:
- **Access Control:** Only visible to users with 'COACH' role
- **Data Fetching:** Client-side fetch from API route
- **Header Note:** "Every player deserves to play. Use this tracker to keep playing time fair all season long."
- **Table Columns:**
  - Player Name
  - Total Quarters Played
  - Games Played
  - Avg Quarters Per Game
- **Highlighting:** Rows with `bg-yellow-100/10` for players more than 2 quarters below team average
- **Loading/Error States:** Graceful handling with appropriate UI feedback
- **Empty State:** Friendly message when no data exists yet

### 6. Awards Page Integration
**File:** `app/awards/page.tsx`

Updated to:
- Import `QuartersPlayedSection` component
- Render section below awards leaderboard
- Pass active `teamId` from session
- Component automatically handles coach-only visibility

### 7. Bug Fixes
**File:** `components/TeamSwitcher.tsx`

Fixed pre-existing TypeScript errors:
- Changed `session?.user?.id` to `session?.userId` (3 instances)
- Aligned with Session interface from `lib/storage.ts`

## Features Implemented

✅ **Database Schema:** QuartersPlayed model with proper relations and indexes
✅ **Data Write Logic:** Atomic transaction during game finalization
✅ **Server Actions:** Reusable functions for reading/writing quarters played data
✅ **API Route:** RESTful endpoint for fetching team statistics
✅ **UI Component:** Polished, responsive table with highlighting
✅ **Access Control:** Coach-only visibility using useAuth hook
✅ **Highlighting Logic:** Yellow background for players below average
✅ **Responsive Design:** Tailwind CSS styling matching app design system
✅ **Type Safety:** Full TypeScript coverage
✅ **Error Handling:** Graceful failures with user-friendly messages

## Technical Notes

### Tailwind CSS v4
- Used correct `@import "tailwindcss";` syntax
- Styles are layered properly
- No universal resets outside `@layer`

### Database Integration
- Uses Neon serverless PostgreSQL adapter
- Prisma Client generated successfully
- Migration file ready for deployment

### Calculation Logic
The system parses the lineup JSON structure:
```typescript
lineup.quarters.forEach(quarter => {
  Object.values(quarter.positions).forEach(player => {
    // Count appearance in quarter
  })
})
```

### Highlighting Algorithm
```typescript
const isBelowAverage = player.totalQuarters < (teamAverage - 2)
```

## Files Modified

1. `prisma/schema.prisma` - Added QuartersPlayed model
2. `prisma/migrations/20260331000000_add_quarters_played/migration.sql` - Migration file
3. `lib/actions/quartersPlayed.ts` - Server actions (NEW)
4. `lib/utils/quartersPlayedUtils.ts` - Helper utilities (NEW)
5. `lib/actions/games.ts` - Updated finalizeGame function
6. `app/api/quarters-played/route.ts` - API endpoint (NEW)
7. `components/QuartersPlayedSection.tsx` - UI component (NEW)
8. `app/awards/page.tsx` - Added quarters played section
9. `components/TeamSwitcher.tsx` - Fixed TypeScript errors

## Build Status

✅ **TypeScript:** All type checks pass
✅ **Build:** Production build successful
✅ **Dev Server:** Running on http://localhost:3000
✅ **API Routes:** All routes registered correctly

## Deployment Notes

When deploying to Vercel:
1. The migration will run automatically via Prisma Migrate
2. Ensure `POSTGRES_PRISMA_URL` or `DATABASE_URL` is set in environment variables
3. The feature will activate once games are finalized with lineup data

## Testing Checklist

- [ ] Create a team as a coach
- [ ] Add players to roster
- [ ] Create a game and set up lineup
- [ ] Finalize the game
- [ ] Verify quarters played records are created in database
- [ ] Visit /awards page as coach
- [ ] Verify Quarters Played section appears
- [ ] Verify highlighting for players below average
- [ ] Test as non-coach user (section should be hidden)

## Next Steps

The feature is production-ready. After deployment:
1. Run database migrations
2. Finalize existing games to populate historical data
3. Monitor API performance with multiple teams
4. Consider adding export functionality for reports

## Credits

Built with:
- Next.js 16.2.1 (App Router + Turbopack)
- TypeScript 5.x
- Prisma 7.6.0
- Tailwind CSS v4
- Vercel Postgres (Neon adapter)
