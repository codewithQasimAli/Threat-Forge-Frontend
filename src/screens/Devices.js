import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert, Switch,
  Modal, ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useUser } from '../context/UserContext';
import { API_BASE_URL } from '../config/api';

export default function Devices({ navigation }) {
  const { user } = useUser();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceActivity, setDeviceActivity] = useState(null);
  const [activityLoading, setActivityLoading] = useState(false);

  const fetchDevices = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/devices/user/${user.id}`);
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

  useEffect(() => { 
    fetchDevices(); 
  }, [fetchDevices]);

  const fetchDeviceActivity = async (device) => {
    setSelectedDevice(device);
    setActivityLoading(true);
    setDeviceActivity(null);
    try {
      const res = await fetch(`http://192.168.137.1:8000/logs/network/by-device`);
      const data = res.ok ? await res.json() : [];
      const deviceIp = device.ip_address || device.ipAddress || device.ip;
      const match = data.find(d => d.dst_ip === deviceIp || d.src_ip === deviceIp);
      setDeviceActivity(match || null);
    } catch (e) {
      setDeviceActivity(null);
    } finally {
      setActivityLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDevices();
  };

  // Toggle active/inactive
  const toggleDevice = async (device) => {
    const nextStatus = device.status === 'active' ? 'inactive' : 'active';
    
    // Optimistic UI update
    setDevices(prev => prev.map(d => 
      d.id === device.id ? { ...d, status: nextStatus } : d
    ));

    try {
      const payload = {
        device_name: device.device_name,
        device_type: device.device_type,
        ip_address: device.ip_address,
        mac_address: device.mac_address,
        status: nextStatus,
        user_id: device.user_id,
      };
      
      const res = await fetch(`${API_BASE_URL}/device/${device.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        // Rollback UI on failure
        setDevices(prev => prev.map(d => 
          d.id === device.id ? { ...d, status: device.status } : d
        ));
        const err = await res.json().catch(() => ({}));
        const errorMessage = err?.detail || 'Could not update status.';
        Alert.alert('Failed', String(errorMessage));
      }
    } catch (e) {
      // Rollback on network error
      setDevices(prev => prev.map(d => 
        d.id === device.id ? { ...d, status: device.status } : d
      ));
      console.error('Toggle error:', e);
      Alert.alert('Network error', 'Could not update device status.');
    }
  };

  // Delete device
  const deleteDevice = (device) => {
    const deviceName = device.device_name || device.name;
    
    Alert.alert(
      'Delete Device',
      `Are you sure you want to remove "${deviceName}"?`,
      [
        { 
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Optimistic remove
            const previousDevices = devices;
            setDevices(prev => prev.filter(d => d.id !== device.id));
            
            try {
              const res = await fetch(`${API_BASE_URL}/device/${device.id}`, { 
                method: 'DELETE' 
              });
              
              if (!res.ok) {
                // Rollback on failure
                setDevices(previousDevices);
                const err = await res.json().catch(() => ({}));
                const errorMessage = err?.detail || 'Could not delete device.';
                Alert.alert('Failed', String(errorMessage));
              } else {
                // Success feedback (optional)
                // Alert.alert('Success', 'Device deleted successfully.');
              }
            } catch (e) {
              // Rollback on network error
              setDevices(previousDevices);
              console.error('Delete error:', e);
              Alert.alert('Network error', 'Could not delete device.');
            }
          },
        },
      ]
    );
  };

  const addDevice = () => {
    navigation.navigate("AddDevice");
  };

  const renderItem = ({ item }) => {
    const enabled = item.status === 'active';
    return (
      <TouchableOpacity style={styles.card} onPress={() => fetchDeviceActivity(item)} activeOpacity={0.8}>
        <View style={{ flex: 1 }}>
          <Text style={styles.deviceName}>{item.device_name || item.name}</Text>
          <Text style={styles.deviceIp}>{item.ip_address}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => navigation.navigate("UpdateDevice", { id: item.id })}
            style={styles.iconBtn}
          >
            <Ionicons name="pencil" size={18} color={"#1976D2"} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => deleteDevice(item)}
            style={styles.iconBtn}
          >
            <Ionicons name="trash-bin" size={18} color={"#1976D2"} />
          </TouchableOpacity>

          <Switch
            value={enabled}
            onValueChange={() => toggleDevice(item)}
            trackColor={{ false: '#cfd8dc', true: '#90caf9' }}
            thumbColor={enabled ? "#1976D2" : '#f4f3f4'}
          />
        </View>
      </TouchableOpacity>
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 20, color: '#607086' }}>
            No devices yet.
          </Text>
        }
      />

      <TouchableOpacity style={styles.addButtonRound} onPress={addDevice}>
        <Text style={styles.plusIcon}>＋</Text>
      </TouchableOpacity>

      <Modal
        visible={selectedDevice !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedDevice(null)}
      >
        <View style={{flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'flex-end'}}>
          <View style={{backgroundColor:'#fff', borderTopLeftRadius:20, borderTopRightRadius:20, padding:20, minHeight:300}}>
            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
              <Text style={{fontSize:18, fontWeight:'bold', color:'#333'}}>{selectedDevice?.device_name || selectedDevice?.deviceName}</Text>
              <TouchableOpacity onPress={() => setSelectedDevice(null)}>
                <Text style={{fontSize:16, color:'#1d8ca9', fontWeight:'600'}}>Close</Text>
              </TouchableOpacity>
            </View>
            <Text style={{fontSize:13, color:'#999', marginBottom:16}}>{selectedDevice?.ip_address || selectedDevice?.ipAddress} · {selectedDevice?.device_type || selectedDevice?.deviceType}</Text>

            <Text style={{fontSize:15, fontWeight:'600', color:'#333', marginBottom:12}}>Network Activity</Text>

            {activityLoading ? (
              <ActivityIndicator size="small" color="#1d8ca9" />
            ) : deviceActivity ? (
              <View>
                <View style={{flexDirection:'row', marginBottom:16}}>
                  <View style={{flex:1, alignItems:'center', backgroundColor:'#f5f5f5', borderRadius:10, padding:12, marginRight:6}}>
                    <Text style={{fontSize:22, fontWeight:'bold', color:'#1d8ca9'}}>{deviceActivity.total_flows}</Text>
                    <Text style={{fontSize:11, color:'#666', marginTop:3}}>Total Flows</Text>
                  </View>
                  <View style={{flex:1, alignItems:'center', backgroundColor:'#FFEBEE', borderRadius:10, padding:12, marginRight:6}}>
                    <Text style={{fontSize:22, fontWeight:'bold', color:'#C62828'}}>{deviceActivity.anomalies}</Text>
                    <Text style={{fontSize:11, color:'#666', marginTop:3}}>Anomalies</Text>
                  </View>
                  <View style={{flex:1, alignItems:'center', backgroundColor:'#f5f5f5', borderRadius:10, padding:12}}>
                    <Text style={{fontSize:22, fontWeight:'bold', color:'#E65100'}}>{deviceActivity.avg_rmse?.toFixed(3)}</Text>
                    <Text style={{fontSize:11, color:'#666', marginTop:3}}>Avg RMSE</Text>
                  </View>
                </View>
                <View style={{backgroundColor:'#f5f5f5', borderRadius:10, padding:12}}>
                  <Text style={{fontSize:12, color:'#666'}}>Last activity: {deviceActivity.last_seen ? new Date(deviceActivity.last_seen).toLocaleString() : 'Never'}</Text>
                  <Text style={{fontSize:12, color:'#C62828', marginTop:4}}>
                    Anomaly rate: {deviceActivity.total_flows > 0 ? ((deviceActivity.anomalies/deviceActivity.total_flows)*100).toFixed(0) : 0}%
                  </Text>
                </View>
              </View>
            ) : (
              <View style={{alignItems:'center', padding:20}}>
                <Text style={{fontSize:14, color:'#999'}}>No network activity recorded for this device yet.</Text>
                <Text style={{fontSize:12, color:'#ccc', marginTop:6}}>Run a simulation to generate traffic data.</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFFFFF" },
  headerRow: {
    flexDirection: 'row', 
    alignItems: 'center',
    paddingHorizontal: 16, 
    paddingTop: 12, 
    paddingBottom: 6,
  },
  title: { fontSize: 23, fontWeight: '700', color: '#1f2937', flex: 1 },
  
  card: {
    backgroundColor: '#fff', 
    borderRadius: 12,
    paddingVertical: 12, 
    paddingHorizontal: 14,
    marginVertical: 6, 
    flexDirection: 'row', 
    alignItems: 'center',
    shadowColor: '#000', 
    shadowOpacity: 0.06, 
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, 
    elevation: 2,
  },
  deviceName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  deviceIp: { fontSize: 12, color: '#6b7280', marginTop: 2 },

  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: {
    width: 34, 
    height: 34, 
    borderRadius: 8,
    backgroundColor: '#edf4ff',
    alignItems: 'center', 
    justifyContent: 'center',
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