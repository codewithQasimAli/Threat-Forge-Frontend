---
name: threatforge-frontend
description: ThreatForge React Native frontend conventions. Use when editing any JS file or screen component.
---

# ThreatForge Frontend Conventions

## Tech Stack
- React Native, 7 tabs: Home, Devices, Alerts, Simulation, Logs, Reports, Settings
- API base: http://192.168.137.1:8000
- User context via useUser() hook from context/UserContext
- userId = user?.id || user?.user_id

## API Routes (EXACT - do not guess)
- Devices: GET /devices/user/{userId}
- Create device: POST /device
- Alerts list: GET /alerts/alerts/user/{userId}
- Alert summary: GET /alerts/alerts/summary/user/{userId} → returns {total_alerts, unacknowledged, by_severity: {critical, high, medium, low}}
- Network logs: GET /logs/network?user_id={userId}
- Network stats: GET /logs/network/stats?user_id={userId}
- Simulation: GET /simulation/latest

## Rules
- Always use unacknowledged count (not total_alerts) for dashboard
- Severity counts must come from by_severity object
- keyExtractor must return String(item.id) not item.id
- FlatList keys must be strings
