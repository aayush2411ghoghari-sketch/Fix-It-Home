import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Platform } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useApp, type JobCategory } from '@/context/AppContext';
import TechnicianCard from '@/components/TechnicianCard';

const FILTERS: { key: JobCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'plumbing', label: 'Plumbing' },
  { key: 'electrical', label: 'Electrical' },
  { key: 'appliance', label: 'Appliance' },
  { key: 'ac', label: 'AC' },
];

export default function BrowseScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { technicianProfiles } = useApp();
  const [filter, setFilter] = useState<JobCategory | 'all'>('all');

  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;

  const filtered =
    filter === 'all'
      ? technicianProfiles
      : technicianProfiles.filter(t => t.services.includes(filter));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
        ListHeaderComponent={
          <View>
            <View style={[styles.header, { paddingTop: topPad + 16 }]}>
              <Text style={[styles.title, { color: colors.foreground }]}>Technicians</Text>
              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                {filtered.length} available nearby
              </Text>
            </View>
            <FlatList
              data={FILTERS}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => item.key}
              contentContainerStyle={styles.filters}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.chip,
                    {
                      backgroundColor: filter === item.key ? colors.primary : colors.muted,
                      borderColor: filter === item.key ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setFilter(item.key)}
                >
                  <Text
                    style={[styles.chipText, { color: filter === item.key ? '#fff' : colors.mutedForeground }]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        }
        renderItem={({ item }) => <TechnicianCard tech={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No technicians available for this category
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 26, fontFamily: 'Inter_700Bold' },
  subtitle: { fontSize: 14, fontFamily: 'Inter_400Regular', marginTop: 4 },
  filters: { paddingHorizontal: 20, paddingBottom: 16, gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 15, fontFamily: 'Inter_400Regular' },
});
