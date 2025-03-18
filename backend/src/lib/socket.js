import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"]
    }
});

export function getReceiverSocketId(userId) { // Accept userId as parameter and give that userId to userSocketMap
    return userSocketMap[userId]; // object of  id of receiverId and returns socket id of receiverId
}

// Used to store online users

const userSocketMap = {};

io.on("connection", (socket) => {  //socket is user
    console.log("User connected.", socket.id);

    const userId = socket.handshake.query.userId;  // Data about connection access authUserId ad userId so , .userId.
    if (userId) userSocketMap[userId] /* userId is key */ = socket.id; // socketId is value

    io.emit("getOnlineUsers",Object.keys(userSocketMap));  // sendUser Id 

    socket.on("disconnect", () => {
        console.log("User disconnected", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap)); // again send all key value pairs to clinet side
    })
})  // something from browser has tried to access backend through url

export { io, server, app };