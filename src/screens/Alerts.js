import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Pressable,
  Modal,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useUser } from '../context/UserContext';
import { API_BASE_URL, WS_BASE_URL } from '../config/api';

const SEVERITY_META = {
  critical: { color: "#8B0000", bg: "#FFE5E5", icon: "alert", label: "Critical" },
  high: { color: "#E74C3C", bg: "#FDECEA", icon: "alert-circle", label: "High" },
  medium: { color: "#F39C12", bg: "#FFF7E6", icon: "warning", label: "Medium" },
  low: { color: "#2ECC71", bg: "#ECFDF3", icon: "information-circle", label: "Low" },
};

const BASE_URL = API_BASE_URL;
const WS_URL = WS_BASE_URL;

const FilterModal = ({ visible, onClose, selectedSeverity, onSelectSeverity, counts }) => {
  const filterOptions = [
    { value: 'all', label: 'All Alerts', icon: 'list', count: counts.all },
    { value: 'critical', label: 'Critical', icon: 'alert', color: '#8B0000', count: counts.critical },
    { value: 'high', label: 'High', icon: 'alert-circle', color: '#E74C3C', count: counts.high },
    { value: 'medium', label: 'Medium', icon: 'warning', color: '#F39C12', count: counts.medium },
    { value: 'low', label: 'Low', icon: 'information-circle', color: '#2ECC71', count: counts.low },
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter by Severity</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </Pressable>
          </View>

          {filterOptions.map((option) => (
            <Pressable
              key={option.value}
              style={[
                styles.filterOption,
                selectedSeverity === option.value && styles.filterOptionSelected,
              ]}
              onPress={() => {
                onSelectSeverity(option.value);
                onClose();
              }}
            >
              <View style={styles.filterOptionLeft}>
                <View style={[
                  styles.filterIcon,
                  { backgroundColor: option.color || '#0a6981ff' }
                ]}>
                  <Ionicons name={option.icon} size={18} color="#fff" />
                </View>
                <Text style={[
                  styles.filterLabel,
                  selectedSeverity === option.value && styles.filterLabelSelected,
                ]}>
                  {option.label}
                </Text>
              </View>
              
              <View style={styles.filterOptionRight}>
                <Text style={styles.filterCount}>{option.count}</Text>
                {selectedSeverity === option.value && (
                  <Ionicons name="checkmark" size={20} color="#0a6981ff" />
                )}
              </View>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
};

const AlertCard = ({ alert, onAcknowledge }) => {
  const severity = (alert.severity || "low").toLowerCase();
  const meta = SEVERITY_META[severity] || SEVERITY_META.low;

  let details = {};
  try {
    details = typeof alert.details === 'string' 
      ? JSON.parse(alert.details) 
      : alert.details || {};
  } catch (e) {
    console.error('Failed to parse alert details:', e);
  }

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: meta.color }]}>
          <Ionicons name={meta.icon} size={22} color="#fff" />
        </View>

        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{alert.title}</Text>
            <View style={[styles.severityBadge, { backgroundColor: meta.bg }]}>
              <Text style={[styles.severityText, { color: meta.color }]}>
                {meta.label}
              </Text>
            </View>
          </View>
          
          <Text style={styles.subtitle}>{alert.message}</Text>
          
          {alert.source_ip && (
            <View style={styles.metaRow}>
              <Ionicons name="globe-outline" size={14} color="#6B7280" />
              <Text style={styles.metaText}>
                {alert.source_ip} → {alert.dest_ip || 'N/A'}
              </Text>
            </View>
          )}
          
          {details.true_label && (
            <View style={[styles.labelBadge, {
              backgroundColor: details.true_label === 'BENIGN' ? '#ECFDF3' : '#FEE4E2'
            }]}>
              <Text style={[styles.labelText, {
                color: details.true_label === 'BENIGN' ? '#10B981' : '#E74C3C'
              }]}>
                {details.true_label}
              </Text>
            </View>
          )}
        </View>

        <Pressable onPress={() => onAcknowledge(alert.id)} style={styles.cta}>
          <Ionicons name="checkmark" size={18} color="white" />
        </Pressable>
      </View>
    </View>
  );
};

