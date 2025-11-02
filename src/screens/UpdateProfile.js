import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useUser } from '../context/UserContext'; // Import context to get the current user
const UpdateProfile = ({navigation}) => {
    const { user, setUserData } = useUser(); // Access user context
    const [name, setName] = useState(user.name);
    const [phone, setPhone] = useState(user.phone || '');
    const [loading, setLoading] = useState(false);

    // Function to handle profile update
    const handleUpdate = async () => {
        if (!name) {
            Alert.alert('Missing field', 'Please provide name.');
            return;
        }
        try {
            setLoading(true);
            const res = await fetch(`http://10.0.2.2:8000/user/${user.email}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone })
            });
            console.log(name, phone)
            const data = await res.json();
            console.log('Update response:', data);

            if (!res.ok) {
                Alert.alert('Update failed', data?.detail || 'Please try again.');
                return;
            }

            // On success, update user data in context
            setUserData({
                ...user,
                name,
                phone,
            });

            Alert.alert('Success', 'Profile updated successfully.', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);

        } catch (e) {
            console.error('Error updating profile:', e);
            Alert.alert('Network error', 'Could not reach the server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Update Profile</Text>

            {/* Name */}
            <TextInput
                style={styles.input}
                placeholder="Name"
                value={name}
                onChangeText={setName}
            />

            {/* Phone */}
            <TextInput
                style={styles.input}
                placeholder="Phone Number"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
            />

            {/* Update Button */}
            <TouchableOpacity
                style={[styles.button, loading && { opacity: 0.7 }]}
                onPress={handleUpdate}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                ) : (
                    <Text style={styles.buttonText}>Update Profile</Text>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#e6f0fb' },
    heading: { fontSize: 26, fontWeight: '700', marginBottom: 25 },
    input: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        marginBottom: 12,
    },
    button: {
        backgroundColor: '#1976D2',
        paddingVertical: 12,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    buttonText: { color: '#fff', fontSize: 16, textAlign: 'center', fontWeight: '600' },
});

export default UpdateProfile;
