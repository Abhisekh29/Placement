import { db } from "../db.js";

export const getStudentDetails = (req, res) => {
  const q = "SELECT * FROM student_master WHERE userid = ?";

  db.query(q, [req.params.userid], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const addStudent = (req, res) => {
    const q =
    "INSERT INTO student_master(`rollno`, `name`, `mobile`, `email`, `dob`, `gender`, `caste`, `address`, `per_10`, `per_12`, `session_id`, `program_id`, `userid`, `mod_by`) VALUES (?)";

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
        req.body.userid,
        req.body.mod_by,
    ];

    db.query(q, [values], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json("Student data has been created.");
    });
}