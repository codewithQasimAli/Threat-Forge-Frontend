/**
 * @format
 */

import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  // Android auto-displays the system tray notification because the FCM
  // message includes a `notification` payload (set server-side).
  // No manual notification-building code needed here.
});

AppRegistry.registerComponent(appName, () => App);
