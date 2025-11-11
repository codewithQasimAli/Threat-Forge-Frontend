// Home.jsx
import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const Sparkline = ({ points = [8, 12, 10, 14, 11, 15, 20, 18,8, 12, 10, 14, 11, 15, 13, 18] }) => {
  // Simple static sparkline made from bars (no libs)
  const max = Math.max(...points);
  return (
    <View style={styles.sparkWrap}>
      {points.map((p, i) => (
        <View
          key={i}
          style={[
            styles.sparkBar,
            { height: 6 + Math.round((p / max) * 44) }, // 6..50px
          ]}
        />
      ))}
    </View>
  );
};

const Home = ({navigation}) => {
  return (
    <View style={styles.screen}>
      {/* Network Status */}
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.badge}>
            <Ionicons name="checkmark" size={26} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Network Status:</Text>
            <Text style={styles.linkText}>Secure</Text>
          </View>

          <Pressable style={styles.ghostBtn} onPress={() =>navigation.navigate("AddDevice")}>
            <Text style={styles.ghostBtnText}>Add devices</Text>
          </Pressable>

          <Pressable style={styles.addBtn} onPress={() =>navigation.navigate("AddDevice")}>
            <Ionicons name="add" size={18} color="#fff" />
          </Pressable>
        </View>
      </View>

      {/* Real-Time Traffic */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>Real-Time Traffic</Text>

        <View style={styles.trafficRow}>
          <View style={styles.chartBox}>
            <Sparkline />
          </View>

          <View style={styles.quickStats}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: "#1E3A8A" }]}>
                <Ionicons name="shield-checkmark" size={18} color="#fff" />
              </View>
              <Text style={styles.statText}>Smart Throttling</Text>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: "#0EA5E9" }]}>
                <Ionicons name="thumbs-up" size={18} color="#fff" />
              </View>
              <Text style={styles.statText}>Server Ping</Text>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: "#16A34A" }]}>
                <Ionicons name="search" size={18} color="#fff" />
              </View>
              <Text style={styles.statText}>Security Scanner</Text>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: "#6366F1" }]}>
                <Ionicons name="speedometer" size={18} color="#fff" />
              </View>
              <Text style={styles.statText}>Speed Ping</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Recent Alerts */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>Recent Alerts</Text>
        <Text style={styles.subtle}>Recent Alerts (1)</Text>

        <View style={styles.alertRow}>
          <View style={[styles.sevIcon, { backgroundColor: "#EF4444" }]}>
            <Ionicons name="alert" size={16} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.alertText}>
              Suspicious activity on Living Room Lamp
            </Text>
            <Text style={styles.alertTime}>2 min ago</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 14,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  row: { flexDirection: "row", alignItems: "center" },

  badge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0a6981ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  title: { fontSize: 15, color: "#374151", fontWeight: "600" },
  linkText: { fontSize: 16, color: "#2563EB", fontWeight: "700" },

  ghostBtn: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
  },
  ghostBtnText: {
    color: "#6B7280",
    fontWeight: "600",
    fontSize: 12,
  },

  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0a6981ff",
    alignItems: "center",
    justifyContent: "center",
  },

  // Real-Time Traffic
  cardHeader: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },

  trafficRow: { flexDirection: "row", gap: 12 },

  chartBox: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 4,
    justifyContent: "flex-end",
    height: 120,
  },

  sparkWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    height: 50,
  },

  sparkBar: {
    width: 8,
    borderRadius: 4,
    backgroundColor: "#2e90fa",
  },

  quickStats: { width: 140, gap: 10 },

  statItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  statText: { fontSize: 12, color: "#111827", fontWeight: "600" },

  // Recent Alerts
  subtle: { color: "#6B7280", fontSize: 12, marginBottom: 8 },
  alertRow: { flexDirection: "row", gap: 10, alignItems: "center" },

  sevIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  alertText: { color: "#111827", fontWeight: "700", fontSize: 13 },
  alertTime: { color: "#6B7280", fontSize: 12, marginTop: 2 },
});
