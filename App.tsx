import 'react-native-gesture-handler'; // Add this import at the very top
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { NavigationIndependentTree, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './Screens/Home';
import Form from './Screens/Form';
import Report from './Screens/Report';
import News from './Screens/News';
import Calendar from './Screens/calender';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Calendar" component={Calendar} />
        <Stack.Screen name="Report" component={Report} />
        <Stack.Screen name="Form" component={Form} />
        <Stack.Screen name="News" component={News} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})