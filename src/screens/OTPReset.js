import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';

export default function OTPReset({ route, navigation }) {
    const { email } = route.params || {};
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVerifyOTP = async () => {
        if (!otp) {
            Alert.alert('Missing OTP', 'Please enter the OTP sent to your email.');
            return;
        }
        try {
            setLoading(true);
            const res = await fetch('http://10.0.2.2:8000/forgot-password/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });
            const data = await res.json().catch(() => ({}));
            console.log('Verify Reset OTP:', res.status, data);

            if (!res.ok) {
                Alert.alert('Verification failed', data?.detail || 'Please try again.');
                return;
            }

            // success → go to Reset Password screen
            navigation.navigate('ResetPassword', { email });
        } catch (e) {
            console.error('Verify reset otp error:', e);
            Alert.alert('Network error', 'Could not reach the server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Enter OTP</Text>
            <Text style={styles.subtitle}>We sent a code to</Text>
            <Text style={styles.email}>{email}</Text>

            <TextInput
                style={styles.input}
                placeholder="OTP"
                keyboardType="number-pad"
                value={otp}
                onChangeText={setOtp}
            />

            <TouchableOpacity style={[styles.button, loading && { opacity: 0.7 }]} onPress={handleVerifyOTP} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.buttonText}>Verify</Text>}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'flex-start',backgroundColor:"#e6f0fb" },
    title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
    subtitle: { color: '#444', marginBottom: 2 },
    email: { color: '#1976D2', marginBottom: 16 },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 14, marginBottom: 12,backgroundColor:"white" },
    button: { backgroundColor: '#1976D2', borderRadius: 6, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
    buttonText: { color: '#fff', textAlign: 'center', fontWeight: '600' }
});
