import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export const checkProfileCompletion = async (navigation: any): Promise<boolean> => {
  try {
    const profileData = await AsyncStorage.getItem('userProfile');
    
    if (!profileData) {
      Alert.alert(
        'Profile Required',
        'Please complete your profile before accessing this feature.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Profile', onPress: () => navigation.navigate('Profile') }
        ]
      );
      return false;
    }
    
    const profile = JSON.parse(profileData);
    
    // Check if profile is complete
    const isComplete = !!(
      profile.name && profile.name.trim() !== '' &&
      profile.phone && profile.phone.trim() !== '' &&
      profile.email && profile.email.trim() !== '' &&
      profile.village && profile.village.trim() !== '' &&
      profile.pincode && profile.pincode.trim() !== ''
    );
    
    if (!isComplete) {
      Alert.alert(
        'Incomplete Profile',
        'Please complete all profile fields before accessing this feature.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Complete Profile', onPress: () => navigation.navigate('Profile') }
        ]
      );
      return false;
    }
    
    // Check Aadhaar verification
    if (!profile.aadhaar || profile.aadhaar.length !== 12) {
      Alert.alert(
        'Aadhaar Required',
        'Please add your Aadhaar number in your profile.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Aadhaar', onPress: () => navigation.navigate('Profile') }
        ]
      );
      return false;
    }
    
    if (!profile.aadhaarVerified) {
      Alert.alert(
        'Aadhaar Verification Required',
        'Please verify your Aadhaar number before accessing this feature.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Verify Now', onPress: () => navigation.navigate('Profile') }
        ]
      );
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.error('Profile check error:', error);
    Alert.alert('Error', 'Failed to verify profile status');
    return false;
  }
};