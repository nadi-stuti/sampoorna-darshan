import { Tabs } from "expo-router";
import { Button, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/providers/ThemeProvider";
import { useTranslation } from "react-i18next";
import Feather from "@expo/vector-icons/Feather";
import { useAuth } from "@/providers/AuthProvider";

const ACTIVE_COLOR = "#FF7A30";
const INACTIVE_COLOR = "#9CA3AF";

export default function TabLayout() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          height: 60,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("common.home"),
          tabBarIcon: ({ color, size }) => (
            <Feather name="map" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="popular"
        options={{
          title: t("common.popular"),
          headerShown: true,
          headerTitle: t("destinations.popularDarshans"),
          headerStyle: {
            backgroundColor: theme.colors.backgroundSecondary,
            borderBottomColor: theme.colors.border,
            borderBottomWidth: 2,
            height: 90,
          },
          headerTitleStyle: {
            color: theme.colors.text,
          },
          tabBarIcon: ({ color, size }) => (
            <Feather name="star" color={color} size={size} />
          ),
        }}
      />
        <Tabs.Screen
          name="favorites"
          options={{
            title: t("common.favorites"),
            href: user ? "/favorites" : null,
            headerShown: true,
            headerStyle: {
              backgroundColor: theme.colors.backgroundSecondary,
              borderBottomColor: theme.colors.border,
              borderBottomWidth: 2,
              height: 90,
            },
            headerTitleStyle: {
              color: theme.colors.text,
            },
            tabBarIcon: ({ color, size }) => (
              <Feather name="heart" color={color} size={size} />
            ),
          }}
        />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("common.profile"),
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarStyle: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    elevation: 0,
    borderRadius: 15,
    height: 60,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: {
      width: 0,
      height: 10,
    },
  },
});
