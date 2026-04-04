/**
 * Runner script for award type migration
 *
 * Usage: npx ts-node scripts/run-award-migration.ts
 */

import { config } from 'dotenv';
import { migrateAwardTypeNames } from '../lib/migrations/rename-award-types';

// Load environment variables
config();

async function main() {
  console.log('='.repeat(60));
  console.log('Running Award Type Migration');
  console.log('='.repeat(60));
  console.log('');

  const result = await migrateAwardTypeNames();

  if (result.success) {
    console.log('');
    console.log('✓ Migration completed successfully!');
    console.log('');
    process.exit(0);
  } else {
    console.log('');
    console.log('✗ Migration failed!');
    console.log(`Error: ${result.error}`);
    console.log('');
    process.exit(1);
  }
}

main();
