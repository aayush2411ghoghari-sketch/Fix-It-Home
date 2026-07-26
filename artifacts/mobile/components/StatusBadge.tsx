import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { JobStatus } from '@/context/AppContext';

const STATUS: Record<JobStatus, { label: string; color: string; bg: string }> = {
  posted: { label: 'Posted', color: '#2563EB', bg: '#DBEAFE' },
  accepted: { label: 'Accepted', color: '#D97706', bg: '#FEF3C7' },
  in_progress: { label: 'In Progress', color: '#7C3AED', bg: '#EDE9FE' },
  completed: { label: 'Completed', color: '#16A34A', bg: '#DCFCE7' },
  cancelled: { label: 'Cancelled', color: '#DC2626', bg: '#FEE2E2' },
};

interface Props {
  status: JobStatus;
  small?: boolean;
}

export default function StatusBadge({ status, small }: Props) {
  const cfg = STATUS[status];
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }, small && styles.smallBadge]}>
      <View style={[styles.dot, { backgroundColor: cfg.color }]} />
      <Text style={[styles.label, { color: cfg.color }, small && styles.smallLabel]}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  smallBadge: { paddingHorizontal: 8, paddingVertical: 3 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  smallLabel: { fontSize: 11 },
});
