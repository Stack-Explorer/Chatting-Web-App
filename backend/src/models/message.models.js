import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,  // reference of User and unique ID 
        ref: "User",                           // Buss fiilhaal abhi user ka reference li or unique id genrate karo , buss that's it   
        required: true,
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    text: {
        type: String,
    },
    image: {
        type: String
    },
},
    { timestamps: true }, // For message timing
);

const Message = mongoose.model("Message", messageSchema);

export default Message;