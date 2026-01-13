import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './Screens/Home';
import Form from './Screens/Form';
import Report from './Screens/Report';
import News from './Screens/News';
import Calendar from './Screens/calender';
import Profile from './Screens/Profile';
import EventDetail from './Screens/EventDetail';
import Login from './Screens/Login';
import OTPVerify from './Screens/OtpVerify';
import ProfileSetup from './Screens/Profilesetup';
import Verification from './Screens/Verification';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        // 
        
        screenOptions={{ headerShown: false }}
      >
        {/* r */}
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Calendar" component={Calendar} />
        <Stack.Screen name="Report" component={Report} />
        <Stack.Screen name="Form" component={Form} />
        <Stack.Screen name="News" component={News} />
        <Stack.Screen name="EventDetail" component={EventDetail} />
      </Stack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}