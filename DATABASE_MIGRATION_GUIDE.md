# Database Migration Guide - FlagFooty

## Overview
This application has been migrated from LocalStorage to a persistent Vercel Postgres (Neon) database using Prisma ORM.

## Database Schema

The application now uses the following database models:

- **User** - Coaches, Parents, and Players with authentication
- **Team** - Teams with sport, division, season, and year
- **Player** - Roster with positions, jersey numbers, and metadata
- **Game** - Schedule with opponents, locations, and status
- **GameLineup** - Unique lineup instances per game (editable without affecting master roster)
- **Award** - MVP and other player awards per game
- **AwardType** - Configurable award types
- **Position** - Positions for each sport
- **Parent** - Parent information with player linkage
- **VenmoRequest** - Payment requests to parents
- **TeamSeason** - Multiple seasons per team
- **Invite** - Team invitations
- **PasswordResetToken** - Password reset functionality

## Deployment Instructions

### Step 1: Create a Neon Postgres Database

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to Storage → Create Database
3. Select \"Neon Postgres\" (recommended for Vercel)
4. Create a new database with a name like \"flagfooty-db\"
5. Copy the DATABASE_URL connection string

Alternatively, create a free database directly at [Neon.tech](https://neon.tech):
1. Sign up for a free account
2. Create a new project
3. Copy the connection string from the dashboard

### Step 2: Update Environment Variables

In your Vercel project settings:

1. Go to Settings → Environment Variables
2. Add a new environment variable:
   - Key: `DATABASE_URL`
   - Value: Your Neon Postgres connection string (should look like: `postgresql://user:password@host/database?sslmode=require`)
3. Save the changes

### Step 3: Push to GitHub

The application is configured to deploy automatically when pushed to the `main` branch of:
```
https://github.com/ryderralls26/flagfooty.git
```

### Step 4: Run Database Migration

After the first deployment to Vercel, you need to run the Prisma migration:

**Option A: Using Vercel CLI**
```bash
vercel env pull .env.local
npx prisma migrate deploy
```

**Option B: Using the Vercel Dashboard**
Add a build command in your Vercel project settings:
```bash
npx prisma migrate deploy && npm run build
```

Alternatively, generate the initial migration locally and push:
```bash
npx prisma migrate dev --name init
git add prisma/migrations
git commit -m \"Add initial database migration\"
git push origin main
```

### Step 5: Seed Initial Data

The application will automatically seed default data on first access:
- Default positions for flag football
- Default award types (MVP, Defensive POYG, Offensive POYG)
- A default coach account (coach@example.com / coach123)

## Key Features

### Unique Game Lineups
Each game now has its own lineup instance stored in the `GameLineup` table. When you generate a lineup for a game:
1. The master roster is copied as a snapshot
2. The lineup can be edited independently for that specific game
3. Changes don't affect the master roster or other games
4. When finalized, the lineup is permanently saved with the game

### Data Persistence
All data is now permanently stored in Postgres:
- Team rosters persist across sessions
- Game schedules and lineups are saved
- Awards and MVPs are recorded in the database
- User accounts and sessions are managed server-side

### Multi-Team Support
Coaches can now manage multiple teams:
- Each team has its own roster, schedule, and games
- Teams can be for different sports (flag football, soccer)
- Teams can have different divisions and seasons

## API Endpoints

All localStorage operations have been replaced with API calls:

- `/api/teams` - Team management
- `/api/players` - Player/roster management
- `/api/games` - Game schedule management
- `/api/lineups` - Game lineup management
- `/api/awards` - Award management
- `/api/positions` - Position management
- `/api/users` - User management

## Development

To run locally with the database:

1. Install dependencies:
```bash
npm install
```

2. Set up your local database URL in `.env`:
```
DATABASE_URL=\"your_postgres_connection_string\"
```

3. Run migrations:
```bash
npx prisma migrate dev
```

4. Generate Prisma Client:
```bash
npx prisma generate
```

5. Start the development server:
```bash
npm run dev
```

## Troubleshooting

### Migration Errors
If you encounter migration errors:
```bash
npx prisma migrate reset
npx prisma migrate dev --name init
```

### Database Connection Issues
Ensure your DATABASE_URL is correctly formatted:
```
postgresql://user:password@host:port/database?sslmode=require
```

### Prisma Client Issues
Regenerate the Prisma Client:
```bash
npx prisma generate
```

## Production Checklist

- [ ] Neon Postgres database created
- [ ] DATABASE_URL environment variable set in Vercel
- [ ] Code pushed to GitHub main branch
- [ ] Vercel deployment successful
- [ ] Database migrations applied
- [ ] Application accessible and functional
- [ ] Test creating a team, roster, and game
- [ ] Verify lineup generation and finalization
- [ ] Verify awards can be assigned

## Notes

- The application maintains backward compatibility with the existing UI
- All localStorage references have been replaced with database calls
- Session management currently uses localStorage for client-side state (can be upgraded to JWT/cookies in future)
- Password hashing should be implemented before production use (currently plain text for demo)
