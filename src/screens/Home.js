import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, RefreshControl
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useUser } from '../context/UserContext';

const API_BASE = 'http://192.168.137.1:8000';

const SEVERITY_COLORS = {
  critical: '#C62828',
  high: '#E65100',
  medium: '#F57F17',
  low: '#2E7D32',
};

export default function Home({ navigation }) {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [devices, setDevices] = useState([]);
  const [alertStats, setAlertStats] = useState(null);
  const [latestSim, setLatestSim] = useState(null);
  const [logStats, setLogStats] = useState(null);
  const [recentAlerts, setRecentAlerts] = useState([]);

  const fetchDashboardData = async () => {
    try {
      const userId = user?.id || user?.user_id;
      const [devRes, alertRes, simRes, logRes, recentRes] = await Promise.all([
        fetch(`${API_BASE}/devices/devices?user_id=${userId}`).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${API_BASE}/alerts/alerts/summary/user/${userId}`).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`${API_BASE}/simulation/latest`).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`${API_BASE}/logs/network/stats`).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`${API_BASE}/alerts/alerts/user/${userId}?limit=3`).then(r => r.ok ? r.json() : []).catch(() => []),
      ]);
      setDevices(Array.isArray(devRes) ? devRes : devRes?.devices || []);
      setAlertStats(alertRes);
      setLatestSim(simRes);
      setLogStats(logRes);
      setRecentAlerts(Array.isArray(recentRes) ? recentRes.slice(0, 3) : []);
    } catch (e) {
      console.log('Dashboard fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchDashboardData(); };

  const getTotalAlerts = () => {
    if (!alertStats) return 0;
    return (alertStats.critical || 0) + (alertStats.high || 0) + (alertStats.medium || 0) + (alertStats.low || 0);
  };

  const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const diff = Math.floor((Date.now() - d.getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff/60)}h ago`;
    return d.toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1d8ca9" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1d8ca9']} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>Welcome back</Text>
          <Text style={styles.headerName}>{user?.name || 'User'}</Text>
        </View>
        <View style={styles.idsBadge}>
          <Ionicons name="shield-checkmark" size={14} color="#fff" />
          <Text style={styles.idsText}>IDS Active</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('Devices')}>
          <Ionicons name="hardware-chip-outline" size={22} color="#1d8ca9" />
          <Text style={styles.statNum}>{devices.length}</Text>
          <Text style={styles.statLbl}>Devices</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('Alerts')}>
          <Ionicons name="notifications-outline" size={22} color="#E65100" />
          <Text style={[styles.statNum, { color: '#E65100' }]}>{getTotalAlerts()}</Text>
          <Text style={styles.statLbl}>Total Alerts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('Logs')}>
          <Ionicons name="analytics-outline" size={22} color="#C62828" />
          <Text style={[styles.statNum, { color: '#C62828' }]}>{logStats?.total_anomalies || 0}</Text>
          <Text style={styles.statLbl}>Anomalies</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('Simulation')}>
          <Ionicons name="play-circle-outline" size={22} color="#2E7D32" />
          <Text style={[styles.statNum, { color: '#2E7D32' }]}>{logStats?.total_flows || 0}</Text>
          <Text style={styles.statLbl}>Flows</Text>
        </TouchableOpacity>
      </View>

      {alertStats && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alert Severity Breakdown</Text>
          <View style={styles.card}>
            {['critical', 'high', 'medium', 'low'].map(s => {
              const count = alertStats[s] || 0;
              const total = getTotalAlerts();
              const pct = total > 0 ? (count / total) : 0;
              return (
                <View key={s} style={styles.severityRow}>
                  <Text style={[styles.severityLabel, { color: SEVERITY_COLORS[s] }]}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Text>
                  <View style={styles.barBg}>
                    <View style={[styles.barFill, { width: `${pct * 100}%`, backgroundColor: SEVERITY_COLORS[s] }]} />
                  </View>
                  <Text style={styles.severityCount}>{count}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {latestSim && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Last Simulation</Text>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Simulation')}>
            <View style={styles.simRow}>
              <View style={styles.simLeft}>
                <Text style={styles.simAttack}>{(latestSim.attack_types || []).join(' + ')}</Text>
                <Text style={styles.simTime}>{formatTime(latestSim.timestamp)}</Text>
              </View>
              <View style={styles.simRight}>
                <View style={styles.simBadge}>
                  <Text style={styles.simBadgeText}>{latestSim.status}</Text>
                </View>
                <Text style={styles.simAnomalies}>{latestSim.anomalies_detected} anomalies</Text>
              </View>
            </View>
            <View style={styles.simStats}>
              <View style={styles.simStat}>
                <Text style={styles.simStatNum}>{latestSim.total_flows}</Text>
                <Text style={styles.simStatLbl}>Flows</Text>
              </View>
              <View style={styles.simStat}>
                <Text style={[styles.simStatNum, { color: '#C62828' }]}>{latestSim.anomalies_detected}</Text>
                <Text style={styles.simStatLbl}>Anomalies</Text>
              </View>
              <View style={styles.simStat}>
                <Text style={styles.simStatNum}>{latestSim.alerts_created}</Text>
                <Text style={styles.simStatLbl}>Alerts</Text>
              </View>
              <View style={styles.simStat}>
                <Text style={styles.simStatNum}>{latestSim.duration_seconds}s</Text>
                <Text style={styles.simStatLbl}>Duration</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {recentAlerts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Alerts</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Alerts')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.card}>
            {recentAlerts.map((alert, i) => (
              <View key={alert.id || i}>
                <View style={styles.alertRow}>
                  <View style={[styles.alertDot, { backgroundColor: SEVERITY_COLORS[alert.severity] || '#999' }]} />
                  <View style={styles.alertInfo}>
                    <Text style={styles.alertTitle} numberOfLines={1}>{alert.title}</Text>
                    <Text style={styles.alertMeta}>{alert.source_ip} · {formatTime(alert.created_at)}</Text>
                  </View>
                  <Text style={[styles.alertSev, { color: SEVERITY_COLORS[alert.severity] || '#999' }]}>
                    {alert.severity}
                  </Text>
                </View>
                {i < recentAlerts.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  loadingText: { marginTop: 12, color: '#666' },
  header: { backgroundColor: '#1d8ca9', padding: 20, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerGreeting: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  headerName: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 2 },
  idsBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, gap: 4 },
  idsText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 8 },
  statCard: { width: '47%', backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  statNum: { fontSize: 26, fontWeight: 'bold', color: '#1d8ca9', marginTop: 6 },
  statLbl: { fontSize: 12, color: '#666', marginTop: 3 },
  section: { marginHorizontal: 12, marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 8 },
  seeAll: { fontSize: 13, color: '#1d8ca9' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  severityRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  severityLabel: { width: 55, fontSize: 13, fontWeight: '500' },
  barBg: { flex: 1, height: 8, backgroundColor: '#f0f0f0', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  severityCount: { width: 24, fontSize: 13, color: '#333', fontWeight: '500', textAlign: 'right' },
  simRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  simLeft: { flex: 1 },
  simAttack: { fontSize: 15, fontWeight: '600', color: '#333' },
  simTime: { fontSize: 12, color: '#999', marginTop: 2 },
  simRight: { alignItems: 'flex-end', gap: 4 },
  simBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  simBadgeText: { fontSize: 11, color: '#2E7D32', fontWeight: '600' },
  simAnomalies: { fontSize: 12, color: '#C62828' },
  simStats: { flexDirection: 'row', borderTopWidth: 0.5, borderTopColor: '#eee', paddingTop: 12, gap: 8 },
  simStat: { flex: 1, alignItems: 'center' },
  simStatNum: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  simStatLbl: { fontSize: 11, color: '#999', marginTop: 2 },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  alertDot: { width: 8, height: 8, borderRadius: 4 },
  alertInfo: { flex: 1 },
  alertTitle: { fontSize: 13, fontWeight: '500', color: '#333' },
  alertMeta: { fontSize: 11, color: '#999', marginTop: 2 },
  alertSev: { fontSize: 11, fontWeight: '600' },
  divider: { height: 0.5, backgroundColor: '#eee', marginVertical: 2 },
});
