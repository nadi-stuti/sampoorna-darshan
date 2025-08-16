import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { supabase } from "./supabase";
import Toast from "react-native-toast-message";
import { insertNotificationMutation } from "@/supabase/sql/user-queries";

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "web") {
    return undefined;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Failed to get push token for notifications!");
    return undefined;
  }

  token = (
    await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    })
  ).data;

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF7940",
    });
  }

  return token;
}

export async function scheduleEventNotification(
  title: string,
  body: string,
  trigger: Notifications.NotificationTriggerInput
) {
  if (Platform.OS === "web") {
    return null;
  }

  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger,
  });
}

export async function saveEventNotification(userId: string, eventId: string) {
  try {
    const { error } = await insertNotificationMutation(userId, eventId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error saving notification:", error);
    return false;
  }
}

export async function removeEventNotification(
  userId: string,
  eventId: string,
  notificationId?: string
) {
  try {
    // Remove from database
    const { error } = await supabase
      .from("event_notifications")
      .delete()
      .match({ user_id: userId, event_id: eventId });

    if (error) throw error;

    // Cancel scheduled notification if on native platform
    if (Platform.OS !== "web" && notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    }

    return true;
  } catch (error) {
    console.error("Error removing notification:", error);
    return false;
  }
}

export type Notificaitons = Awaited<ReturnType<typeof getUserNotifications>>;

export async function getUserNotifications(userId: string) {
  try {
    const { data, error } = await supabase
      .from("event_notifications")
      .select(
        `
        id,
        events (
          id,
          start_time,
          end_time,
          daily,
          date,
          event_translations (
            name,
            description,
            language
          ),
          destinations (
            id,
            destination_translations (
              name,
              language
            )
          )
        )
      `
      )
      .eq("user_id", userId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}
