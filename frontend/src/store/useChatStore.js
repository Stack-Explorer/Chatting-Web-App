import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore.js"

export const useChatStore = create((set, get) => ({
    messages: [], // Empty array
    users: [],  // Empty array , later will be pushed.
    selectedUser: null,
    isUsersLoading: false, // isUsersLoading
    isMessagesLoading: false,

    getUsers: async () => {  // On clicking getUsersForSidebar receiver's id will be received and that will be sent to backend
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/users") // sending request to abckend for getting users
            set({ users: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isUsersLoading: false })
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (messageData) => {

        const { selectedUser, messages } = get();

        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set({ messages: [...messages, res.data] });
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    /*Get all the messages */
    subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket;

        // To Do here.

        socket.on("newMessage", (newMessage) => {
            if (newMessage.senderId !== selectedUser._id) return;
            set({
                messages: [...get().messages, newMessage]
            });
        });

    },

    /*Good for performance of app */
    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    },

    // Set selecetdUser is function that slects the user. which null i starting

    setSelectedUser: (selectedUser) => set({ selectedUser }),

}));