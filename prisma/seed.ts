import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';
import { Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import bcrypt from 'bcryptjs';

const databaseUrl = (process.env.DATABASE_URL || 'file:./dev.db').replace(/[?&]channel_binding=[^&]+/, '');
const isPostgres = databaseUrl.startsWith('postgres:') || databaseUrl.startsWith('postgresql:');

let adapter: any;
if (isPostgres) {
  const pool = new Pool({ connectionString: databaseUrl });
  adapter = new PrismaNeon(pool as any);
} else {
  const libsql = createClient({ url: databaseUrl });
  adapter = new PrismaLibSql(libsql as any);
}

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  const defaultPassword = 'password123';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  const coach = await prisma.user.upsert({
    where: { email: 'coach@test.com' },
    update: {},
    create: {
      email: 'coach@test.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Coach',
      role: 'coach',
      isAdmin: false,
    },
  });
  console.log('✅ Created coach user:', coach.email);

  const parentAdmin = await prisma.user.upsert({
    where: { email: 'parent@test.com' },
    update: {},
    create: {
      email: 'parent@test.com',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Parent',
      role: 'parent',
      isAdmin: true,
    },
  });
  console.log('✅ Created parent (admin) user:', parentAdmin.email);

  const parentReadOnly = await prisma.user.upsert({
    where: { email: 'parent2@test.com' },
    update: {},
    create: {
      email: 'parent2@test.com',
      password: hashedPassword,
      firstName: 'Bob',
      lastName: 'ParentReadOnly',
      role: 'parent',
      isAdmin: false,
    },
  });
  console.log('✅ Created parent (read-only) user:', parentReadOnly.email);

  const player = await prisma.user.upsert({
    where: { email: 'player@test.com' },
    update: {},
    create: {
      email: 'player@test.com',
      password: hashedPassword,
      firstName: 'Tommy',
      lastName: 'Player',
      role: 'player',
      isAdmin: false,
    },
  });
  console.log('✅ Created player user:', player.email);

  console.log('\n🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });