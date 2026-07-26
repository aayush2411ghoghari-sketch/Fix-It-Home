import React from 'react';
import { View, Text, StyleSheet, FlatList, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import JobCard from '@/components/JobCard';

export default function MyJobsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, jobs } = useApp();

  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;

  const myJobs = jobs.filter(j => j.technicianId === user?.id && j.status !== 'cancelled');
  const active = myJobs.filter(j => j.status === 'accepted' || j.status === 'in_progress');
  const completed = myJobs.filter(j => j.status === 'completed');

  type ListItem =
    | { type: 'job'; id: string; job: (typeof myJobs)[0] }
    | { type: 'section'; id: string; title: string };

  const listData: ListItem[] = [
    ...(active.length > 0
      ? [
          { type: 'section' as const, id: 'sec_active', title: 'ACTIVE' },
          ...active.map(j => ({ type: 'job' as const, id: j.id, job: j })),
        ]
      : []),
    ...(completed.length > 0
      ? [
          { type: 'section' as const, id: 'sec_completed', title: 'COMPLETED' },
          ...completed.map(j => ({ type: 'job' as const, id: j.id, job: j })),
        ]
      : []),
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={listData}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.list, myJobs.length === 0 && styles.listEmpty]}
        scrollEnabled={myJobs.length > 0}
        ListHeaderComponent={
          <View style={[styles.header, { paddingTop: topPad + 16 }]}>
            <Text style={[styles.title, { color: colors.foreground }]}>My Jobs</Text>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.statNum, { color: colors.primary }]}>{active.length}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Active</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.statNum, { color: colors.success }]}>{completed.length}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Completed</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.statNum, { color: colors.foreground }]}>
                  ${completed.reduce((s, j) => s + Math.round(j.priceEstimate * 0.85), 0)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Earned</Text>
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          if (item.type === 'section') {
            return (
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>{item.title}</Text>
            );
          }
          return <JobCard job={item.job} onPress={() => router.push(`/job/${item.job.id}`)} />;
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="briefcase" size={52} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No jobs yet</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              Accept jobs from the Jobs tab to get started
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
  title: { fontSize: 26, fontFamily: 'Inter_700Bold', marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 14, alignItems: 'center', gap: 4 },
  statNum: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  sectionLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 1, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  list: { paddingBottom: 110 },
  listEmpty: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36, gap: 12, paddingTop: 60 },
  emptyTitle: { fontSize: 20, fontFamily: 'Inter_600SemiBold' },
  emptyDesc: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 20 },
});
