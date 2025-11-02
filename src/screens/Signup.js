import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import Login from './Login'

const Signup = ({ navigation }) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    console.log('hello')

    const handleSignup = async () => {
        if (!fullName || !email || !password || !confirmPassword) {
            Alert.alert('Missing fields', 'Please fill all fields.');
            return;
        }
        if (!passwordOk(password)) {
            Alert.alert('Weak password', 'Password must be 8+ chars with at least 1 uppercase letter, 1 number, and 1 special character.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Mismatch', 'Passwords do not match.');
            return;
        }
        try {
            setLoading(true);
            console.log(email,password)
            const res = await fetch(`http://10.0.2.2:8000/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: fullName, email, password }),
            });

            const data = await res.json().catch(() => ({}));
            console.log('Signup response:', res.status, data);

            if (!res.ok) {
                Alert.alert('Signup failed', data?.detail || 'Please try again.');
                return;
            }

            // Navigate to OTP with message + email
            navigation.navigate('OTP', {
                email,
                message: 'Check your email for OTP to verify your account.',
            });
        } catch (e) {
            console.error('Signup error:', e);
            Alert.alert('Network error', 'Could not reach the server.');
        } finally {
            setLoading(false);
        }
    }
    const passwordOk = (pwd) => /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(pwd);
    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Sign up</Text>
            <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={fullName}
                onChangeText={setFullName}
            />
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
            <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.link}>
                    Already have an account? <Text style={styles.loginText}>Log In</Text>
                </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleSignup}>
                <Text style={styles.buttonText}>Create Account</Text>
            </TouchableOpacity>
        </View>
    )
}

export default Signup

const styles = StyleSheet.create({
    container: {
        justifyContent: 'start',
        alignItems: 'start',
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
        cursor: 'pointer'
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '600',
    },
});