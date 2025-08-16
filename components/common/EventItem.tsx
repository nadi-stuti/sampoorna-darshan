import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import Feather from "@expo/vector-icons/Feather";

type EventItemProps = {
  id: string;
  name: string;
  description: string;
  startTime: string;
  hasAlert: boolean;
  onPress: () => void;
  onAlertToggle: () => void;
};

export default function EventItem({
  name,
  description,
  startTime,
  hasAlert,
  onPress,
  onAlertToggle,
}: EventItemProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const formattedTime = format(new Date(startTime), "hh:mm a");

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.timeContainer}>
        <Text style={[styles.time, { color: theme.colors.primary }]}>
          {formattedTime}
        </Text>
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
          {name}
        </Text>
        <Text
          style={[styles.description, { color: theme.colors.text + "CC" }]}
          numberOfLines={1}
        >
          {description}
        </Text>
      </View>
      <TouchableOpacity
        style={[
          styles.alertButton,
          { backgroundColor: hasAlert ? theme.colors.primary : theme.colors.card },
        ]}
        onPress={onAlertToggle}
      >
        <Text
          style={[
            styles.alertText,
            { color: hasAlert ? "#FFFFFF" : theme.colors.text },
          ]}
        >
          {t("destinations.setAlert")}
        </Text>
        <Feather
          name="bell"
          size={16}
          color={hasAlert ? "#FFFFFF" : theme.colors.text}
          style={styles.alertIcon}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  timeContainer: {
    width: 75,
    marginRight: 12,
  },
  time: {
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
  },
  alertButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  alertText: {
    fontSize: 12,
    fontWeight: "600",
  },
  alertIcon: {
    marginLeft: 4,
  },
});
