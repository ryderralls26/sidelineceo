/**
 * Migration script to rename old award types to new naming convention
 *
 * This should be run once to update existing data:
 * - 'Player of the Game' -> 'Defensive Player of the Game'
 * - 'POYG' -> 'Defensive Player of the Game'
 *
 * Updates both AwardType records and Award records
 */

import { prisma } from '@/lib/db';

export async function migrateAwardTypeNames() {
  try {
    console.log('Starting award type migration...');

    const result = await prisma.$transaction(async (tx) => {
      // Update AwardType records
      const updatedAwardTypes = await tx.awardType.updateMany({
        where: {
          OR: [
            { name: 'Player of the Game' },
            { name: 'POYG' },
          ],
        },
        data: {
          name: 'Defensive Player of the Game',
          description: 'Defensive Player of the Game',
        },
      });

      // Update Award records
      const updatedAwards = await tx.award.updateMany({
        where: {
          OR: [
            { awardName: 'Player of the Game' },
            { awardName: 'POYG' },
          ],
        },
        data: {
          awardName: 'Defensive Player of the Game',
        },
      });

      return {
        awardTypesUpdated: updatedAwardTypes.count,
        awardsUpdated: updatedAwards.count,
      };
    });

    console.log('Migration completed successfully:');
    console.log(`- Award types updated: ${result.awardTypesUpdated}`);
    console.log(`- Award records updated: ${result.awardsUpdated}`);

    return { success: true, ...result };
  } catch (error) {
    console.error('Migration failed:', error);
    return { success: false, error: 'Migration failed' };
  }
}

// Self-executing migration if run directly
if (require.main === module) {
  migrateAwardTypeNames()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
