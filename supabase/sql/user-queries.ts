import { supabase } from "@/lib/supabase";

export const userSavedPlacesQuery = (id: string) =>
  supabase.from("saved_places").select("destination_id").eq("user_id", id);

export const userEventNotificationsQuery = (id: string) =>
  supabase.from("event_notifications").select("event_id").eq("user_id", id);

export const insertNotificationMutation = async (
  userId: string,
  eventId: string
) =>
  await supabase.from("event_notifications").insert({
    user_id: userId,
    event_id: eventId,
  });

export const saveDestinationToFavorites = async (userId: string, destinationId: string) => {
  const { error } = await supabase
    .from("saved_places")
    .insert({ user_id: userId, destination_id: destinationId });

  if (error) throw error;
};

export const removeDestinationFromFavorites = async (userId: string, destinationId: string) => {
  const { error } = await supabase
    .from("saved_places")
    .delete()
    .eq("user_id", userId)
    .eq("destination_id", destinationId);

  if (error) throw error;
};
