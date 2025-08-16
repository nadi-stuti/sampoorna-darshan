import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Constants, Database } from '../../../types/database.types';
import { Picker } from '@react-native-picker/picker';

type Destination = Database['public']['Tables']['destinations']['Insert'];
type DestinationTranslation = Database['public']['Tables']['destination_translations']['Insert'];
type DestinationImage = Database['public']['Tables']['destination_images']['Insert'];

const LANGUAGES = Constants.public.Enums.Language;
const SAMPRADAYA = Constants.public.Enums.Sampradaya;
const DEITY = Constants.public.Enums.Deity;
const LANGUAGE_NAMES = {
  en: 'English',
  hi: 'Hindi',
  kn: 'Kannada',
  ml: 'Malayalam',
  ta: 'Tamil',
};

export default function NewDestinationScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [destination, setDestination] = useState<Destination>({
    city: '',
    deity: 'Shiva',
    sampradaya: 'RadhaVallabhi',
    latitude: 0,
    longitude: 0,
    live_feed: '',
  });
  const [translations, setTranslations] = useState<Record<string, DestinationTranslation>>(
    LANGUAGES.reduce((acc, lang) => ({
      ...acc,
      [lang]: {
        destination_id: '',
        language: lang,
        name: '',
        short_description: '',
        detailed_description: '',
      },
    }), {})
  );
  const [imageUrl, setImageUrl] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const handleAddImage = () => {
    if (!imageUrl.trim()) return;
    setImageUrls(prev => [...prev, imageUrl.trim()]);
    setImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!destination.city || !destination.deity || !destination.sampradaya || !destination.live_feed) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Create destination
      const { data: newDestination, error: destinationError } = await supabase
        .from('destinations')
        .insert(destination)
        .select()
        .single();

      if (destinationError) throw destinationError;

      // Create translations
      const translationPromises = Object.values(translations).map(translation => {
        if (!translation.name) return Promise.resolve();
        return supabase
          .from('destination_translations')
          .insert({ ...translation, destination_id: newDestination.id });
      });

      // Create images
      const imagePromises = imageUrls.map(url =>
        supabase
          .from('destination_images')
          .insert({
            destination_id: newDestination.id,
            hero_image: url,
          })
      );

      await Promise.all([...translationPromises, ...imagePromises]);
      router.back();
    } catch (error) {
      console.error('Error creating destination:', error);
      Alert.alert('Error', 'Failed to create destination');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>New Destination</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>City *</Text>
          <TextInput
            style={styles.input}
            value={destination.city}
            onChangeText={(text) => setDestination({ ...destination, city: text })}
            placeholder="Enter city name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Deity *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={destination.deity}
              onValueChange={(value) => setDestination({ ...destination, deity: value })}
              style={styles.picker}
            >
              {DEITY.map((deity) => (
                <Picker.Item key={deity} label={deity} value={deity} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Sampradaya *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={destination.sampradaya}
              onValueChange={(value) => setDestination({ ...destination, sampradaya: value })}
              style={styles.picker}
            >
              {SAMPRADAYA.map((sampradaya) => (
                <Picker.Item key={sampradaya} label={sampradaya} value={sampradaya} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Latitude *</Text>
          <TextInput
            style={styles.input}
            value={destination.latitude.toString()}
            onChangeText={(text) => setDestination({ ...destination, latitude: parseFloat(text) || 0 })}
            placeholder="Enter latitude"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Longitude *</Text>
          <TextInput
            style={styles.input}
            value={destination.longitude.toString()}
            onChangeText={(text) => setDestination({ ...destination, longitude: parseFloat(text) || 0 })}
            placeholder="Enter longitude"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Live Feed *</Text>
          <TextInput
            style={styles.input}
            value={destination.live_feed}
            onChangeText={(text) => setDestination({ ...destination, live_feed: text })}
            placeholder="Enter Live feed url"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Images</Text>
          <View style={styles.imageInputContainer}>
            <TextInput
              style={[styles.input, styles.imageInput]}
              value={imageUrl}
              onChangeText={setImageUrl}
              placeholder="Enter image URL"
            />
            <TouchableOpacity style={styles.addImageButton} onPress={handleAddImage}>
              <Text style={styles.addImageButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.imageList}>
            {imageUrls.map((url, index) => (
              <View key={index} style={styles.imageItem}>
                <Text style={styles.imageUrl} numberOfLines={1}>{url}</Text>
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => handleRemoveImage(index)}
                >
                  <Text style={styles.removeImageButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {LANGUAGES.map(lang => (
          <View key={lang} style={styles.translationGroup}>
            <Text style={styles.label}>{LANGUAGE_NAMES[lang]} Translation</Text>
            <TextInput
              style={styles.input}
              value={translations[lang].name}
              onChangeText={(text) => setTranslations(prev => ({
                ...prev,
                [lang]: { ...prev[lang], name: text },
              }))}
              placeholder={`Destination name in ${LANGUAGE_NAMES[lang]}`}
            />
            <TextInput
              style={[styles.input, styles.input]}
              value={translations[lang].short_description}
              onChangeText={(text) => setTranslations(prev => ({
                ...prev,
                [lang]: { ...prev[lang], short_description: text },
              }))}
              placeholder={`Destination short description in ${LANGUAGE_NAMES[lang]}`}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              value={translations[lang].detailed_description}
              onChangeText={(text) => setTranslations(prev => ({
                ...prev,
                [lang]: { ...prev[lang], detailed_description: text },
              }))}
              placeholder={`Destination detailed description in ${LANGUAGE_NAMES[lang]}`}
              multiline
              numberOfLines={10}
            />

            <TextInput
              style={[styles.input, styles.input]}
              value={translations[lang].location}
              onChangeText={(text) => setTranslations(prev => ({
                ...prev,
                [lang]: { ...prev[lang], location: text },
              }))}
              placeholder={`Destination location in ${LANGUAGE_NAMES[lang]}`}
            />
          </View>
        ))}

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Creating...' : 'Create Destination'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  picker: {
    height: 50,
  },
  imageInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  imageInput: {
    flex: 1,
  },
  addImageButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addImageButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  imageList: {
    marginTop: 8,
  },
  imageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  imageUrl: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  removeImageButton: {
    padding: 4,
  },
  removeImageButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: 'bold',
  },
  translationGroup: {
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
}); 