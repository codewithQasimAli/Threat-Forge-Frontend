import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator, RefreshControl
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const API_BASE = 'http://192.168.137.1:8000';

const SEVERITY_COLORS = {
  critical: { bg: '#FFEBEE', text: '#C62828', border: '#EF9A9A' },
  high:     { bg: '#FFF3E0', text: '#E65100', border: '#FFCC80' },
  medium:   { bg: '#FFFDE7', text: '#F57F17', border: '#FFF176' },
  low:      { bg: '#E8F5E9', text: '#2E7D32', border: '#A5D6A7' },
  none:     { bg: '#F5F5F5', text: '#616161', border: '#E0E0E0' },
};

export default function NetworkLogsScreen() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchData = async () => {
    try {
      const url = filter === 'all'
        ? `${API_BASE}/logs/network?limit=50`
        : `${API_BASE}/logs/network?severity=${filter}&limit=50`;
      const [logsRes, statsRes] = await Promise.all([
        fetch(url).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${API_BASE}/logs/network/stats`).then(r => r.ok ? r.json() : null).catch(() => null),
      ]);
      setLogs(logsRes);
      setStats(statsRes);
    } catch (e) {
      setLogs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, [filter]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatProtocol = (p) => {
    if (p === 6) return 'TCP';
    if (p === 17) return 'UDP';
    if (p === 1) return 'ICMP';
    return `P${p}`;
  };

  const renderLog = ({ item }) => {
    const colors = SEVERITY_COLORS[item.severity] || SEVERITY_COLORS.none;
    return (
      <View style={[styles.logCard, { borderLeftColor: colors.border, borderLeftWidth: 4 }]}>
        <View style={styles.logHeader}>
          <View style={[styles.severityBadge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.severityText, { color: colors.text }]}>
              {(item.severity || 'none').toUpperCase()}
            </Text>
          </View>
          <Text style={styles.logTime}>{formatTime(item.timestamp)}</Text>
        </View>
        <View style={styles.logRow}>
          <Ionicons name="arrow-forward-outline" size={12} color="#999" />
          <Text style={styles.logIp}>{item.src_ip}</Text>
          <Text style={styles.logArrow}>→</Text>
          <Text style={styles.logIp}>{item.dst_ip}</Text>
        </View>
        <View style={styles.logFooter}>
          <Text style={styles.logMeta}>{formatProtocol(item.protocol)}</Text>
          <Text style={styles.logDot}>·</Text>
          <Text style={styles.logMeta}>RMSE: {item.rmse_score?.toFixed(4)}</Text>
          <Text style={styles.logDot}>·</Text>
          <Text style={styles.logMeta}>{item.packet_count} pkts</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1d8ca9" />
        <Text style={styles.loadingText}>Loading network logs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Network Logs</Text>
        <Text style={styles.headerSub}>Real-time IoT traffic analysis</Text>
      </View>

      {stats && (
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{stats.total_flows}</Text>
            <Text style={styles.statLbl}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: '#C62828' }]}>{stats.critical}</Text>
            <Text style={styles.statLbl}>Critical</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: '#E65100' }]}>{stats.high}</Text>
            <Text style={styles.statLbl}>High</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: '#F57F17' }]}>{stats.medium}</Text>
            <Text style={styles.statLbl}>Medium</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: '#2E7D32' }]}>{stats.low}</Text>
            <Text style={styles.statLbl}>Low</Text>
          </View>
        </View>
      )}

      <View style={styles.filterRow}>
        {['all', 'critical', 'high', 'medium', 'low'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={logs}
        keyExtractor={item => item.id}
        renderItem={renderLog}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1d8ca9']} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="document-outline" size={40} color="#ccc" />
            <Text style={styles.emptyText}>No logs found</Text>
          </View>
        }
        contentContainerStyle={{ padding: 12, paddingBottom: 30 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#666' },
  header: { backgroundColor: '#1d8ca9', padding: 20, paddingTop: 50 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },
  statsRow: { flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  statLbl: { fontSize: 10, color: '#999', marginTop: 2 },
  filterRow: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 8, gap: 6, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  filterBtn: { flex: 1, paddingVertical: 5, borderRadius: 12, backgroundColor: '#f5f5f5', alignItems: 'center' },
  filterBtnActive: { backgroundColor: '#1d8ca9' },
  filterText: { fontSize: 11, color: '#666', fontWeight: '500' },
  filterTextActive: { color: '#fff' },
  logCard: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 8, elevation: 1 },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  severityBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  severityText: { fontSize: 11, fontWeight: '700' },
  logTime: { fontSize: 11, color: '#999' },
  logRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  logIp: { fontSize: 13, color: '#333', fontWeight: '500' },
  logArrow: { fontSize: 13, color: '#999' },
  logFooter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  logMeta: { fontSize: 11, color: '#888' },
  logDot: { fontSize: 11, color: '#ccc' },
  emptyBox: { alignItems: 'center', padding: 40 },
  emptyText: { color: '#999', marginTop: 8 },
});
