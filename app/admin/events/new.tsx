import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Database } from '../../../types/database.types';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

type Event = Database['public']['Tables']['events']['Insert'];
type EventTranslation = Database['public']['Tables']['event_translations']['Insert'];
type Destination = Database['public']['Tables']['destinations']['Row'];

const LANGUAGES = ['en', 'hi', 'kn', 'ml', 'ta'] as const;
const LANGUAGE_NAMES = {
  en: 'English',
  hi: 'Hindi',
  kn: 'Kannada',
  ml: 'Malayalam',
  ta: 'Tamil',
};

export default function NewEventScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [event, setEvent] = useState<Event>({
    destination_id: '',
    start_time: '',
    end_time: '',
    date: null,
    daily: false,
    isPopular: false,
  });
  const [translations, setTranslations] = useState<Record<string, EventTranslation>>(
    LANGUAGES.reduce((acc, lang) => ({
      ...acc,
      [lang]: {
        event_id: '',
        language: lang,
        name: '',
        description: '',
      },
    }), {})
  );

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('city', { ascending: true });

      if (error) throw error;
      setDestinations(data || []);
      if (data && data.length > 0) {
        setEvent(prev => ({ ...prev, destination_id: data[0].id }));
      }
    } catch (error) {
      console.error('Error fetching destinations:', error);
      Alert.alert('Error', 'Failed to fetch destinations');
    }
  };

  const handleSubmit = async () => {
    if (!event.destination_id || !event.start_time || !event.end_time || (!event.daily && !event.date)) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const { data: newEvent, error: eventError } = await supabase
        .from('events')
        .insert(event)
        .select()
        .single();

      if (eventError) throw eventError;

      const translationPromises = Object.values(translations).map(translation => {
        if (!translation.name) return Promise.resolve();
        return supabase
          .from('event_translations')
          .insert({ ...translation, event_id: newEvent.id });
      });

      await Promise.all(translationPromises);
      router.back();
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>New Event</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Destination *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={event.destination_id}
              onValueChange={(value) => setEvent({ ...event, destination_id: value })}
              style={styles.picker}
            >
              {destinations.map(destination => (
                <Picker.Item
                  key={destination.id}
                  label={destination.city}
                  value={destination.id}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Start Time *</Text>
          <TextInput
            style={styles.input}
            value={event.start_time}
            onChangeText={(text) => setEvent({ ...event, start_time: text })}
            placeholder="HH:MM (24-hour format)"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>End Time *</Text>
          <TextInput
            style={styles.input}
            value={event.end_time}
            onChangeText={(text) => setEvent({ ...event, end_time: text })}
            placeholder="HH:MM (24-hour format)"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text>
              {event.date ? new Date(event.date).toLocaleDateString() : 'Select date'}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={event.date ? new Date(event.date) : new Date()}
              mode="date"
              onChange={(_, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setEvent({ ...event, date: selectedDate.toISOString() });
                }
              }}
            />
          )}
        </View>

        <View style={styles.switchGroup}>
          <Text style={styles.label}>Daily Event</Text>
          <Switch
            value={event.daily}
            onValueChange={(value) => setEvent({ ...event, daily: value })}
          />
        </View>

        <View style={styles.switchGroup}>
          <Text style={styles.label}>Popular Event</Text>
          <Switch
            value={event.isPopular}
            onValueChange={(value) => setEvent({ ...event, isPopular: value })}
          />
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
              placeholder={`Event name in ${LANGUAGE_NAMES[lang]}`}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              value={translations[lang].description}
              onChangeText={(text) => setTranslations(prev => ({
                ...prev,
                [lang]: { ...prev[lang], description: text },
              }))}
              placeholder={`Event description in ${LANGUAGE_NAMES[lang]}`}
              multiline
              numberOfLines={4}
            />
          </View>
        ))}

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Creating...' : 'Create Event'}
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
  dateButton: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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