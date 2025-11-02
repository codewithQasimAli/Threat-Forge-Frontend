import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { useUser } from '../context/UserContext';


const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUserData, user } = useUser();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter email and password.');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch('http://10.0.2.2:8000/signin', {
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

      // Store user data in context
      setUserData(data.user);



      Alert.alert('Success', 'Logged in successfully.', [
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
    <View style={styles.container}>
      <Text style={styles.heading}>Log in</Text>

      <TextInput
        style={styles.input}
        placeholder="Email Address"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Text
        style={{
          fontSize: 14,
          textAlign: 'right',
          color: '#1976D2',
          fontWeight: '500',
          width: '100%',
          marginBottom: 8,
        }}
        onPress={() => navigation.navigate('ForgetPassword')}
      >Forget Password</Text>
      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.link}>
          Don't have an account? <Text style={styles.loginText}>Sign Up</Text>
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
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 20,
    backgroundColor: '#e6f0fb',
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 25,
  },
  input: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 12,
  },
  link: {
    color: '#555',
    marginBottom: 15,
  },
  loginText: {
    color: '#1976D2',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#1976D2',
    paddingVertical: 12,
    borderRadius: 6,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
});
