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
  ScrollView,
} from 'react-native';
import { useUser } from '../context/UserContext';
import { API_BASE_URL } from '../config/api';

const Chip = ({ label, selected, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.chip,
      selected ? { backgroundColor: "#0a6981ff" } : { backgroundColor: '#edf4ff' },
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

  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState('Camera');
  const [ipAddress, setIpAddress] = useState('');
  const [macAddress, setMacAddress] = useState('');
  const [status, setStatus] = useState('active');

  //  Store original values to detect changes
  const [originalIP, setOriginalIP] = useState('');
  const [originalMAC, setOriginalMAC] = useState('');

  const deviceTypeChoices = ['Camera', 'Sensor', 'Light', 'Router', 'Baby Monitor'];

  const loadDevice = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/device/${id}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || 'Failed to fetch device');

      // Set all fields
      setDeviceName(data.device_name ?? data.name ?? '');
      setDeviceType(data.device_type ?? 'Camera');
      setIpAddress(data.ip_address ?? data.ip ?? '');
      setMacAddress(data.mac_address ?? data.mac ?? '');
      setStatus(data.status ?? (data.active ? 'active' : 'inactive'));

      // Store original IP and MAC for duplicate checking
      setOriginalIP(data.ip_address ?? '');
      setOriginalMAC((data.mac_address ?? '').toUpperCase().replace(/-/g, ':'));
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

  // VALIDATION
  const validate = () => {
    if (!deviceName || !ipAddress || !macAddress) {
      Alert.alert('Missing fields', 'Device name, IP address, and MAC address are required.');
      return false;
    }

    // IP validation with range check
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ipAddress)) {
      Alert.alert('Invalid IP', 'Please enter a valid IPv4 address (e.g., 192.168.1.100)');
      return false;
    }

    // Check IP octets are 0-255
    const octets = ipAddress.split('.').map(Number);
    if (octets.some(octet => octet < 0 || octet > 255)) {
      Alert.alert('Invalid IP', 'IP address octets must be between 0 and 255');
      return false;
    }

    // Reject invalid/reserved IPs
    const invalidIPs = ['0.0.0.0', '255.255.255.255'];
    if (invalidIPs.includes(ipAddress)) {
      Alert.alert('Invalid IP', 'This IP address cannot be used for devices');
      return false;
    }

    // MAC validation
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$/;
    if (!macRegex.test(macAddress)) {
      Alert.alert('Invalid MAC', 'Format must be AA:BB:CC:DD:EE:FF or AA-BB-CC-DD-EE-FF');
      return false;
    }

    return true;
  };

  //  CHECK FOR DUPLICATES (excluding current device)
  const checkDuplicates = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/devices/user/${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch devices');

      const existingDevices = await res.json();

      // Normalize new MAC
      const normalizedNewMAC = macAddress.toUpperCase().replace(/-/g, ':');

      //  Check duplicate IP (only if IP changed and not checking against self)
      if (ipAddress !== originalIP) {
        const duplicateIP = existingDevices.find(d => d.id !== id && d.ip_address === ipAddress);
        if (duplicateIP) {
          Alert.alert(
            'Duplicate IP Address',
            `Device "${duplicateIP.device_name}" already uses IP address ${ipAddress}.\n\nEach device must have a unique IP address.`
          );
          return false;
        }
      }

      //  Check duplicate MAC (only if MAC changed and not checking against self)
      if (normalizedNewMAC !== originalMAC) {
        const duplicateMAC = existingDevices.find(d => {
          if (d.id === id) return false; // Skip current device
          const existingMAC = d.mac_address.toUpperCase().replace(/-/g, ':');
          return existingMAC === normalizedNewMAC;
        });

        if (duplicateMAC) {
          Alert.alert(
            'Duplicate MAC Address',
            `Device "${duplicateMAC.device_name}" already uses MAC address ${macAddress}.\n\nEach device must have a unique MAC address.`
          );
          return false;
        }
      }

      return true; // No duplicates
    } catch (e) {
      console.error('Duplicate check error:', e);
      Alert.alert('Error', 'Could not validate device. Please check your connection and try again.');
      return false;
    }
  };

  const onSave = async () => {
    // Validate format
    if (!validate()) return;

    setSaving(true);

    try {
      // Check for duplicates
      const noDuplicates = await checkDuplicates();
      if (!noDuplicates) {
        setSaving(false);
        return;
      }

      // Update device
      const payload = {
        device_name: deviceName,
        device_type: deviceType,
        ip_address: ipAddress,
        mac_address: macAddress.toUpperCase().replace(/-/g, ':'),
        status,
        user_id: user.id,
      };

      const res = await fetch(`${API_BASE_URL}/device/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // ✅ FIX: Explicit String() conversion
        const errorMessage = data?.detail || 'Please try again.';
        Alert.alert('Update failed', String(errorMessage));
        setSaving(false);
        return;
      }

      // ✅ FIX: Proper state management
      Alert.alert(
        'Success', 
        'Device updated successfully.', 
        [
          { 
            text: 'OK', 
            onPress: () => {
              setSaving(false);
              navigation.navigate('Main', { screen: 'Devices' });
            }
          }
        ]
      );
    } catch (e) {
      console.error('Update device error:', e);
      Alert.alert('Network error', 'Could not reach the server.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.screen, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={"#0a6981ff"} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.heading}>Update Device</Text>

      <Text style={styles.label}>Device Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="Device Name"
        placeholderTextColor="#9CA3AF"
        value={deviceName}
        onChangeText={setDeviceName}
      />

      <Text style={styles.label}>Device Type *</Text>
      <View style={styles.chipsRow}>
        {deviceTypeChoices.map(t => (
          <Chip key={t} label={t} selected={deviceType === t} onPress={() => setDeviceType(t)} />
        ))}
      </View>

      <Text style={styles.label}>IP Address *</Text>
      <TextInput
        style={styles.input}
        placeholder="192.168.1.100"
        placeholderTextColor="#9CA3AF"
        value={ipAddress}
        onChangeText={setIpAddress}
        keyboardType="numbers-and-punctuation"
        autoCapitalize="none"
      />

      <Text style={styles.label}>MAC Address *</Text>
      <TextInput
        style={styles.input}
        placeholder="AA:BB:CC:DD:EE:FF"
        placeholderTextColor="#9CA3AF"
        value={macAddress}
        onChangeText={(text) => setMacAddress(text.toUpperCase())}
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
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  heading: { fontSize: 22, fontWeight: '700', marginBottom: 16, color: '#111827' },
  label: { fontSize: 13, color: '#444', marginTop: 10, marginBottom: 6, fontWeight: '600' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d2d6dc',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#111827',
    fontSize: 15,
  },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },
  chipText: { color: "#0a6981ff", fontSize: 14 },
  button: {
    marginTop: 20,
    backgroundColor: "#0a6981ff",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});