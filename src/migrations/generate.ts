import { execSync } from 'child_process';
import * as readline from 'readline';
import * as path from 'path';

const HISTORY_DIR = path.resolve(__dirname, 'history');

function generateMigration(name: string) {
  const cleanName = name.trim().replace(/[^a-zA-Z0-9]/g, '_');
  const timestamp = Date.now();
  const version = `M${timestamp}-${cleanName}`;

  //   const command = `npx ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:generate ${HISTORY_DIR}/${version} -d ./src/config/typeorm.ts`;
  const command = `npx ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:generate "${HISTORY_DIR}/${version}" -d ./src/config/typeorm.ts`;

  console.log(`➡️ Generating migration: ${cleanName}`);

  try {
    execSync(command, { stdio: 'inherit' });
    console.log('✅ Migration generated successfully in history!');
  } catch (error: any) {
    console.error('❌ Migration generation failed:', error.message);
    process.exit(1);
  }
}

// CLI argument or interactive
const args = process.argv.slice(2);
const migrationName = args[0];

if (migrationName) {
  generateMigration(migrationName);
} else {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('📝 Enter migration name: ', (name) => {
    if (!name.trim()) {
      console.error('❌ Migration name is required.');
      rl.close();
      process.exit(1);
    }
    generateMigration(name);
    rl.close();
  });
}
