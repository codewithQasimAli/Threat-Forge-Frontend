import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { API_BASE_URL } from '../config/api';  // ← ADDED THIS

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

      // ← CHANGED THIS LINE
      const res = await fetch(`${API_BASE_URL}/forgot-password/verify`, {
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

      navigation.navigate('ResetPassword', { email });
    } catch (e) {
      console.error('Verify reset otp error:', e);
      Alert.alert('Network error', 'Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      {/* Logo on top */}
      <Image
        source={require('../../assets/threatforge_logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.form}>
        <Text style={styles.title}>Enter OTP</Text>
        <Text style={styles.subtitle}>We sent a code to</Text>
        <Text style={styles.email}>{email}</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter OTP"
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
          value={otp}
          onChangeText={setOtp}
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleVerifyOTP}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Verify</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('ForgetPassword')}>
          <Text style={styles.link}>
            Didn't get the code? <Text style={styles.resendText}>Resend</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 0,
  },
  logo: {
    width: 200,
    height: 100,
    marginBottom: 50,
    marginTop: -200,
  },
  form: {
    width: '86%',
    maxWidth: 360,
    alignSelf: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    color: '#444',
    marginBottom: 4,
    textAlign: 'center',
  },
  email: {
    color: '#0a6981ff',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
    color: '#111827'

  },
  button: {
    backgroundColor: '#0a6981ff',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  link: {
    color: '#6B7280',
    marginTop: 15,
    textAlign: 'center',
  },
  resendText: {
    color: '#0a6981ff',
    fontWeight: '700',
  },
});