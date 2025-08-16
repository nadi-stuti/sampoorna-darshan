import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/database.types';

type Event = Database['public']['Tables']['events']['Row'];
type EventTranslation = Database['public']['Tables']['event_translations']['Row'];

export default function EventsScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<(Event & { translations: EventTranslation[] })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false });

      if (eventsError) throw eventsError;

      const eventsWithTranslations = await Promise.all(
        (eventsData || []).map(async (event) => {
          const { data: translations, error: translationsError } = await supabase
            .from('event_translations')
            .select('*')
            .eq('event_id', event.id);

          if (translationsError) throw translationsError;
          return { ...event, translations: translations || [] };
        })
      );

      setEvents(eventsWithTranslations);
    } catch (error) {
      console.error('Error fetching events:', error);
      Alert.alert('Error', 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('events')
                .delete()
                .eq('id', id);

              if (error) throw error;
              setEvents(events.filter(e => e.id !== id));
            } catch (error) {
              console.error('Error deleting event:', error);
              Alert.alert('Error', 'Failed to delete event');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading events...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Events</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/admin/events/new')}
        >
          <MaterialIcons name="add" size={24} color="white" />
          <Text style={styles.addButtonText}>Add Event</Text>
        </TouchableOpacity>
      </View>

      {events.map((event) => (
        <View key={event.id} style={styles.eventCard}>
          <View style={styles.eventInfo}>
            <Text style={styles.eventName}>
              {event.translations.find(t => t.language === 'en')?.name || 'Untitled Event'}
            </Text>
            <Text style={styles.eventDate}>
              {new Date(event.date).toLocaleDateString()} • {event.start_time} - {event.end_time}
            </Text>
            <Text style={styles.eventLocation}>
              {event.daily ? 'Daily Event' : 'One-time Event'} • {event.is_popular ? 'Popular' : 'Regular'}
            </Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push(`/admin/events/${event.id}/edit`)}
            >
              <MaterialIcons name="edit" size={20} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDelete(event.id)}
            >
              <MaterialIcons name="delete" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {events.length === 0 && (
        <View style={styles.emptyState}>
          <MaterialIcons name="event" size={48} color="#999" />
          <Text style={styles.emptyStateText}>No events found</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  eventCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
}); 