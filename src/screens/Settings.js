// src/screens/Settings.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useUser } from '../context/UserContext';


export default function Settings({ navigation }) {
  const { user } = useUser();
  const [notifLoading, setNotifLoading] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [notifSaved, setNotifSaved] = useState(false);

  const saveNotificationPrefs = async (key, value) => {
    setNotifLoading(true);
    setNotifSaved(false);
    try {
      const userId = user?.id || user?.user_id;
      await fetch(`http://192.168.137.1:8000/notifications/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          push_enabled: key === 'push' ? value : pushEnabled,
          sound_enabled: key === 'sound' ? value : soundEnabled,
          vibration_enabled: key === 'vibration' ? value : vibrationEnabled,
        }),
      });
      setNotifSaved(true);
      setTimeout(() => setNotifSaved(false), 2000);
    } catch (e) {
      console.log('Notification prefs save error:', e);
    } finally {
      setNotifLoading(false);
    }
  };

  const onLogout = () =>
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => navigation.replace('Login') },
    ]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.cardTop}>
        {/* <View style={styles.avatarWrap}>
          {user.photo ? (
            <Image source={{ uri: user.photo }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={48} color="#9db7e6" />
            </View>
          )}
        </View> */}
{/* 
        <TouchableOpacity style={styles.editPhotoBtn} onPress={onEditPhoto}>
          <Text style={styles.editPhotoText}>Edit Photo</Text>
        </TouchableOpacity> */}

        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionItem} onPress={()=>navigation.navigate('UpdateProfile')}>
          <View style={styles.actionLeft}>
            <View style={styles.actionIcon}>
              <Ionicons name="camera" size={20} color={"#1976D2"} />
            </View>
            <Text style={styles.actionText}>Edit Account Details</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9aa0a6" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} onPress={()=>navigation.navigate('ResetPassword', {email:user.email})}>
          <View style={styles.actionLeft}>
            <View style={styles.actionIcon}>
              <Ionicons name="key" size={20} color={"#1976D2"} />
            </View>
            <Text style={styles.actionText}>Change Password</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9aa0a6" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.card}>
          <View style={styles.notifRow}>
            <View style={styles.notifLeft}>
              <Text style={styles.notifLabel}>Push Alerts</Text>
              <Text style={styles.notifSub}>Receive alerts when anomalies detected</Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={(v) => { setPushEnabled(v); saveNotificationPrefs('push', v); }}
              trackColor={{ false: '#ccc', true: '#1d8ca9' }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.notifRow}>
            <View style={styles.notifLeft}>
              <Text style={styles.notifLabel}>Sound</Text>
              <Text style={styles.notifSub}>Play sound for new alerts</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={(v) => { setSoundEnabled(v); saveNotificationPrefs('sound', v); }}
              trackColor={{ false: '#ccc', true: '#1d8ca9' }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.notifRow}>
            <View style={styles.notifLeft}>
              <Text style={styles.notifLabel}>Vibration</Text>
              <Text style={styles.notifSub}>Vibrate on new alerts</Text>
            </View>
            <Switch
              value={vibrationEnabled}
              onValueChange={(v) => { setVibrationEnabled(v); saveNotificationPrefs('vibration', v); }}
              trackColor={{ false: '#ccc', true: '#1d8ca9' }}
              thumbColor="#fff"
            />
          </View>
          {notifLoading && (
            <View style={styles.notifStatus}>
              <ActivityIndicator size="small" color="#1d8ca9" />
              <Text style={styles.notifStatusText}>Saving...</Text>
            </View>
          )}
          {notifSaved && (
            <View style={styles.notifStatus}>
              <Text style={styles.notifStatusText}>✓ Preferences saved</Text>
            </View>
          )}
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 16, paddingBottom: 32 },
  cardTop: {
    backgroundColor: '#f0f5f5ff',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarWrap: { marginBottom: 12 },
  avatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#fff' },
  avatarPlaceholder: {
    borderWidth: 3,
    borderColor: '#d6e3ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editPhotoBtn: {
    backgroundColor: "#1976D2",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  editPhotoText: { color: '#fff', fontWeight: '600' },
  name: { fontSize: 30, fontWeight: '700', color: '#1f2937', marginTop: 2,textTransform:'capitalize' },
  email: { fontSize: 20, color: '#65758b', marginTop: 1 },

  actions: { gap: 12, marginTop: 6 },
  actionItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  actionLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  actionIcon: {
    width: 34, height: 34, borderRadius: 8,
    backgroundColor: '#edf4ff',
    alignItems: 'center', justifyContent: 'center',
  },
  actionText: { fontSize: 15, color: '#111827', fontWeight: '600' },

  section: { marginHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginLeft: 4 },
  card: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  notifRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  notifLeft: { flex: 1, marginRight: 12 },
  notifLabel: { fontSize: 15, color: '#333', fontWeight: '500' },
  notifSub: { fontSize: 12, color: '#999', marginTop: 2 },
  divider: { height: 0.5, backgroundColor: '#eee', marginHorizontal: 16 },
  notifStatus: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, gap: 6 },
  notifStatusText: { fontSize: 13, color: '#1d8ca9' },

  logoutBtn: {
    marginTop: 20,
    backgroundColor: '#D85045',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
