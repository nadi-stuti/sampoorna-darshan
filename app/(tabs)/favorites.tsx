import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView } from "react-native";
import React, { useEffect, useState } from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "expo-router";
import { userSavedPlacesQuery } from "@/supabase/sql/user-queries";
import { destinationsQuery } from "@/supabase/sql/map-queries";
import DestinationCard from "@/components/destinations/DestinationCard";
import { Destinations, DestinationsFullDetails, getDestinationFullDetails } from "@/lib/map";
import LoadingIndicator from "@/components/common/LoadingIndicator";

const Favorites = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const [savedDestinations, setSavedDestinations] = useState<DestinationsFullDetails>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchSavedDestinations();
  }, [user]);

  const fetchSavedDestinations = async () => {
    try {
      const { data, error: savedError } = await userSavedPlacesQuery(user.id);
      if (savedError) throw savedError;

      const savedPlaces = data.map(place => place.destination_id);
      setSavedDestinations(await getDestinationFullDetails(savedPlaces));
    } catch (error) {
      console.error("Error fetching saved destinations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDestinationPress = (destination: any) => {
    router.push({
      pathname: "/",
      params: {
        destinationId: destination.id,
        latitude: destination.latitude,
        longitude: destination.longitude,
        zoom: 12
      }
    });
  };

  if (loading) {
    return (
      <LoadingIndicator />
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text }}>{t("auth.notSignedIn")}</Text>
      </View>
    );
  }

  if (savedDestinations.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text }}>{t("destinations.noFavorites")}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={savedDestinations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleDestinationPress(item)}>
            <DestinationCard
              destination={item}
              size="large"
            />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

export default Favorites;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
});
