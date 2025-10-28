import { db } from "../db.js";

// Fetching active students (is_enable = '1')
export const getStudents = (req, res) => {
  const { yearId, programId } = req.query; 
  
  if (!yearId) {
    return res.status(400).json({ message: "Academic Year is required for fetching students." });
  }

  let q = `
    SELECT 
      s.userid,
      s.rollno,
      s.name,
      s.mobile,
      s.email,
      s.dob,
      s.gender,
      s.caste,
      s.address,
      s.per_10,
      s.per_12,
      ss.session_name,
      p.program_name,
      s.mod_time,
      um.username AS modified_by
    FROM student_master AS s
    JOIN session_master AS ss ON s.session_id = ss.session_id
    JOIN academic_year AS ay ON ss.year_id = ay.year_id 
    JOIN program_master AS p ON s.program_id = p.program_id
    LEFT JOIN user_master AS um ON s.mod_by = um.userid
    JOIN user_master AS u ON s.userid = u.userid
  `;

  const values = [];
  // Condition 1: Only fetches ENABLED/ACTIVE students (is_enable = '1')
  const conditions = ["u.is_enable = '1'", "ay.year_id = ?"];
  values.push(yearId);

  // Add optional Program filter
  if (programId && programId !== 'all') {
    conditions.push("p.program_id = ?");
    values.push(programId);
  }

  q += " WHERE " + conditions.join(" AND ");
  q += " ORDER BY s.rollno"; 

  db.query(q, values, (err, data) => {
    if (err) {
      console.error("DB Error fetching active students:", err);
      return res.status(500).json(err);
    }
    return res.status(200).json(data);
  });
};


// 🌟 NEW FUNCTION: Fetching rejected students (is_enable = '2') 🌟
export const getRejectedStudents = (req, res) => {
  const q = `
    SELECT 
      u.userid,
      s.name,
      s.rollno,
      s.mobile,
      u.username,
      u.user_type,
      u.mod_time,
      um.username AS modified_by
    FROM user_master AS u
    LEFT JOIN student_master AS s ON u.userid = s.userid
    LEFT JOIN user_master AS um ON u.mod_by = um.userid
    WHERE u.is_enable = '2' 
    ORDER BY u.mod_time DESC
  `;

  db.query(q, (err, data) => {
    if (err) {
      console.error("DB Error fetching rejected students:", err);
      return res.status(500).json(err);
    }
    return res.status(200).json(data);
  });
};

export const updateStudent = (req, res) => {
  const { userid } = req.params;
  const q = "UPDATE Student_master SET `rollno` = ?, `name` = ?, `mobile` = ?, `email` = ?, `dob` = ?, `gender` = ? , `caste` = ? , `address` = ? , `per_10` = ? , `per_12` = ? , `session_id` = ?, `program_id` = ?, `mod_by` = ?, `mod_time` = NOW() WHERE userid = ?";
  const values = [
    req.body.rollno,
    req.body.name,
    req.body.mobile,
    req.body.email,
    req.body.dob,
    req.body.gender,
    req.body.caste,
    req.body.address,
    req.body.per_10,
    req.body.per_12,
    req.body.session_id,
    req.body.program_id,
    req.body.mod_by,
  ];
  db.query(q, [...values, userid], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json({ message: "Student updated successfully." });
  });
};

export const deleteStudent = (req, res) => {
  const { userid } = req.params;
  
  // Start transaction to ensure both records are handled
  db.beginTransaction(err => {
    if (err) return res.status(500).json({ message: "Transaction failed." });

    // 1. Delete from student_master
    const q1 = "DELETE FROM Student_master WHERE userid = ?";
    db.query(q1, [userid], (err, data) => {
      if (err && err.code !== 'ER_ROW_IS_REFERENCED_2') { // Allow deletion if no student record exists
        return db.rollback(() => res.status(500).json({ message: "Failed to delete student record.", error: err }));
      }

      // 2. Delete from user_master
      const q2 = "DELETE FROM user_master WHERE userid = ?";
      db.query(q2, [userid], (err, data) => {
        if (err) {
          return db.rollback(() => res.status(500).json({ message: "Failed to delete user account.", error: err }));
        }

        db.commit(commitErr => {
          if (commitErr) return db.rollback(() => res.status(500).json({ message: "Commit failed." }));
          return res.status(200).json({ message: "Student and User records deleted successfully." });
        });
      });
    });
  });
};
