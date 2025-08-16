import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Switch,
  ScrollView,
  Image,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import LoadingIndicator from "@/components/common/LoadingIndicator";
import {
  getUserNotifications,
  Notificaitons,
  removeEventNotification,
} from "@/lib/notifications";

import Feather from "@expo/vector-icons/Feather";
import AuthScreen from "../auth-screen";
import { languageOptions } from "@/lib/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { convertTo12HourFormat } from "@/lib/functions";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const { theme, themeType, setThemeType, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const { user, handleSignOut } = useAuth();

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notificaitons>([]);

  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  const handleLanguageToggle = () => {
    setShowLanguageSelector(!showLanguageSelector);
  };

  const getLanguageDisplayName = (code: string) => {
    const option = languageOptions.find((opt) => opt.code === code);
    return option ? option.label : code;
  };

  const handleLanguageSelect = async (languageCode: string) => {
    if (!user) return;

    try {
      await supabase
        .from("users")
        .update({ preferred_language: languageCode })
        .eq("id", user.id);

      i18n.changeLanguage(languageCode);

      // Update local state
      setProfile((prev) => ({ ...prev, preferred_language: languageCode }));
    } catch (err) {
      console.error("Error updating language:", err);
    }
    setShowLanguageSelector(false);
  };

  const toggleTheme = async () => {
    if (!user) return;

    const theme = themeType === "light" ? "dark" : "light";

    try {
      await supabase.from("users").update({ theme }).eq("id", user.id);

      setThemeType(theme);

      // Update local state
      setProfile((prev) => ({ ...prev, theme }));

      await AsyncStorage.setItem("userTheme", theme);
    } catch (err) {
      console.error("Error updating theme:", err);
    }
  };

  // Fetch user profile
  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);

      // Set language from profile
      if (data?.preferred_language) {
        i18n.changeLanguage(data.preferred_language);
      }

      // Set theme from profile
      if (data?.theme) {
        setThemeType(data.theme as any);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user notifications
  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const data = await getUserNotifications(user.id);
      setNotifications(data || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  // Delete notification
  const deleteNotification = async (
    notificationId: string,
    eventId: string
  ) => {
    if (!user) return;

    try {
      await removeEventNotification(user.id, eventId);

      // Update local state
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== notificationId)
      );
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };
  
  const router = useRouter();

  // Load initial data
  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchNotifications();
    }
  }, [user]);


  if (loading && !profile) {
    return <LoadingIndicator />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <View style={styles.profileSection}>
              <Image
                source={{
                  uri:
                    user.user_metadata?.avatar_url ||
                    "https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg",
                }}
                style={styles.profileImage}
              />
              <View style={styles.profileInfo}>
                <Text
                  style={[styles.profileName, { color: theme.colors.text }]}
                >
                  {user.user_metadata?.full_name || "User"}
                </Text>
                <Text
                  style={[
                    styles.profileEmail,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {user.email}
                </Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity
                style={[styles.logoutButton, { backgroundColor: theme.colors.backgroundSecondary }]}
                onPress={handleSignOut}
              >
                <Text style={[styles.logoutText, { color: theme.colors.error }]}>
                  {t("common.logout")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {true && (
                <TouchableOpacity
                  style={[styles.adminButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => router.push('/admin')}
                >
                  <Feather name="external-link" size={20} color="white" />
                  <Text style={styles.adminButtonText}>Admin Dashboard</Text>
                </TouchableOpacity>
              )}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t("profile.userDetails")}
            </Text>

            <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
              <TouchableOpacity
                style={styles.settingRow}
                onPress={handleLanguageToggle}
              >
                <View style={styles.settingLabelContainer}>
                  <Text
                    style={[styles.settingLabel, { color: theme.colors.text }]}
                  >
                    {t("profile.language")}
                  </Text>
                </View>
                <Text
                  style={[styles.settingValue, { color: theme.colors.text }]}
                >
                  {getLanguageDisplayName(profile?.preferred_language)}
                </Text>
              </TouchableOpacity>

              {showLanguageSelector && (
                <View
                  style={[
                    styles.languageSelector,
                    { backgroundColor: theme.colors.backgroundSecondary },
                  ]}
                >
                  {languageOptions.map((option) => (
                    <TouchableOpacity
                      key={option.code}
                      style={[
                        styles.languageOption,
                        profile?.preferred_language === option.code && {
                          backgroundColor: `${theme.colors.primary}20`,
                        },
                      ]}
                      onPress={() => handleLanguageSelect(option.code)}
                    >
                      <Text
                        style={[
                          styles.languageText,
                          { color: theme.colors.text },
                          profile?.preferred_language === option.code && {
                            fontWeight: "600",
                            color: theme.colors.primary,
                          },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View style={styles.settingRow}>
                <View style={styles.settingLabelContainer}>
                  <Text
                    style={[styles.settingLabel, { color: theme.colors.text }]}
                  >
                    {t("profile.theme")}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.themeToggle,
                    { backgroundColor: theme.colors.backgroundSecondary },
                  ]}
                  onPress={toggleTheme}
                >
                  <View
                    style={[
                      styles.themeOption,
                      !isDark && { backgroundColor: theme.colors.primary },
                    ]}
                  >
                    <Feather
                      name="sun"
                      size={16}
                      color={!isDark ? "white" : theme.colors.textSecondary}
                    />
                  </View>
                  <View
                    style={[
                      styles.themeOption,
                      isDark && { backgroundColor: theme.colors.primary },
                    ]}
                  >
                    <Feather
                      name="moon"
                      size={16}
                      color={isDark ? "white" : theme.colors.textSecondary}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {notifications.length > 0 && (
            <View style={styles.section}>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={[styles.sectionTitle, { color: theme.colors.text }]}
                >
                  {t("profile.myAlerts")}
                </Text>

                <TouchableOpacity onPress={fetchNotifications}>
                  <Feather
                    name="refresh-cw"
                    size={24}
                    style={{ color: theme.colors.primary }}
                  />
                </TouchableOpacity>
              </View>

              <View
                style={[styles.card, { backgroundColor: theme.colors.card }]}
              >
                {notifications.map((notification) => {
                  const event = notification.events;
                  const eventTranslation =
                    event.event_translations.find(
                      (t) => t.language === profile?.preferred_language
                    ) ||
                    event.event_translations[0] ||
                    {};
                  const destination = event.destinations;
                  const destinationTranslation =
                    destination.destination_translations.find(
                      (d) => d.language === profile?.preferred_language
                    ) ||
                    destination?.destination_translations[0] ||
                    {};

                  return (
                    <View key={notification.id} style={styles.reminderRow}>
                      <View style={styles.reminderInfo}>
                        <Text
                          style={[
                            styles.reminderName,
                            { color: theme.colors.text },
                          ]}
                        >
                          {eventTranslation.name}
                        </Text>
                        <View style={styles.reminderDetails}>
                          <Feather
                            name="map-pin"
                            size={12}
                            color={theme.colors.primary}
                            style={styles.reminderIcon}
                          />
                          <Text
                            style={[
                              styles.reminderLocation,
                              { color: theme.colors.textSecondary },
                            ]}
                          >
                            {destinationTranslation?.name || "unknown"}
                          </Text>
                        </View>
                        <View style={styles.reminderDetails}>
                          <Feather
                            name="calendar"
                            size={12}
                            color={theme.colors.primary}
                            style={styles.reminderIcon}
                          />
                          <Text
                            style={[
                              styles.reminderTime,
                              { color: theme.colors.textSecondary },
                            ]}
                          >
                            {event.daily ? t("events.daily") : event.date}{" "}
                            {convertTo12HourFormat(event.start_time)}
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.deleteButton,
                          { backgroundColor: theme.colors.error },
                        ]}
                        onPress={() =>
                          deleteNotification(notification.id, event.id)
                        }
                      >
                        <Feather name="trash" size={16} color="white" />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 16 : 16,
    paddingBottom: 16,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileInfo: {
    marginLeft: 12,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    fontWeight: "500",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  settingLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 16,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginLeft: 10,
    textAlign: "right",
  },
  languageSelector: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  languageOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
  },
  languageText: {
    fontSize: 16,
  },
  themeToggle: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 4,
  },
  themeOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  reminderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  reminderInfo: {
    flex: 1,
  },
  reminderName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  reminderDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  reminderIcon: {
    marginRight: 6,
  },
  reminderLocation: {
    fontSize: 14,
  },
  reminderTime: {
    fontSize: 14,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
    marginLeft:20,
    marginRight:20,
  },
  adminButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   content: {
//     padding: 16,
//   },
//   header: {
//     alignItems: "center",
//     marginBottom: 24,
//   },
//   profilePhoto: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     marginBottom: 16,
//   },
//   username: {
//     fontSize: 18,
//     fontWeight: "600",
//     marginBottom: 16,
//   },
//   section: {
//     marginBottom: 24,
//     padding: 16,
//     borderWidth: 1,
//     borderRadius: 8,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     marginBottom: 16,
//   },
//   preferenceRow: {
//     marginBottom: 16,
//   },
//   preferenceLabel: {
//     fontSize: 16,
//     marginBottom: 8,
//   },
//   languageSwitcher: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//   },
//   languageButton: {
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 20,
//     marginRight: 8,
//     marginBottom: 8,
//   },
//   languageButtonText: {
//     fontSize: 14,
//     fontWeight: "500",
//   },
//   themeSwitcher: {
//     flexDirection: "row",
//   },
//   themeButton: {
//     flex: 1,
//     paddingVertical: 8,
//     alignItems: "center",
//     marginRight: 8,
//     borderRadius: 8,
//   },
//   themeButtonText: {
//     fontSize: 14,
//     fontWeight: "500",
//   },
//   alertItem: {
//     flexDirection: "row",
//     padding: 16,
//     borderWidth: 1,
//     borderRadius: 8,
//     marginBottom: 8,
//   },
//   alertContent: {
//     flex: 1,
//   },
//   alertTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginBottom: 4,
//   },
//   alertSubtitle: {
//     fontSize: 14,
//     marginBottom: 4,
//   },
//   alertTime: {
//     fontSize: 12,
//   },
//   deleteButton: {
//     justifyContent: "center",
//     paddingHorizontal: 8,
//   },
//   emptyText: {
//     textAlign: "center",
//     padding: 16,
//     fontSize: 14,
//   },
// });
