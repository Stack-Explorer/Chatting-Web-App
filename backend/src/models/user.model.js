import mongoose, { Mongoose } from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    profilePic: {
        type: String,
        default: ""
    }
},
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);  // For member since ke liye

export default User;