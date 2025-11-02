import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';

const ForgetPassword = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgetPassword = async () => {
    if (!email) {
      Alert.alert('Missing email', 'Please enter your email address.');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch('http://10.0.2.2:8000/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));
      console.log('Forgot Password:', res.status, data);

      if (!res.ok) {
        Alert.alert('Request failed', data?.detail || 'Please try again.');
        return;
      }

      // Success: tell user and go to OTP input screen
      Alert.alert('OTP sent', 'Check your email for the OTP to reset your password.', [
        { text: 'OK', onPress: () => navigation.navigate('OTPReset', { email }) },
      ]);
    } catch (e) {
      console.error('Forgot password error:', e);
      Alert.alert('Network error', 'Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Forget Password</Text>

      <TextInput
        style={styles.input}
        placeholder="Email Address"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleForgetPassword}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.buttonText}>Submit</Text>}
      </TouchableOpacity>
    </View>
  );
};

export default ForgetPassword;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-start', alignItems: 'flex-start', padding: 20, backgroundColor: '#e6f0fb' },
  heading: { fontSize: 26, fontWeight: '700', marginBottom: 25 },
  input: { width: '100%', backgroundColor: 'white', borderRadius: 6, borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 12 },
  button: { backgroundColor: '#1976D2', paddingVertical: 12, borderRadius: 6, width: '100%', alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 16, textAlign: 'center', fontWeight: '600' },
});
