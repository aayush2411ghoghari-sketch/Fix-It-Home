import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useApp, type Message } from '@/context/AppContext';
import StatusBadge from '@/components/StatusBadge';
import CategoryIcon from '@/components/CategoryIcon';

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, jobs, acceptJob, declineJob, completeJob, cancelJob, sendMessage, rateJob, getJobMessages } =
    useApp();

  const [msgText, setMsgText] = useState('');
  const [ratingVal, setRatingVal] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [showRating, setShowRating] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const isWeb = Platform.OS === 'web';
  const bottomPad = isWeb ? 34 : insets.bottom;

  const job = jobs.find(j => j.id === id);
  const messages = getJobMessages(id ?? '');
  const isCustomer = user?.role === 'customer';

  if (!job) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Feather name="alert-circle" size={48} color={colors.mutedForeground} />
        <Text style={[styles.notFound, { color: colors.mutedForeground }]}>Job not found</Text>
      </View>
    );
  }

  const showChat = ['accepted', 'in_progress', 'completed'].includes(job.status);

  const handleAccept = async () => {
    setActionLoading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await acceptJob(job.id);
    setActionLoading(false);
  };

  const handleDecline = () => {
    Alert.alert('Decline Job', 'Decline this job request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Decline',
        style: 'destructive',
        onPress: () => {
          declineJob(job.id);
          router.back();
        },
      },
    ]);
  };

  const handleComplete = async () => {
    setActionLoading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await completeJob(job.id);
    setActionLoading(false);
    if (isCustomer) setShowRating(true);
  };

  const handleCancel = () => {
    Alert.alert('Cancel Job', 'Are you sure you want to cancel this job?', [
      { text: 'Keep Job', style: 'cancel' },
      {
        text: 'Cancel Job',
        style: 'destructive',
        onPress: async () => {
          await cancelJob(job.id);
          router.back();
        },
      },
    ]);
  };

  const handleSend = async () => {
    const text = msgText.trim();
    if (!text) return;
    setMsgText('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await sendMessage(job.id, text);
  };

  const handleRate = async () => {
    if (ratingVal === 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await rateJob(job.id, ratingVal, ratingComment);
    setShowRating(false);
  };

  const renderMsg = ({ item }: { item: Message }) => {
    const isMe = item.senderId === user?.id;
    return (
      <View style={[styles.msgWrap, isMe ? styles.msgRight : styles.msgLeft]}>
        {!isMe && (
          <Text style={[styles.msgSender, { color: colors.mutedForeground }]}>{item.senderName}</Text>
        )}
        <View
          style={[
            styles.msgBubble,
            { backgroundColor: isMe ? colors.primary : colors.card, borderColor: isMe ? colors.primary : colors.border },
          ]}
        >
          <Text style={[styles.msgText, { color: isMe ? '#fff' : colors.foreground }]}>{item.text}</Text>
        </View>
        <Text style={[styles.msgTime, { color: colors.mutedForeground }]}>
          {new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  const jobCategoryLabel = job.category.charAt(0).toUpperCase() + job.category.slice(1);

  // Footer = job info + actions (rendered at bottom of inverted list = appears at top)
  const Footer = (
    <View style={{ padding: 20, gap: 14 }}>
      {/* Category + Status + Price */}
      <View style={styles.jobHeader}>
        <CategoryIcon category={job.category} size={48} />
        <View style={{ flex: 1, gap: 6 }}>
          <Text style={[styles.jobTitle, { color: colors.foreground }]}>{jobCategoryLabel} Repair</Text>
          <StatusBadge status={job.status} />
        </View>
        <Text style={[styles.price, { color: colors.primary }]}>${job.priceEstimate}</Text>
      </View>

      {/* Description */}
      <View style={[styles.infoBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.infoBoxLabel, { color: colors.mutedForeground }]}>Description</Text>
        <Text style={[styles.infoBoxText, { color: colors.foreground }]}>{job.description}</Text>
      </View>

      {/* Details */}
      <View style={[styles.infoBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <InfoRow icon="map-pin" value={job.address} colors={colors} />
        <View style={[styles.infoSep, { backgroundColor: colors.border }]} />
        <InfoRow
          icon="clock"
          value={job.urgency === 'today' ? 'Needed today' : 'Needed this week'}
          colors={colors}
        />
        <View style={[styles.infoSep, { backgroundColor: colors.border }]} />
        <InfoRow
          icon="user"
          value={isCustomer ? (job.technicianName ?? 'Awaiting technician...') : job.customerName}
          colors={colors}
        />
      </View>

      {/* Technician actions: posted job */}
      {job.status === 'posted' && !isCustomer && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.declineBtn, { borderColor: colors.destructive }]}
            onPress={handleDecline}
            activeOpacity={0.8}
          >
            <Feather name="x" size={20} color={colors.destructive} />
            <Text style={[styles.declineBtnText, { color: colors.destructive }]}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.acceptBtn, { backgroundColor: colors.primary }]}
            onPress={handleAccept}
            disabled={actionLoading}
            activeOpacity={0.85}
          >
            {actionLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Feather name="check" size={20} color="#fff" />
                <Text style={styles.acceptBtnText}>Accept Job</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Customer: cancel if posted */}
      {job.status === 'posted' && isCustomer && (
        <TouchableOpacity
          style={[styles.outlineBtn, { borderColor: colors.destructive }]}
          onPress={handleCancel}
          activeOpacity={0.8}
        >
          <Text style={[styles.outlineBtnText, { color: colors.destructive }]}>Cancel Job</Text>
        </TouchableOpacity>
      )}

      {/* Technician: mark complete when accepted */}
      {job.status === 'accepted' && !isCustomer && (
        <TouchableOpacity
          style={[styles.fullBtn, { backgroundColor: colors.primary }]}
          onPress={handleComplete}
          disabled={actionLoading}
          activeOpacity={0.85}
        >
          {actionLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather name="check-circle" size={20} color="#fff" />
              <Text style={styles.fullBtnText}>Mark Complete</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {/* Customer: rate + pay when completed */}
      {job.status === 'completed' && isCustomer && !job.rating && !showRating && (
        <TouchableOpacity
          style={[styles.fullBtn, { backgroundColor: colors.primary }]}
          onPress={() => setShowRating(true)}
          activeOpacity={0.85}
        >
          <Feather name="star" size={20} color="#fff" />
          <Text style={styles.fullBtnText}>Rate & Pay ${job.priceEstimate}</Text>
        </TouchableOpacity>
      )}

      {/* Rating form */}
      {showRating && (
        <View style={[styles.ratingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.ratingTitle, { color: colors.foreground }]}>How was the service?</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map(s => (
              <TouchableOpacity key={s} onPress={() => setRatingVal(s)}>
                <Feather name="star" size={38} color={s <= ratingVal ? '#FFB800' : colors.border} />
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={[styles.ratingInput, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
            placeholder="Leave a comment (optional)"
            placeholderTextColor={colors.mutedForeground}
            value={ratingComment}
            onChangeText={setRatingComment}
            multiline
          />
          <TouchableOpacity
            style={[styles.fullBtn, { backgroundColor: ratingVal > 0 ? colors.primary : colors.muted }]}
            onPress={handleRate}
            disabled={ratingVal === 0}
            activeOpacity={0.85}
          >
            <Text style={[styles.fullBtnText, { color: ratingVal > 0 ? '#fff' : colors.mutedForeground }]}>
              Submit & Pay ${job.priceEstimate}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Existing rating */}
      {job.rating && !showRating && (
        <View style={[styles.ratingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.ratingTitle, { color: colors.foreground }]}>Your Rating</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map(s => (
              <Feather key={s} name="star" size={26} color={s <= job.rating! ? '#FFB800' : colors.border} />
            ))}
          </View>
          {job.ratingComment ? (
            <Text style={[styles.infoBoxText, { color: colors.foreground }]}>{job.ratingComment}</Text>
          ) : null}
        </View>
      )}

      {/* Chat label */}
      {showChat && (
        <View style={styles.chatDivider}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.chatLabel, { color: colors.mutedForeground }]}>
            {messages.length === 0 ? 'Start chatting' : `${messages.length} message${messages.length !== 1 ? 's' : ''}`}
          </Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          data={showChat ? [...messages].reverse() : []}
          keyExtractor={item => item.id}
          inverted={showChat && messages.length > 0}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: showChat ? 12 : 24 }}
          renderItem={renderMsg}
          ListFooterComponent={Footer}
        />

        {/* Chat input */}
        {showChat && (
          <View
            style={[
              styles.inputBar,
              { paddingBottom: bottomPad + 6, borderTopColor: colors.border, backgroundColor: colors.background },
            ]}
          >
            <TextInput
              style={[
                styles.msgInput,
                { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border },
              ]}
              placeholder={`Message ${isCustomer ? 'technician' : 'customer'}...`}
              placeholderTextColor={colors.mutedForeground}
              value={msgText}
              onChangeText={setMsgText}
              multiline
              returnKeyType="send"
              blurOnSubmit={false}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              style={[styles.sendBtn, { backgroundColor: msgText.trim() ? colors.primary : colors.muted }]}
              onPress={handleSend}
              disabled={!msgText.trim()}
              activeOpacity={0.85}
            >
              <Feather name="send" size={17} color={msgText.trim() ? '#fff' : colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

function InfoRow({ icon, value, colors }: { icon: any; value: string; colors: any }) {
  return (
    <View style={styles.infoRow}>
      <Feather name={icon} size={15} color={colors.mutedForeground} />
      <Text style={[styles.infoRowText, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFound: { fontSize: 16, fontFamily: 'Inter_400Regular' },
  jobHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  jobTitle: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  price: { fontSize: 26, fontFamily: 'Inter_700Bold' },
  infoBox: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 12 },
  infoBoxLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.5 },
  infoBoxText: { fontSize: 15, fontFamily: 'Inter_400Regular', lineHeight: 22 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoRowText: { fontSize: 14, fontFamily: 'Inter_400Regular', flex: 1 },
  infoSep: { height: 1 },
  actions: { flexDirection: 'row', gap: 12 },
  declineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 8,
  },
  declineBtnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  acceptBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 14,
    gap: 8,
  },
  acceptBtnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#fff' },
  fullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 14,
    gap: 10,
  },
  fullBtnText: { fontSize: 17, fontFamily: 'Inter_600SemiBold', color: '#fff' },
  outlineBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  outlineBtnText: { fontSize: 15, fontFamily: 'Inter_500Medium' },
  ratingCard: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 14 },
  ratingTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  stars: { flexDirection: 'row', gap: 10 },
  ratingInput: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  chatDivider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  dividerLine: { flex: 1, height: 1 },
  chatLabel: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  msgWrap: { paddingHorizontal: 20, paddingVertical: 4 },
  msgLeft: { alignItems: 'flex-start' },
  msgRight: { alignItems: 'flex-end' },
  msgSender: { fontSize: 11, fontFamily: 'Inter_500Medium', marginBottom: 4 },
  msgBubble: { maxWidth: '76%', borderRadius: 18, padding: 12, borderWidth: 1 },
  msgText: { fontSize: 15, fontFamily: 'Inter_400Regular', lineHeight: 21 },
  msgTime: { fontSize: 10, fontFamily: 'Inter_400Regular', marginTop: 4 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  msgInput: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    maxHeight: 100,
  },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
