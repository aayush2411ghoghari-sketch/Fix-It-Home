import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import type { TechnicianProfile, JobCategory } from '@/context/AppContext';

interface Props {
  tech: TechnicianProfile;
}

const CATEGORY_LABELS: Record<JobCategory, string> = {
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  appliance: 'Appliance',
  ac: 'AC / HVAC',
};

export default function TechnicianCard({ tech }: Props) {
  const colors = useColors();

  const initials = tech.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: colors.foreground }]}>{tech.name}</Text>
          <View style={styles.ratingRow}>
            <Feather name="star" size={13} color="#FFB800" />
            <Text style={[styles.rating, { color: colors.foreground }]}>{tech.rating.toFixed(1)}</Text>
            <Text style={[styles.jobCount, { color: colors.mutedForeground }]}>
              ({tech.completedJobs} jobs)
            </Text>
          </View>
        </View>
        <View style={styles.priceWrap}>
          <Text style={[styles.price, { color: colors.primary }]}>${tech.pricePerHour}</Text>
          <Text style={[styles.priceSub, { color: colors.mutedForeground }]}>per job</Text>
        </View>
      </View>

      {/* Bio */}
      <Text style={[styles.bio, { color: colors.mutedForeground }]} numberOfLines={2}>
        {tech.bio}
      </Text>

      {/* Tags */}
      <View style={styles.tags}>
        {tech.services.map(s => (
          <View key={s} style={[styles.tag, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.tagText, { color: colors.primary }]}>{CATEGORY_LABELS[s]}</Text>
          </View>
        ))}
        <View style={[styles.tag, { backgroundColor: colors.muted }]}>
          <Feather name="map-pin" size={11} color={colors.mutedForeground} />
          <Text style={[styles.tagText, { color: colors.mutedForeground }]}>
            {tech.serviceRadiusKm}km radius
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 20, marginBottom: 12, borderRadius: 16, borderWidth: 1, padding: 16, gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#fff' },
  name: { fontSize: 17, fontFamily: 'Inter_600SemiBold', marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rating: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  jobCount: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  priceWrap: { alignItems: 'flex-end' },
  price: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  priceSub: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  bio: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 19 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, gap: 4 },
  tagText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
});
