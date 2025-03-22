import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import axios from "axios";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

// First argument as callback function in zustand

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    onlineUsers: [],
    socket: null,

    /*OTP related */

    hasEnteredCorrectCredentials : false,

    isCheckingAuth: false,
    isCheckingAuth: true, // default isCheckingAuth = true
    isVerified: false,
    isOtpPending: true,
    isPostingUserOTP: false,

    hasSubmittedDetails : false,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data, isCheckingAuth: false, isVerified: res.data?.isVerified });
            get().connectSocket();
        } catch (error) {
            console.log("Error in checkAuth : ", error)
            set({ authUser: null });
        } finally {  // Final will execute in any condition
            set({ isCheckingAuth: false })
        }
    },

    signup: async (data) => { // in the backend it is automatically destructring the data /*Data is reaching backend done */
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            set({ authUser: res.data, isOtpPending: false });
            const requestData = JSON.parse(res.config.data);
            console.log(` Request Data is : ${JSON.stringify(requestData)}`);
            localStorage.setItem("fullName", requestData.fullName);
            localStorage.setItem("email", requestData.email);
            localStorage.setItem("password", requestData.password);
            console.log(localStorage);
        } catch (error) {
            toast.error(error.response.data.message);
            set({ authUser: null })
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", data); // destructure in backend automatically
            set({ authUser: res.data });
            toast.success("Logged In successfully");
            get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isLoggingIn: false })
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null, isOtpPending: false, isVerified: false });
            get().disconnectSocket();
            toast.success("Logged out successfully");
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });

        try {
            const res = await axiosInstance.put("/auth/update-profile", data);
            set({ authUser: res.data });
            toast.success("Profile updated successfully");
        } catch (error) {
            console.log("Error in updating profile", error);
            toast.error(error.response.data.message);
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    connectSocket: () => {
        const { authUser } = get();
        if (!authUser || get().socket?.connected) return;
        const socket = io(BASE_URL, {
            query: {
                userId: authUser._id,
            }  // localhost : 5001 pe jo hai as a userId = authUser._id bhejo
        });
        socket.connect();
        set({ socket: socket });

        socket.on("getOnlineUsers", (userIds) => {  // getUsers // users are no one but userSocketMap
            set({ onlineUsers: userIds });
        })

    },


    disconnectSocket: () => {
        if (get().socket?.connected) get().socket.disconnect();
    },

    postUserOTP: async (userOTP, email, fullName, password) => {
        try {
            set({ isPostingUserOTP: true });
            console.log(`userOTP is ${userOTP} \n FullName is : ${fullName}`);
            const res = await axiosInstance.post("/auth/getUserDataVerifyAndSaveUser", { userOTP, email, fullName, password });
            set({ authUser: res.data, isOtpPending: false, isVerified: true });
            console.log(`Data reached`);
            set({ hasEnteredCorrectCredentials: true , hasSubmittedDetails : true});
            toast.success("OTP submitted")
        } catch (error) {
            toast.error(error.response.data.message);
            toast.error("Failed to submit OTP!");
            set({ hasEnteredCorrectCredentials: false });
        } finally {
            set({ isPostingUserOTP: false });
        }
    },

    resendOTP: async (email, username) => {
        try {
            await axiosInstance.post("/auth/resend-otp", { email, username });
            toast.success("OTP resent successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Error resending OTP");
        }
    }

}))