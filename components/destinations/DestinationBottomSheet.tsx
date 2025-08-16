import {
  DestinationsFullDetails,
  getDestinationFullDetails,
  getUserEvents,
  getUserSavedDestinations
} from "@/lib/map";
import { useTheme } from "@/providers/ThemeProvider";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
// import { Destination, Event } from "@/constants/destinations";
import { convertTo12HourFormat } from "@/lib/functions";
import {
  removeEventNotification,
  saveEventNotification,
} from "@/lib/notifications";
import { useAuth } from "@/providers/AuthProvider";
import { removeDestinationFromFavorites, saveDestinationToFavorites } from "@/supabase/sql/user-queries";
import Feather from "@expo/vector-icons/Feather";
import { format, isPast } from "date-fns";
import Toast from "react-native-toast-message";
import YoutubePlayer from 'react-native-youtube-iframe';
import LoadingIndicator from "../common/LoadingIndicator";

interface DestinationBottomSheetProps {
  destinationId: string;
  visible: boolean;
  onClose: () => void;
}

const { height } = Dimensions.get("window");

const getYoutubeVideoId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};


const DestinationBottomSheet: React.FC<DestinationBottomSheetProps> = ({
  destinationId,
  visible,
  onClose,
}) => {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const [isSaved, setIsSaved] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const [details, setDetails] = useState<DestinationsFullDetails[number] | null>(
    null
  );

  const [userEventNotifications, setUserEventNotifications] = useState<
    string[]
  >([]);

  const [savedDestinations, setSavedDestinations] = useState<string[]>([]);

  const { user } = useAuth();

  const fetchDestinationDetails = async () => {

    try {
      const allDetails = await getDestinationFullDetails([destinationId]);
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
    
    const savedDestinations =  (await getUserSavedDestinations(user.id)).map((d) => d.destination_id)
    setSavedDestinations(savedDestinations);
    setIsSaved(savedDestinations.includes(destinationId));
  };

  const toggleEventNotification = async (eventId: string) => {
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

  useEffect(() => {
    fetchDestinationDetails();
    fetchUserDetails();
  }, [destinationId]);

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Animate out
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, animation]);

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [height, 0],
  });

  const handleToggleSave = async () => {
    if (!user) {
      return;
    }


    try {
      if (isSaved) {
        await removeDestinationFromFavorites(user.id, destinationId);
        setIsSaved(false);
      } else {
        await saveDestinationToFavorites(user.id, destinationId);
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleLearnMore = () => {
    router.push(`/destination/${destinationId}`);
    onClose();
  };

  const handleViewEvents = () => {
    router.push(`/destination/${destinationId}?tab=daily-events`);
    onClose();
  };


  if (!visible) return null;

  if (!details) return <LoadingIndicator />;

  const langDetails = details.destination_translations.find((d) => d.language === i18n.language);

  const sortEvents = (events) => {
    return [...events].sort((a, b) => {
      const timeA = new Date(`2000-01-01T${a.start_time}`);
      const timeB = new Date(`2000-01-01T${b.start_time}`);
      return timeA.getTime() - timeB.getTime();
    });
  };

  const getCurrentEvent = () => {
    if (!details) return [];
    const events = [];
    const sortedEvents = sortEvents(details.events.filter((e) => e.daily));
    const nextEvent = sortedEvents.find((e, index) => !isPast(new Date(`${format(new Date(), 'yyyy-MM-dd')}T${e.start_time}`)));
    if (nextEvent) {
      const nextIndex = sortedEvents.indexOf(nextEvent);

      if (nextIndex !== 0) {
        const currentEvent = sortedEvents[nextIndex - 1];
        events.push(currentEvent);
      }
      events.push(nextEvent);
    }
    else {
      events.push(sortedEvents[sortedEvents.length - 1]);
    }
    return events;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.closeArea} onPress={onClose} />

        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: theme.colors.background,
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.headerContainer}>
            <View style={styles.handle} />
            <TouchableOpacity
              style={[
                styles.closeButton,
                { backgroundColor: theme.colors.backgroundSecondary },
              ]}
              onPress={onClose}
            >
              <Feather name="x" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {!details ? (
            <Text>Loading...</Text>
          ) : (
            <ScrollView style={styles.content}>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                {langDetails?.name}
              </Text>
              <View style={[styles.videoContainer, { height: 200 }]}>
                <YoutubePlayer
                  height={200}
                  width={Dimensions.get('window').width * 0.9}
                  videoId={getYoutubeVideoId(details.live_feed) || ''}
                  play={true}
                  webViewProps={{
                    androidLayerType: 'hardware',
                  }}
                />
              </View>

              <View style={styles.detailsContainer}>

                {/* <View style={styles.locationContainer}>
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
                    {details.location}
                  </Text>
                </View>

                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Feather name="star" size={16} color="#F59E0B" />
                    <Text
                      style={[styles.statText, { color: theme.colors.text }]}
                    >
                      {3.8}
                    </Text>
                  </View>
                  <View style={styles.dot} />
                  <Text
                    style={[
                      styles.statText,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {"1,000,000,000"} {t("destinations.visits")}
                  </Text>
                </View> */}

                {/* <Text
                  style={[styles.description, { color: theme.colors.text }]}
                >
                  {langDetails?.short_description}
                </Text> */}

                {details.events.length > 0 && (
                  <View style={styles.eventsSection}>

                    {getCurrentEvent().map((eventWithLangs,index) => {
                      const event = eventWithLangs.event_translations.find(
                        (e) => e.language === i18n.language
                      );

                      return (
                        <View
                          key={eventWithLangs.id}
                          style={[
                            styles.eventCard,
                            {
                              backgroundColor: theme.colors.backgroundSecondary,
                            },
                          ]}
                        >
                          <View style={styles.eventIconContainer}>
                            <Text
                              style={[
                                styles.eventTime,
                                { color: theme.colors.text },
                              ]}
                            >
                              {convertTo12HourFormat(eventWithLangs.start_time)}
                            </Text>
                            <Text
                              style={[
                                styles.eventTime,
                                { color: theme.colors.text },
                              ]}
                            >
                              {convertTo12HourFormat(eventWithLangs.end_time)}
                            </Text>
                          </View>
                          <View style={styles.eventDetails}>
                            <Text
                              style={[
                                styles.eventName,
                                { color: theme.colors.text },
                              ]}
                            >
                              {event?.name || "no name"}
                            </Text>
                            <Text
                              style={[
                                styles.eventDescription,
                                { color: theme.colors.textSecondary },
                              ]}
                            >
                              {index === 0 ? t("events.currentEvent") : t("events.nextEvent")}
                            </Text>
                          </View>

                          {index === 1 && <TouchableOpacity
                            style={[
                              styles.reminderButton,
                              isReminderSet(eventWithLangs.id)
                                ? {
                                  backgroundColor: `${theme.colors.primary}20`,
                                }
                                : {
                                  backgroundColor:
                                    theme.colors.backgroundSecondary,
                                },
                            ]}
                            onPress={() =>
                              toggleEventNotification(eventWithLangs.id)
                            }
                          >
                            <Feather
                              name="bell"
                              size={16}
                              color={
                                isReminderSet(eventWithLangs.id)
                                  ? theme.colors.primary
                                  : theme.colors.textSecondary
                              }
                              fill={
                                isReminderSet(eventWithLangs.id)
                                  ? theme.colors.primary
                                  : "none"
                              }
                            />
                          </TouchableOpacity>}
                        </View>
                      );
                    })}
                  </View>
                )}

                <View style={styles.actionButtonsContainer}>
                  {!user ? <TouchableOpacity
                    style={[
                      styles.saveButton, { backgroundColor: theme.colors.backgroundSecondary }
                    ]}
                    onPress={() => { onClose(); router.push("/profile") }}
                  >
                    <Feather
                      name="log-in"
                      size={20}
                      color={theme.colors.textSecondary
                      }
                      fill={isSaved ? theme.colors.secondary : "none"}
                    />
                    <Text
                      style={[
                        styles.saveButtonText,
                        {
                          color: theme.colors.textSecondary,
                        },
                      ]}
                    >{t("common.loginToSave")}</Text>
                  </TouchableOpacity> : (
                    <TouchableOpacity
                      style={[
                        styles.saveButton,
                        {
                          backgroundColor: isSaved
                            ? theme.colors.backgroundSecondary
                            : theme.colors.backgroundSecondary,
                        },
                      ]}
                      onPress={handleToggleSave}
                    >
                      <Feather
                        name="heart"
                        size={20}
                        color={
                          isSaved
                            ? theme.colors.secondary
                            : theme.colors.textSecondary
                        }
                        fill={isSaved ? theme.colors.secondary : "none"}
                      />
                      <Text
                        style={[
                          styles.saveButtonText,
                          {
                            color: isSaved
                              ? theme.colors.secondary
                              : theme.colors.textSecondary,
                          },
                        ]}
                      >
                        {isSaved
                          ? t("destinations.removeFromFavorites")
                          : t("destinations.addToFavorites")}
                      </Text>
                    </TouchableOpacity>)}

                  <TouchableOpacity
                    style={[
                      styles.calendarButton,
                      { backgroundColor: theme.colors.backgroundSecondary },
                    ]}
                    onPress={handleViewEvents}
                  >
                    <Feather
                      name="calendar"
                      size={20}
                      color={theme.colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.calendarButtonText,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      {t("events.calendar")}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[
                    styles.learnMoreButton,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={handleLearnMore}
                >
                  <Text style={styles.learnMoreButtonText}>
                    {t("destinations.learnMore")}
                  </Text>
                  <Feather name="chevron-right" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  closeArea: {
    flex: 1,
  },
  container: {
    height: height * 0.7,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  headerContainer: {
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
    position: "relative",
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#CCCCCC",
    marginBottom: 4,
  },
  closeButton: {
    position: "absolute",
    right: 16,
    top: 8,
    padding: 8,
    borderRadius: 20,
  },
  content: {
    flex: 1,
  },
  image: {
    width: "100%",
    height: 200,
  },
  detailsContainer: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
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
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    fontSize: 14,
    marginLeft: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CBD5E0",
    marginHorizontal: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  eventsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  eventCard: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  eventIconContainer: {
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  eventDetails: {
    flex: 1,
  },
  eventName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    // fontWeight: "200",
  },
  eventDescription: {
    fontSize: 14,
  },
  seeMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  seeMoreText: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 4,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  saveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  calendarButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  calendarButtonText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  learnMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
  },
  reminderButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  learnMoreButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginRight: 4,
  },
  videoContainer: {
    // width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    borderRadius: 20,
    overflow: 'hidden',
  },
});

export default DestinationBottomSheet;
