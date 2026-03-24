import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, Linking
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useUser } from '../context/UserContext';

const API_BASE = 'http://192.168.137.1:8000';

export default function ReportsScreen() {
  const { user } = useUser();
  const [csvLoading, setCsvLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const userId = user?.id || user?.user_id;

  const exportCSV = async () => {
    setCsvLoading(true);
    try {
      const url = `${API_BASE}/alerts/export/csv?user_id=${userId}`;
      await Linking.openURL(url);
      Alert.alert('Export Started', 'CSV file is being downloaded to your device.');
    } catch (e) {
      Alert.alert('Export Failed', 'Could not export CSV. Please try again.');
    } finally {
      setCsvLoading(false);
    }
  };

  const exportPDF = async () => {
    setPdfLoading(true);
    try {
      const url = `${API_BASE}/alerts/export/pdf?user_id=${userId}`;
      await Linking.openURL(url);
      Alert.alert('Export Started', 'PDF report is being downloaded to your device.');
    } catch (e) {
      Alert.alert('Export Failed', 'Could not export PDF. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports</Text>
        <Text style={styles.headerSub}>Export alerts and traffic data</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color="#1d8ca9" />
          <Text style={styles.infoText}>
            Export your ThreatForge alert data for documentation, analysis, or external review.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Export Format</Text>

        <TouchableOpacity
          style={styles.exportCard}
          onPress={exportCSV}
          disabled={csvLoading}
        >
          <View style={styles.exportLeft}>
            <View style={[styles.iconBox, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="document-text-outline" size={28} color="#2E7D32" />
            </View>
            <View>
              <Text style={styles.exportTitle}>Export as CSV</Text>
              <Text style={styles.exportSub}>Spreadsheet format — open in Excel</Text>
              <Text style={styles.exportDetail}>Includes: ID, title, severity, IPs, RMSE, timestamp</Text>
            </View>
          </View>
          {csvLoading ? (
            <ActivityIndicator size="small" color="#2E7D32" />
          ) : (
            <Ionicons name="download-outline" size={22} color="#2E7D32" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.exportCard}
          onPress={exportPDF}
          disabled={pdfLoading}
        >
          <View style={styles.exportLeft}>
            <View style={[styles.iconBox, { backgroundColor: '#FFEBEE' }]}>
              <Ionicons name="document-outline" size={28} color="#C62828" />
            </View>
            <View>
              <Text style={styles.exportTitle}>Export as PDF</Text>
              <Text style={styles.exportSub}>Formatted report — ready to share</Text>
              <Text style={styles.exportDetail}>Includes: styled table with all alert details</Text>
            </View>
          </View>
          {pdfLoading ? (
            <ActivityIndicator size="small" color="#C62828" />
          ) : (
            <Ionicons name="download-outline" size={22} color="#C62828" />
          )}
        </TouchableOpacity>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>What's included</Text>
          <Text style={styles.noteItem}>• All detected IoT network anomalies</Text>
          <Text style={styles.noteItem}>• Attack severity levels (Critical, High, Medium, Low)</Text>
          <Text style={styles.noteItem}>• Source and destination IP addresses</Text>
          <Text style={styles.noteItem}>• RMSE anomaly scores from Kitsune IDS</Text>
          <Text style={styles.noteItem}>• Timestamps for each detection event</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#1d8ca9', padding: 20, paddingTop: 50 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },
  content: { padding: 16 },
  infoCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#E3F2FD', borderRadius: 10, padding: 12, marginBottom: 20, gap: 10 },
  infoText: { flex: 1, fontSize: 13, color: '#1565C0', lineHeight: 18 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  exportCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  exportLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  iconBox: { width: 52, height: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  exportTitle: { fontSize: 15, fontWeight: '600', color: '#333' },
  exportSub: { fontSize: 12, color: '#666', marginTop: 2 },
  exportDetail: { fontSize: 11, color: '#999', marginTop: 2 },
  noteCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginTop: 8, elevation: 1 },
  noteTitle: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 10 },
  noteItem: { fontSize: 13, color: '#555', marginBottom: 6, lineHeight: 18 },
});
