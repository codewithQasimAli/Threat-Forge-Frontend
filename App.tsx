/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View, Text, Image } from 'react-native';
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
import AppTabs from './src/navigation/Tabs';
import { UserProvider } from './src/context/UserContext'; 



const Stack = createNativeStackNavigator()

const StackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName='Login'
      screenOptions={{
        headerStyle: { backgroundColor: '#1976D2' },
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
      }}

    >
      <Stack.Screen name='Signup' component={Signup} />
      <Stack.Screen name='Login' component={Login} />
      <Stack.Screen name="OTP" component={OTPVerification} />
      <Stack.Screen name="ForgetPassword" component={ForgetPassword} />
      <Stack.Screen name="OTPReset" component={OTPReset} />
      <Stack.Screen name="ResetPassword" component={ResetPassword} />
      <Stack.Screen name="UpdateProfile" component={UpdateProfile} />
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
