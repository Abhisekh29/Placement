import express from "express";
import authRoutes from "./routes/auth.js"
import sessionRoutes from "./routes/session.js"
import programRoutes from "./routes/program.js"
import studentRoutes from "./routes/student.js"
import userRoutes from "./routes/user.js";

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

app.use("/api/auth", authRoutes);
app.use("/api/session_master", sessionRoutes)
app.use("/api/program_master", programRoutes);
app.use("/api/student_master", studentRoutes);
app.use("/api/users", userRoutes);

// app.listen(8000, () =>{
//     console.log("Connected!")
// })

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));