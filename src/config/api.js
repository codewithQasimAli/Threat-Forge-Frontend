// src/config/api.js

/**
 * ========================================
 * API Configuration for ThreatForge
 * ========================================
 * 
 * CURRENT MODE:  HOTSPOT 
 * 
 * STEPS:
 * 1. Turn ON laptop Mobile Hotspot
 * 2. Connect phone to hotspot
 * 3. Start backend:  uvicorn app. main:app --host 0.0.0.0 --port 8000 --reload
 * 4. Ready to demo! 
 */

// ============================================
// HOTSPOT MODE 
// Hotspot IP confirmed: 192.168.137.1
// ============================================
export const API_BASE_URL = 'http://192.168.137.1:8000';
export const WS_BASE_URL = 'ws://192.168.137.1:8000';


// ============================================
// HOME WIFI 
// ============================================
// export const API_BASE_URL = 'http://192.168.0.161:8000';
// export const WS_BASE_URL = 'ws://192.168.0.161:8000';


// ============================================
// USB CABLE (Emergency backup)
// ============================================
// export const API_BASE_URL = 'http://localhost:8000';
// export const WS_BASE_URL = 'ws://10.0.2.2:8000';