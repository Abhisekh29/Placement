import { db } from "../db.js";

export const getPendingUsers = (req, res) => {
  const q = "SELECT userid, username, user_type FROM user_master WHERE is_enable = '0'";
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const updateUserStatus = (req, res) => {
  const { userId } = req.params;
  const { status, mod_by } = req.body;

  const q = "UPDATE user_master SET is_enable = ?, mod_by = ? WHERE userid = ?";
  db.query(q, [status, mod_by, userId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json({ message: "User status updated successfully." });
  });
};