import { db } from "../db.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// --- 1. Multer Configuration for Offer Letters ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 🌟 FIX: Corrected folder path
    const dest = "uploads/offer_letters/";
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = req.user.userid + "-" + req.params.driveId + "-" + Date.now();
    cb(null, "offer-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type, only JPEG, PNG, JPG and PDF is allowed!"), false);
  }
};
export const uploadOfferLetter = multer({ storage, fileFilter });


// --- 2. getMyPlacements (FIXED) ---
// Now selects all the columns from your database screenshot
export const getMyPlacements = (req, res) => {
  const user_id = req.user.userid; 

  const q = `
    SELECT 
      sp.user_id,
      sp.drive_id,
      pd.drive_name,
      cm.company_name,
      pd.ctc,
      pd.drive_description,
      sp.is_selected,
      sp.role,
      sp.place, 
      sp.offerletter_file_name,
      um.username AS modified_by,
      sp.mod_time
    FROM student_placement AS sp
    JOIN placement_drive AS pd ON sp.drive_id = pd.drive_id
    JOIN company_master AS cm ON pd.company_id = cm.company_id
    LEFT JOIN user_master AS um ON sp.mod_by = um.userid
    WHERE sp.user_id = ?
    ORDER BY sp.drive_id DESC
  `;
  
  db.query(q, [user_id], (err, data) => {
    if (err) {
      console.error("DB Error fetching 'My Placements':", err);
      return res.status(500).json(err);
    }
    return res.status(200).json(data);
  });
};

// --- 3. updateMyPlacement (FIXED) ---
// Matches your schema: 'is_selected', 'role', 'place', 'offerletter_file_name'
export const updateMyPlacement = (req, res) => {
  const user_id = req.user.userid;
  const { driveId } = req.params;
  const { is_selected, role, place } = req.body; 

  const getOldFileQuery = "SELECT offerletter_file_name FROM student_placement WHERE drive_id = ? AND user_id = ?";
  
  db.query(getOldFileQuery, [driveId, user_id], (err, data) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    if (data.length === 0) return res.status(404).json({ message: "Application not found." });

    const oldFileName = data[0].offerletter_file_name;
    let newFileName = oldFileName;

    if (req.file) {
      newFileName = req.file.filename;
      if (oldFileName) {
        const oldFilePath = path.resolve("uploads/offer_letters", oldFileName);
        if (fs.existsSync(oldFilePath)) {
          fs.unlink(oldFilePath, (unlinkErr) => {
            if (unlinkErr) console.error("Could not delete old offer letter:", unlinkErr);
          });
        }
      }
    }

    let updateQuery, values;
    
    if (String(is_selected) === '1') {
      // If "Yes" is selected, update all fields
      updateQuery = `
        UPDATE student_placement 
        SET is_selected = ?, role = ?, place = ?, offerletter_file_name = ?, mod_by = ?, mod_time = NOW() 
        WHERE drive_id = ? AND user_id = ?
      `;
      values = [
        is_selected,
        role || null,
        place || null, 
        newFileName,
        user_id,
        driveId,
        user_id
      ];
    } else {
      // If "No" is selected, reset fields to NULL
      updateQuery = `
        UPDATE student_placement 
        SET is_selected = ?, role = NULL, place = NULL, offerletter_file_name = NULL, mod_by = ?, mod_time = NOW() 
        WHERE drive_id = ? AND user_id = ?
      `;
      values = [
        is_selected,
        user_id,
        driveId,
        user_id
      ];
      
      if (oldFileName) {
        const oldFilePath = path.resolve("uploads/offer_letters", oldFileName);
        if (fs.existsSync(oldFilePath)) {
          fs.unlink(oldFilePath, (unlinkErr) => {
            if (unlinkErr) console.error("Could not delete old offer letter:", unlinkErr);
          });
        }
      }
    }

    db.query(updateQuery, values, (err, data) => {
      if (err) {
        console.error("DB Error updating placement:", err);
        return res.status(500).json(err);
      }
      return res.status(200).json({ message: "Application updated successfully." });
    });
  });
};


// --- 4. applyForDrive (CRITICAL FIX) ---
// This now finds the CTC and saves it to your 'student_placement' table
export const applyForDrive = (req, res) => {
  const user_id = req.user.userid; 
  const { drive_id } = req.body;

  if (!drive_id) {
    return res.status(400).json({ message: "Drive ID is required." });
  }

  // Get CTC from placement_drive to store in student_placement
  const getDriveDataQ = "SELECT ctc FROM placement_drive WHERE drive_id = ?";
  
  db.query(getDriveDataQ, [drive_id], (err, driveData) => {
    if (err || driveData.length === 0) {
      return res.status(404).json({ message: "Drive not found." });
    }
    
    // This is the CTC value you were missing
    const driveCTC = driveData[0].ctc; 

    const q = "INSERT INTO student_placement (`user_id`, `drive_id`, `is_selected`, `ctc`, `role`, `mod_by`, `mod_time`) VALUES (?, ?, ?, ?, ?, ?, NOW())";
    const values = [
      user_id,
      drive_id,
      '0', // Default: '0' (Pending)
      driveCTC, // 🌟 Store the CTC from the drive
      "Applied", // Default role/remark
      user_id 
    ];

    db.query(q, values, (err, data) => {
      if (err) {
        // This relies on your UNIQUE KEY `user_drive_unique` (`user_id`, `drive_id`)
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ message: "You have already applied for this drive." });
        }
        console.error("DB Error applying for drive:", err);
        return res.status(500).json(err);
      }
      return res.status(201).json({ message: "Application successful." });
    });
  });
};

// --- 5. getAppliedDrives (This is correct) ---
export const getAppliedDrives = (req, res) => {
  const user_id = req.user.userid; 
  const q = "SELECT drive_id FROM student_placement WHERE user_id = ?";
  db.query(q, [user_id], (err, data) => {
    if (err) {
      console.error("DB Error fetching applied drives:", err);
      return res.status(500).json(err);
    }
    const driveIds = data.map(item => item.drive_id);
    return res.status(200).json(driveIds);
  });
};