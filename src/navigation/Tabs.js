import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Home from '../screens/Home';
import Devices from '../screens/Devices';
import Alerts from '../screens/Alerts';
import SimulationScreen from '../screens/SimulationScreen';
import NetworkLogsScreen from '../screens/NetworkLogsScreen';
import ReportsScreen from '../screens/ReportsScreen';
import Settings from '../screens/Settings';

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: '#1d8ca9', 
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: '#fff',    // active icon/text color
        tabBarInactiveTintColor: '#cfd8dc', // inactive color
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Home: 'home',
            Devices: 'hardware-chip',
            Alerts: 'notifications',
            Simulation: 'analytics',
            Logs: 'list',
            Reports: 'bar-chart',
            Settings: 'settings',
          };
          const iconName = icons[route.name] || 'ellipse';
          return <Ionicons name={focused ? iconName : `${iconName}-outline`} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Devices" component={Devices} />
      <Tab.Screen name="Alerts" component={Alerts} />
      <Tab.Screen name="Simulation" component={SimulationScreen} />
      <Tab.Screen name="Logs" component={NetworkLogsScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
}
