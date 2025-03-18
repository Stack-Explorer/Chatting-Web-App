import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =  import.meta.env.MODE === "development" ?"http://localhost:5001" : "/"  ;

// First argument as callback function in zustand

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    onlineUsers: [],
    socket: null,

    isCheckingAuth: true, // default isCheckingAuth = true

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data });
            get().connectSocket();
        } catch (error) {
            console.log("Error in checkAuth : ", error)
            set({ authUser: null });
        } finally {  // Final will execute in any condition
            set({ isCheckingAuth: false })
        }
    },

    signup: async (data) => { // in the backend it is automatically destructring the data
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            set({ authUser: res.data });
            toast.success("Account created successfully");
        } catch (error) {
            toast.error(error.response.data.message);
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
            set({ authUser: null });
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
    }

}))