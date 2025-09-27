import { db } from "../db.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// --- Multer Configuration ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = "uploads/certificates/";
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = req.body.user_id + "-" + Date.now();
    cb(null, "cert-" + uniqueSuffix + path.extname(file.originalname));
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
export const upload = multer({ storage, fileFilter });

// --- Controller Functions ---

export const getInternships = (req, res) => {
  const q = `
    SELECT 
      i.internship_id, i.user_id, i.company_id, i.semester, i.certificate,
      s.name AS student_name,
      c.company_name,
      i.mod_time,
      um.username AS modified_by
    FROM student_internship AS i
    JOIN student_master AS s ON i.user_id = s.userid
    JOIN company_master AS c ON i.company_id = c.company_id
    LEFT JOIN user_master AS um ON i.mod_by = um.userid
  `;
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const addInternship = (req, res) => {
  const q = "INSERT INTO student_internship (`user_id`, `company_id`, `semester`, `certificate`, `mod_by`, `mod_time`) VALUES (?, ?, ?, ?, ?, NOW())";
  const values = [
    req.body.user_id,
    req.body.company_id,
    req.body.semester,
    req.file ? req.file.filename : null, // Handle optional certificate
    req.body.mod_by,
  ];
  db.query(q, values, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(201).json({ message: "Internship record added successfully." });
  });
};

export const updateInternship = (req, res) => {
  const { internshipId } = req.params;
  const getOldFileQuery = "SELECT certificate FROM student_internship WHERE internship_id = ?";

  db.query(getOldFileQuery, [internshipId], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json({ message: "Internship record not found." });

    const oldFileName = data[0].certificate;
    let newFileName = oldFileName;

    if (req.file) {
      newFileName = req.file.filename;
      if (oldFileName) {
        const oldFilePath = path.resolve("uploads/certificates", oldFileName);
        if (fs.existsSync(oldFilePath)) {
          fs.unlink(oldFilePath, (unlinkErr) => {
            if (unlinkErr) console.error("Could not delete old certificate:", unlinkErr);
          });
        }
      }
    }

    const q = "UPDATE student_internship SET `user_id` = ?, `company_id` = ?, `semester` = ?, `certificate` = ?, `mod_by` = ?, `mod_time` = NOW() WHERE `internship_id` = ?";
    const values = [
      req.body.user_id,
      req.body.company_id,
      req.body.semester,
      newFileName,
      req.body.mod_by,
      internshipId,
    ];
    db.query(q, values, (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json({ message: "Internship record updated successfully." });
    });
  });
};

export const deleteInternship = (req, res) => {
  const { internshipId } = req.params;
  const getFileQuery = "SELECT certificate FROM student_internship WHERE internship_id = ?";

  db.query(getFileQuery, [internshipId], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length > 0 && data[0].certificate) {
      const fileName = data[0].certificate;
      const filePath = path.resolve("uploads/certificates", fileName);
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) console.error("Could not delete certificate file:", unlinkErr);
        });
      }
    }

    const q = "DELETE FROM student_internship WHERE internship_id = ?";
    db.query(q, [internshipId], (err, data) => {
      if (err) return res.status(500).json({ message: "Failed to delete internship.", error: err });
      return res.status(200).json({ message: "Internship record deleted successfully." });
    });
  });
};