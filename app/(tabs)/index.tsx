import DestinationBottomSheet from "@/components/destinations/DestinationBottomSheet";
import { FloatingActionButtons } from "@/components/FloatingActionButtons";
import { MAP_MARKERS } from "@/constants/imagesUrl";
import {
  DeityDetails,
  Destinations,
  getDeityDetails,
  getDestinations,
} from "@/lib/map";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import * as Location from "expo-location";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform, StyleSheet, Text, View } from "react-native";
import { LatLng, LeafletView } from "react-native-leaflet-view";

// Initial map region (centered on India)
const INITIAL_REGION = {
  latitude: 24.5937,
  longitude: 78.9629,
  latitudeDelta: 20,
  longitudeDelta: 20,
};

const Map = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const destinationId = params?.destinationId as string;
  const latitude = params?.latitude as string;
  const longitude = params?.longitude as string;
  const initialZoom = params?.zoom as string;
  // const mapRef = useRef<MapView>(null);

  // const [region, setRegion] = useState<Region>(INITIAL_REGION);

  const [destinations, setDestinations] = useState<Destinations>([]);
  const [selectedDestination, setSelectedDestination] = useState<string>("");
  const [deity, setDeity] = useState<DeityDetails>();
  const [filtersVisible, setFiltersVisible] = useState(false);

  const [userSavedPlaces, setUserSavedPlaces] = useState<string[]>([]);
  const [userEventNotifications, setUserEventNotifications] = useState<
    string[]
  >([]);
  const [bottomSheetVisible, setBottomSheetVisible] = useState<boolean>(false);
  const [mapCenterPosition, setMapCenterPosition] = useState<LatLng>([
    INITIAL_REGION.latitude,
    INITIAL_REGION.longitude,
  ]);
  const [zoom, setZoom] = useState(4.8);

  // Fetch user's current location
  // const getUserLocation = async () => {
  //   try {
  //     const { status } = await Location.requestForegroundPermissionsAsync();

  //     if (status !== "granted") {
  //       console.log("Permission to access location was denied");
  //       return;
  //     }

  //     const location = await Location.getCurrentPositionAsync({});
  //     const { latitude, longitude } = location.coords;

  //     // Move map to user's location
  //     if (mapRef.current) {
  //       mapRef.current.animateToRegion(
  //         {
  //           latitude,
  //           longitude,
  //           latitudeDelta: 0.1,
  //           longitudeDelta: 0.1,
  //         },
  //         1000
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Error getting location:", error);
  //   }
  // };

  // Fetch destinations from Supabase
  const fetchDestinations = async () =>
    setDestinations(await getDestinations());

  const fetchDeityDetails = async () => setDeity(await getDeityDetails());

  // const fetchUserSavedPlaces = async () => {
  //   if (!user) return;

  //   try {
  //     const { data, error } = await userSavedPlacesQuery(user.id);

  //     if (error) {
  //       throw error;
  //     }

  //     if (data) {
  //       setUserSavedPlaces(data.map((item) => item.destination_id));
  //     }
  //   } catch (error) {
  //     console.error("Error fetching saved places:", error);
  //   }
  // };

  // Fetch user's event notifications
  // const fetchUserEventNotifications = async () => {
  //   if (!user) return;

  //   try {
  //     const { data, error } = await userEventNotificationsQuery(user.id);

  //     if (error) {
  //       throw error;
  //     }

  //     if (data) {
  //       setUserEventNotifications(data.map((item) => item.event_id));
  //     }
  //   } catch (error) {
  //     console.error("Error fetching event notifications:", error);
  //   }
  // };

  // const toggleEventNotification = async (eventId: string) => {
  //   if (!user) return;

  //   const hasNotification = userEventNotifications.includes(eventId);

  //   try {
  //     if (hasNotification) {
  //       // Remove notification
  //       await removeEventNotification(user.id, eventId);

  //       setUserEventNotifications((prev) =>
  //         prev.filter((id) => id !== eventId)
  //       );
  //     } else {
  //       // Add notification
  //       const selectedEvent = destinationEvents.find(
  //         (event) => event.id === eventId
  //       );

  //       if (selectedEvent) {
  //         const eventName =
  //           selectedEvent.event_translations[0]?.name || "Event";
  //         const destinationName =
  //           selectedDestination.destination_translations[0]?.name || "Temple";

  //         await saveEventNotification(user.id, eventId);

  //         setUserEventNotifications((prev) => [...prev, eventId]);
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error toggling event notification:", error);
  //   }
  // };

  // Handle marker press - show bottom sheet with destination details

  // Load initial data
  useEffect(() => {
    fetchDestinations();
    fetchDeityDetails();
    // fetchUserSavedPlaces();
    // fetchUserEventNotifications();

    // Handle navigation from favorites
    if (destinationId && latitude && longitude) {
      setMapCenterPosition([parseFloat(latitude), parseFloat(longitude)]);
      setZoom(initialZoom ? parseFloat(initialZoom) : 12);
      setSelectedDestination(destinationId);
      setBottomSheetVisible(true);
    }
  }, [user, destinationId, latitude, longitude, initialZoom]);

  if (Platform.OS === "web") {
    return (
      <View style={styles.container}>
        <Text>Web Not Supported</Text>;
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LeafletView
        doDebug={false}
        mapCenterPosition={{
          lat: mapCenterPosition[0],
          lng: mapCenterPosition[1],
        }}
        zoom={zoom}
        mapMarkers={destinations?.map((d) => {
          return {
            position: [d.latitude, d.longitude],
            icon:
              deity?.find((de) => de.deity === d.deity)?.map_marker ||
              MAP_MARKERS.Other,
            size: [150, 150],
            iconAnchor: [0, 150],
            id: d.id,
          };
        })}
        onMessageReceived={(m) => {
          if (
            m.event === "onMapMarkerClicked" &&
            m.payload &&
            m.payload.mapMarkerID
          ) {
            const d = destinations?.find(
              (d) => d.id === m.payload?.mapMarkerID
            );
            setMapCenterPosition([d?.latitude, d?.longitude]);
            setZoom(12);
            setSelectedDestination(m.payload.mapMarkerID);
            setBottomSheetVisible(true);
          }
        }}
      />

      <FloatingActionButtons />

      {selectedDestination && (
        <DestinationBottomSheet
          destinationId={selectedDestination}
          visible={bottomSheetVisible}
          onClose={() => setBottomSheetVisible(false)}
        />
      )}
    </View>
  );
};

export default Map;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  searchContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: 20,
    right: 20,
    zIndex: 1,
  },
  buttonsContainer: {
    position: "absolute",
    bottom: 120,
    right: 20,
    zIndex: 1,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
});
