import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/providers/ThemeProvider";
import Feather from "@expo/vector-icons/Feather";
import { format } from "date-fns";
import { supabase } from "../lib/supabase";
import { Tables, Enums } from "../types/database.types";
import { convertTo12HourFormat } from "@/lib/functions";

interface EventDetailCardProps {
  event: Tables<"events">;
  eventTranslation: Tables<"event_translations">;
  eventImage: string;
  destinationTranslation: Tables<"destination_translations">;
  deity: Enums<"Deity">;
  sampradaya: Enums<"Sampradaya">;
  onSetReminder: (eventId: string) => void;
}

const EventDetailCard: React.FC<EventDetailCardProps> = ({
  event,
  eventTranslation,
  eventImage,
  destinationTranslation,
  deity,
  sampradaya,
  onSetReminder,
}) => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();

  const handleSetReminder = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        // TODO: Show login prompt
        return;
      }
      const { error } = await supabase.from("event_notifications").insert({
        event_id: event.id,
        user_id: user.id,
        notification_time: new Date().toISOString(),
      });
      if (error) throw error;
      onSetReminder(event.id);
    } catch (error) {
      console.error("Error setting reminder:", error);
    }
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.card, shadowColor: "#000" },
      ]}
    >
      <Image
        source={{ uri: eventImage }}
        style={styles.heroImage}
        resizeMode="cover"
      />
      <View style={styles.content}>
        {/* Badges */}
        <View style={styles.badgesRow}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor:
                theme.colors.badge[deity] || theme.colors.backgroundSecondary,
              },
            ]}
          >
            <Feather
              name="star"
              size={12}
              color={theme.colors.primary}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[styles.badgeText, { color: theme.colors.textSecondary }]}
            >
              {deity}
            </Text>
          </View>
          <View
            style={[
              styles.badge,
              {
                backgroundColor:
                theme.colors.badge[sampradaya] || theme.colors.backgroundSecondary,
              },
            ]}
          >
            <Feather
              name="award"
              size={12}
              color={theme.colors.primary}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[styles.badgeText, { color: theme.colors.textSecondary }]}
            >
              {sampradaya}
            </Text>
          </View>
        </View>
        {/* Title */}
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {eventTranslation.name}
        </Text>
        {/* Description */}
        <Text
          style={[styles.description, { color: theme.colors.textSecondary }]}
        >
          {eventTranslation.description}
        </Text>
        {/* Location */}
        <View style={styles.row}>
          <Feather
            name="map-pin"
            size={14}
            color={theme.colors.primary}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[styles.location, { color: theme.colors.textSecondary }]}
          >
            {destinationTranslation.name}, {destinationTranslation.location}
          </Text>
        </View>
        {/* Date & Time */}
        <View style={styles.row}>
          <Feather
            name="clock"
            size={14}
            color={theme.colors.primary}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[styles.dateTime, { color: theme.colors.textSecondary }]}
          >
            {event.daily
              ? t("events.everyday")
              : format(new Date(event.date || ""), "dd MMM yyyy")}{" "}
            • {convertTo12HourFormat(event.start_time)}
          </Text>
        </View>
        {/* Set Reminder Button */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.reminderButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={handleSetReminder}
          >
            <Feather
              name="bell"
              size={14}
              color={theme.colors.card}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[styles.reminderButtonText, { color: theme.colors.card }]}
            >
              {t("destinations.setReminder")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginVertical: 12,
    marginHorizontal: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    height: 180,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  content: {
    padding: 16,
  },
  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 6,
    minWidth: 0,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "500",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  location: {
    fontSize: 13,
    flexShrink: 1,
  },
  dateTime: {
    fontSize: 13,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  reminderButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  reminderButtonText: {
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 2,
  },
});

export default EventDetailCard;
