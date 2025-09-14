import express from "express";
import authRoutes from "./routes/auth.js"
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

// app.listen(8000, () =>{
//     console.log("Connected!")
// })

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));