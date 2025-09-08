import express from "express";

const app = express()

app.use(express.json())

// app.listen(8000, () =>{
//     console.log("Connected!")
// })

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));