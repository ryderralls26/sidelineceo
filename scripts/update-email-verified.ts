// Set DATABASE_URL before importing prisma
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./dev.db';

import { prisma } from '../lib/prisma';

async function main() {
  // Update all existing users to have emailVerified set to current time
  const result = await prisma.user.updateMany({
    where: {
      emailVerified: null,
    },
    data: {
      emailVerified: new Date(),
    },
  });

  console.log(`Updated ${result.count} users with emailVerified`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
