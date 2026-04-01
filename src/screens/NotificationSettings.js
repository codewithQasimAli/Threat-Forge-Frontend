import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Switch, ActivityIndicator, ScrollView,
} from 'react-native';
import { useUser } from '../context/UserContext';

const API_BASE = 'http://192.168.137.1:8000';

export default function NotificationSettings() {
  const { user } = useUser();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const savePrefs = async (key, value) => {
    setSaving(true);
    setSaved(false);
    try {
      const userId = user?.id || user?.user_id;
      await fetch(`${API_BASE}/notifications/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          push_enabled: key === 'push' ? value : pushEnabled,
          sound_enabled: key === 'sound' ? value : soundEnabled,
          vibration_enabled: key === 'vibration' ? value : vibrationEnabled,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.log('Notification save error:', e);
    } finally {
      setSaving(false);
    }
  };

  const renderToggle = (label, sub, value, onToggle) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.textWrap}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.sub}>{sub}</Text>
        </View>
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#ccc', true: '#1d8ca9' }}
          thumbColor="#fff"
        />
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Notifications</Text>

      {renderToggle('Push Alerts', 'Receive alerts when anomalies detected', pushEnabled, (v) => { setPushEnabled(v); savePrefs('push', v); })}
      {renderToggle('Sound', 'Play sound for new alerts', soundEnabled, (v) => { setSoundEnabled(v); savePrefs('sound', v); })}
      {renderToggle('Vibration', 'Vibrate on new alerts', vibrationEnabled, (v) => { setVibrationEnabled(v); savePrefs('vibration', v); })}

      {saving && (
        <View style={styles.status}>
          <ActivityIndicator size="small" color="#1d8ca9" />
          <Text style={styles.statusText}>Saving...</Text>
        </View>
      )}
      {saved && (
        <View style={styles.status}>
          <Text style={styles.statusText}>✓ Preferences saved</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { flexGrow: 1, padding: 16, paddingBottom: 32 },
  title: { fontSize: 24, fontWeight: '700', color: '#1f2937', textAlign:'center', marginBottom: 24, marginTop: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  textWrap: { flex: 1, marginRight: 12 },
  label: { fontSize: 15, color: '#333', fontWeight: '600' },
  sub: { fontSize: 12, color: '#999', marginTop: 3 },
  status: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, gap: 6 },
  statusText: { fontSize: 13, color: '#1d8ca9' },
});
