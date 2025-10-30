import { db } from "../db.js";
import multer from "multer";
import path from "path";
import fs from "fs"; // Import the File System module

// Multer setup remains the same
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/expenditure/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now();
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
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

export const upload = multer({ storage: storage, fileFilter: fileFilter });

// Controller functions
export const getExpenditures = (req, res) => {
  const q = `
    SELECT 
      e.exp_id,
      e.session_id,
      s.session_name,
      e.expense_on,
      e.amount,
      e.bill_file,
      e.mod_time,
      um.username AS modified_by
    FROM expenditure AS e
    JOIN session_master AS s ON e.session_id = s.session_id
    LEFT JOIN user_master AS um ON e.mod_by = um.userid
    Order BY e.exp_id DESC
  `;
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const addExpenditure = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Bill file is required." });
  }
  const q = "INSERT INTO expenditure (`session_id`, `expense_on`, `amount`, `bill_file`, `mod_by`, `mod_time`) VALUES (?, ?, ?, ?, ?, NOW())";
  const values = [
    req.body.session_id,
    req.body.expense_on,
    req.body.amount,
    req.file.filename,
    req.body.mod_by,
  ];
  db.query(q, values, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(201).json({ message: "Expenditure added successfully." });
  });
};

export const updateExpenditure = (req, res) => {
  const { expId } = req.params;
  
  // 1. Get the old filename before updating
  const getOldFileQuery = "SELECT bill_file FROM expenditure WHERE exp_id = ?";
  db.query(getOldFileQuery, [expId], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json({ message: "Expenditure not found." });

    const oldFileName = data[0].bill_file;
    let newFileName = oldFileName;

    // 2. If a new file is uploaded, set the new filename and delete the old file
    if (req.file) {
      newFileName = req.file.filename;
      
      const oldFilePath = path.join("uploads/expenditure", oldFileName);
      fs.unlink(oldFilePath, (unlinkErr) => {
        if (unlinkErr) console.error("Error deleting old file:", unlinkErr);
      });
    }

    // 3. Update the database with the new data
    const q = "UPDATE expenditure SET `session_id` = ?, `expense_on` = ?, `amount` = ?, `bill_file` = ?, `mod_by` = ?, `mod_time` = NOW() WHERE `exp_id` = ?";
    const values = [
      req.body.session_id,
      req.body.expense_on,
      req.body.amount,
      newFileName, // Use the new filename or the old one if no new file was uploaded
      req.body.mod_by,
      expId,
    ];

    db.query(q, values, (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json({ message: "Expenditure updated successfully." });
    });
  });
};


export const deleteExpenditure = (req, res) => {
  const { expId } = req.params;

  // First, get the filename to delete it from the server
  const getFileQuery = "SELECT bill_file FROM expenditure WHERE exp_id = ?";
  db.query(getFileQuery, [expId], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length > 0) {
      const fileName = data[0].bill_file;
      const filePath = path.join("uploads/expenditure", fileName);
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) console.error("Error deleting file:", unlinkErr);
      });
    }

    // Then, delete the record from the database
    const q = "DELETE FROM expenditure WHERE exp_id = ?";
    db.query(q, [expId], (err, data) => {
      if (err) {
        return res.status(500).json({ message: "Failed to delete expenditure record.", error: err });
      }
      return res.status(200).json({ message: "Expenditure deleted successfully." });
    });
  });
};