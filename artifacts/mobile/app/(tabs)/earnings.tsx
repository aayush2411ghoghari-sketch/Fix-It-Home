import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';

export default function EarningsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, jobs } = useApp();

  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  const completedJobs = jobs.filter(j => j.technicianId === user?.id && j.status === 'completed');
  const totalGross = completedJobs.reduce((s, j) => s + j.priceEstimate, 0);
  const totalCommission = completedJobs.reduce((s, j) => s + Math.round(j.priceEstimate * 0.15), 0);
  const totalNet = completedJobs.reduce((s, j) => s + Math.round(j.priceEstimate * 0.85), 0);

  const now = new Date();
  const thisMonthJobs = completedJobs.filter(j => {
    const d = new Date(j.completedAt ?? j.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthNet = thisMonthJobs.reduce((s, j) => s + Math.round(j.priceEstimate * 0.85), 0);

  const avgRating =
    completedJobs.filter(j => j.rating).reduce((s, j) => s + (j.rating ?? 0), 0) /
    (completedJobs.filter(j => j.rating).length || 1);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad + 24 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Earnings</Text>
      </View>

      {/* Total card */}
      <LinearGradient
        colors={[colors.primary, '#FF8A65']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.totalCard}
      >
        <Text style={styles.totalLabel}>Total Earned</Text>
        <Text style={styles.totalAmount}>${totalNet}</Text>
        <Text style={styles.totalSub}>{completedJobs.length} jobs completed</Text>
      </LinearGradient>

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="calendar" size={18} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.foreground }]}>${monthNet}</Text>
          <Text style={[styles.statLabel, { color: colors.foreground }]}>This month</Text>
          <Text style={[styles.statSub, { color: colors.mutedForeground }]}>{thisMonthJobs.length} jobs</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="percent" size={18} color={colors.mutedForeground} />
          <Text style={[styles.statValue, { color: colors.foreground }]}>${totalCommission}</Text>
          <Text style={[styles.statLabel, { color: colors.foreground }]}>Platform fee</Text>
          <Text style={[styles.statSub, { color: colors.mutedForeground }]}>15% commission</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="star" size={18} color="#FFB800" />
          <Text style={[styles.statValue, { color: colors.foreground }]}>
            {completedJobs.filter(j => j.rating).length > 0 ? avgRating.toFixed(1) : '—'}
          </Text>
          <Text style={[styles.statLabel, { color: colors.foreground }]}>Avg rating</Text>
          <Text style={[styles.statSub, { color: colors.mutedForeground }]}>
            {completedJobs.filter(j => j.rating).length} reviews
          </Text>
        </View>
      </View>

      {/* Payment history */}
      <View style={[styles.historyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.historyTitle, { color: colors.foreground }]}>Payment History</Text>

        {completedJobs.length === 0 ? (
          <View style={styles.emptyHistory}>
            <Feather name="dollar-sign" size={36} color={colors.mutedForeground} />
            <Text style={[styles.emptyHistoryText, { color: colors.mutedForeground }]}>
              Complete jobs to see your earnings here
            </Text>
          </View>
        ) : (
          completedJobs.slice().reverse().slice(0, 10).map((job, i) => (
            <View
              key={job.id}
              style={[
                styles.payRow,
                { borderBottomColor: colors.border, borderBottomWidth: i < completedJobs.length - 1 ? 1 : 0 },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.payName, { color: colors.foreground }]}>{job.customerName}</Text>
                <Text style={[styles.payCat, { color: colors.mutedForeground }]}>
                  {job.category.charAt(0).toUpperCase() + job.category.slice(1)} repair ·{' '}
                  {new Date(job.completedAt ?? job.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.payAmounts}>
                <Text style={[styles.payNet, { color: colors.success }]}>
                  +${Math.round(job.priceEstimate * 0.85)}
                </Text>
                <Text style={[styles.payCommission, { color: colors.mutedForeground }]}>
                  -${Math.round(job.priceEstimate * 0.15)} fee
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 26, fontFamily: 'Inter_700Bold' },
  totalCard: { marginHorizontal: 20, borderRadius: 20, padding: 28, marginBottom: 16, alignItems: 'center' },
  totalLabel: { fontSize: 14, fontFamily: 'Inter_500Medium', color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
  totalAmount: { fontSize: 52, fontFamily: 'Inter_700Bold', color: '#fff' },
  totalSub: { fontSize: 13, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  statsGrid: { flexDirection: 'row', gap: 10, marginHorizontal: 20, marginBottom: 16 },
  statCard: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 14, gap: 3 },
  statValue: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  statSub: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  historyCard: { marginHorizontal: 20, borderRadius: 14, borderWidth: 1, padding: 16 },
  historyTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold', marginBottom: 14 },
  payRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  payName: { fontSize: 15, fontFamily: 'Inter_500Medium' },
  payCat: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  payAmounts: { alignItems: 'flex-end' },
  payNet: { fontSize: 17, fontFamily: 'Inter_700Bold' },
  payCommission: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  emptyHistory: { alignItems: 'center', paddingVertical: 28, gap: 10 },
  emptyHistoryText: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' },
});
