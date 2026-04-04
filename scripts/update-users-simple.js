const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'dev.db');
const db = new Database(dbPath);

try {
  const result = db.prepare(`
    UPDATE User
    SET emailVerified = datetime('now')
    WHERE emailVerified IS NULL
  `).run();

  console.log(`Updated ${result.changes} users with emailVerified`);
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
} finally {
  db.close();
}
