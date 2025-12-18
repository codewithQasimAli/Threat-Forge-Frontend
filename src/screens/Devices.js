import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Platform, Alert, Switch,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useUser } from '../context/UserContext';


export default function Devices({ navigation }) {
  const { user } = useUser();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDevices = useCallback(async () => {
    try {
      const res = await fetch(`http://10.0.2.2:8000/devices/user/${user.id}`);
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.detail || 'Failed to fetch devices');

      const list = (Array.isArray(data) ? data : []).map(d => ({
        id: d.id,
        name: d.name ?? d.device_name ?? 'Unnamed device',
        device_name: d.device_name ?? d.name ?? 'Unnamed device',
        device_type: d.device_type ?? d.type ?? 'Unknown',
        ip_address: d.ip_address ?? d.ip ?? '—',
        mac_address: d.mac_address ?? d.mac ?? '',
        status: d.status ?? (d.active ? 'active' : 'inactive'),
        user_id: d.user_id ?? user.id,
      }));
      setDevices(list);
    } catch (e) {
      console.error('Devices fetch error:', e);
      Alert.alert('Error', 'Could not load devices.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchDevices(); }, [fetchDevices]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDevices();
  };

  // --- Toggle active/inactive ---
  const toggleDevice = async (device) => {
    // optimistic UI
    const nextStatus = device.status === 'active' ? 'inactive' : 'active';
    setDevices(prev => prev.map(d => d.id === device.id ? { ...d, status: nextStatus } : d));

    try {
      // PUT the full device payload with updated status
      const payload = {
        device_name: device.device_name,
        device_type: device.device_type,
        ip_address: device.ip_address,
        mac_address: device.mac_address,
        status: nextStatus,
        user_id: device.user_id,
      };
      const res = await fetch(`http://10.0.2.2:8000/device/${device.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        // rollback UI on failure
        setDevices(prev => prev.map(d => d.id === device.id ? { ...d, status: device.status } : d));
        const err = await res.json().catch(() => ({}));
        Alert.alert('Failed', err?.detail || 'Could not update status.');
      }
    } catch (e) {
      setDevices(prev => prev.map(d => d.id === device.id ? { ...d, status: device.status } : d));
      console.error('Toggle error:', e);
      Alert.alert('Network error', 'Could not update device status.');
    }
  };

  // --- Delete device ---
  const deleteDevice = (device) => {
    Alert.alert('Delete device', `Remove "${device.device_name || device.name}"?`, [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          // optimistic remove
          const prev = devices;
          setDevices(prev.filter(d => d.id !== device.id));
          try {
            const res = await fetch(`http://10.0.2.2:8000/device/${device.id}`, { method: 'DELETE' });
            if (!res.ok) {
              setDevices(prev); // rollback
              const err = await res.json().catch(() => ({}));
              Alert.alert('Failed', err?.detail || 'Could not delete device.');
            }
          } catch (e) {
            setDevices(prev); // rollback
            console.error('Delete error:', e);
            Alert.alert('Network error', 'Could not delete device.');
          }
        },
      },
    ]);
  };

  const addDevice = () => {
    navigation.navigate("AddDevice");
  };

  const renderItem = ({ item }) => {
    const enabled = item.status === 'active';
    return (
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.deviceName}>{item.device_name || item.name}</Text>
          <Text style={styles.deviceIp}>{item.ip_address}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={() => navigation.navigate("UpdateDevice", { id: item.id })} style={styles.iconBtn}>
            <Ionicons name="pencil" size={18} color={"#1976D2"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteDevice(item)} style={styles.iconBtn}>
            <Ionicons name="trash-bin" size={18} color={"#1976D2"} />
          </TouchableOpacity>
          <Switch
            value={enabled}
            onValueChange={() => toggleDevice(item)}
            trackColor={{ false: '#cfd8dc', true: '#90caf9' }}
            thumbColor={enabled ? "#1976D2" : '#f4f3f4'}
          />
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={"#1976D2"} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Devices</Text>

      </View>

      <FlatList
        data={devices}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 20, color: '#607086' }}>
            No devices yet.
          </Text>
        }
      />

      <TouchableOpacity style={styles.addButtonRound} onPress={addDevice}>
        <Text style={styles.plusIcon}>＋</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFFFFF" },
  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6,
  },
  title: { fontSize: 23, fontWeight: '700', color: '#1f2937', flex: 1 },
  addCircle: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: "#1976D2", alignItems: 'center', justifyContent: 'center',
  },

  card: {
    backgroundColor: '#fff', borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 14,
    marginVertical: 6, flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  deviceName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  deviceIp: { fontSize: 12, color: '#6b7280', marginTop: 2 },

  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: {
    width: 34, height: 34, borderRadius: 8,
    backgroundColor: '#edf4ff',
    alignItems: 'center', justifyContent: 'center',
  },

  addButtonContainer: {
  width: '100%',
  alignItems: 'center',
  marginVertical: 20, 
},

  addButtonRound: {
  backgroundColor: '#0a6981ff',
  width: 60,
  height: 60,
  borderRadius: 30,
  alignItems: 'center',
  justifyContent: "center",
  alignSelf: "center", 
  marginVertical: 80,
  elevation: 4,
  shadowColor: '#000',
  shadowOpacity: 0.3,
  shadowRadius: 3,
  shadowOffset: { width: 0, height: 2 },
},

  plusIcon: {
  color: '#fff',
  fontSize: 32,
  fontWeight: 'bold',
  marginTop: -2, 
},

});
