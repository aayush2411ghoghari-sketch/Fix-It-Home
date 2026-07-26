import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { JobCategory } from '@/context/AppContext';

const CONFIG: Record<JobCategory, { icon: string; color: string; bg: string }> = {
  plumbing: { icon: 'droplet', color: '#2563EB', bg: '#DBEAFE' },
  electrical: { icon: 'zap', color: '#D97706', bg: '#FEF3C7' },
  appliance: { icon: 'tool', color: '#7C3AED', bg: '#EDE9FE' },
  ac: { icon: 'wind', color: '#0891B2', bg: '#CFFAFE' },
};

interface Props {
  category: JobCategory;
  size?: number;
}

export default function CategoryIcon({ category, size = 40 }: Props) {
  const { icon, color, bg } = CONFIG[category];
  return (
    <View
      style={[
        styles.wrap,
        { width: size, height: size, borderRadius: size * 0.28, backgroundColor: bg },
      ]}
    >
      <Feather name={icon as any} size={size * 0.48} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});
