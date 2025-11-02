import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { useUser } from '../context/UserContext';

export default function ResetPassword({ route, navigation }) {
  const { email } = route.params ?? '';
  const [pwd, setPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordOk = p => /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(p);

  const onSubmit = async () => {
    if (!pwd || !confirm) {
      Alert.alert('Missing fields', 'Please enter and confirm your new password.');
      return;
    }
    if (!passwordOk(pwd)) {
      Alert.alert(
        'Weak password',
        'Password must be at least 8 characters and include 1 uppercase letter, 1 number, and 1 special character.'
      );
      return;
    }
    if (pwd !== confirm) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('http://10.0.2.2:8000/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, new_password: pwd }),
      });
      console.log(email, pwd)
      const data = await res.json().catch(() => ({}));
      console.log('Reset password:', res.status, data);

      if (!res.ok) {
        Alert.alert('Reset failed', data?.detail || 'Please try again.');
        return;
      }

      Alert.alert('Success', 'Password reset successfully. Please log in.', [
        { text: 'OK', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }) },
      ]);
    } catch (e) {
      console.error('Reset password error:', e);
      Alert.alert('Network error', 'Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Reset Password</Text>
      <Text style={styles.emailHint}>{email}</Text>

      <TextInput
        style={styles.input}
        placeholder="New Password"
        secureTextEntry
        value={pwd}
        onChangeText={setPwd}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm New Password"
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
      />

      <Text style={styles.hint}>
        • 8+ chars • 1 uppercase • 1 number • 1 special
      </Text>

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={onSubmit}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.buttonText}>Reset Password</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#e6f0fb' },
  heading: { fontSize: 26, fontWeight: '700', marginBottom: 8 },
  emailHint: { color: '#1976D2', marginBottom: 16 },
  input: {
    width: '100%', backgroundColor: '#fff', borderRadius: 6,
    borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 12,
  },
  hint: { fontSize: 12, color: '#6b7280', marginBottom: 12 },
  button: {
    backgroundColor: '#1976D2', paddingVertical: 12, borderRadius: 6,
    width: '100%', alignItems: 'center', justifyContent: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
