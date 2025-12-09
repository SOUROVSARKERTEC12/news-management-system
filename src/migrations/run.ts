import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const HISTORY_DIR = path.resolve(__dirname, 'history');
const EXECUTE_DIR = path.resolve(__dirname, 'execute');
const LAST_EXECUTED_FILE = 'last_migration.ts';

// Ensure execute folder exists
if (!fs.existsSync(EXECUTE_DIR)) {
  fs.mkdirSync(EXECUTE_DIR, { recursive: true });
}

// Get all migration files from history
const historyFiles = fs.readdirSync(HISTORY_DIR).filter(f => f.endsWith('.ts') || f.endsWith('.js'));
if (historyFiles.length === 0) {
  console.error('❌ No migration files found in history!');
  process.exit(1);
}

// Sort files by name (timestamp prefix)
historyFiles.sort();
const latestMigration = historyFiles[historyFiles.length - 1];
const sourceFile = path.join(HISTORY_DIR, latestMigration);
const destFile = path.join(EXECUTE_DIR, LAST_EXECUTED_FILE);

// Copy latest migration to execute folder
fs.copyFileSync(sourceFile, destFile);
console.log(`➡️ Copied last migration to execute folder: ${LAST_EXECUTED_FILE}`);

// Run TypeORM migration
try {
  const command = `npx ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:run -d ./src/config/typeorm.ts`;
  console.log('➡️ Running migrations via TypeORM CLI...');
  execSync(command, { stdio: 'inherit' });
  console.log('✅ Migration executed successfully!');
} catch (error: any) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}
