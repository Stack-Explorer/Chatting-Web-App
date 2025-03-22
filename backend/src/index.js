import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"
import { connectDB } from "./lib/lib.js";
import cookieParser from "cookie-parser";  // Parsing cookie
import cors from "cors";
import bodyParser from "body-parser";

import path from "path";

import { app, server, io } from "./lib/socket.js"

dotenv.config();

const PORT = process.env.PORT;
const __dirname = path.resolve();

// npm run "dev"  ------>   run cmd nodemon index.js

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

const fullSrcLink = path.join(__dirname, "../frontend/dist");

console.log(fullSrcLink);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"))
    })
}

server.listen(PORT, () => {
    console.log(`Server is working on PORT ${PORT}`);
    connectDB();
})