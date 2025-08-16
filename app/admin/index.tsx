import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/database.types';

type Destination = Database['public']['Tables']['destinations']['Row'];
type Event = Database['public']['Tables']['events']['Row'];

interface QuickActionProps {
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
}

function QuickAction({ title, icon, onPress }: QuickActionProps) {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <MaterialIcons name={icon} size={24} color="#007AFF" />
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    destinations: 0,
    events: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showDestinationsModal, setShowDestinationsModal] = useState(false);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [destinationsCount, eventsCount, usersCount] = await Promise.all([
        supabase.from('destinations').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        destinations: destinationsCount.count || 0,
        events: eventsCount.count || 0,
        users: usersCount.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      Alert.alert('Error', 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchDestinations = async () => {
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('city', { ascending: true });

      if (error) throw error;
      setDestinations(data || []);
      setShowDestinationsModal(true);
    } catch (error) {
      console.error('Error fetching destinations:', error);
      Alert.alert('Error', 'Failed to fetch destinations');
    }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
      setShowEventsModal(true);
    } catch (error) {
      console.error('Error fetching events:', error);
      Alert.alert('Error', 'Failed to fetch events');
    }
  };

  const handleEditDestination = (destination: Destination) => {
    setShowDestinationsModal(false);
    router.push(`/admin/destinations/${destination.id}/edit`);
  };

  const handleEditEvent = (event: Event) => {
    setShowEventsModal(false);
    router.push(`/admin/events/${event.id}/edit`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
      </View>

      <View style={styles.statsContainer}>
        <TouchableOpacity style={styles.statCard} onPress={fetchDestinations}>
          <Text style={styles.statNumber}>{stats.destinations}</Text>
          <Text style={styles.statLabel}>Destinations</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statCard} onPress={fetchEvents}>
          <Text style={styles.statNumber}>{stats.events}</Text>
          <Text style={styles.statLabel}>Events</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statCard} onPress={() => router.push('/admin/users')}>
          <Text style={styles.statNumber}>{stats.users}</Text>
          <Text style={styles.statLabel}>Users</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <QuickAction
            title="Add Destination"
            icon="add-location"
            onPress={() => router.push('/admin/destinations/new')}
          />
          <QuickAction
            title="Add Event"
            icon="event"
            onPress={() => router.push('/admin/events/new')}
          />
          <QuickAction
            title="Manage Users"
            icon="people"
            onPress={() => router.push('/admin/users')}
          />
          <QuickAction
            title="View Reports"
            icon="assessment"
            onPress={() => router.push('/admin/reports')}
          />
        </View>
      </View>

      <Modal
        visible={showDestinationsModal}
        animationType="slide"
        onRequestClose={() => setShowDestinationsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Destinations</Text>
            <TouchableOpacity onPress={() => setShowDestinationsModal(false)}>
              <MaterialIcons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {destinations.map(destination => (
              <TouchableOpacity
                key={destination.id}
                style={styles.itemCard}
                onPress={() => handleEditDestination(destination)}
              >
                <Text style={styles.itemTitle}>{destination.city}</Text>
                <Text style={styles.itemSubtitle}>{destination.deity}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={showEventsModal}
        animationType="slide"
        onRequestClose={() => setShowEventsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Events</Text>
            <TouchableOpacity onPress={() => setShowEventsModal(false)}>
              <MaterialIcons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {events.map(event => (
              <TouchableOpacity
                key={event.id}
                style={styles.itemCard}
                onPress={() => handleEditEvent(event)}
              >
                <Text style={styles.itemTitle}>{event.start_time}</Text>
                <Text style={styles.itemSubtitle}>{event.destination_id}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  quickActions: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 14,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  itemCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
}); 