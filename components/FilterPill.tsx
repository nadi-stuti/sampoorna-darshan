import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";

interface FilterPillProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

const FilterPill: React.FC<FilterPillProps> = ({ label, selected, onPress, style }) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      style={[
        styles.pill,
        {
          backgroundColor: selected ? theme.colors.primary : theme.colors.backgroundSecondary,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={{ color: selected ? theme.colors.card : theme.colors.textSecondary, fontWeight: "600" }}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 2,
  },
});

export default FilterPill; 