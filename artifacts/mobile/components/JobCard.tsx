import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import type { Job } from '@/context/AppContext';
import StatusBadge from './StatusBadge';
import CategoryIcon from './CategoryIcon';

interface Props {
  job: Job;
  onPress: () => void;
}

function getTimeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function JobCard({ job, onPress }: Props) {
  const colors = useColors();
  const categoryLabel = job.category.charAt(0).toUpperCase() + job.category.slice(1);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.78}
    >
      <View style={styles.body}>
        <CategoryIcon category={job.category} size={46} />
        <View style={styles.info}>
          <View style={styles.topRow}>
            <Text style={[styles.category, { color: colors.foreground }]}>{categoryLabel}</Text>
            <Text style={[styles.price, { color: colors.primary }]}>${job.priceEstimate}</Text>
          </View>
          <Text style={[styles.desc, { color: colors.mutedForeground }]} numberOfLines={2}>
            {job.description}
          </Text>
          <View style={styles.metaRow}>
            <StatusBadge status={job.status} small />
            <View style={styles.urgencyRow}>
              <Feather
                name={job.urgency === 'today' ? 'zap' : 'calendar'}
                size={11}
                color={job.urgency === 'today' ? colors.warning : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.urgency,
                  { color: job.urgency === 'today' ? colors.warning : colors.mutedForeground },
                ]}
              >
                {job.urgency === 'today' ? 'Today' : 'This week'}
              </Text>
            </View>
            <Text style={[styles.time, { color: colors.mutedForeground }]}>{getTimeAgo(job.createdAt)}</Text>
          </View>
        </View>
      </View>
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Feather name="map-pin" size={12} color={colors.mutedForeground} />
        <Text style={[styles.address, { color: colors.mutedForeground }]} numberOfLines={1}>
          {job.address}
        </Text>
        {job.technicianName && (
          <>
            <View style={[styles.dot, { backgroundColor: colors.border }]} />
            <Feather name="user-check" size={12} color={colors.mutedForeground} />
            <Text style={[styles.address, { color: colors.mutedForeground }]} numberOfLines={1}>
              {job.technicianName}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 20, marginBottom: 12, borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  body: { padding: 16, flexDirection: 'row', gap: 14 },
  info: { flex: 1, gap: 6 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  category: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  price: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  desc: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 18 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  urgencyRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  urgency: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  time: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  address: { fontSize: 12, fontFamily: 'Inter_400Regular', flex: 1 },
  dot: { width: 3, height: 3, borderRadius: 1.5 },
});
