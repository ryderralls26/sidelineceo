# Deployment Guide - Velox Launch (FlagFooty)

## ✅ What's Been Completed

Your authentication system has been successfully migrated from localStorage to a database-backed solution. The code has been pushed to GitHub at:

**Repository**: https://github.com/ryderralls26/flagfooty.git
**Branch**: `main`

### Key Changes Made:

1. **Secure Password Hashing**
   - Installed `bcryptjs` for industry-standard password hashing
   - All passwords are hashed with 10 salt rounds before storage

2. **Database-Backed Authentication**
   - Created API routes: `/api/auth/signup`, `/api/auth/signin`, `/api/auth/logout`, `/api/auth/session`
   - All user accounts are now stored in PostgreSQL via Prisma
   - Sessions use HTTP-only cookies (secure, cannot be stolen via XSS)

3. **Cross-Device Login**
   - Users can now log in from any device
   - Accounts are persistent and not tied to browser localStorage

4. **Updated AuthContext**
   - Removed all localStorage dependencies
   - Now fetches session from server on page load
   - Properly handles authentication state

## 🚀 Next Steps - Deploy to Vercel

### Step 1: Set Up Vercel Postgres Database

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select or create your project

2. **Create Postgres Database**
   - Navigate to: **Storage** tab
   - Click **Create Database**
   - Select **Postgres**
   - Choose your region (e.g., US East)
   - Click **Create**

3. **Copy Environment Variables**
   Vercel will display environment variables like:
   ```
   POSTGRES_URL=\"postgres://default:...\"
   POSTGRES_PRISMA_URL=\"postgres://default:...?pgbouncer=true\"
   POSTGRES_URL_NO_SSL=\"postgres://default:...\"
   POSTGRES_URL_NON_POOLING=\"postgres://default:...\"
   POSTGRES_USER=\"default\"
   POSTGRES_HOST=\"...\"
   POSTGRES_PASSWORD=\"...\"
   POSTGRES_DATABASE=\"verceldb\"
   ```

4. **These are automatically added to your Vercel project!**
   - Vercel auto-connects the database to your project
   - No need to manually copy them to Vercel's environment variables

### Step 2: Deploy to Vercel

Since your code is already pushed to GitHub, deployment is automatic:

1. **Connect GitHub to Vercel** (if not already)
   - Go to https://vercel.com/new
   - Click \"Import Git Repository\"
   - Select `ryderralls26/flagfooty`
   - Click **Import**

2. **Configure Build Settings** (should be auto-detected)
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build` (or leave default)
   - Output Directory: `.next` (or leave default)

3. **Deploy**
   - Click **Deploy**
   - Vercel will:
     - Install dependencies
     - Generate Prisma Client (`prisma generate`)
     - Build your Next.js app
     - Deploy to production

### Step 3: Run Database Migration

After deployment, you need to create the database tables:

**Option A: Using Vercel CLI (Recommended)**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Run migration in production
vercel env pull .env.local
npx prisma migrate deploy
```

**Option B: Manual Migration via Vercel Dashboard**

1. Go to your project on Vercel
2. Navigate to **Settings** → **Functions**
3. Create a temporary API route for migration:

Create `/app/api/migrate/route.ts`:
```typescript
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test connection
    await prisma.$connect();
    return Response.json({ status: 'connected' });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
```

4. Deploy and visit: `https://your-app.vercel.app/api/migrate`
5. If it works, run migrations locally with production DB:

```bash
# Pull production env vars
vercel env pull .env.local

# Run migration
npx prisma migrate deploy
```

### Step 4: Test Your Deployment

1. **Visit your app**: `https://your-app.vercel.app`

2. **Test Sign Up**:
   - Go to `/signup`
   - Create a new account
   - You should be auto-logged in

3. **Test Sign In**:
   - Log out
   - Go to `/login`
   - Sign in with your credentials
   - Should successfully authenticate

4. **Test Cross-Device**:
   - Log in on one browser
   - Open the app in another browser (or incognito)
   - Log in with the same credentials
   - Both sessions should work independently

## 📋 Environment Variables Checklist

Make sure these are set in Vercel (auto-added when you create Postgres):

- ✅ `POSTGRES_URL`
- ✅ `POSTGRES_PRISMA_URL`
- ✅ `POSTGRES_URL_NO_SSL`
- ✅ `POSTGRES_URL_NON_POOLING`
- ✅ `POSTGRES_USER`
- ✅ `POSTGRES_HOST`
- ✅ `POSTGRES_PASSWORD`
- ✅ `POSTGRES_DATABASE`

## 🔧 Troubleshooting

### Issue: \"PrismaClient is unable to connect\"

**Solution**: Make sure you ran `prisma migrate deploy` after creating the database.

```bash
vercel env pull .env.local
npx prisma migrate deploy
```

### Issue: \"User.create() is not a function\"

**Solution**: Regenerate Prisma Client:

```bash
npx prisma generate
```

### Issue: \"Session cookie not persisting\"

**Solution**:
- Make sure your Vercel deployment is using HTTPS (it should be automatic)
- Check that cookies are enabled in your browser
- In production, cookies will be secure by default

### Issue: Build fails with \"Cannot find module '@prisma/client'\"

**Solution**: Add this to your `package.json`:

```json
\"scripts\": {
  \"build\": \"prisma generate && next build\"
}
```

This ensures Prisma Client is generated during build.

## 🎉 Success Checklist

After deployment, verify:

- ✅ App loads at your Vercel URL
- ✅ Can create a new account at `/signup`
- ✅ Can sign in at `/login`
- ✅ Can access protected routes (e.g., `/coach-dashboard`)
- ✅ Logging out redirects to login page
- ✅ Can log in from different devices with same account

## 📚 Additional Resources

- **Vercel Postgres Docs**: https://vercel.com/docs/storage/vercel-postgres
- **Prisma with Vercel**: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel
- **Next.js Deployment**: https://nextjs.org/docs/deployment

## 🔐 Security Notes

- All passwords are hashed with bcrypt (10 rounds)
- Session cookies are HTTP-only (XSS protection)
- Cookies use SameSite=lax (CSRF protection)
- In production, cookies are sent over HTTPS only
- Email addresses are stored in lowercase for consistency

## 📝 Next Enhancements (Optional)

1. **Email Verification**
   - Add email verification flow for new signups
   - Use services like Resend, SendGrid, or AWS SES

2. **Password Reset**
   - The schema already has `PasswordResetToken` model
   - Implement forgot password flow

3. **OAuth Integration**
   - Add Google/GitHub login
   - Use NextAuth.js or similar

4. **Rate Limiting**
   - Protect against brute force attacks
   - Use Vercel Edge Config or Upstash Redis

---\n\n**Repository**: https://github.com/ryderralls26/flagfooty.git\n**Status**: ✅ Ready for deployment\n**Last Updated**: April 2, 2026\n