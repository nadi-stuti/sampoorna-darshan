import LOCAL from "@/constants/data";
import { useTheme } from "@/providers/ThemeProvider";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet } from "react-native";
import DropdownSelect from "react-native-input-select";
import EventDetailCard from "@/components/EventDetailCard";
import { supabase } from "@/lib/supabase";
import { Constants, Enums, Tables } from "@/types/database.types";
import Toast from "react-native-toast-message";

type PopularScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const Popular = ({ navigation }: PopularScreenProps) => {
  const { i18n } = useTranslation();
  const [popularEvents, setPopularEvents] = useState<{
    event: Tables<'events'>;
    translation: Tables<'event_translations'>;
    image: string;
    destinationTranslation: Tables<'destination_translations'>;
    deity: Enums<'Deity'>;
    sampradaya: Enums<'Sampradaya'>;
    city: string;
  }[]>([]);
  const { theme } = useTheme();
  const [selectedDeity, setSelectedDeity] = useState<Enums<'Deity'> | null>(null);
  const [selectedSampradaya, setSelectedSampradaya] = useState<Enums<'Sampradaya'> | null>(null);
  const [selectedDaily, setSelectedDaily] = useState<'daily' | 'special' | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [menu, setMenu] = useState<string[]>([]);

  useEffect(() => {
    const fetchPopularEvents = async () => {
      try {
        const { data: events, error: eventsError } = await supabase
          .from('events')
          .select(`
            *,
            event_translations!inner(*),
            destinations!inner(
              destination_translations!inner(*),
              deity,
              sampradaya,
              city
            )
          `)
          .eq('isPopular', true)
          .eq('event_translations.language', i18n.language as Enums<'Language'>)
          .eq('destinations.destination_translations.language', i18n.language as Enums<'Language'>);

        if (eventsError) throw eventsError;

        const formattedEvents = events.map(event => ({
          event: {
            ...event,
            destination_id: event.destination_id,
          },
          translation: event.event_translations[0],
          image: event.event_image || '',
          destinationTranslation: event.destinations.destination_translations[0],
          deity: event.destinations.deity,
          sampradaya: event.destinations.sampradaya,
          city: event.destinations.city,
        }));

        setPopularEvents(formattedEvents);
      } catch (error) {
        console.error("Error fetching popular events:", error);
        Toast.show({
          type: "error",
          text1: "Error fetching popular events",
        });
      }
    };

    fetchPopularEvents();
  }, [i18n.language]);

  const handleSetReminder = (eventId: string) => {
    // TODO: Show success message
    console.log(`Reminder set for event ${eventId}`);
  };

  const filterOptions = useMemo(() => {
    const deities = Array.from(new Set(popularEvents.map(e => e.deity))).filter(Boolean);
    const sampradayas = Array.from(new Set(popularEvents.map(e => e.sampradaya))).filter(Boolean);
    const cities = Array.from(new Set(popularEvents.map(e => e.city))).filter(Boolean);
    return { deities, sampradayas, cities };
  }, [popularEvents]);

  const filteredEvents = useMemo(() => {
    return popularEvents.filter(e => {
      if (selectedDeity && e.deity !== selectedDeity) return false;
      if (selectedSampradaya && e.sampradaya !== selectedSampradaya) return false;
      if (selectedDaily === 'daily' && !e.event.daily) return false;
      if (selectedDaily === 'special' && e.event.daily) return false;
      if (selectedCity && e.city !== selectedCity) return false;
      return true;
    });
  }, [popularEvents, selectedDeity, selectedSampradaya, selectedDaily, selectedCity]);

  const handleMenuChange = (itemValue: any) => {
    setMenu(itemValue);
  };

  return (
    <FlatList
      data={filteredEvents}
      style={{ backgroundColor: theme.colors.background }}
      ListHeaderComponent={
        <DropdownSelect
        placeholder="Filter darshans"
        options={[
          {
            title:'Type',
            data: [
              {label: 'All', value: 'All'},
              {label: 'Daily', value: 'daily'},
              {label: 'Special', value: 'special'},
            ],
          },
          {
            title: 'Deity',
            data: Constants.public.Enums.Deity.map(deity => ({label: deity, value: deity})),
          },
          {
            title: 'Sampradaya',
            data: Constants.public.Enums.Sampradaya.map(sampradaya => ({label: sampradaya, value: sampradaya})),
          },
          {
            title: 'State',
            data: LOCAL.states.map(state => ({label: state, value: state})),
          },
        ]}
        selectedValue={menu}
        onValueChange={(itemValue: any) => setMenu(itemValue)}
        isMultiple
        isSearchable
        primaryColor={theme.colors.primary}
        dropdownStyle={{ backgroundColor:theme.colors.backgroundSecondary,height: 36,borderRadius: 0,borderWidth: 0,borderColor: theme.colors.border }}
      />
    //     <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.filterBar, { backgroundColor: theme.colors.backgroundSecondary, borderBottomColor: theme.colors.border }]} contentContainerStyle={{ paddingHorizontal: 8, alignItems: 'center' }}>
    //       {/* Deity Dropdown */}
    //       <View style={styles.pickerContainer}>
    //         <Text style={[styles.pickerLabel, { color: theme.colors.text }]}>Deity:</Text>
    //         <Picker
    //           selectedValue={selectedDeity}
    //           style={[styles.picker, { color: theme.colors.text, backgroundColor: theme.colors.backgroundSecondary }]}
    //           onValueChange={value => setSelectedDeity(value || null)}
    //           mode="dialog"
    //         >
    //           <Picker.Item label="All" value={null} />
    //           {filterOptions.deities.map(deity => (
    //             <Picker.Item key={deity} label={deity} value={deity} />
    //           ))}
    //         </Picker>
    //       </View>
    //       {/* Sampradaya Dropdown */}
    //       <View style={styles.pickerContainer}>
    //         <Text style={[styles.pickerLabel, { color: theme.colors.text }]}>Sampradaya:</Text>
    //         <Picker
    //           selectedValue={selectedSampradaya}
    //           style={[styles.picker, { color: theme.colors.text, backgroundColor: theme.colors.backgroundSecondary }]}
    //           onValueChange={value => setSelectedSampradaya(value || null)}
    //           mode="dropdown"
    //         >
    //           <Picker.Item label="All" value={null} />
    //           {filterOptions.sampradayas.map(sampradaya => (
    //             <Picker.Item key={sampradaya} label={sampradaya} value={sampradaya} />
    //           ))}
    //         </Picker>
    //       </View>
    //       {/* Daily/special Dropdown */}
    //       <View style={styles.pickerContainer}>
    //         {/* <Text style={[styles.pickerLabel, { color: theme.colors.text }]}>Type:</Text> */}

    //         <DropdownSelect
    //         labelStyle={{ color: theme.colors.text }}
    //         dropdownContainerStyle={{ backgroundColor: theme.colors.backgroundSecondary,width: 120 }}
    //         dropdownStyle={{ backgroundColor: theme.colors.backgroundSecondary }}
    //   label="Type" 
    //   options={[
    //     { label: 'All', value: "All" },
    //     { label: 'Daily', value: 'daily' },
    //     { label: 'Special', value: 'special' },
    //   ]}
    //   selectedValue={selectedDaily}
    //   onValueChange={value => setSelectedDaily(value as 'daily' | 'special')}
    //   // primaryColor={'green'}
    // />
    //         {/* <Picker
    //           selectedValue={"daily"}
    //           style={[styles.picker, { color: theme.colors.text, backgroundColor: theme.colors.backgroundSecondary }]}
    //           itemStyle={{ fontSize: 10,height: 36 }}
    //           onValueChange={value => setSelectedDaily(value as 'daily' | 'special')}
    //           mode="dropdown"
    //         >
    //           <Picker.Item label="All" value={null}/>
    //           <Picker.Item label="Daily" value="daily"/>
    //           <Picker.Item label="Special" value="special"/>
    //         </Picker> */}
    //       </View>
    //       {/* City Dropdown */}
    //       <View style={styles.pickerContainer}>
    //         <Text style={[styles.pickerLabel, { color: theme.colors.text }]}>City:</Text>
    //         <Picker
    //           selectedValue={selectedCity}
    //           style={[styles.picker, { color: theme.colors.text, backgroundColor: theme.colors.backgroundSecondary }]}
    //           onValueChange={value => setSelectedCity(value || null)}
    //           mode="dropdown"
    //         >
    //           <Picker.Item label="All" value={null} />
    //           {filterOptions.cities.map(city => (
    //             <Picker.Item key={city} label={city} value={city} />
    //           ))}
    //         </Picker>
    //       </View>
    //     </ScrollView>
      }
      stickyHeaderIndices={[0]}
      renderItem={({ item }) => (
        <EventDetailCard
          event={item.event}
          eventTranslation={item.translation}
          eventImage={item.image}
          destinationTranslation={item.destinationTranslation}
          deity={item.deity}
          sampradaya={item.sampradaya}
          onSetReminder={handleSetReminder}
        />
      )}
    />
  );
};

export default Popular;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  filterBar: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    flexDirection: 'row',
  },
  pickerContainer: {
    minWidth: 120,
    marginRight: 12,
    alignItems: 'center',
    flexDirection: 'row',
  },
  pickerLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  picker: {
    width: 120,
    height: 36,
  },
});
