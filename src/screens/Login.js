import React, { useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import messaging from '@react-native-firebase/messaging';
import { useUser } from '../context/UserContext';
import { API_BASE_URL } from '../config/api';  // ← ADDED THIS

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUserData } = useUser();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter email and password.');
      return;
    }
    try {
      setLoading(true);

      // ← CHANGED THIS LINE
      const res = await fetch(`${API_BASE_URL}/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));
      console.log('Signin response:', res.status, data);

      if (!res.ok) {
        Alert.alert('Login failed', data?.detail || 'Invalid credentials.');
        return;
      }

      setUserData(data.user);
      try {
        const fcmToken = await messaging().getToken();
        await fetch(`${API_BASE_URL}/fcm-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: data.user.id, fcm_token: fcmToken }),
        });
      } catch (e) {
        console.log('FCM token registration failed:', e);
      }
      Alert.alert('Success', 'Logged in successfully. ', [
        { text: 'OK', onPress: () => navigation.replace('Main') },
      ]);
    } catch (e) {
      console.error('Signin error:', e);
      Alert.alert('Network error', 'Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      {/* Top logo (same as Sign up) */}
      <Image
        source={require('../../assets/threatforge_logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Narrow, centered form */}
      <View style={styles.form}>
        <Text style={styles.title}>Log in</Text>

        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        {/* Password with eye toggle */}
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!passwordVisible}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setPasswordVisible(v => !v)}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Ionicons
              name={passwordVisible ? 'eye' : 'eye-off'}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>
        </View>

        <Text
          style={styles.forgot}
          onPress={() => navigation.navigate('ForgetPassword')}
        >
          Forget Password
        </Text>

        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.link}>
            Don't have an account? <Text style={styles.actionText}>Sign Up</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Log in</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 0,
  },
  logo: {
    width: 240,
    height: 140,
    marginBottom: 50,
    marginTop: -180,
  },
  form: {
    width: '86%',
    maxWidth: 360,
    alignSelf: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 23,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: Platform.select({ ios: 12, android: 10 }),
    marginBottom: 10,
    paddingRight: 42, 
    color: '#111827',
  },
  passwordContainer: {
    width: '100%',
    position: 'relative',
    marginBottom: 10,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: Platform.select({ ios: 14, android: 12 }),
  },
  forgot: {
    fontSize: 14,
    textAlign: 'right',
    color: '#0a6981ff',
    fontWeight: '600',
    marginBottom: 10,
  },
  link: {
    color: '#6B7280',
    marginBottom: 12,
  },
  actionText: {
    color: '#0a6981ff',
    fontWeight: '700',
  },
  button: {
    backgroundColor: '#0a6981ff',
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
  },
});