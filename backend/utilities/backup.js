import fs from "fs";
import path from "path";
import { exec } from "child_process";
import cron from "node-cron";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// Setup for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const backupDir = path.join(__dirname, "../utilities/backups");

// Ensure backup directory exists
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

const performBackup = () => {
  const { DB_HOST, DB_USER, DB_PASS, DB_NAME } = process.env;

  // Format: YYYY-MM-DD_HH-mm-ss
  // 1. Get current UTC time (changed 'date' to 'now')
  const now = new Date();

  // 2. Add IST Offset (5 hours and 30 minutes in milliseconds)
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);

  // 3. Format into YYYY-MM-DD_HH-mm-ss
  const timestamp = istDate.toISOString().replace(/T/, "_").replace(/:/g, "-").split(".")[0];
  const fileName = `backup_${timestamp}.sql`;
  const filePath = path.join(backupDir, fileName);

  // MySQL Dump Command
  // Note: There must be no space between -p and the password!
  const dumpCommand = `mysqldump -h ${DB_HOST} -u ${DB_USER} -p${DB_PASS} ${DB_NAME} > ${filePath}`;

  exec(dumpCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`[BACKUP ERROR] Failed to create backup: ${error.message}`);
      return;
    }
    console.log(`[SUCCESS] Database backup saved successfully: ${fileName}`);
    cleanupOldBackups();
  });
};

const cleanupOldBackups = () => {
  const files = fs.readdirSync(backupDir);
  const now = Date.now();
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;

  files.forEach((file) => {
    const filePath = path.join(backupDir, file);
    const stat = fs.statSync(filePath);

    // If file is older than 30 days, delete it
    if (now - stat.mtimeMs > thirtyDaysInMs) {
      fs.unlinkSync(filePath);
      console.log(`[CLEANUP] Deleted old backup: ${file}`);
    }
  });
};

// --- SCHEDULE THE CRON JOB ---
// "0 4 * * *" means every day at 4:00 AM
export const startBackupCron = () => {
  console.log(
    "Database Backup Cron Job initialized. Scheduled for 4:00 AM daily.",
  );
  cron.schedule("0 4 * * *", () => {
    console.log("Running scheduled database backup...");
    performBackup();
  });
};
