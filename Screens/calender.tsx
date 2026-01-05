import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Calendar() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Your calendar content here */}
      <Text style={styles.title}>Calendar Page</Text>
      <Text>Show your calendar here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1f4e',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginTop: 20,
  },
});