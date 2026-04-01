import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useUser } from '../context/UserContext';

export default function Settings({ navigation }) {
  const { user } = useUser();

  const onLogout = () =>
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => navigation.replace('Login') },
    ]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.cardTop}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('UpdateProfile')}>
          <View style={styles.actionLeft}>
            <View style={[styles.actionIcon, { backgroundColor: '#edf4ff' }]}>
              <Ionicons name="camera" size={20} color="#1976D2" />
            </View>
            <Text style={styles.actionText}>Edit Account Details</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9aa0a6" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('ResetPassword', { email: user.email })}>
          <View style={styles.actionLeft}>
            <View style={[styles.actionIcon, { backgroundColor: '#fff3e0' }]}>
              <Ionicons name="key" size={20} color="#E65100" />
            </View>
            <Text style={styles.actionText}>Change Password</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9aa0a6" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('NotificationSettings')}>
          <View style={styles.actionLeft}>
            <View style={[styles.actionIcon, { backgroundColor: '#e8f5e9' }]}>
              <Ionicons name="notifications" size={20} color="#2E7D32" />
            </View>
            <Text style={styles.actionText}>Notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9aa0a6" />
        </TouchableOpacity>
      </View>

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
    backgroundColor: '#f0f5f5',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  name: { fontSize: 30, fontWeight: '700', color: '#1f2937', textTransform: 'capitalize' },
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
    alignItems: 'center', justifyContent: 'center',
  },
  actionText: { fontSize: 15, color: '#111827', fontWeight: '600' },
  logoutBtn: {
    marginTop: 20,
    backgroundColor: '#D85045',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