const Alerts = () => {
  const { user } = useUser();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [summaryStats, setSummaryStats] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [dateRange, setDateRange] = useState('all');
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [devices, setDevices] = useState([]);

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);

  // Fetch alerts from API
  const fetchAlerts = useCallback(async () => {
    if (!user?.id) return;
    try {
      const severityParam = selectedSeverity !== 'all' ? `&severity=${selectedSeverity}` : '';
      const deviceParam = selectedDeviceId ? `&device_id=${selectedDeviceId}` : '';

      let dateParams = '';
      const today = new Date();
      const fmt = (d) => d.toISOString().split('T')[0];
      if (dateRange === 'today') {
        dateParams = `&start_date=${fmt(today)}&end_date=${fmt(today)}`;
      } else if (dateRange === '7days') {
        const from = new Date(today); from.setDate(from.getDate() - 7);
        dateParams = `&start_date=${fmt(from)}&end_date=${fmt(today)}`;
      } else if (dateRange === '30days') {
        const from = new Date(today); from.setDate(from.getDate() - 30);
        dateParams = `&start_date=${fmt(from)}&end_date=${fmt(today)}`;
      }

      const res = await fetch(`${BASE_URL}/alerts/alerts/user/${user.id}?acknowledged=false&limit=500${severityParam}${deviceParam}${dateParams}`);
      const data = await res.json().catch(() => []);
      if (!res.ok) {
        const errorMessage = data?.detail || 'Failed to fetch alerts';
        throw new Error(String(errorMessage));
      }
      console.log('alerts fetched:', data.length);
      setAlerts(data);
      try {
        const summaryRes = await fetch(`${BASE_URL}/alerts/alerts/summary/user/${user.id}`);
        if (summaryRes.ok) {
          const summaryData = await summaryRes.json();
          setSummaryStats(summaryData);
        }
      } catch (e) {}
      setErr("");
    } catch (e) {
      console.error('alerts fetch error:', e);
      const errorMsg = e.message || 'Could not load alerts.';
      setErr(errorMsg);
      Alert.alert('Error', String(errorMsg));
    } finally {
      setLoading(false);
    }
  }, [user?.id, selectedSeverity, selectedDeviceId, dateRange]);

  // WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (!user?.id) return;

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      console.log(`Connecting WebSocket for user ${user.id}...`);
      console.log(`WebSocket URL: ${WS_URL}/ws/alerts?user_id=${user.id}`);
      
      const ws = new WebSocket(`${WS_URL}/ws/alerts?user_id=${user.id}`);
      
      ws.onopen = () => {
        console.log('WebSocket connected!');
        setWsConnected(true);
        reconnectAttempts.current = 0;
        
        // Send heartbeat every 30 seconds
        const heartbeatInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send('ping');
          }
        }, 30000);
        
        ws.heartbeatInterval = heartbeatInterval;
      };

      ws.onmessage = (event) => {
        try {
          // Skip "pong" responses from heartbeat
          if (event.data === 'pong') {
            console.log('Heartbeat: pong received');
            return;
          }
          
          const message = JSON.parse(event.data);
          console.log('WebSocket message:', message);
          
          if (message.type === 'new_alert') {
            // Check if alert already exists (prevent duplicates)
            setAlerts((prev) => {
              const exists = prev.some(a => a.id === message.data.id);
              if (exists) {
                console.log('Alert already exists, skipping duplicate');
                return prev;
              }
              // Add new alert to the TOP of the list
              return [message.data, ...prev];
            });
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
          console.error('Raw message:', event.data);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWsConnected(false);
      };

      ws.onclose = (e) => {
        console.log('WebSocket closed:', e.code, e.reason);
        setWsConnected(false);
        
        // Clear heartbeat
        if (ws.heartbeatInterval) {
          clearInterval(ws.heartbeatInterval);
        }
        
        // Attempt reconnection with exponential backoff
        if (reconnectAttempts.current < 10) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          console.log(`Reconnecting in ${delay}ms...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current += 1;
            connectWebSocket();
          }, delay);
        }
      };

      wsRef.current = ws;
    } catch (e) {
      console.error('WebSocket connection error:', e);
      setWsConnected(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      fetchAlerts();
    }, [fetchAlerts, selectedSeverity])
  );

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectWebSocket]);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`${BASE_URL}/devices/user/${user.id}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setDevices(data); })
      .catch(() => {});
  }, [user?.id]);

  const handleAcknowledge = useCallback(async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/alerts/alerts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acknowledged: true }),
      });
      
      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        const errorMessage = data?.detail || `HTTP ${res.status}`;
        throw new Error(String(errorMessage));
      }

      setAlerts((prev) => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
      try {
        const summaryRes = await fetch(`${BASE_URL}/alerts/alerts/summary/user/${user.id}`);
        if (summaryRes.ok) {
          const summaryData = await summaryRes.json();
          setSummaryStats(summaryData);
        }
      } catch (e) {}
      Alert.alert('Success', 'Alert acknowledged successfully.');
    } catch (e) {
      console.error('acknowledge error:', e);
      const errorMsg = e.message || 'Failed to acknowledge alert.';
      Alert.alert('Error', String(errorMsg));
    }
  }, [user?.id]);

  if (loading) {
    return (
      <View style={styles.screen}>
        <Text style={styles.header}>Alerts</Text>
        <ActivityIndicator size="large" color="#0a6981ff" style={{ marginTop: 20 }} />
      </View>
    );
  }

  if (err) {
    return (
      <View style={styles.screen}>
        <Text style={styles.header}>Alerts</Text>
        <Text style={styles.error}>{err}</Text>
        <Pressable onPress={() => fetchAlerts()} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  let visibleAlerts = [...alerts];
  
  visibleAlerts = visibleAlerts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const severityCounts = summaryStats ? {
    all: summaryStats.unacknowledged || 0,
    critical: summaryStats.by_severity?.critical || 0,
    high: summaryStats.by_severity?.high || 0,
    medium: summaryStats.by_severity?.medium || 0,
    low: summaryStats.by_severity?.low || 0,
  } : {
    all: alerts.filter(a => !a.acknowledged).length,
    critical: alerts.filter(a => !a.acknowledged && (a.severity || "").toLowerCase() === "critical").length,
    high: alerts.filter(a => !a.acknowledged && (a.severity || "").toLowerCase() === "high").length,
    medium: alerts.filter(a => !a.acknowledged && (a.severity || "").toLowerCase() === "medium").length,
    low: alerts.filter(a => !a.acknowledged && (a.severity || "").toLowerCase() === "low").length,
  };

  return (
    <View style={styles.screen}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Text style={styles.header}>Alerts</Text>
          <View style={[styles.statusDot, { 
            backgroundColor: wsConnected ? '#10B981' : '#EF4444' 
          }]} />
        </View>
        <Pressable
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="funnel" size={20} color="#0a6981ff" />
          {selectedSeverity !== "all" && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>1</Text>
            </View>
          )}
        </Pressable>
      </View>

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        selectedSeverity={selectedSeverity}
        onSelectSeverity={setSelectedSeverity}
        counts={severityCounts}
      />

      {/* Date Range Filter Chips */}
      <View style={styles.chipRow}>
        {[
          { key: 'all', label: 'All Time' },
          { key: 'today', label: 'Today' },
          { key: '7days', label: '7 Days' },
          { key: '30days', label: '30 Days' },
        ].map(opt => (
          <Pressable
            key={opt.key}
            onPress={() => setDateRange(opt.key)}
            style={[styles.chip, dateRange === opt.key && styles.chipActive]}
          >
            <Text style={[styles.chipText, dateRange === opt.key && styles.chipTextActive]}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Device Filter Chips */}
      {devices.length > 0 && (
        <View style={styles.chipScroll}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipScrollContent}
        >
          <Pressable
            onPress={() => setSelectedDeviceId(null)}
            style={[styles.chip, selectedDeviceId === null && styles.chipActive]}
          >
            <Text style={[styles.chipText, selectedDeviceId === null && styles.chipTextActive]}>
              All Devices
            </Text>
          </Pressable>
          {devices.map(d => (
            <Pressable
              key={d.id}
              onPress={() => setSelectedDeviceId(d.id)}
              style={[styles.chip, selectedDeviceId === d.id && styles.chipActive]}
            >
              <Text style={[styles.chipText, selectedDeviceId === d.id && styles.chipTextActive]}>
                {d.device_name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        </View>
      )}

      <FlatList
        data={visibleAlerts}
        keyExtractor={(item, index) => `alert-${item.id}-${index}`}
        renderItem={({ item }) => (
          <AlertCard alert={item} onAcknowledge={handleAcknowledge} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={{ paddingVertical: 8 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle-outline" size={64} color="#10B981" />
            <Text style={styles.emptyText}>
              No {selectedSeverity !== "all" ? selectedSeverity : ""} alerts
            </Text>
            <Text style={styles.emptySubtext}>
              {selectedSeverity === "all" 
                ? "All clear! You're all caught up." 
                : `No ${selectedSeverity} severity alerts at the moment.`}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAFB",
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#E74C3C',
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  filterOptionSelected: {
    backgroundColor: '#E0F2FE',
    borderWidth: 2,
    borderColor: '#0a6981ff',
  },
  filterOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  filterLabelSelected: {
    color: '#0a6981ff',
    fontWeight: '700',
  },
  filterOptionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
  },
  error: {
    color: "#B42318",
    backgroundColor: "#FEE4E2",
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  retryBtn: {
    backgroundColor: '#0a6981ff',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  retryText: {
    color: 'white',
    fontWeight: '700',
  },
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    backgroundColor: 'white',
  },
  row: { 
    flexDirection: "row", 
    alignItems: "flex-start", 
    gap: 12 
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { 
    fontSize: 16, 
    fontWeight: "700", 
    color: "#101828",
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '700',
  },
  subtitle: { 
    fontSize: 14, 
    color: '#475467', 
    marginBottom: 8,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  labelBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
  },
  labelText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cta: {
    backgroundColor: "#0a6981ff",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipActive: {
    backgroundColor: '#0a6981ff',
    borderColor: '#0a6981ff',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  chipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  chipScroll: {
    height: 44,
    paddingHorizontal: 16,
    marginBottom: 4,
    overflow: 'hidden',
  },
  chipScrollContent: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    paddingRight: 16,
  },
});

export default Alerts;