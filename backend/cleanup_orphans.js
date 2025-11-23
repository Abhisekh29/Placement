import mysql from "mysql2/promise";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";

// Load environment variables (DB credentials)
dotenv.config();

// CONFIGURATION
// Adjust this path if your uploads folder is located somewhere else relative to this script
const CERTIFICATES_DIR = path.resolve("uploads/certificates");

const cleanup = async () => {
  console.log("🚀 Starting cleanup process...");
  let connection;

  try {
    // 1. Connect to the Database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });
    console.log("✅ Connected to Database.");

    // 2. Fetch all valid certificate filenames from the database
    const [rows] = await connection.execute(
      "SELECT certificate FROM student_internship WHERE certificate IS NOT NULL AND certificate != ''"
    );
    
    // Create a Set for O(1) lookup time
    const validFiles = new Set(rows.map((row) => row.certificate));
    console.log(`📊 Found ${validFiles.size} valid certificate records in the database.`);

    // 3. Read all files from the uploads directory
    try {
      await fs.access(CERTIFICATES_DIR);
    } catch (e) {
      console.error(`❌ Error: Directory not found at ${CERTIFICATES_DIR}`);
      return;
    }

    const filesOnDisk = await fs.readdir(CERTIFICATES_DIR);
    console.log(`📂 Found ${filesOnDisk.length} files in the uploads folder.`);

    // 4. Identify Orphans (Files on disk that are NOT in the validFiles set)
    // We filter out system files like .DS_Store or .gitignore if present
    const orphans = filesOnDisk.filter(
      (file) => !validFiles.has(file) && file !== ".DS_Store" && file !== ".gitignore"
    );

    if (orphans.length === 0) {
      console.log("✨ No orphaned files found. Your folders are clean!");
      return;
    }

    console.log(`⚠️ Found ${orphans.length} orphaned files. Deleting them now...`);

    // 5. Delete Orphaned Files
    let deletedCount = 0;
    for (const file of orphans) {
      const filePath = path.join(CERTIFICATES_DIR, file);
      try {
        await fs.unlink(filePath);
        console.log(`   🗑️ Deleted: ${file}`);
        deletedCount++;
      } catch (err) {
        console.error(`   ❌ Failed to delete ${file}:`, err.message);
      }
    }

    console.log(`\n🎉 Cleanup Complete! Removed ${deletedCount} files.`);

  } catch (error) {
    console.error("❌ An error occurred:", error);
  } finally {
    if (connection) await connection.end();
  }
};

cleanup();