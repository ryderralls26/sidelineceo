# 🚀 Quick Deployment Guide

## You're Almost Live! Follow These Steps:

### 1. Create Database (5 min)
Go to [Vercel Dashboard](https://vercel.com/dashboard) → Storage → Create Database
- Choose \"Neon Postgres\"  
- Name: `flagfooty-db`
- Copy the `DATABASE_URL`

### 2. Set Environment Variable (2 min)
In your Vercel project:
- Settings → Environment Variables
- Add: `DATABASE_URL` = [your connection string]

### 3. Deploy (Automatic)
Your GitHub push will trigger deployment automatically!

### 4. Run Migrations (5 min)
After first deployment:
```bash
vercel env pull .env.local
npx prisma migrate deploy
```

### 5. Test! ✅
Visit your site and log in:
- Email: `coach@example.com`
- Password: `coach123`

## That's It!
Your app is now live with full database persistence!

For detailed instructions, see: DATABASE_MIGRATION_GUIDE.md
