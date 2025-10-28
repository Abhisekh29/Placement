import { db } from "../db.js";

export const getPendingUsers = (req, res) => {
  const q = "SELECT userid, username, user_type FROM user_master WHERE is_enable = '0'";
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};


export const updateUserStatus = (req, res) => {
  const { userid } = req.params;
  const { status, mod_by } = req.body;
  
  if (!status || !mod_by) {
    // This handles the case where mod_by is missing (caused "status for null" error previously)
    return res.status(400).json({ message: "Status and modifier (mod_by) are required." });
  }

  // q: Update user_master table
  const q = "UPDATE user_master SET is_enable = ?, mod_by = ?, mod_time = NOW() WHERE userid = ?";
  const values = [status, mod_by, userid];

  db.query(q, values, (err, data) => {
    if (err) {
      console.error("DB Error updating user status:", err);
      return res.status(500).json({ message: "Database failed to update user status.", error: err });
    }
    
    if (data.affectedRows === 0) {
        return res.status(404).json({ message: "User not found or status already set." });
    }
    
    // Success: Returns 200 OK.
    return res.status(200).json({ message: `User status updated to ${status}` });
  });
};