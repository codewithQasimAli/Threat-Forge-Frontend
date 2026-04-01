import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, RefreshControl
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useUser } from '../context/UserContext';

const API_BASE = 'http://192.168.137.1:8000';

export default function SimulationScreen() {
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useUser();

  const fetchData = async () => {
    try {
      setError(null);
      const [latestRes, historyRes] = await Promise.all([
        fetch(`${API_BASE}/simulation/latest?user_id=${user?.id || user?.user_id}`).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`${API_BASE}/simulation/history?limit=5&user_id=${user?.id || user?.user_id}`).then(r => r.ok ? r.json() : []).catch(() => []),
      ]);
      setLatest(latestRes);
      setHistory(historyRes || []);
    } catch (e) {
      setError('Could not load simulation data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const formatDate = (iso) => {
    if (!iso) return 'N/A';
    const d = new Date(iso);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSeverityColor = (count) => {
    if (count === 0) return '#4CAF50';
    if (count < 5) return '#FF9800';
    return '#F44336';
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1d8ca9" />
        <Text style={styles.loadingText}>Loading simulation data...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1d8ca9']} />}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Simulation</Text>
        <Text style={styles.headerSub}>IoT Network Attack Detection</Text>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Ionicons name="warning-outline" size={18} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {latest ? (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Last Simulation Run</Text>
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <Ionicons name="time-outline" size={16} color="#666" />
                <Text style={styles.cardLabel}>Run Time</Text>
                <Text style={styles.cardValue}>{formatDate(latest.timestamp)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.cardRow}>
                <Ionicons name="flash-outline" size={16} color="#666" />
                <Text style={styles.cardLabel}>Attack Types</Text>
                <Text style={styles.cardValue}>{(latest.attack_types || []).join(', ')}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.cardRow}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#666" />
                <Text style={styles.cardLabel}>Status</Text>
                <View style={[styles.badge, { backgroundColor: '#E8F5E9' }]}>
                  <Text style={[styles.badgeText, { color: '#2E7D32' }]}>{latest.status}</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.cardRow}>
                <Ionicons name="timer-outline" size={16} color="#666" />
                <Text style={styles.cardLabel}>Duration</Text>
                <Text style={styles.cardValue}>{latest.duration_seconds}s</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detection Results</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNum}>{latest.total_flows}</Text>
                <Text style={styles.statLabel}>Flows Analyzed</Text>
              </View>
              <View style={[styles.statCard, { borderColor: getSeverityColor(latest.anomalies_detected) }]}>
                <Text style={[styles.statNum, { color: getSeverityColor(latest.anomalies_detected) }]}>
                  {latest.anomalies_detected}
                </Text>
                <Text style={styles.statLabel}>Anomalies</Text>
              </View>
              <View style={[styles.statCard, { borderColor: getSeverityColor(latest.alerts_created) }]}>
                <Text style={[styles.statNum, { color: getSeverityColor(latest.alerts_created) }]}>
                  {latest.alerts_created}
                </Text>
                <Text style={styles.statLabel}>Alerts Created</Text>
              </View>
            </View>
          </View>

          {latest.anomalies_detected > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Threat Level</Text>
              <View style={styles.threatCard}>
                <Ionicons name="shield-outline" size={32} color="#F44336" />
                <View style={styles.threatInfo}>
                  <Text style={styles.threatTitle}>CRITICAL</Text>
                  <Text style={styles.threatSub}>
                    {latest.anomalies_detected} anomalies detected from {(latest.attack_types || []).join(' + ')} attack
                  </Text>
                </View>
              </View>
            </View>
          )}
        </>
      ) : (
        <View style={styles.emptyBox}>
          <Ionicons name="play-circle-outline" size={48} color="#1d8ca9" />
          <Text style={styles.emptyTitle}>No Simulations Yet</Text>
          <Text style={styles.emptySub}>Run the simulation pipeline to see results here</Text>
        </View>
      )}

      {history.length > 1 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Runs</Text>
          {history.slice(1).map((run, index) => (
            <View key={run.id || index} style={styles.historyCard}>
              <View style={styles.historyLeft}>
                <Text style={styles.historyAttack}>{(run.attack_types || []).join(', ')}</Text>
                <Text style={styles.historyTime}>{formatDate(run.timestamp)}</Text>
              </View>
              <View style={styles.historyRight}>
                <Text style={[styles.historyAnomalies, { color: getSeverityColor(run.anomalies_detected) }]}>
                  {run.anomalies_detected} anomalies
                </Text>
                <Text style={styles.historyFlows}>{run.total_flows} flows</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  loadingText: { marginTop: 12, color: '#666', fontSize: 14 },
  header: { backgroundColor: '#1d8ca9', padding: 20, paddingTop: 50 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },
  errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFEBEE', margin: 16, padding: 12, borderRadius: 8, gap: 8 },
  errorText: { color: '#F44336', fontSize: 13 },
  section: { margin: 16, marginBottom: 0 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 10 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  cardRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 8 },
  cardLabel: { flex: 1, color: '#666', fontSize: 14 },
  cardValue: { color: '#333', fontSize: 14, fontWeight: '500' },
  divider: { height: 0.5, backgroundColor: '#eee' },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, borderWidth: 2, borderColor: '#1d8ca9' },
  statNum: { fontSize: 28, fontWeight: 'bold', color: '#1d8ca9' },
  statLabel: { fontSize: 11, color: '#666', marginTop: 4, textAlign: 'center' },
  threatCard: { backgroundColor: '#FFF3F3', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: '#FFCDD2' },
  threatInfo: { flex: 1 },
  threatTitle: { fontSize: 16, fontWeight: 'bold', color: '#F44336' },
  threatSub: { fontSize: 13, color: '#666', marginTop: 3 },
  emptyBox: { alignItems: 'center', padding: 40, margin: 16, backgroundColor: '#fff', borderRadius: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginTop: 12 },
  emptySub: { fontSize: 13, color: '#666', marginTop: 6, textAlign: 'center' },
  historyCard: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', elevation: 1 },
  historyLeft: { flex: 1 },
  historyAttack: { fontSize: 14, fontWeight: '600', color: '#333' },
  historyTime: { fontSize: 12, color: '#999', marginTop: 3 },
  historyRight: { alignItems: 'flex-end' },
  historyAnomalies: { fontSize: 14, fontWeight: '600' },
  historyFlows: { fontSize: 12, color: '#999', marginTop: 3 },
});
