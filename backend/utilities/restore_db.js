import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import readline from 'readline';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const backupDir = path.join(__dirname, '../utilities/backups');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("\n==========================================");
console.log("   DATABASE RESTORATION UTILITY");
console.log("==========================================\n");

if (!fs.existsSync(backupDir)) {
  console.log("No backup directory found. Exiting...");
  process.exit(0);
}

// Get all .sql files and sort them (newest first)
const files = fs.readdirSync(backupDir)
  .filter(file => file.endsWith('.sql'))
  .map(file => {
    return {
      name: file,
      time: fs.statSync(path.join(backupDir, file)).mtime.getTime()
    };
  })
  .sort((a, b) => b.time - a.time);

if (files.length === 0) {
  console.log("No backups available to restore. Exiting...");
  process.exit(0);
}

// Display available backups
console.log("Available Restore Points:");
files.forEach((file, index) => {
  console.log(`  [${index + 1}] ${file.name}`);
});
console.log(`  [0] Cancel and Exit\n`);

rl.question("Enter the number of the backup to restore: ", (answer) => {
  const selection = parseInt(answer);

  if (selection === 0 || isNaN(selection) || selection < 1 || selection > files.length) {
    console.log("Operation cancelled. Exiting...");
    process.exit(0);
  }

  const selectedFile = files[selection - 1].name;
  const filePath = path.join(backupDir, selectedFile);

  console.log(`\nWARNING: You are about to overwrite the current database with: ${selectedFile}`);
  rl.question("Type 'RESTORE' to confirm: ", (confirm) => {
    if (confirm !== 'RESTORE') {
      console.log("Confirmation failed. Operation cancelled.");
      process.exit(0);
    }

    console.log("\nRestoring database. Please wait...");
    const { DB_HOST, DB_USER, DB_PASS, DB_NAME } = process.env;
    
    // MySQL Import Command
    const restoreCmd = `mysql -h ${DB_HOST} -u ${DB_USER} -p${DB_PASS} ${DB_NAME} < ${filePath}`;

    exec(restoreCmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`\n[ERROR] Failed to restore database: ${error.message}`);
      } else {
        console.log(`\n[SUCCESS] Database successfully restored from ${selectedFile}!`);
      }
      process.exit(0);
    });
  });
});