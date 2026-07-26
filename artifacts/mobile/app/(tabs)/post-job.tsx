import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useApp, type JobCategory, type JobUrgency } from '@/context/AppContext';
import CategoryIcon from '@/components/CategoryIcon';

const CATEGORIES: { key: JobCategory; label: string; desc: string }[] = [
  { key: 'plumbing', label: 'Plumbing', desc: 'Pipes, leaks, drains, water heater' },
  { key: 'electrical', label: 'Electrical', desc: 'Outlets, wiring, circuit, fixtures' },
  { key: 'appliance', label: 'Appliance', desc: 'Washer, dryer, dishwasher, fridge' },
  { key: 'ac', label: 'AC / HVAC', desc: 'Air conditioning, heating, ventilation' },
];

const PRICE_MAP: Record<JobCategory, number> = {
  plumbing: 120,
  electrical: 140,
  appliance: 90,
  ac: 160,
};

const URGENCY_OPTIONS: { key: JobUrgency; label: string; desc: string; icon: string }[] = [
  { key: 'today', label: 'Today', desc: 'I need this fixed as soon as possible', icon: 'zap' },
  { key: 'this_week', label: 'This week', desc: 'Within the next few days is fine', icon: 'calendar' },
];

type Step = 1 | 2 | 3 | 4;

