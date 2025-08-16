import {
  destinationsQuery,
  destinationDetialsQuery,
  destinationEventQuery,
  deityQuery,
  destinationImageQuery,
  destinationLiveFeedQuery,
  destinationsFullDetailsQuery,
} from "@/supabase/sql/map-queries";
import { userEventNotificationsQuery, userSavedPlacesQuery } from "@/supabase/sql/user-queries";

export type Destinations = Awaited<ReturnType<typeof getDestinations>>;
export const getDestinations = async () => {
  try {
    const { data, error } = await destinationsQuery;

    if (error) {
      throw error;
    }

    if (data) {
      return data;
    }
  } catch (error) {
    console.error("Error fetching destinations:", error);
    return [];
  }
  return [];
};

export type DeityDetails = Awaited<ReturnType<typeof getDeityDetails>>;
export const getDeityDetails = async () => {
  try {
    const { data, error } = await deityQuery;

    if (error) {
      throw error;
    }

    if (data) {
      return data;
    }
  } catch (error) {
    console.error("Error fetching destinations:", error);
    return [];
  }
  return [];
};

export type DestinationDetails = Awaited<
  ReturnType<typeof getDestinationDetails>
>;
export type DestinationDetailsLangFiltered = DestinationDetails[number];
export const getDestinationDetails = async (destinationId: string) => {
  try {
    const { data, error } = await destinationDetialsQuery(destinationId);

    if (error) {
      throw error;
    }

    if (data) {
      return data;
    }
  } catch (error) {
    console.error("Error fetching destination by id:", error);
    return [];
  }
  return [];
};

export type DestinationImages = Awaited<
  ReturnType<typeof getDestinationImages>
>;
export const getDestinationImages = async (destinationId: string) => {
  try {
    const { data, error } = await destinationImageQuery(destinationId);

    if (data) {
      return data;
    }
  } catch (error) {
    console.error("Error fetching destination images:", error);
    return [];
  }
  return [];
};

export type DestinationLiveFeed = Awaited<
  ReturnType<typeof getDestinationLiveFeed>
>;
export const getDestinationLiveFeed = async (destinationId: string) => {
  try {
    const { data, error } = await destinationLiveFeedQuery(destinationId);
    if (data) {
      return data.live_feed;
    }
  } catch (error) {
    console.error("Error fetching destination live feed:", error);
    return "";
  }
  return "";
};
export type DestinationEvents = Awaited<
  ReturnType<typeof getDestinationEvents>
>;
export const getDestinationEvents = async (destinationId: string) => {
  try {
    const { data, error } = await destinationEventQuery(destinationId);

    if (error) {
      throw error;
    }

    if (data) {
      return data;
    }
  } catch (error) {
    console.error("Error fetching destination events:", error);
    return [];
  }
  return [];
};

export type UserEvents = Awaited<ReturnType<typeof getUserEvents>>;
export const getUserEvents = async (userId: string) => {
  try {
    const { data, error } = await userEventNotificationsQuery(userId);

    if (error) {
      throw error;
    }

    if (data) {
      return data;
    }
  } catch (error) {
    console.error("Error fetching events for user:", error);
    return [];
  }
  return [];
};

export type UserSavedDestinations = Awaited<
  ReturnType<typeof getUserSavedDestinations>
>;
export const getUserSavedDestinations = async (userId: string) => {
  const { data, error } = await userSavedPlacesQuery(userId);


  if (error) {
    throw error;
  }

  return data;
};

export type DestinationsFullDetails = Awaited<
  ReturnType<typeof getDestinationFullDetails>
>;
export const getDestinationFullDetails = async (destinationIds: string[]) => {
  const { data, error } = await destinationsFullDetailsQuery(destinationIds);

  if (error) {
    throw error;
  }

  return data;
};

