import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../../../lib/supabase';
import { Database } from '../../../../types/database.types';
import { Picker } from '@react-native-picker/picker';

type Destination = Database['public']['Tables']['destinations']['Row'];
type Deity = Database['public']['Enums']['Deity'];
type Sampradaya = Database['public']['Enums']['Sampradaya'];

export default function EditDestination() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [destination, setDestination] = useState<Omit<Destination, 'id'>>({
    city: '',
    deity: 'Shiva',
    sampradaya: 'Shaiva',
    latitude: 0,
    longitude: 0,
  });

  useEffect(() => {
    if (id !== 'new') {
      fetchDestination();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchDestination = async () => {
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        const { id: _, ...rest } = data;
        setDestination(rest);
      }
    } catch (error) {
      console.error('Error fetching destination:', error);
      Alert.alert('Error', 'Failed to fetch destination');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!destination.city || !destination.deity || !destination.sampradaya) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      if (id === 'new') {
        const { error } = await supabase
          .from('destinations')
          .insert([destination]);

        if (error) throw error;
        Alert.alert('Success', 'Destination created successfully');
      } else {
        const { error } = await supabase
          .from('destinations')
          .update(destination)
          .eq('id', id);

        if (error) throw error;
        Alert.alert('Success', 'Destination updated successfully');
      }

      router.back();
    } catch (error) {
      console.error('Error saving destination:', error);
      Alert.alert('Error', 'Failed to save destination');
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
          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            value={destination.city}
            onChangeText={(text) => setDestination({ ...destination, city: text })}
            placeholder="Enter city name"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Deity</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={destination.deity}
              onValueChange={(value: Deity) => setDestination({ ...destination, deity: value })}
              style={styles.picker}
            >
              <Picker.Item label="Shiva" value="Shiva" />
              <Picker.Item label="Vishnu" value="Vishnu" />
              <Picker.Item label="Krishna" value="Krishna" />
              <Picker.Item label="Rama" value="Rama" />
              <Picker.Item label="Ganesh" value="Ganesh" />
              <Picker.Item label="Hanuman" value="Hanuman" />
              <Picker.Item label="Shakti" value="Shakti" />
              <Picker.Item label="Durga" value="Durga" />
              <Picker.Item label="Kali" value="Kali" />
              <Picker.Item label="Lakshmi" value="Lakshmi" />
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Sampradaya</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={destination.sampradaya}
              onValueChange={(value: Sampradaya) => setDestination({ ...destination, sampradaya: value })}
              style={styles.picker}
            >
              <Picker.Item label="RadhaVallabhi" value="RadhaVallabhi" />
              <Picker.Item label="Vaishnava" value="Vaishnava" />
              <Picker.Item label="Shaiva" value="Shaiva" />
              <Picker.Item label="Shakta" value="Shakta" />
              <Picker.Item label="Ganapatya" value="Ganapatya" />
              <Picker.Item label="Swaminarayan" value="Swaminarayan" />
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Latitude</Text>
          <TextInput
            style={styles.input}
            value={destination.latitude.toString()}
            onChangeText={(text) => setDestination({ ...destination, latitude: parseFloat(text) || 0 })}
            placeholder="Enter latitude"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Longitude</Text>
          <TextInput
            style={styles.input}
            value={destination.longitude.toString()}
            onChangeText={(text) => setDestination({ ...destination, longitude: parseFloat(text) || 0 })}
            placeholder="Enter longitude"
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>
            {id === 'new' ? 'Create Destination' : 'Update Destination'}
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
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  picker: {
    height: 50,
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