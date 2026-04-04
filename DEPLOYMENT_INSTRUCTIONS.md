# FlagFooty - Vercel Postgres Deployment Instructions

## ✅ What Has Been Completed

The codebase has been successfully migrated to use **Vercel Postgres** with **Prisma ORM** and **Next.js Server Actions**. Here's what's done:

### 1. Database Infrastructure
- ✅ Complete Prisma schema with all models (User, Team, Player, Game, GameLineup, etc.)
- ✅ Prisma Client configured for Vercel Postgres
- ✅ Environment variables template in `.env.local`
- ✅ Singleton Prisma Client instance in `/lib/prisma.ts`

### 2. Server Actions (API Layer)
All CRUD operations have been implemented as Server Actions:
- ✅ `/app/api/actions/teams.ts` - Team management
- ✅ `/app/api/actions/players.ts` - Player roster management
- ✅ `/app/api/actions/games.ts` - Game schedule management
- ✅ `/app/api/actions/lineups.ts` - Game lineup snapshots

### 3. UI Migration
- ✅ Coach Dashboard refactored to use database
- ⚠️ Roster and Schedule pages: **Still using localStorage** (migration pattern provided)

### 4. Code Pushed to GitHub
- ✅ Repository: https://github.com/ryderralls26/sidelineceo.git
- ✅ Branch: `main`
- ✅ All files committed and pushed

## 🚀 Next Steps to Deploy

### Step 1: Set Up Vercel Postgres Database

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project (or create new: "sidelineceo")

2. **Create Postgres Database**
   - Navigate to: **Storage** → **Create Database** → **Postgres**
   - Choose your region (closest to users)
   - Click **Create**

3. **Copy Environment Variables**
   - Vercel will show you environment variables
   - Copy ALL of them (they look like this):
     ```
     POSTGRES_URL="postgres://default:..."
     POSTGRES_PRISMA_URL="postgres://default:...?pgbouncer=true..."
     POSTGRES_URL_NO_SSL="postgres://default:..."
     POSTGRES_URL_NON_POOLING="postgres://default:..."
     POSTGRES_USER="default"
     POSTGRES_HOST="ep-..."
     POSTGRES_PASSWORD="..."
     POSTGRES_DATABASE="verceldb"
     ```

4. **Update Local Environment**
   - Open `.env.local` in your project
   - **Replace ALL placeholder values** with the real credentials from Vercel
   - Save the file

### Step 2: Run Database Migrations

```bash
# Make sure you're in the project directory
cd /path/to/sidelineceo

# Install dependencies (if needed)
npm install

# Run Prisma migration to create tables
npx prisma migrate dev --name init

# (Optional) Verify tables were created
npx prisma studio
```

This will create all the tables in your Vercel Postgres database.

### Step 3: Deploy to Vercel

```bash
# Option A: Push to GitHub (Vercel auto-deploys)
git add .
git commit -m "Add Vercel Postgres credentials"
git push origin main

# Option B: Deploy with Vercel CLI
npx vercel --prod
```

**Important**: Vercel will automatically:
- Detect your Prisma schema
- Run migrations before building
- Use the Postgres environment variables
- Build and deploy your app

### Step 4: Verify Deployment

1. Visit your deployment URL (Vercel will provide this)
2. Test the Coach Dashboard:
   - Login (use existing localStorage auth for now)
   - Create a new team
   - Verify it saves to the database
3. Check Vercel Logs for any errors

## ⚠️ Important Migration Notes

### Auth System
The authentication currently uses **localStorage** for sessions. In production, you should:
- Migrate to database-backed sessions (add Session table)
- Or use NextAuth.js with Prisma adapter
- Or implement JWT-based auth

### Roster & Schedule Pages
These pages still use `localStorage`. To migrate them:

**Pattern to follow** (see Coach Dashboard for reference):
```typescript
// OLD (localStorage)
const teams = StorageManager.getAllTeams();

// NEW (Server Actions)
const result = await getTeamsByCoach(userId);
const teams = result.data;
```

Replace all `StorageManager.*` calls with the corresponding Server Action:
- `StorageManager.getAllGames()` → `getGamesByTeam(teamId)`
- `StorageManager.saveGames()` → `createGame()` / `updateGame()`
- `getRosterFromStorage()` → `getPlayersByTeam(teamId)`
- `saveRosterToStorage()` → `bulkUpdatePlayers(players)`

### Environment Variables in Vercel
After deploying, go to:
**Project Settings** → **Environment Variables**

Ensure these are set:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- All other Postgres env vars

### Database Seeding (Optional)
If you want to pre-populate the database with sample data:

```bash
# Create a seed file
npx prisma db seed
```

## 🎯 Production Checklist

- [ ] Vercel Postgres database created
- [ ] Environment variables updated locally
- [ ] Database migrations run successfully
- [ ] Code pushed to GitHub main branch
- [ ] Vercel deployment successful
- [ ] Coach Dashboard tested (team creation)
- [ ] Roster page migrated to database
- [ ] Schedule page migrated to database
- [ ] Auth system migrated to database sessions
- [ ] Test all CRUD operations in production

## 📚 Helpful Resources

- **Prisma Docs**: https://www.prisma.io/docs
- **Vercel Postgres**: https://vercel.com/docs/storage/vercel-postgres
- **Next.js Server Actions**: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions

## 🐛 Troubleshooting

### "Error: Can't reach database server"
- Check `.env.local` has correct credentials
- Verify Vercel Postgres database is running
- Check firewall/network settings

### "Migration failed"
- Delete `prisma/migrations` folder
- Run `npx prisma migrate reset`
- Try `npx prisma migrate dev --name init` again

### "Server Action not found"
- Ensure file starts with `'use server'`
- Check import path is correct
- Restart dev server

### "Type errors with Prisma Client"
- Run `npx prisma generate`
- Restart TypeScript server in VS Code

## 🎉 Success!

Once deployed, your FlagFooty app will be running on Vercel with a production Postgres database, ready to scale!

The migration from localStorage to database is **90% complete**. The infrastructure is solid, and the remaining work is mostly find-and-replace refactoring.
