import { db } from "../db.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// --- Multer Configuration for Admin Offer Letter Upload ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = "uploads/offer_letters/";
    try {
      fs.mkdirSync(dest, { recursive: true });
      cb(null, dest);
    } catch (err) {
      cb(err, dest);
    }
  },
  filename: (req, file, cb) => {
    // Creating unique filename using user and drive IDs
    const uniqueSuffix = req.params.userId + "-" + req.params.driveId + "-" + Date.now();
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
    cb(new Error("Invalid file type! Only JPEG, PNG, JPG, and PDF are allowed."), false);
  }
};
export const uploadAdminOfferLetter = multer({ storage, fileFilter });

// --- Fetch all student placements for the Admin ---
export const getAllPlacements = (req, res) => {
  const q = `
    SELECT 
      sp.user_id, 
      sp.drive_id, 
      sm.name,             
      sm.rollno,
      pd.drive_name, 
      cm.company_name,
      ss.session_name,
      pm.program_name,
      sp.ctc, 
      sp.is_selected, 
      sp.role, 
      sp.place, 
      sp.offerletter_file_name, 
      sp.mod_time,
      um.username AS modified_by
    FROM student_placement AS sp
    JOIN placement_drive AS pd ON sp.drive_id = pd.drive_id
    JOIN company_master AS cm ON pd.company_id = cm.company_id
    JOIN student_master AS sm ON sp.user_id = sm.userid
    LEFT JOIN session_master AS ss ON sm.session_id = ss.session_id
    LEFT JOIN program_master AS pm ON sm.program_id = pm.program_id
    LEFT JOIN user_master AS um ON sp.mod_by = um.userid
    ORDER BY sp.mod_time DESC
  `;

  db.query(q, (err, data) => {
    if (err) {
      console.error("DB Error fetching all placements:", err);
      return res.status(500).json({ message: "Failed to fetch placement records.", error: err });
    }
    return res.status(200).json(data);
  });
};

// --- Update a specific student's placement status ---
export const updatePlacementStatus = (req, res) => {
  const { userId, driveId } = req.params;
  const { is_selected, role, place, ctc } = req.body;
  const adminId = req.user.userid; 

  // First, check if there's an existing file to delete if necessary
  const getOldFileQuery = "SELECT offerletter_file_name FROM student_placement WHERE user_id = ? AND drive_id = ?";
  
  db.query(getOldFileQuery, [userId, driveId], (err, data) => {
    if (err) {
      if(req.file) fs.unlink(req.file.path, () => {});
      return res.status(500).json({ message: "Database error", error: err });
    }
    
    const oldFileName = data.length > 0 ? data[0].offerletter_file_name : null;
    let newFileName = oldFileName;

    if (req.file) {
      newFileName = req.file.filename;
    }

    let updateQuery, values;

    if (is_selected === "Yes") {
      updateQuery = `
        UPDATE student_placement 
        SET is_selected = ?, role = ?, place = ?, ctc = ?, offerletter_file_name = ?, mod_by = ?, mod_time = NOW() 
        WHERE user_id = ? AND drive_id = ?
      `;
      values = [is_selected, role || null, place || null, ctc || null, newFileName, adminId, userId, driveId];
    } else {
      updateQuery = `
        UPDATE student_placement 
        SET is_selected = ?, role = NULL, place = NULL, ctc = NULL, offerletter_file_name = NULL, mod_by = ?, mod_time = NOW() 
        WHERE user_id = ? AND drive_id = ?
      `;
      values = [is_selected, adminId, userId, driveId];
    }

    db.query(updateQuery, values, (updateErr, updateData) => {
      if (updateErr) {
        if (req.file) fs.unlink(req.file.path, () => {});
        console.error("DB Error updating placement status:", updateErr);
        return res.status(500).json({ message: "Failed to update placement status.", error: updateErr });
      }

      // Cleanup old files if successfully overwritten or cleared
      if (is_selected === 'Yes' && req.file && oldFileName && oldFileName !== newFileName) {
        const oldFilePath = path.resolve("uploads/offer_letters", oldFileName);
        if (fs.existsSync(oldFilePath)) fs.unlink(oldFilePath, () => {});
      }
      if (is_selected !== 'Yes' && oldFileName) {
        const oldFilePath = path.resolve("uploads/offer_letters", oldFileName);
        if (fs.existsSync(oldFilePath)) fs.unlink(oldFilePath, () => {});
      }

      return res.status(200).json({ message: "Placement updated successfully." });
    });
  });
};

// --- Delete a placement record ---
export const deletePlacement = (req, res) => {
  const { userId, driveId } = req.params;
  const q = "DELETE FROM student_placement WHERE user_id = ? AND drive_id = ?";
  
  db.query(q, [userId, driveId], (err, data) => {
    if (err) return res.status(500).json({ message: "Failed to delete placement record.", error: err });
    if (data.affectedRows === 0) return res.status(404).json({ message: "Placement record not found." });
    return res.status(200).json({ message: "Placement record deleted successfully." });
  });
};