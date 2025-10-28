import { db } from "../db.js";

// Fetch all placement drives with joined data
export const getPlacementDrives = (req, res) => {
  const q = `
    SELECT 
      pd.drive_id,
      pd.drive_name,
      sm.session_name,
      cm.company_name,
      pd.drive_description,
      pd.ctc,
      pd.is_active,
      pd.mod_time,
      um.username AS modified_by,
      pd.session_id, -- Needed for edit modal
      pd.company_id -- Needed for edit modal
    FROM placement_drive AS pd
    JOIN session_master AS sm ON pd.session_id = sm.session_id
    JOIN company_master AS cm ON pd.company_id = cm.company_id
    LEFT JOIN user_master AS um ON pd.mod_by = um.userid
    ORDER BY pd.mod_time DESC
  `;
  db.query(q, (err, data) => {
    if (err) {
        console.error("DB Error fetching placement drives:", err);
        return res.status(500).json(err);
    }
    return res.status(200).json(data);
  });
};

// Add a new placement drive
export const addPlacementDrive = (req, res) => {
  const q = "INSERT INTO placement_drive (`session_id`, `drive_name`, `company_id`, `drive_description`, `ctc`, `is_active`, `mod_by`, `mod_time`) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())";
  const values = [
    req.body.session_id,
    req.body.drive_name,
    req.body.company_id,
    req.body.drive_description,
    req.body.ctc,
    '1', // Default status: '1' (Closed) as requested
    req.body.mod_by,
  ];

  db.query(q, values, (err, data) => {
    if (err) {
        console.error("DB Error adding placement drive:", err);
        return res.status(500).json(err);
    }
    return res.status(201).json({ message: "Placement drive added successfully." });
  });
};

// Update an existing placement drive
export const updatePlacementDrive = (req, res) => {
  const { driveId } = req.params;
  // Note: is_active status is not part of this update, it has a separate endpoint
  const q = "UPDATE placement_drive SET `session_id` = ?, `drive_name` = ?, `company_id` = ?, `drive_description` = ?, `ctc` = ?, `mod_by` = ?, `mod_time` = NOW() WHERE drive_id = ?";
  const values = [
    req.body.session_id,
    req.body.drive_name,
    req.body.company_id,
    req.body.drive_description,
    req.body.ctc,
    req.body.mod_by,
  ];

  db.query(q, [...values, driveId], (err, data) => {
    if (err) {
        console.error("DB Error updating placement drive:", err);
        return res.status(500).json(err);
    }
    return res.status(200).json({ message: "Placement drive updated successfully." });
  });
};

// Delete a placement drive
export const deletePlacementDrive = (req, res) => {
  const { driveId } = req.params;
  const q = "DELETE FROM placement_drive WHERE drive_id = ?";

  db.query(q, [driveId], (err, data) => {
    if (err) {
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ message: "Cannot delete this drive as it has linked student placements." });
        }
        console.error("DB Error deleting placement drive:", err);
        return res.status(500).json({ message: "Failed to delete placement drive.", error: err });
    }
    return res.status(200).json({ message: "Placement drive deleted successfully." });
  });
};

// Toggle the is_active status of a placement drive
export const toggleDriveStatus = (req, res) => {
  const { driveId } = req.params;
  const { is_active, mod_by } = req.body; // is_active will be the NEW value ('0' or '1')

  const q = "UPDATE placement_drive SET `is_active` = ?, `mod_by` = ?, `mod_time` = NOW() WHERE drive_id = ?";
  
  db.query(q, [is_active, mod_by, driveId], (err, data) => {
    if (err) {
        console.error("DB Error toggling drive status:", err);
        return res.status(500).json(err);
    }
    return res.status(200).json({ message: "Placement drive status updated successfully." });
  });
};