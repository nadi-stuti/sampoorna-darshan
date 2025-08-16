import { Platform } from "react-native";

export type ThemeType = "light" | "dark";

const badgeColorsLight: Record<string, string> = {
  Shiva: "#c9d5f7",
  Vishnu: "#9ac9a6",
  Krishna: "#dab5d3",
  Rama: "#e5d8a5",
  Ganesh: "#e1b9a8",
  Hanuman: "#85d3c3",
  Shakti: "#e19b9b",
  Durga: "#e5acba",
  Kali: "#8b8bcc",
  Lakshmi: "#ded368",
  RadhaVallabhi: "#de6f9e",
  Vaishnava: "#97e797",
  Shaiva: "#e3e8f7",
  Shakta: "#eba0b3",
  Ganapatya: "#f49871",
  Swaminarayan: "#d3c27a",
};

const badgeColorsDark: Record<string, string> = {
  Shiva: "#23263a",
  Vishnu: "#233a2a",
  Krishna: "#3a2335",
  Rama: "#393823",
  Ganesh: "#3a2b23",
  Hanuman: "#233a36",
  Shakti: "#3a2323",
  Durga: "#3a2328",
  Kali: "#23233a",
  Lakshmi: "#233a3a",
  RadhaVallabhi: "#233a3a",
  Vaishnava: "#233a2a",
  Shaiva: "#23263a",
  Shakta: "#3a2328",
  Ganapatya: "#3a2b23",
  Swaminarayan: "#393823",
};

const palette = {
  // Primary colors
  orange: {
    50: "#FFF8F0",
    100: "#FFECD6",
    200: "#FFD5AD",
    300: "#FFBB85",
    400: "#FFA45C",
    500: "#FF8A33", // Primary orange
    600: "#F06E00",
    700: "#C85A00",
    800: "#A04700",
    900: "#7A3600",
  },
  red: {
    50: "#FFF1F1",
    100: "#FFE1E1",
    200: "#FFC7C7",
    300: "#FFA8A8",
    400: "#FF7E7E",
    500: "#FF5C5C", // Primary red
    600: "#FF2D2D",
    700: "#FF0000",
    800: "#CC0000",
    900: "#990000",
  },
  blue: {
    50: "#EFF6FF",
    100: "#DBEAFE",
    200: "#BFDBFE",
    300: "#93C5FD",
    400: "#60A5FA",
    500: "#3B82F6",
    600: "#2563EB",
    700: "#1D4ED8",
    800: "#1E40AF",
    900: "#1E3A8A",
  },
  yellow: {
    50: "#FFFBEB",
    100: "#FEF3C7",
    200: "#FDE68A",
    300: "#FCD34D",
    400: "#FBBF24",
    500: "#F59E0B",
    600: "#D97706",
    700: "#B45309",
    800: "#92400E",
    900: "#78350F",
  },
  green: {
    50: "#ECFDF5",
    100: "#D1FAE5",
    200: "#A7F3D0",
    300: "#6EE7B7",
    400: "#34D399",
    500: "#10B981",
    600: "#059669",
    700: "#047857",
    800: "#065F46",
    900: "#064E3B",
  },
  // Grayscale
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },
};

const fonts = {
  weights: {
    regular: "400",
    medium: "500",
    bold: "700",
  },
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.65,
  },
  families: {
    heading: Platform.select({
      ios: "Georgia",
      android: "serif",
      web: "Georgia, serif",
    }),
    body: Platform.select({
      ios: "System",
      android: "Roboto",
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    }),
  },
};

const spacing = {
  "0": 0,
  "0.5": 2,
  "1": 4,
  "2": 8,
  "3": 12,
  "4": 16,
  "5": 20,
  "6": 24,
  "8": 32,
  "10": 40,
  "12": 48,
  "16": 64,
  "20": 80,
  "24": 96,
  "32": 128,
};

const radii = {
  none: 0,
  sm: 2,
  md: 4,
  lg: 8,
  xl: 12,
  "2xl": 16,
  "3xl": 24,
  full: 9999,
};

const shadows = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 7,
  },
};

// Light Theme
const lightTheme = {
  colors: {
    primary: palette.orange[500],
    primaryLight: palette.orange[300],
    primaryDark: palette.orange[700],
    secondary: palette.red[500],
    secondaryLight: palette.red[300],
    secondaryDark: palette.red[700],
    accent: palette.yellow[500],

    background: "#FFFFFF",
    backgroundSecondary: palette.gray[100],
    card: "#FFFFFF",
    text: palette.gray[900],
    textSecondary: palette.gray[600],
    textTertiary: palette.gray[400],
    border: palette.gray[200],
    divider: palette.gray[200],

    success: palette.green[500],
    error: palette.red[500],
    warning: palette.yellow[500],
    info: palette.blue[500],
    badge: badgeColorsLight,

    // Map specific
    mapBackground: "#E8EAF6",
    mapWater: "#B3E5FC",
    mapLand: "#DCEDC8",
    mapRoad: "#FFFFFF",
    mapBorder: palette.gray[300],
  },
  dark: false,
};

// Dark Theme
const darkTheme = {
  colors: {
    primary: palette.orange[600],
    primaryLight: palette.orange[400],
    primaryDark: palette.orange[800],
    secondary: palette.red[600],
    secondaryLight: palette.red[400],
    secondaryDark: palette.red[800],
    accent: palette.yellow[600],

    background: palette.gray[900],
    backgroundSecondary: palette.gray[800],
    card: palette.gray[800],
    text: "#FFFFFF",
    textSecondary: palette.gray[300],
    textTertiary: palette.gray[500],
    border: palette.gray[700],
    divider: palette.gray[700],

    success: palette.green[600],
    error: palette.red[600],
    warning: palette.yellow[600],
    info: palette.blue[600],
    badge: badgeColorsDark,
    // Map specific
    mapBackground: "#121212",
    mapWater: "#263238",
    mapLand: "#1B2826",
    mapRoad: "#37474F",
    mapBorder: palette.gray[700],
  },
  dark: true,
};

export const ThemeConst = {
  lightTheme,
  darkTheme,
  fonts,
  spacing,
  radii,
  shadows,
};

export default ThemeConst;
