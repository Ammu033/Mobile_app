import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Verification({ navigation }: any) {
  const [aadhaarImage, setAadhaarImage] = useState<string | null>(null);

  const handleUploadAadhaar = async () => {
    Alert.alert(
      'Upload Aadhaar',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission needed', 'Camera access is required');
              return;
            }

            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.8,
            });

            if (!result.canceled) {
              setAadhaarImage(result.assets[0].uri);
            }
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission needed', 'Gallery access is required');
              return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.8,
            });

            if (!result.canceled) {
              setAadhaarImage(result.assets[0].uri);
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleContinue = async () => {
    if (!aadhaarImage) {
      Alert.alert('Required', 'Please upload your Aadhaar card');
      return;
    }

    try {
      // Save verification status
      await AsyncStorage.setItem('isVerified', 'true');
      await AsyncStorage.setItem('aadhaarImage', aadhaarImage);
      
      // Go to profile setup
      navigation.replace('ProfileSetup');
    } catch (error) {
      Alert.alert('Error', 'Verification failed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.content}>
        {/* User Icon */}
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="account-circle-outline" size={80} color="#333" />
        </View>

        {/* Title */}
        <Text style={styles.title}>verification required</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>please upload picture of your adhaar</Text>

        {/* Camera Button */}
        <TouchableOpacity
          style={styles.cameraButton}
          onPress={handleUploadAadhaar}
        >
          {aadhaarImage ? (
            <Image source={{ uri: aadhaarImage }} style={styles.uploadedImage} />
          ) : (
            <MaterialCommunityIcons name="camera" size={50} color="#333" />
          )}
        </TouchableOpacity>

        {/* Continue Button (if image uploaded) */}
        {aadhaarImage && (
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  iconContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 18,
    color: '#333',
    marginBottom: 15,
    fontWeight: '400',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 50,
    textAlign: 'center',
  },
  cameraButton: {
    width: 120,
    height: 120,
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  continueButton: {
    marginTop: 40,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 0,
  },
  continueButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '400',
  },
});