import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../../../lib/supabase';
import { Database } from '../../../../types/database.types';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

type Event = Database['public']['Tables']['events']['Row'];
type EventTranslation = Database['public']['Tables']['event_translations']['Row'];
type Language = Database['public']['Enums']['Language'];

export default function EditEvent() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<Omit<Event, 'id'>>({
    destination_id: '',
    start_time: '',
    end_time: '',
    date: null,
    daily: false,
    isPopular: false,
  });
  const [translations, setTranslations] = useState<Record<Language, Omit<EventTranslation, 'id' | 'event_id'>>>({
    en: { name: '', description: '', language: 'en' },
    hi: { name: '', description: '', language: 'hi' },
    kn: { name: '', description: '', language: 'kn' },
    ml: { name: '', description: '', language: 'ml' },
    ta: { name: '', description: '', language: 'ta' },
  });
  const [destinations, setDestinations] = useState<{ id: string; city: string }[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchDestinations();
    if (id !== 'new') {
      fetchEvent();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchDestinations = async () => {
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select('id, city');

      if (error) throw error;
      setDestinations(data || []);
    } catch (error) {
      console.error('Error fetching destinations:', error);
      Alert.alert('Error', 'Failed to fetch destinations');
    }
  };

  const fetchEvent = async () => {
    try {
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (eventError) throw eventError;

      const { data: translationData, error: translationError } = await supabase
        .from('event_translations')
        .select('*')
        .eq('event_id', id);

      if (translationError) throw translationError;

      if (eventData) {
        const { id: _, ...rest } = eventData;
        setEvent({
          ...rest,
          daily: rest.daily || false,
          isPopular: rest.isPopular || false,
        });
      }

      if (translationData) {
        const newTranslations = { ...translations };
        translationData.forEach(t => {
          newTranslations[t.language] = {
            name: t.name,
            description: t.description,
            language: t.language,
          };
        });
        setTranslations(newTranslations);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      Alert.alert('Error', 'Failed to fetch event');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!event.destination_id || !event.start_time || !event.end_time) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      if (id === 'new') {
        const { data: newEvent, error: eventError } = await supabase
          .from('events')
          .insert([event])
          .select()
          .single();

        if (eventError) throw eventError;

        const translationPromises = Object.entries(translations).map(([lang, trans]) =>
          supabase.from('event_translations').insert([{
            ...trans,
            event_id: newEvent.id,
          }])
        );

        await Promise.all(translationPromises);
        Alert.alert('Success', 'Event created successfully');
      } else {
        const { error: eventError } = await supabase
          .from('events')
          .update(event)
          .eq('id', id);

        if (eventError) throw eventError;

        const translationPromises = Object.entries(translations).map(([lang, trans]) =>
          supabase
            .from('event_translations')
            .upsert({
              ...trans,
              event_id: id,
            })
        );

        await Promise.all(translationPromises);
        Alert.alert('Success', 'Event updated successfully');
      }

      router.back();
    } catch (error) {
      console.error('Error saving event:', error);
      Alert.alert('Error', 'Failed to save event');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Destination</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={event.destination_id}
              onValueChange={(value) => setEvent({ ...event, destination_id: value })}
              style={styles.picker}
            >
              <Picker.Item label="Select Destination" value="" />
              {destinations.map(dest => (
                <Picker.Item key={dest.id} label={dest.city} value={dest.id} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Start Time</Text>
          <TextInput
            style={styles.input}
            value={event.start_time}
            onChangeText={(text) => setEvent({ ...event, start_time: text })}
            placeholder="HH:MM"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>End Time</Text>
          <TextInput
            style={styles.input}
            value={event.end_time}
            onChangeText={(text) => setEvent({ ...event, end_time: text })}
            placeholder="HH:MM"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <Text>{event.date ? new Date(event.date).toLocaleDateString() : 'Select Date'}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={event.date ? new Date(event.date) : new Date()}
              mode="date"
              onChange={(event: any, selectedDate?: Date) => {
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
            value={event.daily || false}
            onValueChange={(value) => setEvent({ ...event, daily: value })}
          />
        </View>

        <View style={styles.switchGroup}>
          <Text style={styles.label}>Popular Event</Text>
          <Switch
            value={event.isPopular || false}
            onValueChange={(value) => setEvent({ ...event, isPopular: value })}
          />
        </View>

        {Object.entries(translations).map(([lang, trans]) => (
          <View key={lang} style={styles.translationGroup}>
            <Text style={styles.label}>{lang.toUpperCase()} Translation</Text>
            <TextInput
              style={styles.input}
              value={trans.name}
              onChangeText={(text) => setTranslations({
                ...translations,
                [lang]: { ...trans, name: text },
              })}
              placeholder={`Name in ${lang}`}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              value={trans.description}
              onChangeText={(text) => setTranslations({
                ...translations,
                [lang]: { ...trans, description: text },
              })}
              placeholder={`Description in ${lang}`}
              multiline
              numberOfLines={4}
            />
          </View>
        ))}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>
            {id === 'new' ? 'Create Event' : 'Update Event'}
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
  form: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
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
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  translationGroup: {
    marginBottom: 24,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 