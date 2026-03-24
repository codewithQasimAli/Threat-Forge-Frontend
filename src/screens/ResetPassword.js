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
import Ionicons from 'react-native-vector-icons/Ionicons';
import { API_BASE_URL } from '../config/api';  // ← ADDED THIS

export default function ResetPassword({ route, navigation }) {
  const { email } = route.params ?? '';
  const [pwd, setPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordOk = p =>
    /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(p);

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

      // ← CHANGED THIS LINE
      const res = await fetch(`${API_BASE_URL}/forgot-password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, new_password: pwd }),
      });
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
    <View style={styles.screen}>
      <View style={styles.form}>
        <Text style={styles.heading}>Reset Password</Text>
        <Text style={styles.emailHint}>{email}</Text>

        {/* New Password */}
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="New Password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showPwd}
            value={pwd}
            onChangeText={setPwd}
          />
          <TouchableOpacity
            onPress={() => setShowPwd(!showPwd)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPwd ? 'eye' : 'eye-off'}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>
        </View>

        {/* Confirm Password */}
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="Confirm New Password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showConfirm}
            value={confirm}
            onChangeText={setConfirm}
          />
          <TouchableOpacity
            onPress={() => setShowConfirm(!showConfirm)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showConfirm ? 'eye' : 'eye-off'}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>• 8+ chars • 1 uppercase • 1 number • 1 special</Text>

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={onSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Reset Password</Text>
          )}
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
    marginBottom: 200,
  },
  form: {
    width: '86%',
    maxWidth: 360,
    alignSelf: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emailHint: {
    color: '#0a6981ff',
    marginBottom: 16,
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
    marginBottom: 12,
  },
  input: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#111827'

  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 14,
  },
  hint: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
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