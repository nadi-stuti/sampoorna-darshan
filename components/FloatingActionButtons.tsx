import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FeedbackForm } from './feedback/FeedbackForm';

const WHATSAPP_NUMBER = '+919340708756'; // Replace with actual support number

export const FloatingActionButtons = () => {
  const { theme } = useTheme();
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);

  const handleWhatsAppPress = () => {
    const url = `whatsapp://send?phone=${WHATSAPP_NUMBER}`;
    Linking.openURL(url).catch(() => {
      // Fallback to web WhatsApp if app is not installed
      Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}`);
    });
  };

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={() => setIsFeedbackVisible(true)}
        >
          <MaterialCommunityIcons name="message-text" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.fab, { backgroundColor: '#25D366' }]}
          onPress={handleWhatsAppPress}
        >
          <MaterialCommunityIcons name="whatsapp" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FeedbackForm
        visible={isFeedbackVisible}
        onClose={() => setIsFeedbackVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    gap: 12,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
}); 