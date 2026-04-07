# FlagFooty

A professional sports team management platform for coaches, featuring:

- Team roster management with player positions and stats
- Game scheduling and lineup generation
- MVP and player awards tracking
- Persistent database storage with Vercel Postgres/Neon
- Multi-team support for coaches

This is a [Next.js](https://nextjs.org) project with Prisma ORM and PostgreSQL database.

## Database Migration Notice

**IMPORTANT:** This application has been migrated from LocalStorage to a persistent PostgreSQL database.

See [DATABASE_MIGRATION_GUIDE.md](./DATABASE_MIGRATION_GUIDE.md) for complete deployment instructions.

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon recommended for Vercel deployment)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up your database URL in `.env`:
```env
DATABASE_URL=\"postgresql://user:password@host/database?sslmode=require\"
```

3. Run database migrations:
```bash
npx prisma migrate dev
npx prisma generate
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser.

### Default Login
- Email: `coach@example.com`
- Password: `coach123`

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Features

- **Team Management**: Create and manage multiple teams with different sports and divisions
- **Roster Management**: Add players with positions, jersey numbers, and metadata
- **Game Scheduling**: Schedule games with opponents, locations, and times
- **Lineup Generator**: Automatically generate optimal lineups from your roster
- **Game Cards**: Unique, editable lineup instances for each game
- **Awards System**: Assign MVP and other awards to players
- **Persistent Storage**: All data saved to PostgreSQL database
- **Multi-Coach Support**: Each coach can manage their own teams

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Database**: PostgreSQL (Neon/Vercel Postgres)
- **ORM**: Prisma
- **Styling**: Tailwind CSS v4
- **TypeScript**: Full type safety

## Deploy on Vercel

1. Create a Neon Postgres database in Vercel Dashboard
2. Set `DATABASE_URL` environment variable
3. Push to GitHub - automatic deployment will trigger
4. Run migrations: `npx prisma migrate deploy`

See [DATABASE_MIGRATION_GUIDE.md](./DATABASE_MIGRATION_GUIDE.md) for detailed instructions.
