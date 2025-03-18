import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt, { genSalt, hash } from "bcryptjs";

export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;
    try {

        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (!fullName.trim() || !email.trim() || !password.trim()) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Enter valid email format" });
        }

        // Password restriction
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be atleast 6 characters" });
        }
        // User checking error handling
        const user = await User.findOne({ email }); // Find if email already exists

        if (user) return res.status(400).json({ message: "Email already exists" });

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        });

        if (newUser) {
            // Generate JWT Token Here.
            generateToken(newUser._id, res);
            await newUser.save();

            return res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic
            }) // _Id can be be as Id
        } else {
            return res.status(400).json({ message: "Invalid user data" });
        }


    } catch (error) {
        console.log("Error in signup controller : ", error.message);
        res.status(500).json({ message: "Internal Server Error" })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }); // just getting the object 
        if (!user) {
            return res.status(400).json({ message: "Email not found !" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid Password" });
        }

        generateToken(user._id, res);

        return res.status(201).json({
            _id: user._id,
            email,
            fullName: user.fullName,
            profilePic: user.profilePic,
        })
    } catch (error) {
        console.log(`Error in Login controller : ${error.message}`);
        return res.status(500).json({ error: "Internal Server error" })
    }
}

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 })  // DOn't send anything in place of value like token var and message empty set jwt token as empty 
        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("Error in logout controller", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

export const updateProfile = async (req, res) => {
    // updateProfile naam ka function bana hai  will only be triggered when that button will be clicked 
    // Profile Pic is empty by default and then , updatedUser will find by id and sets from "" -> to https://cloudinaryimage 
    try {
        const { profilePic } = req.body
        const userId = req.user._id  // req.user is user and hence getting id of it

        if (!profilePic) {
            return res.status(400).json({ message: "Profile Pic is required" });
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic)  // It is like kind of url to upload iamges on cloudinary
        const updatedUser = await User.findByIdAndUpdate(userId, { profilePic: uploadResponse.secure_url }, { new: true })  // pass id and which field do you want to update.  // profile pic from "" -> is "https"

        return res.status(200).json(updatedUser);

    } catch (error) {
        console.log("Error in updateProfile : ", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

export const checkAuth = (req, res) => {
    try {
        return res.status(200).json(req.user);  // Give whole user data 
    } catch (error) {
        console.log("Error in checkAuth controller : ", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}