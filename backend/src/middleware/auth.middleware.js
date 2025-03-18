import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
    try {
        // First gets the token and if not token . nikal bosdike
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No Token Provided !" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized - Invalid Token" });
        }

        const user = await User.findById(decoded.userId).select("-password");

        req.user = user;

        // req.user jo hai vo ab user hai jo 

        next();

        // next basically be anything

    } catch (error) {
        console.log(`Error in protectRoute MiddleWare : ${error.message}`);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}