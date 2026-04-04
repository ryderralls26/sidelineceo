# Database Migration Status

## ✅ Completed

### 1. Prisma Schema Setup
- ✅ Updated `prisma/schema.prisma` with all required models:
  - User (Coach)
  - Team
  - Season
  - Player (Master Roster)
  - Game (Schedule)
  - GameLineup (Game-specific roster snapshot)
  - Award, AwardType, Invite, Parent, VenmoRequest, etc.
- ✅ Configured Prisma 7 with `prisma.config.ts`
- ✅ Set up environment variables in `.env.local` for Vercel Postgres

### 2. Database Configuration
- ✅ Created `.env.local` with Vercel Postgres environment variables (placeholders)
- ✅ Generated Prisma Client successfully
- ✅ Created `/lib/prisma.ts` for singleton Prisma Client instance

### 3. Server Actions Created
- ✅ `/app/api/actions/teams.ts` - Full Team CRUD operations
- ✅ `/app/api/actions/players.ts` - Full Player CRUD operations
- ✅ `/app/api/actions/games.ts` - Full Game CRUD operations
- ✅ `/app/api/actions/lineups.ts` - GameLineup CRUD operations

### 4. UI Components Refactored
- ✅ Coach Dashboard refactored to use Server Actions
  - Now uses `getTeamsByCoach()`, `createTeam()`, `deleteTeam()`
  - Removed localStorage dependencies for team management
  - Created `/app/coach-dashboard/CoachDashboardClient.tsx`

## 🚧 In Progress / Next Steps

### 5. Roster Page Migration
The Roster page (`/app/roster/page.tsx`) needs to be refactored to:
- Use `getPlayersByTeam()` instead of `getRosterFromStorage()`
- Use `createPlayer()`, `updatePlayer()`, `bulkUpdatePlayers()` for mutations
- Use `deletePlayer()` for removing players
- Store coach data in database instead of localStorage

### 6. Schedule Page Migration
The Schedule page (`/app/schedule/page.tsx`) needs to be refactored to:
- Use `getGamesByTeam()` instead of `StorageManager.getAllGames()`
- Use `createGame()`, `updateGame()`, `deleteGame()` for mutations
- Use `finalizeGame()` and `createOrUpdateGameLineup()` for game finalization

### 7. Database Migration & Seeding
Before the app can run, you need to:

```bash
# 1. Update .env.local with real Vercel Postgres credentials
# Get these from: https://vercel.com/dashboard > Storage > Postgres

# 2. Run Prisma migrations
npx prisma migrate dev --name init

# 3. (Optional) Seed the database with initial data
npx prisma db seed
```

### 8. Additional Refactoring Needed
- **AuthContext**: Currently uses localStorage for session. Should use database-backed sessions or JWT.
- **Game Cards**: Print functionality still relies on localStorage snapshots.
- **Awards System**: Needs integration with database actions.
- **Positions Management**: Currently hardcoded, should be in database.

## 📋 Migration Checklist

- [x] Set up Prisma schema
- [x] Configure Vercel Postgres environment
- [x] Create Server Actions for CRUD
- [x] Refactor Coach Dashboard
- [ ] Refactor Roster Page
- [ ] Refactor Schedule Page
- [ ] Migrate Auth to database sessions
- [ ] Test all CRUD operations
- [ ] Run database migrations
- [ ] Deploy to Vercel

## 🔧 How to Complete the Migration

### Step 1: Get Vercel Postgres Credentials
1. Go to https://vercel.com/dashboard
2. Select your project or create a new one
3. Go to Storage > Postgres
4. Create a new Postgres database
5. Copy all the environment variables to `.env.local`

### Step 2: Run Database Migrations
```bash
npx prisma migrate dev --name init
```

This will create all tables in your Postgres database.

### Step 3: Refactor Remaining Pages
Use the Coach Dashboard as a template. Replace:
- `StorageManager.getAllX()` → `getXByTeam(teamId)`
- `StorageManager.createX()` → `createX(data)`
- `StorageManager.updateX()` → `updateX(id, data)`
- `localStorage.setItem()` → Server Actions

### Step 4: Test
Start the dev server and test all CRUD operations:
```bash
npm run dev
```

### Step 5: Deploy
```bash
git push origin main
```

Vercel will automatically detect the Postgres database and use the environment variables.

## 📝 Important Notes

1. **Environment Variables**: The `.env.local` file contains placeholder values. You MUST replace these with real credentials from Vercel.

2. **Prisma Client**: After any schema changes, run `npx prisma generate` to regenerate the client.

3. **Team Context**: Most operations require a `teamId`. Make sure to pass this from the session or URL params.

4. **Backward Compatibility**: The old localStorage code is preserved (renamed with `-old` suffix) for reference.

5. **Sports Enum**: The database uses `flag_football` (with underscore) vs the old `flag-football` (with hyphen). Watch for this when refactoring.

## 🎯 Key Server Actions

### Teams
- `getTeamsByCoach(coachId)` - Get all teams for a coach
- `getTeam(id)` - Get single team with players and games
- `createTeam(data)` - Create new team
- `updateTeam(id, data)` - Update team
- `deleteTeam(id)` - Delete team

### Players
- `getPlayersByTeam(teamId)` - Get all players for a team
- `createPlayer(data)` - Add new player
- `updatePlayer(id, data)` - Update player
- `bulkUpdatePlayers(players)` - Update multiple players at once
- `deletePlayer(id)` - Remove player

### Games
- `getGamesByTeam(teamId)` - Get all games for a team
- `getGame(id)` - Get single game with lineup and awards
- `createGame(data)` - Create new game
- `updateGame(id, data)` - Update game
- `deleteGame(id)` - Delete game
- `finalizeGame(gameId)` - Mark game as finalized

### GameLineups
- `getGameLineup(gameId)` - Get lineup for a game
- `createOrUpdateGameLineup(data)` - Save game lineup and roster snapshot
- `deleteGameLineup(gameId)` - Delete game lineup

## 🚀 Production Deployment

The app is configured for Vercel deployment with:
- Vercel Postgres as the database
- Prisma as the ORM
- Server Actions for data mutations
- Automatic migrations on deploy

Just push to the `main` branch and Vercel will handle the rest!
