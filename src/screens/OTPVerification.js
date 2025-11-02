import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';

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
      console.log('Verify OTP:', res.status, data);

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
    <View style={styles.container}>
      <Text style={styles.title}>Verify your email</Text>
      <Text style={styles.subtitle}>{message || 'Check your email for the OTP.'}</Text>
      <Text style={styles.email}>{email}</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        keyboardType="number-pad"
        value={otp}
        onChangeText={setOtp}
      />

      <TouchableOpacity style={[styles.button, loading && { opacity: 0.7 }]} onPress={handleEmailVerify} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buttonText}>Verify</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default OTPVerification;

const styles = StyleSheet.create({
  container:{ flex:1, padding:20, justifyContent:'center',backgroundColor:"#e6f0fb" },
  title:{ fontSize:22, fontWeight:'700', marginBottom:8, textAlign:'center' },
  subtitle:{ color:'#444', marginBottom:6, textAlign:'center' },
  email:{ color:'#1976D2', marginBottom:16, textAlign:'center' },
  input:{ borderWidth:1, borderColor:'#ccc', borderRadius:6, padding:12, marginBottom:12,backgroundColor:"white" },
  button:{
    backgroundColor:'#1976D2',
    borderRadius:6,
    paddingVertical:12,
    alignItems:'center',
    justifyContent:'center',
  },
  buttonText:{ color:'#fff', textAlign:'center', fontWeight:'600' },
});
