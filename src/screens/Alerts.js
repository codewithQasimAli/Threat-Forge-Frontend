import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  Alert, Pressable,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useUser } from '../context/UserContext';

const SEVERITY_META = {
  high: { color: "#E74C3C", bg: "#FDECEA", icon: "alert-circle" },
  medium: { color: "#F39C12", bg: "#FFF7E6", icon: "warning" },
  low: { color: "#2ECC71", bg: "#ECFDF3", icon: "information-circle" },
};

const Alerts = () => {
  const { user } = useUser();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Fetch alerts for current user
  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch(`http://10.0.2.2:8000/alerts/user/${user.id}`);
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.detail || 'Failed to fetch alerts');
      console.log('alerts', data);
      setAlerts(data);
    } catch (e) {
      console.error('alerts fetch error:', e);
      setErr('Could not load alerts.');
      Alert.alert('Error', 'Could not load alerts.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  // PUT /alerts/{id} -> { acknowledged: true }
  const handleAcknowledge = useCallback(async (id) => {
    try {
      const res = await fetch(`http://10.0.2.2:8000/alerts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acknowledged: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || `HTTP ${res.status}`);

      // Update state: remove acknowledged alert
      setAlerts((prev) => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
      Alert.alert('Acknowledged', 'Alert marked as acknowledged successfully.');
    } catch (e) {
      console.error('acknowledge error:', e);
      Alert.alert('Error', 'Failed to acknowledge alert.');
    }
  }, []);

  if (loading) {
    return (
      <View style={styles.screen}>
        <Text style={styles.header}>Alerts</Text>
        <ActivityIndicator />
      </View>
    );
  }

  if (err) {
    return (
      <View style={styles.screen}>
        <Text style={styles.header}>Alerts</Text>
        <Text style={styles.error}>{err}</Text>
      </View>
    );
  }

  // Only unacknowledged alerts
  const visibleAlerts = alerts
    .filter(a => !a.acknowledged)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <View style={styles.screen}>
      <Text style={styles.header}>Alerts</Text>
      <FlatList
        data={visibleAlerts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <AlertCard alert={item} onAcknowledge={handleAcknowledge} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={{ paddingVertical: 8 }}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: '#667085' }}>
            No alerts to show
          </Text>
        }
      />
    </View>
  );
};

const AlertCard = ({ alert, onAcknowledge }) => {
  const severity = (alert.severity || "low").toLowerCase();
  const meta = SEVERITY_META[severity] || SEVERITY_META.low;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: meta.color }]}>
          <Ionicons name={meta.icon} size={22} color="#fff" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{alert.title}</Text>
          <Text style={styles.subtitle}>{alert.message}</Text>
        </View>

        <Pressable onPress={() => onAcknowledge(alert.id)} style={styles.cta}>
          <Text style={styles.ctaText}>Acknowledge</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  header: {
    fontSize: 23,
    fontWeight: '700',
    color: '#1f2937',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  error: {
    color: "#B42318",
    backgroundColor: "#FEE4E2",
    padding: 12,
    borderRadius: 12,
  },
  card: {
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    backgroundColor: 'white'
  },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 3,
  },
  title: { fontSize: 16, fontWeight: "800", color: "#101828", marginBottom: 2 },
  subtitle: { fontSize: 14, color: "#475467", marginBottom: 6 },
  cta: {
    backgroundColor: "#0a6981ff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: "center",
    marginLeft: 8,
  },
  ctaText: { color: "white", fontWeight: "700" },
});

export default Alerts;
