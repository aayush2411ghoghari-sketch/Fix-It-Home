import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useApp, type JobCategory } from '@/context/AppContext';
import JobCard from '@/components/JobCard';

const CATEGORIES: { key: JobCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'plumbing', label: 'Plumbing' },
  { key: 'electrical', label: 'Electrical' },
  { key: 'appliance', label: 'Appliance' },
  { key: 'ac', label: 'AC' },
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, jobs } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [catFilter, setCatFilter] = useState<JobCategory | 'all'>('all');

  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;
  const isCustomer = !user || user.role === 'customer';

  const displayJobs = isCustomer
    ? jobs.filter(j => j.customerId === user?.id)
    : jobs.filter(j => j.status === 'posted' && (catFilter === 'all' || j.category === catFilter));

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={displayJobs}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <JobCard job={item} onPress={() => router.push(`/job/${item.id}`)} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.list, displayJobs.length === 0 && styles.listEmpty]}
        scrollEnabled={displayJobs.length > 0}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.background }]}>
              <View>
                <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
                  {isCustomer ? getGreeting() : 'Jobs near you'}
                </Text>
                <Text style={[styles.name, { color: colors.foreground }]}>{user?.name ?? 'Welcome'}</Text>
              </View>
              {isCustomer && (
                <TouchableOpacity
                  style={[styles.postFab, { backgroundColor: colors.primary }]}
                  onPress={() => router.push('/(tabs)/post-job')}
                  activeOpacity={0.85}
                >
                  <Feather name="plus" size={22} color="#fff" />
                </TouchableOpacity>
              )}
            </View>

            {/* Category filter for technicians */}
            {!isCustomer && (
              <FlatList
                data={CATEGORIES}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.key}
                contentContainerStyle={styles.filters}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.chip,
                      {
                        backgroundColor: catFilter === item.key ? colors.primary : colors.muted,
                        borderColor: catFilter === item.key ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setCatFilter(item.key)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: catFilter === item.key ? '#fff' : colors.mutedForeground },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}

            {displayJobs.length > 0 && (
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                {isCustomer ? `${displayJobs.length} job${displayJobs.length !== 1 ? 's' : ''}` : `${displayJobs.length} available`}
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather
              name={isCustomer ? 'clipboard' : 'briefcase'}
              size={52}
              color={colors.mutedForeground}
            />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              {isCustomer ? 'No jobs yet' : 'No jobs available'}
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              {isCustomer
                ? 'Tap the + button to post your first job and get matched with nearby technicians'
                : 'Check back soon — new jobs are posted regularly in your area'}
            </Text>
            {isCustomer && (
              <TouchableOpacity
                style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/(tabs)/post-job')}
                activeOpacity={0.85}
              >
                <Feather name="plus" size={16} color="#fff" />
                <Text style={styles.emptyBtnText}>Post a job</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  greeting: { fontSize: 13, fontFamily: 'Inter_400Regular', marginBottom: 2 },
  name: { fontSize: 26, fontFamily: 'Inter_700Bold' },
  postFab: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  filters: { paddingHorizontal: 20, paddingBottom: 12, gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  sectionLabel: { fontSize: 12, fontFamily: 'Inter_500Medium', paddingHorizontal: 20, paddingBottom: 8 },
  list: { paddingBottom: 110 },
  listEmpty: { flex: 1 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    gap: 12,
    paddingTop: 48,
  },
  emptyTitle: { fontSize: 20, fontFamily: 'Inter_600SemiBold', textAlign: 'center' },
  emptyDesc: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 4,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 13,
    marginTop: 4,
  },
  emptyBtnText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#fff' },
});
