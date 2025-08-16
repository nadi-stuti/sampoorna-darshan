import { Stack, Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Dashboard',
        }}
      />
      <Stack.Screen
        name="destinations"
        options={{
          title: 'Destinations'
        }}
      />
      <Stack.Screen
        name="events"
        options={{
          title: 'Events'
        }}
      />
      <Stack.Screen
        name="users"
        options={{
          title: 'Users',
        }}
      />
    </Stack>
  );
} 