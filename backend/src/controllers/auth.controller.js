import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt, { genSalt, hash } from "bcryptjs";
import { sendOTPEmail } from "./nodemailer.controller.js";
import OTP from "../models/otp.model.js";

export const signup = async (req, res) => {
    try {

        console.log("I got called from frontend");

        console.log(`Body data is : `, req.body);

        const { email, fullName, password } = req.body;

        console.log(req.body)

        if (!email || !fullName || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (!email.trim() || !fullName.trim() || !password.trim()) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.trim().length < 6) {
            return res.status(401).json({ message: "Password must be at least 6 characters" });
        }

        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z]{2,})+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }


        const doUserExist = await User.findOne({ email });

        if (doUserExist) return res.status(401).json({ message: "User already exists!" })

        await generateOTP(email, fullName);

        console.log("OTP sent on given email");

        return res.status(201).json({ message: "OTP sent on given email" });

    } catch (err) {
        console.log(`Error in signup controller : ${err.message}`);
        res.status(500).json({ error: "Internal server error" });
    }
};

const generateOTP = async (email, fullName) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    console.log(`Generated OTP is ${otp}`)

    await OTP.findOneAndUpdate(
        { email },
        { otp, expiresAt },
        { upsert: true, new: true }
    )

    const generatedAndSavedOTP = OTP.findOne({ otp });

    console.log(`generatedAndSavedOTP is : ${generatedAndSavedOTP}`);

    try {
        await sendOTPEmail(email, otp, fullName);
        return otp;
    } catch (error) {
        console.log("Error in SendOTP function : ", error.message);
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

const verifyOTP = async (originalOTP, userOTP) => {
    try {
        if (userOTP !== originalOTP) {
            return { success: false, message: "Invalid OTP!" }
        }
        console.log(`verifyOTP got triggered`)
        return { success: true, message: "Account Created successfully !" };

    } catch (error) {
        console.log("Error in verifyOTP controller : ", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

export const getUserDataVerifyAndSaveUser = async (req, res) => {

    try {

        console.log(` getUserDataVerifyAndSaveUser is : ${JSON.stringify(req.body)}`)

        console.log(req.body);

        const { email, fullName, password, userOTP } = req.body;

        console.log(`Email is : ${email} \n fullName is : ${fullName} \n password is : ${password} \n userOTP is : ${userOTP} `)

        const otpEntry = await OTP.findOne({ email }); // Gives whole document

        console.log(`Original OTP is : ${otpEntry.otp}`)

        if (!otpEntry) {
            return res.status(400).json({ message: "OTP not found. Please request a new OTP." });
        }

        if (Date.now() > otpEntry.expiresAt) {
            console.log(`Date got triggered`);
            return res.status(401).json({ message: "OTP expired. Please request a new OTP." });
        }

        const verificationResult = await verifyOTP(otpEntry.otp, userOTP);

        if (!verificationResult.success) {
            return res.status(401).json({ message: verificationResult.message });
        }

        console.log("OTP verified");

        // naya user tab tak creat enahi hona chahiye jab tak email verify na ho jaaye 

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = new User({
            email,
            fullName,
            password: hashedPassword
        });

        if (!newUser) {
            return res.status(401).json({ message: "Failed to create account" });
        }


        const saveUser = await newUser.save();

        if (!saveUser) {
            console.log("User not saved")
        }

        const tokenGenerated = await generateToken(newUser._id, res);

        if (tokenGenerated) console.log("Token Generated");

        console.log("Account Created Successfully !")

        return res.status(200).json({ message: "Account Created Successfully !" });

    } catch (error) {
        console.log("Error in getUserDataVerifyAndSaveUser : ", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

export const resendOTP = async (req, res) => {
    try {
        const { email, fullName } = req.body;

        if (!email || !fullName) {
            return res.status(400).json({ message: "Email and fullName are required" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Expires in 5 mins

        await OTP.findOneAndUpdate(
            { email },
            { otp, expiresAt },
            { upsert: true, new: true }
        );

        await sendOTPEmail(email, otp, fullName);
        return res.status(200).json({ message: "OTP resent successfully" });

    } catch (error) {
        console.error(`Error in resendOTP controller: ${error.message}`);
        res.status(500).json({ error: "Internal server error" });
    }
};