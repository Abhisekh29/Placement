import { db } from "../db.js";

export const getHomeNotifications = (req, res) => {
  // A safer alternative to avoid whitespace issues
  const q = `SELECT n.start_date, n.end_date, n.text FROM notification AS n WHERE CURDATE() BETWEEN n.start_date AND n.end_date ORDER BY n.start_date DESC`;

  db.query(q, (err, data) => {
    if (err) {
      console.error("DATABASE ERROR in homeNotifications:", err); // 👈 ADD THIS LOG
      return res.status(500).json({ error: "Failed to fetch notifications from DB" });
    }
    // The data should be an array here, even if empty.
    return res.status(200).json(data);
  });
};