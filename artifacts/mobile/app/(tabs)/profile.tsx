import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, jobs, signOut } = useApp();

  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  const isCustomer = user?.role === 'customer';

  const customerStats = {
    posted: jobs.filter(j => j.customerId === user?.id).length,
    completed: jobs.filter(j => j.customerId === user?.id && j.status === 'completed').length,
  };

  const techStats = {
    completed: jobs.filter(j => j.technicianId === user?.id && j.status === 'completed').length,
    earned: jobs
      .filter(j => j.technicianId === user?.id && j.status === 'completed')
      .reduce((s, j) => s + Math.round(j.priceEstimate * 0.85), 0),
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await signOut();
          router.replace('/onboarding');
        },
      },
    ]);
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad + 24 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Profile</Text>
      </View>

      {/* Profile card */}
      <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: colors.foreground }]}>{user?.name}</Text>
          <Text style={[styles.phone, { color: colors.mutedForeground }]}>{user?.phone}</Text>
          <View style={[styles.rolePill, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.roleText, { color: colors.primary }]}>
              {isCustomer ? 'Customer' : 'Technician'}
            </Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {isCustomer ? (
          <>
            <StatCard label="Jobs Posted" value={customerStats.posted.toString()} colors={colors} />
            <StatCard label="Completed" value={customerStats.completed.toString()} colors={colors} />
          </>
        ) : (
          <>
            <StatCard label="Jobs Done" value={techStats.completed.toString()} colors={colors} />
            <StatCard label="Total Earned" value={`$${techStats.earned}`} colors={colors} />
          </>
        )}
      </View>

      {/* Menu */}
      <View style={[styles.menu, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <MenuItem icon="shield" label="Trust & Safety" colors={colors} />
        <MenuItem icon="help-circle" label="Help & Support" colors={colors} />
        <MenuItem icon="star" label="Rate FixIt Now" colors={colors} />
        <MenuItem icon="file-text" label="Terms of Service" colors={colors} last />
      </View>

      {/* Sign out */}
      <TouchableOpacity
        style={[styles.signOutBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
        onPress={handleSignOut}
        activeOpacity={0.8}
      >
        <Feather name="log-out" size={18} color={colors.destructive} />
        <Text style={[styles.signOutText, { color: colors.destructive }]}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={[styles.version, { color: colors.mutedForeground }]}>FixIt Now v1.0</Text>
    </ScrollView>
  );
}

function StatCard({ label, value, colors }: { label: string; value: string; colors: any }) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.statValue, { color: colors.primary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function MenuItem({ icon, label, colors, last }: { icon: any; label: string; colors: any; last?: boolean }) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, !last && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
      activeOpacity={0.7}
    >
      <Feather name={icon} size={18} color={colors.mutedForeground} />
      <Text style={[styles.menuLabel, { color: colors.foreground }]}>{label}</Text>
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 26, fontFamily: 'Inter_700Bold' },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 16,
    marginBottom: 16,
  },
  avatar: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 24, fontFamily: 'Inter_700Bold', color: '#fff' },
  name: { fontSize: 19, fontFamily: 'Inter_700Bold', marginBottom: 4 },
  phone: { fontSize: 14, fontFamily: 'Inter_400Regular', marginBottom: 8 },
  rolePill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  roleText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  statsRow: { flexDirection: 'row', marginHorizontal: 20, gap: 12, marginBottom: 16 },
  statCard: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 16, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 24, fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  menu: { marginHorizontal: 20, borderRadius: 14, borderWidth: 1, marginBottom: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  menuLabel: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
  signOutBtn: {
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    marginBottom: 12,
  },
  signOutText: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  version: { fontSize: 12, fontFamily: 'Inter_400Regular', textAlign: 'center' },
});
