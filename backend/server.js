import express from "express";
import authRoutes from "./routes/auth.js"
import sessionRoutes from "./routes/session.js"
import programRoutes from "./routes/program.js"
import adminProgramRoutes from "./routes/adminProgram.js"
import studentRoutes from "./routes/student.js"
import userRoutes from "./routes/user.js";
import academicYearRoutes from "./routes/academicYear.js";
import departmentRoutes from "./routes/department.js";
import companyTypeRoutes from "./routes/companyType.js";
import academicSessionRoutes from "./routes/academicSession.js";
import companyRoutes from "./routes/company.js";
import adminCompanyRoutes from "./routes/adminCompany.js";

import cors from "cors";
import cookieParser from "cookie-parser";

const app = express()

// ✅ Enable CORS
app.use(cors({
  origin: "http://localhost:5173", // allow your frontend
  credentials: true, // if you plan to use cookies/sessions
}));

app.use(express.json())
app.use(cookieParser())

// Open Routes
app.use("/api/auth", authRoutes);

// Student Routes
app.use("/api/session_master", sessionRoutes)
app.use("/api/program_master", programRoutes);
app.use("/api/student_master", studentRoutes);
app.use("/api/company", companyRoutes);

// User Routes
app.use("/api/users", userRoutes);
app.use("/api/academic-year", academicYearRoutes);
app.use("/api/department", departmentRoutes);
app.use("/api/companyType", companyTypeRoutes);
app.use("/api/academic-session", academicSessionRoutes);
app.use("/api/adminPrograms", adminProgramRoutes);
app.use("/api/adminCompany", adminCompanyRoutes);


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));