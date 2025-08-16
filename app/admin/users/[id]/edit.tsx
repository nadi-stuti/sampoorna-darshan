import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';
import { Picker } from '@react-native-picker/picker';

type User = Database['public']['Tables']['users']['Row'];
type Language = Database['public']['Enums']['Language'];
type Theme = Database['public']['Enums']['Theme'];

const LANGUAGES: Language[] = ['en', 'hi', 'kn', 'ml', 'ta'];
const THEMES: Theme[] = ['light', 'dark'];

export default function EditUser() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [user, setUser] = useState<Partial<User>>({
    email: '',
    preferred_language: 'en',
    theme: 'light',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id !== 'new') {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setUser(data);
    } catch (error) {
      console.error('Error fetching user:', error);
      Alert.alert('Error', 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (id === 'new') {
        const { error } = await supabase
          .from('users')
          .insert([user]);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('users')
          .update(user)
          .eq('id', id);

        if (error) throw error;
      }

      router.push('/admin/users');
    } catch (error) {
      console.error('Error saving user:', error);
      Alert.alert('Error', 'Failed to save user');
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
        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={user.email}
            onChangeText={(text) => setUser({ ...user, email: text })}
            placeholder="Enter email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Preferred Language</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={user.preferred_language}
              onValueChange={(value) => setUser({ ...user, preferred_language: value as Language })}
              style={styles.picker}
            >
              {LANGUAGES.map((lang) => (
                <Picker.Item
                  key={lang}
                  label={getLanguageName(lang)}
                  value={lang}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Theme</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={user.theme}
              onValueChange={(value) => setUser({ ...user, theme: value as Theme })}
              style={styles.picker}
            >
              {THEMES.map((theme) => (
                <Picker.Item
                  key={theme}
                  label={theme.charAt(0).toUpperCase() + theme.slice(1)}
                  value={theme}
                />
              ))}
            </Picker>
          </View>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>
            {id === 'new' ? 'Create User' : 'Update User'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const getLanguageName = (language: Language) => {
  const languageNames: Record<Language, string> = {
    en: 'English',
    hi: 'Hindi',
    kn: 'Kannada',
    ml: 'Malayalam',
    ta: 'Tamil',
  };
  return languageNames[language];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 16,
  },
  field: {
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
    marginTop: 16,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 