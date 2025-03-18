import { create } from "zustand";

export const useThemeStore = create((set) => ({
    theme: localStorage.getItem("chat-theme") || "coffee", // Initial theme is coffee.  nahin to set karo as a chatTheme
    setTheme: (theme) => {
        localStorage.setItem("chat-theme", theme);  // Theme will be taken in as parameter and setting that theme as theme hence theme is only written ,
        set({ theme });  // localStorage : chat-theme :  setTheme  as theme and set theme as retro or anything from "coffee"
    }
}));