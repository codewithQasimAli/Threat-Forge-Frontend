// src/screens/UpdateDevice.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
} from 'react-native';
import { useUser } from '../context/UserContext';


// Simple chips for selecting an option
const Chip = ({ label, selected, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.chip,
      selected ? { backgroundColor: "#1976D2" } : { backgroundColor: '#edf4ff' },
    ]}
  >
    <Text style={[styles.chipText, selected && { color: '#fff', fontWeight: '700' }]}>{label}</Text>
  </TouchableOpacity>
);

export default function UpdateDevice({ route, navigation }) {
  const { id } = route.params || {};
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // form fields
  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState('Camera'); // default choice
  const [ipAddress, setIpAddress] = useState('');
  const [macAddress, setMacAddress] = useState('');
  const [status, setStatus] = useState('active'); // 'active' | 'inactive'

  const deviceTypeChoices = ['Camera', 'Light', 'Router','Baby Monitor'];

  const loadDevice = useCallback(async () => {
    try {
      const res = await fetch(`http://10.0.2.2:8000/device/${id}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || 'Failed to fetch device');

      // normalize fields
      setDeviceName(data.device_name ?? data.name ?? '');
      setDeviceType(data.device_type ?? 'Camera');
      setIpAddress(data.ip_address ?? data.ip ?? '');
      setMacAddress(data.mac_address ?? data.mac ?? '');
      setStatus(data.status ?? (data.active ? 'active' : 'inactive'));
    } catch (e) {
      console.error('Load device error:', e);
      Alert.alert('Error', 'Could not load device.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [id, navigation]);

  useEffect(() => {
    loadDevice();
  }, [loadDevice]);

  const onSave = async () => {
    if (!deviceName || !ipAddress || !macAddress ||!status||!deviceType ) {
      Alert.alert('Missing fields', 'All fields are required');
      return;
    }
    try {
      setSaving(true);
      const payload = {
        device_name: deviceName,
        device_type: deviceType,
        ip_address: ipAddress,
        mac_address: macAddress,
        status,
        user_id: user.id, // from context
      };

      const res = await fetch(`http://10.0.2.2:8000/device/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        Alert.alert('Update failed', data?.detail || 'Please try again.');
        return;
      }

      Alert.alert('Success', 'Device updated successfully.', [
        { text: 'OK', onPress: () => navigation.navigate('Main', { screen: 'Devices' }) },
      ]);
    } catch (e) {
      console.error('Update device error:', e);
      Alert.alert('Network error', 'Could not reach the server.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.screen, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={"#1976D2"} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.heading}>Update Device</Text>

      <Text style={styles.label}>Device Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Device Name"
        value={deviceName}
        onChangeText={setDeviceName}
      />

      <Text style={styles.label}>Device Type</Text>
      <View style={styles.chipsRow}>
        {deviceTypeChoices.map(t => (
          <Chip key={t} label={t} selected={deviceType === t} onPress={() => setDeviceType(t)} />
        ))}
      </View>

      <Text style={styles.label}>IP Address</Text>
      <TextInput
        style={styles.input}
        placeholder="192.168.1.1"
        value={ipAddress}
        onChangeText={setIpAddress}
        keyboardType="numbers-and-punctuation"
        autoCapitalize="none"
      />

      <Text style={styles.label}>MAC Address</Text>
      <TextInput
        style={styles.input}
        placeholder="00:1A:2B:3C:4D:5E"
        value={macAddress}
        onChangeText={setMacAddress}
        autoCapitalize="characters"
      />

      <Text style={styles.label}>Status</Text>
      <View style={styles.chipsRow}>
        <Chip label="Active" selected={status === 'active'} onPress={() => setStatus('active')} />
        <Chip label="Inactive" selected={status === 'inactive'} onPress={() => setStatus('inactive')} />
      </View>

      <TouchableOpacity
        style={[styles.button, saving && { opacity: 0.7 }]}
        onPress={onSave}
        disabled={saving}
      >
        {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.buttonText}>Save Changes</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#e6f0fb' },
  heading: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  label: { fontSize: 13, color: '#444', marginTop: 10, marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d2d6dc',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },
  chipText: { color: "#1976D2" },
  button: {
    marginTop: 20,
    backgroundColor: "#1976D2",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
