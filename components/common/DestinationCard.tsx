import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { useTranslation } from "react-i18next";
import Feather from "@expo/vector-icons/Feather";

const { width } = Dimensions.get("window");

type DestinationCardProps = {
  id: string;
  name: string;
  image: string;
  description: string;
  city: string;
  isSaved: boolean;
  onPress: () => void;
  onSaveToggle: () => void;
};

export default function DestinationCard({
  name,
  image,
  description,
  city,
  isSaved,
  onPress,
  onSaveToggle,
}: DestinationCardProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image source={{ uri: image }} style={styles.image} />
      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: theme.background }]}
        onPress={onSaveToggle}
      >
        <Feather
          name="heart"
          size={20}
          color={isSaved ? theme.error : theme.text}
          fill={isSaved ? theme.error : "none"}
        />
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {name}
        </Text>
        <Text
          style={[styles.description, { color: theme.text + "CC" }]}
          numberOfLines={2}
        >
          {description}
        </Text>
        <View style={styles.footer}>
          <View style={styles.locationContainer}>
            <Feather name="map-pin" size={16} color={theme.primary} />
            <Text style={[styles.location, { color: theme.text + "CC" }]}>
              {city}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width * 0.85,
    maxWidth: 320,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    marginHorizontal: 8,
  },
  image: {
    width: "100%",
    height: 160,
  },
  saveButton: {
    position: "absolute",
    right: 12,
    top: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  location: {
    fontSize: 14,
    marginLeft: 4,
  },
});
