import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';

// Prisma 7 requires an adapter for SQLite
const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';
console.log('Database URL:', databaseUrl); // Debug logging
const libsql = createClient({ url: databaseUrl });
const adapter = new PrismaLibSql(libsql as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Default test password for all seed users
  // DEVELOPER NOTE: Test password is "password123" for all seed accounts
  const defaultPassword = 'password123';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  // Create test coach user
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

  // Create test parent user (with admin access)
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

  // Create test parent user (read-only)
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

  // Create test player user
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
  console.log('\n📝 Test Accounts (all use password: "password123"):');
  console.log('   - coach@test.com (Coach - Full Access)');
  console.log('   - parent@test.com (Parent - Admin Access)');
  console.log('   - parent2@test.com (Parent - Read-only)');
  console.log('   - player@test.com (Player - Read-only)');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
