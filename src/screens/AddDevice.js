// src/screens/AddDevice.js
import React, { useState } from 'react';
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

const Chip = ({ label, selected, onPress }) => (
    <TouchableOpacity
        onPress={onPress}
        style={[
            styles.chip,
            selected ? { backgroundColor: "#0a6981ff" } : { backgroundColor: '#edf4ff' },
        ]}
    >
        <Text style={[styles.chipText, selected && { color: '#fff', fontWeight: '700' }]}>
            {label}
        </Text>
    </TouchableOpacity>
);

export default function AddDevice({ navigation }) {
    const { user } = useUser();

    const [deviceName, setDeviceName] = useState('');
    const [deviceType, setDeviceType] = useState('Camera');
    const [ipAddress, setIpAddress] = useState('');
    const [macAddress, setMacAddress] = useState('');
    const [status, setStatus] = useState('active');
    const [saving, setSaving] = useState(false);

    const deviceTypeChoices = ['Camera', 'Sensor', 'Light', 'Router', 'Baby Monitor'];

    const validate = () => {
        if (!deviceName || !ipAddress || !macAddress) {
            Alert.alert('Missing fields', 'Device name, IP address, and MAC address are required.');
            return false;
        }
        // very light IP check (optional)
        const ipOk = /^(\d{1,3}\.){3}\d{1,3}$/.test(ipAddress);
        if (!ipOk) {
            Alert.alert('Invalid IP', 'Please enter a valid IPv4 address.');
            return false;
        }
        // light MAC check (optional)
        const macOk = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/.test(macAddress);
        if (!macOk) {
            Alert.alert('Invalid MAC', 'Format must be 00:1A:2B:3C:4D:5E');
            return false;
        }
        return true;
    };

    const onSave = async () => {
        if (!validate()) return;
        try {
            setSaving(true);
            const payload = {
                device_name: deviceName,
                device_type: deviceType,
                ip_address: ipAddress,
                mac_address: macAddress.toUpperCase(),
                status,
                user_id: user.id,
            };

            const res = await fetch(`http://10.0.2.2:8000/device`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                Alert.alert('Create failed', data?.detail || 'Please try again.');
                return;
            }

            Alert.alert('Success', 'Device added successfully.', [
                { text: 'OK', onPress: () => navigation.navigate('Main', { screen: 'Devices' }) },
            ]);
        } catch (e) {
            console.error('Add device error:', e);
            Alert.alert('Network error', 'Could not reach the server.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16 }}>
            <Text style={styles.heading}>Add New Device</Text>

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
                placeholder="192.168.0.0"
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
                {saving ? (
                    <ActivityIndicator color="#fff" size="small" />
                ) : (
                    <Text style={styles.buttonText}>Add Device</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#FFFFFF' },
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
    chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18 },
    chipText: { color: "#1976D2" },
    button: {
        marginTop: 20,
        backgroundColor: "#0a6981ff",
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
