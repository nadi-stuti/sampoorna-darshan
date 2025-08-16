import { MAP_MARKERS } from '@/constants/imagesUrl';
import i18n from '@/lib/i18n';
import { DestinationsFullDetails } from '@/lib/map';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { removeDestinationFromFavorites, saveDestinationToFavorites, userSavedPlacesQuery } from '@/supabase/sql/user-queries';
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface DestinationCardProps {
  destination: DestinationsFullDetails[number];
  style?: any;
  size?: 'small' | 'medium' | 'large';
}

interface SavedPlace {
  destination_id: string;
}

const { width } = Dimensions.get('window');

const DestinationCard: React.FC<DestinationCardProps> = ({ 
  destination, 
  style, 
  size = 'medium'
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    checkIfSaved();
  }, [destination.id]);

  const checkIfSaved = async () => {
    if (!user) return;
    try {
      const { data, error } = await userSavedPlacesQuery(user.id);
      if (error) throw error;
      setIsSaved(data?.some((place: SavedPlace) => place.destination_id === destination.id) || false);
    } catch (error) {
      console.error("Error checking saved status:", error);
    }
  };

  const handlePress = () => {
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
  // Determine card dimensions based on size prop
  const getCardDimensions = () => {
    switch (size) {
      case 'small':
        return {
          width: width * 0.4,
          imageHeight: width * 0.4,
        };
      case 'large':
        return {
          width: width - 32,
          imageHeight: (width - 32) * 0.6,
        };
      case 'medium':
      default:
        return {
          width: width * 0.6,
          imageHeight: width * 0.4,
        };
    }
  };

  const { width: cardWidth, imageHeight } = getCardDimensions();

  const langDestination = destination.destination_translations.find(translation => translation.language === i18n.language)

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.container, 
        { 
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.border,
          width: cardWidth,
        },
        style
      ]}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: destination.destination_images[0].hero_image }} 
          style={[styles.image, { height: imageHeight }]} 
          resizeMode="cover"
        />
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text 
            style={[
              styles.title, 
              { color: theme.colors.text }
            ]}
            numberOfLines={1}
          >
            {langDestination?.name}
          </Text>
          
          <View style={styles.ratingContainer}>
            <Feather name="map-pin" size={14} color={theme.colors.textSecondary} />
            <Text style={[styles.ratingText, { color: theme.colors.textSecondary }]}>
              {langDestination?.location}
            </Text>
          </View>
        </View>
        
        <View style={styles.locationContainer}>
          <Feather name="compass" size={14} color={theme.colors.textSecondary} />
          <Text 
            style={[
              styles.locationText, 
              { color: theme.colors.textSecondary }
            ]}
            numberOfLines={1}
          >
            {langDestination?.short_description}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginRight: 12,
    borderWidth: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  contentContainer: {
    padding: 12,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationText: {
    fontSize: 12,
    marginLeft: 4,
  },
});

export default DestinationCard;