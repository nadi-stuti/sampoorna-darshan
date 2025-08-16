import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ThemeConst from "@/constants/theme";

// Define theme colors

export type Theme = typeof ThemeConst.lightTheme;
type ThemeType = "light" | "dark" | "system";

type ThemeContextType = {
  theme: Theme;
  themeType: ThemeType;
  setThemeType: (theme: ThemeType) => void;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const [themeType, setThemeType] = useState<ThemeType>("system");
  const [theme, setTheme] = useState<Theme>(
    colorScheme === "dark" ? ThemeConst.darkTheme : ThemeConst.lightTheme
  );

  // Load saved theme preference
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("theme");
        if (savedTheme) {
          setThemeType(savedTheme as ThemeType);
        }
      } catch (e) {
        console.log("Error loading theme", e);
      }
    };
    loadTheme();
  }, []);

  // Apply theme based on preference and system
  useEffect(() => {
    const newTheme =
      themeType === "system"
        ? colorScheme === "dark"
          ? ThemeConst.darkTheme
          : ThemeConst.lightTheme
        : themeType === "dark"
        ? ThemeConst.darkTheme
        : ThemeConst.lightTheme;

    setTheme(newTheme);
  }, [themeType, colorScheme]);

  // Save theme changes
  const changeTheme = async (newTheme: ThemeType) => {
    try {
      await AsyncStorage.setItem("theme", newTheme);
      setThemeType(newTheme);
    } catch (e) {
      console.log("Error saving theme", e);
    }
  };

  const isDark =
    themeType === "dark" || (themeType === "system" && colorScheme === "dark");

  const value = {
    theme,
    themeType,
    setThemeType: changeTheme,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
