import { ImageViewer } from "@/components/destinations/ImageViewer";
import { convertTo12HourFormat } from "@/lib/functions";
import {
  DestinationsFullDetails,
  getDestinationFullDetails,
  getUserEvents
} from "@/lib/map";
import {
  removeEventNotification,
  saveEventNotification,
} from "@/lib/notifications";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import Feather from "@expo/vector-icons/Feather";
import { format } from "date-fns";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from "react-native";
import Toast from "react-native-toast-message";

// Generate a unique ID for reminders
const generateId = () => Math.random().toString(36).substring(2, 15);

type EventTabType = "daily" | "upcoming";

interface Event {
  id: string;
  start_time: string;
  end_time: string;
  daily: boolean | null;
  date: string | null;
  event_image: string | null;
  event_translations: Array<{
    name: string;
    description: string;
    language: "hi" | "en" | "kn" | "ml" | "ta";
  }>;
}

export default function DestinationDetailScreen() {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams();
  const { id, tab: initialTab } = params;

  const [activeTab, setActiveTab] = useState(
    initialTab === "daily-events" ? "daily events" : "details"
  );
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [details, setDetails] = useState<DestinationsFullDetails[number] | null>(
    null
  );
  const [userEventNotifications, setUserEventNotifications] = useState<
    string[]
  >([]);

  const [showImageViewer, setShowImageViewer] = useState(false);
  const carouselRef = useRef<FlatList>(null);
  const autoScrollTimer = useRef<NodeJS.Timeout | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    if (details?.destination_images?.length && details?.destination_images?.length > 1) {
      autoScrollTimer.current = setInterval(() => {
        if (carouselRef.current && !showImageViewer) {
          const nextIndex = (activeImageIndex + 1) % details?.destination_images?.length;
          carouselRef.current.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
          setActiveImageIndex(nextIndex);
        }
      }, 5000); // Change image every 5 seconds
    }

    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, [activeImageIndex, details?.destination_images?.length]);

  const fetchDestinationDetails = async (id: string) => {
    try {
      const allDetails = await getDestinationFullDetails([id]);
      setDetails(allDetails[0]);
    } catch (error) {
      console.error("Error fetching destination details:", error);
      Toast.show({
        type: "error",
        text1: "Error fetching destination details",
      });
    }
  };

  // Fetch user's event notifications
  const fetchUserDetails = async () => {
    if (!user) return;

    setUserEventNotifications(
      (await getUserEvents(user.id)).map((e) => e.event_id)
    );
  };

  useEffect(() => {
    fetchDestinationDetails(id as string);
  }, [id]);

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleSetReminder = async (eventId: string) => {
    if (!user) return;

    const hasNotification = userEventNotifications.includes(eventId);

    try {
      if (hasNotification) {
        // Remove notification
        await removeEventNotification(user.id, eventId);

        setUserEventNotifications((prev) =>
          prev.filter((id) => id !== eventId)
        );
      } else {
        // Add notification
        const selectedEvent = details?.events.find((event) => event.id === eventId);

        if (selectedEvent) {
          // const eventName =
          //   selectedEvent.event_translations.find((d) => d.language === i18n.language)?.name || "Event";
          // const destinationName =
          //   details?.name || "Temple";

          await saveEventNotification(user.id, eventId);

          setUserEventNotifications((prev) => [...prev, eventId]);
        }
      }
    } catch (error) {
      console.error("Error toggling event notification:", error);
    }
  };

  const isReminderSet = (eventId: string) => {
    return userEventNotifications.some((id) => id === eventId);
  };

  const sortEvents = (events: Event[]) => {
    if (activeTab === "daily events") {
      return [...events].sort((a, b) => {
        const timeA = new Date(`2000-01-01T${a.start_time}`);
        const timeB = new Date(`2000-01-01T${b.start_time}`);
        return timeA.getTime() - timeB.getTime();
      });
    } else if (activeTab === "upcoming events") {
      return [...events].sort((a, b) => {
        // Handle null dates by putting them at the end
        if (!a.date) return 1;
        if (!b.date) return -1;
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });
    } else {
      return [];
    }
  };

  const filteredEvents = details?.events?.filter((event) => {
    if (activeTab === "daily events") {
      return event.daily === true;
    } else {
      return event.daily === false && event.date !== null;
    }
  }) || [];

  const sortedEvents = sortEvents(filteredEvents);

  if (!details) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text style={{ color: theme.colors.text }}>{t("common.loading")}</Text>
      </View>
    );
  }

  const langDetails = details.destination_translations.find((d) => d.language === i18n.language);

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>

          <FlatList
            ref={carouselRef}
            data={details?.destination_images}
            keyExtractor={(_, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e: { nativeEvent: { contentOffset: { x: number } } }) => {
              const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveImageIndex(newIndex);
            }}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setShowImageViewer(true)}
              >
                <Image
                  source={{ uri: item.hero_image }}
                  style={[styles.headerImage, { width }]}
                  resizeMode="cover"
                />
                <View style={styles.headerOverlay} />
              </TouchableOpacity>
            )}
          />


          <View style={styles.headerControls}>
            <TouchableOpacity
              style={[
                styles.backButton,
                { backgroundColor: "rgba(0, 0, 0, 0.3)" },
              ]}
              onPress={handleBack}
            >
              <Feather name="chevron-left" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "details" && {
                borderBottomColor: theme.colors.primary,
                borderBottomWidth: 2,
              },
            ]}
            onPress={() => handleTabChange("details")}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === "details"
                      ? theme.colors.primary
                      : theme.colors.textSecondary,
                },
              ]}
            >
              {t("destinations.details")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "daily events" && {
                borderBottomColor: theme.colors.primary,
                borderBottomWidth: 2,
              },
            ]}
            onPress={() => handleTabChange("daily events")}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === "daily events"
                      ? theme.colors.primary
                      : theme.colors.textSecondary,
                },
              ]}
            >
              {t("events.dailyEvents")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "upcoming events" && {
                borderBottomColor: theme.colors.primary,
                borderBottomWidth: 2,
              },
            ]}
            onPress={() => handleTabChange("upcoming events")}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === "upcoming events"
                      ? theme.colors.primary
                      : theme.colors.textSecondary,
                },
              ]}
            >
              {t("events.upcomingEvents")}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {activeTab === "details" ? (
            <View style={styles.detailsTab}>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                {langDetails?.name}
              </Text>

              <View style={styles.locationContainer}>
                <Feather
                  name="map-pin"
                  size={16}
                  color={theme.colors.primary}
                />
                <Text
                  style={[
                    styles.location,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {langDetails?.location}
                </Text>
              </View>

              <Text style={[styles.description, { color: theme.colors.text }]}>
                {langDetails?.detailed_description}
              </Text>
            </View>
          ) : (
            <View style={styles.eventsTab}>
              {sortedEvents.length === 0 ? (
                <View style={styles.noEventsContainer}>
                  <Feather
                    name="calendar"
                    size={48}
                    color={theme.colors.textTertiary}
                  />
                  <Text
                    style={[
                      styles.noEventsText,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {t("events.noEvents")}
                  </Text>
                </View>
              ) : (
                sortedEvents.map((eventWithLangs: Event) => {
                  const event = eventWithLangs.event_translations.find(
                    (e) => e.language === i18n.language
                  );

                  return (
                    <View
                      key={eventWithLangs.id}
                      style={[styles.eventCard, { backgroundColor: theme.colors.card }]}
                    >
                      {eventWithLangs.event_image && (
                        <Image
                          source={{ uri: eventWithLangs.event_image }}
                          style={styles.eventImage}
                          resizeMode="cover"
                        />
                      )}
                      <View style={styles.eventContent}>
                        <View style={styles.eventHeader}>
                          <Text style={[styles.eventTitle, { color: theme.colors.text }]}>
                            {event?.name}
                          </Text>
                          <TouchableOpacity
                            style={[
                              styles.reminderButton,
                              isReminderSet(eventWithLangs.id) ? { backgroundColor: `${theme.colors.primary}20` } : { backgroundColor: theme.colors.backgroundSecondary },
                            ]}
                            onPress={() => handleSetReminder(eventWithLangs.id)}
                          >
                            <Feather
                              name="bell"
                              size={16}
                              color={
                                isReminderSet(eventWithLangs.id)
                                  ? theme.colors.primary
                                  : theme.colors.textSecondary
                              }
                            />
                            <Text
                              style={[
                                styles.reminderButtonText,
                                {
                                  color: isReminderSet(eventWithLangs.id)
                                    ? theme.colors.primary
                                    : theme.colors.textSecondary,
                                },
                              ]}
                            >
                              {isReminderSet(eventWithLangs.id)
                                ? t("events.removeReminder")
                                : t("events.setReminder")}
                            </Text>
                          </TouchableOpacity>
                        </View>

                        <View style={styles.eventDetailsRow}>
                          {activeTab === "upcoming events" && eventWithLangs.date && (
                            <Text style={[styles.eventTimeText, { color: theme.colors.textSecondary }]}>
                              {format(new Date(eventWithLangs.date), "dd MMM yyyy")}
                            </Text>
                          )}
                          <Text style={[styles.eventTimeText, { color: theme.colors.textSecondary }]}>
                            {convertTo12HourFormat(eventWithLangs.start_time)}
                          </Text>
                        </View>

                        {event?.description && (
                          <Text style={[styles.eventDescription, { color: theme.colors.text }]}>
                            {event.description}
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      <ImageViewer
        visible={showImageViewer}
        onClose={() => setShowImageViewer(false)}
        images={details?.destination_images}
        initialIndex={activeImageIndex}
        theme={theme}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    height: 240,
    position: "relative",
  },
  headerImage: {
    width: "100%",
    height: "100%",
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  headerControls: {
    position: "absolute",
    top: StatusBar.currentHeight ? StatusBar.currentHeight + 16 : 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
  },
  content: {
    flex: 1,
  },
  detailsTab: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    marginLeft: 6,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  rating: {
    fontSize: 14,
    fontWeight: "500",
    color: "#F59E0B",
    marginLeft: 4,
  },
  visits: {
    fontSize: 14,
    marginLeft: 4,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  typeTag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  typeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  seasonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  seasonTag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  seasonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  eventsTab: {
    padding: 16,
  },
  noEventsContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  noEventsText: {
    fontSize: 16,
    marginTop: 12,
  },
  eventTypeTabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
    marginBottom: 16,
  },
  eventTypeTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  eventTypeTabText: {
    fontSize: 16,
    fontWeight: "500",
  },
  eventCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventImage: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  eventContent: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  reminderButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  reminderButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "500",
  },
  eventDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  eventTimeText: {
    fontSize: 14,
    marginRight: 8,
  },
  eventDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
});

