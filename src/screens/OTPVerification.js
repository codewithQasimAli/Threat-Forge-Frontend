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

const OTPVerification = ({ route, navigation }) => {
  const { email, message } = route.params || {};
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailVerify = async () => {
    if (!otp || !/^\d{4,8}$/.test(otp)) {
      Alert.alert('Invalid OTP', 'Please enter the OTP from your email.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('http://10.0.2.2:8000/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        Alert.alert('Verification failed', data?.detail || 'Please try again.');
        return;
      }

      Alert.alert('Verified', 'Email verified successfully. You can now log in.', [
        {
          text: 'OK',
          onPress: () =>
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            }),
        },
      ]);
    } catch (e) {
      console.error('Verify OTP error:', e);
      Alert.alert('Network error', 'Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      {/* Logo */}
      <Image
        source={require('../../assets/threatforge_logo.png')} // adjust path if needed
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Narrow, centered form */}
      <View style={styles.form}>
        <Text style={styles.title}>Verify your email</Text>
        {!!message && <Text style={styles.subtitle}>{message}</Text>}
        {!!email && <Text style={styles.email}>{email}</Text>}

        <TextInput
          style={styles.input}
          placeholder="Enter OTP"
          keyboardType="number-pad"
          value={otp}
          onChangeText={setOtp}
          maxLength={8}
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleEmailVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Verify</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OTPVerification;

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
    alignSelf: 'flex-start',
  },
  email: {
    color: '#0a6981ff',
    marginBottom: 14,
    fontWeight: '600',
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
    letterSpacing: 2,
  },
  button: {
    backgroundColor: '#0a6981ff',
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
