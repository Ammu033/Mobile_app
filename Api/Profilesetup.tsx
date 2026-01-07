import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileSetup({ route, navigation }: any) {
  const { phoneNumber } = route.params;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [village, setVillage] = useState('');
  const [pincode, setPincode] = useState('');

  const handleComplete = async () => {
    if (!name || !village || !pincode) {
      Alert.alert('Required Fields', 'Please fill all required fields');
      return;
    }

    try {
      const userProfile = {
        name,
        phone: `+91${phoneNumber}`,
        email,
        village,
        pincode,
        createdAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem('userId', `user_${Date.now()}`);

      Alert.alert(
        'Welcome!',
        'Your profile has been created successfully',
        [{ text: 'Get Started', onPress: () => navigation.replace('Home') }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create profile');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a2456" />

      <View style={styles.header}>
        <MaterialCommunityIcons name="account-circle" size={80} color="#FFD700" />
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>Tell us about yourself</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={`+91 ${phoneNumber}`}
            editable={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="your.email@example.com"
            placeholderTextColor="#999"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Village Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your village name"
            placeholderTextColor="#999"
            value={village}
            onChangeText={setVillage}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Pincode *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter pincode"
            placeholderTextColor="#999"
            keyboardType="numeric"
            maxLength={6}
            value={pincode}
            onChangeText={setPincode}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleComplete}>
          <Text style={styles.buttonText}>Complete Setup</Text>
          <MaterialCommunityIcons name="check" size={20} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a2456',
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFD700',
    marginTop: 8,
  },
  content: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a2456',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#1a2456',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputDisabled: {
    backgroundColor: '#f0f0f0',
    color: '#999',
  },
  button: {
    backgroundColor: '#FFD700',
    padding: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 4,
    marginTop: 20,
    marginBottom: 40,
  },
  buttonText: {
    color: '#1a2456',
    fontSize: 18,
    fontWeight: 'bold',
  },
});