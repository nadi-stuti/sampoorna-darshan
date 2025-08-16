import { supabase } from "@/lib/supabase";

export const destinationsQuery = supabase.from("destinations").select(`
            id,
            latitude,
            longitude,
            sampradaya,
            deity,
            city
          `);

export const destinationsFullDetailsQuery = (ids: string[]) =>
  supabase.from("destinations").select(`
    id,
    latitude,
    longitude,
    sampradaya,
    deity,
    city,
    live_feed,
    destination_translations (
      name,
      short_description,
      detailed_description,
      location,
      language
    ),
    destination_images (
      hero_image,
      image_description
    ),
    events (
      id,
      start_time,
      end_time,
      daily,
      date,
      isPopular,
      event_image,
      event_translations (
        name,
        description,
        language
      )
    )
  `).in("id", ids);

export const destinationDetialsQuery = (id: string) =>
  supabase
    .from("destination_translations")
    .select("*")
    .eq("destination_id", id);

export const destinationImageQuery = (id: string) =>
  supabase
    .from("destination_images")
    .select("*")
    .eq("destination_id", id);

export const deityQuery = supabase.from("deity").select("*");

export const destinationLiveFeedQuery = (id: string) =>
  supabase
    .from("destinations")
    .select("live_feed")
    .eq("id", id).single();

export const destinationEventQuery = (destinationId: string) =>
  supabase
    .from("events")
    .select(
      `
          id,
          start_time,
          end_time,
          daily,
          date,
          event_translations (
            name,
            description,
            language
          )
        `
    )
    .eq("destination_id", destinationId)
    .order("start_time", { ascending: true });
