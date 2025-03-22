import express from "express";
import { checkAuth, getUserDataVerifyAndSaveUser, login, logout, resendOTP, signup, updateProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout",protectRoute, logout);

router.put("/update-profile", protectRoute, updateProfile);

router.get("/check", protectRoute, checkAuth);

router.post("/getUserDataVerifyAndSaveUser", getUserDataVerifyAndSaveUser);

router.post("/resend-otp", resendOTP);

export default router;