export default function PostJobScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { createJob } = useApp();

  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  const [step, setStep] = useState<Step>(1);
  const [category, setCategory] = useState<JobCategory | null>(null);
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [urgency, setUrgency] = useState<JobUrgency>('today');
  const [loading, setLoading] = useState(false);

  const canProceed = () => {
    if (step === 1) return !!category;
    if (step === 2) return description.trim().length >= 10;
    if (step === 3) return address.trim().length > 3;
    return true;
  };

  const handleNext = () => {
    if (!canProceed()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep((s => (s + 1) as Step)(step));
  };

  const handleBack = () => {
    if (step === 1) return;
    setStep((s => (s - 1) as Step)(step));
  };

  const handlePost = async () => {
    if (!category) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLoading(true);
    try {
      const job = await createJob({ category, description, address, urgency });
      router.push(`/job/${job.id}`);
    } catch {
      Alert.alert('Error', 'Failed to post job. Please try again.');
      setLoading(false);
    }
  };

  const stepTitles: Record<Step, string> = {
    1: 'What needs fixing?',
    2: 'Describe the issue',
    3: 'Location & urgency',
    4: 'Review & post',
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        {step > 1 ? (
          <TouchableOpacity onPress={handleBack} style={styles.navBtn}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </TouchableOpacity>
        ) : (
          <View style={styles.navBtn} />
        )}
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{stepTitles[step]}</Text>
        <Text style={[styles.stepCount, { color: colors.mutedForeground }]}>{step}/4</Text>
      </View>

      {/* Progress */}
      <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
        <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${(step / 4) * 100}%` }]} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.body, { paddingBottom: bottomPad + 100 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Step 1: Category */}
        {step === 1 && (
          <View style={styles.stepBody}>
            <Text style={[styles.stepHint, { color: colors.mutedForeground }]}>
              Select the category that best fits your issue
            </Text>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: category === cat.key ? colors.secondary : colors.card,
                    borderColor: category === cat.key ? colors.primary : colors.border,
                    borderWidth: category === cat.key ? 2 : 1,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setCategory(cat.key);
                }}
                activeOpacity={0.8}
              >
                <CategoryIcon category={cat.key} size={44} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.optionLabel, { color: colors.foreground }]}>{cat.label}</Text>
                  <Text style={[styles.optionDesc, { color: colors.mutedForeground }]}>{cat.desc}</Text>
                </View>
                {category === cat.key && <Feather name="check-circle" size={22} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step 2: Description */}
        {step === 2 && (
          <View style={styles.stepBody}>
            <Text style={[styles.stepHint, { color: colors.mutedForeground }]}>
              Give the technician enough detail to come prepared with the right tools
            </Text>
            <TextInput
              style={[
                styles.textArea,
                { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border },
              ]}
              placeholder="e.g. There's a leaking pipe under the kitchen sink — water is pooling in the cabinet. It started this morning..."
              placeholderTextColor={colors.mutedForeground}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              autoFocus
            />
            <Text
              style={[
                styles.charHint,
                { color: description.length < 10 ? colors.warning : colors.mutedForeground },
              ]}
            >
              {description.length < 10 ? `${10 - description.length} more characters needed` : `${description.length} characters — good detail`}
            </Text>
          </View>
        )}

        {/* Step 3: Address + Urgency */}
        {step === 3 && (
          <View style={styles.stepBody}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Address</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border },
              ]}
              placeholder="Street address, City"
              placeholderTextColor={colors.mutedForeground}
              value={address}
              onChangeText={setAddress}
              autoFocus
              returnKeyType="next"
            />

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground, marginTop: 20 }]}>How urgent?</Text>
            {URGENCY_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: urgency === opt.key ? colors.secondary : colors.card,
                    borderColor: urgency === opt.key ? colors.primary : colors.border,
                    borderWidth: urgency === opt.key ? 2 : 1,
                  },
                ]}
                onPress={() => setUrgency(opt.key)}
                activeOpacity={0.8}
              >
                <Feather
                  name={opt.icon as any}
                  size={22}
                  color={urgency === opt.key ? colors.primary : colors.mutedForeground}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.optionLabel, { color: colors.foreground }]}>{opt.label}</Text>
                  <Text style={[styles.optionDesc, { color: colors.mutedForeground }]}>{opt.desc}</Text>
                </View>
                {urgency === opt.key && <Feather name="check-circle" size={20} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step 4: Review */}
        {step === 4 && category && (
          <View style={styles.stepBody}>
            <Text style={[styles.stepHint, { color: colors.mutedForeground }]}>
              Confirm your job details before posting to nearby technicians
            </Text>

            <View style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ReviewRow icon="tool" label="Category" value={CATEGORIES.find(c => c.key === category)?.label ?? ''} colors={colors} />
              <View style={[styles.sep, { backgroundColor: colors.border }]} />
              <ReviewRow icon="file-text" label="Description" value={description} colors={colors} />
              <View style={[styles.sep, { backgroundColor: colors.border }]} />
              <ReviewRow icon="map-pin" label="Address" value={address} colors={colors} />
              <View style={[styles.sep, { backgroundColor: colors.border }]} />
              <ReviewRow icon="clock" label="Urgency" value={urgency === 'today' ? 'Today' : 'This week'} colors={colors} />
              <View style={[styles.sep, { backgroundColor: colors.border }]} />
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: colors.mutedForeground }]}>Estimated cost</Text>
                <Text style={[styles.priceValue, { color: colors.primary }]}>${PRICE_MAP[category]}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.postBtn, { backgroundColor: colors.primary }]}
              onPress={handlePost}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Feather name="send" size={18} color="#fff" />
                  <Text style={styles.postBtnText}>Post Job</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Next button */}
      {step < 4 && (
        <View style={[styles.bottomBar, { paddingBottom: bottomPad + 8, borderTopColor: colors.border, backgroundColor: colors.background }]}>
          <TouchableOpacity
            style={[
              styles.nextBtn,
              { backgroundColor: canProceed() ? colors.primary : colors.muted },
            ]}
            onPress={handleNext}
            disabled={!canProceed()}
            activeOpacity={0.85}
          >
            <Text style={[styles.nextBtnText, { color: canProceed() ? '#fff' : colors.mutedForeground }]}>
              Continue
            </Text>
            <Feather name="arrow-right" size={18} color={canProceed() ? '#fff' : colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function ReviewRow({ icon, label, value, colors }: { icon: any; label: string; value: string; colors: any }) {
  return (
    <View style={styles.reviewRow}>
      <Feather name={icon} size={15} color={colors.mutedForeground} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.reviewLabel, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[styles.reviewValue, { color: colors.foreground }]} numberOfLines={3}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  navBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  stepCount: { fontSize: 14, fontFamily: 'Inter_500Medium', width: 40, textAlign: 'right' },
  progressTrack: { height: 3 },
  progressFill: { height: 3 },
  body: { padding: 20 },
  stepBody: { gap: 12 },
  stepHint: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20, marginBottom: 4 },
  optionCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14, gap: 14 },
  optionLabel: { fontSize: 16, fontFamily: 'Inter_600SemiBold', marginBottom: 3 },
  optionDesc: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  textArea: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 14,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    minHeight: 150,
    lineHeight: 22,
  },
  charHint: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  fieldLabel: { fontSize: 12, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.5, marginBottom: 8 },
  input: { height: 52, borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 16, fontSize: 16, fontFamily: 'Inter_400Regular' },
  reviewCard: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 14 },
  reviewRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  reviewLabel: { fontSize: 11, fontFamily: 'Inter_500Medium', letterSpacing: 0.3, marginBottom: 3 },
  reviewValue: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  sep: { height: 1 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  priceValue: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  postBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 14,
    gap: 10,
    marginTop: 8,
  },
  postBtnText: { fontSize: 17, fontFamily: 'Inter_600SemiBold', color: '#fff' },
  bottomBar: { paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1 },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 14,
    gap: 8,
  },
  nextBtnText: { fontSize: 17, fontFamily: 'Inter_600SemiBold' },
});
