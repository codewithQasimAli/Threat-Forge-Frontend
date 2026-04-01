/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View, Text, Image, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Signup from './src/screens/Signup'
import Login from './src/screens/Login'
import OTPVerification from './src/screens/OTPVerification'
import ResetPassword from './src/screens/ResetPassword'
import ForgetPassword from './src/screens/ForgetPassword'
import OTPReset from './src/screens/OTPReset'
import UpdateProfile from './src/screens/UpdateProfile'
import AddDevice from './src/screens/AddDevice'
import UpdateDevice from './src/screens/UpdateDevice'
import NotificationSettings from './src/screens/NotificationSettings'
import Settings from './src/screens/Settings'
import AppTabs from './src/navigation/Tabs';
import { UserProvider } from './src/context/UserContext'; 



const Stack = createNativeStackNavigator()

const StackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName='Login'
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: '#1d8ca9' },
        headerTintColor: '#fff',
        headerTitle: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              source={require('./assets/logo5.png')}
              style={{ width: 35, height: 35, marginRight: 8 }}
              resizeMode="contain"
            />
            <Text
              style={{
                color: 'white',
                fontSize: 23,
                fontWeight: 'bold',
                letterSpacing: 0.5,
              }}
            >
              THREAT FORGE
            </Text>
          </View>
        ),
        headerRight: () => (
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
            <Ionicons name="settings-outline" size={18} color="#fff" />
          </TouchableOpacity>
        ),
      })}

    >
      <Stack.Screen name='Signup' component={Signup} options={{ headerShown: false } } />
      <Stack.Screen name='Login' component={Login} options={{ headerShown: false } } />
      <Stack.Screen name="OTP" component={OTPVerification} options={{ headerShown: false } } />
      <Stack.Screen name="ForgetPassword" component={ForgetPassword} options={{ headerShown: false } } />
      <Stack.Screen name="OTPReset" component={OTPReset} options={{ headerShown: false } } />
      <Stack.Screen name="ResetPassword" component={ResetPassword} options={{ headerRight: () => null }} />
      <Stack.Screen name="UpdateProfile" component={UpdateProfile} options={{ headerRight: () => null }} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettings} options={{ headerRight: () => null }} />
      <Stack.Screen name="Settings" component={Settings} options={{ headerRight: () => null }} />
      <Stack.Screen name="AddDevice" component={AddDevice} />
      <Stack.Screen name="UpdateDevice" component={UpdateDevice} />
      <Stack.Screen
        name="Main"
        component={AppTabs}
        options={{ headerShown: true }}
      />
    </Stack.Navigator>

  )
}
function App() {
  return (
    <UserProvider>
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
    </UserProvider>
  );
}



export default App;
