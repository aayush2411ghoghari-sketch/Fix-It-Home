import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import type { UserRole } from '@/context/AppContext';

const genId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

export default function Onboarding() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setUser } = useApp();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  const handleRoleSelect = (role: UserRole) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedRole(role);
    setStep(2);
  };

  const handleContinue = async () => {
    if (!name.trim() || !phone.trim() || !selectedRole) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    try {
      await setUser({ id: genId(), name: name.trim(), phone: phone.trim(), role: selectedRole });
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[colors.primary, '#FF8A65', colors.background]}
      locations={[0, 0.32, 0.65]}
      style={styles.gradient}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 24, paddingBottom: bottomPad + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <MaterialCommunityIcons name="wrench" size={28} color="#fff" />
          </View>
          <Text style={styles.logoText}>FixIt Now</Text>
        </View>

        {step === 1 && (
          <View style={styles.section}>
            <Text style={styles.headline}>Home repair,{'\n'}sorted instantly.</Text>
            <Text style={styles.subheadline}>How will you use FixIt Now?</Text>

            <TouchableOpacity
              style={[styles.roleCard, { backgroundColor: colors.background }]}
              onPress={() => handleRoleSelect('customer')}
              activeOpacity={0.85}
            >
              <View style={[styles.roleIconWrap, { backgroundColor: colors.secondary }]}>
                <MaterialCommunityIcons name="hammer-wrench" size={26} color={colors.primary} />
              </View>
              <View style={styles.roleText}>
                <Text style={[styles.roleTitle, { color: colors.foreground }]}>I need a repair</Text>
                <Text style={[styles.roleDesc, { color: colors.mutedForeground }]}>
                  Post a job and get matched with nearby technicians fast
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleCard, { backgroundColor: colors.background }]}
              onPress={() => handleRoleSelect('technician')}
              activeOpacity={0.85}
            >
              <View style={[styles.roleIconWrap, { backgroundColor: colors.secondary }]}>
                <MaterialCommunityIcons name="toolbox" size={26} color={colors.primary} />
              </View>
              <View style={styles.roleText}>
                <Text style={[styles.roleTitle, { color: colors.foreground }]}>I'm a technician</Text>
                <Text style={[styles.roleDesc, { color: colors.mutedForeground }]}>
                  Accept jobs nearby and grow your income on your schedule
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={[styles.formCard, { backgroundColor: colors.background }]}>
            <TouchableOpacity onPress={() => setStep(1)} style={styles.backBtn}>
              <Feather name="arrow-left" size={22} color={colors.foreground} />
            </TouchableOpacity>

            <Text style={[styles.formTitle, { color: colors.foreground }]}>
              {selectedRole === 'customer' ? 'Your details' : 'Your profile'}
            </Text>
            <Text style={[styles.formSub, { color: colors.mutedForeground }]}>
              Used for bookings and communication
            </Text>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Full name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                placeholder="Your full name"
                placeholderTextColor={colors.mutedForeground}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                returnKeyType="next"
                autoFocus
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Phone number</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                placeholder="+1 (555) 000-0000"
                placeholderTextColor={colors.mutedForeground}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                returnKeyType="done"
                onSubmitEditing={handleContinue}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.continueBtn,
                { backgroundColor: colors.primary, opacity: !name.trim() || !phone.trim() ? 0.45 : 1 },
              ]}
              onPress={handleContinue}
              disabled={!name.trim() || !phone.trim() || loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.continueBtnText}>Get started</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 20 },
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 44, gap: 12 },
  logoIcon: {
    width: 48,
    height: 48,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { fontSize: 26, fontFamily: 'Inter_700Bold', color: '#fff' },
  section: { gap: 16 },
  headline: { fontSize: 38, fontFamily: 'Inter_700Bold', color: '#fff', lineHeight: 46, marginBottom: 6 },
  subheadline: { fontSize: 16, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.85)', marginBottom: 6 },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 18,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  roleIconWrap: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  roleText: { flex: 1, gap: 4 },
  roleTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  roleDesc: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 18 },
  formCard: { borderRadius: 24, padding: 24, gap: 0, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 8 },
  backBtn: { marginBottom: 16 },
  formTitle: { fontSize: 24, fontFamily: 'Inter_700Bold', marginBottom: 6 },
  formSub: { fontSize: 14, fontFamily: 'Inter_400Regular', marginBottom: 24 },
  field: { marginBottom: 16 },
  label: { fontSize: 12, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.5, marginBottom: 8 },
  input: { height: 52, borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 16, fontSize: 16, fontFamily: 'Inter_400Regular' },
  continueBtn: { height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  continueBtnText: { fontSize: 17, fontFamily: 'Inter_600SemiBold', color: '#fff' },
});
