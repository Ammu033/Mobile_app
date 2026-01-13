import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserProfile {
  name: string;
  phone: string;
  email: string;
  village: string;
  pincode: string;
  aadhaar?: string;
  aadhaarVerified?: boolean;  // Add this
  profileCompleted?: boolean;
}

export default function Profile({ navigation }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Amanpreet Singh',
    phone: '+91 98765 43210',
    email: 'amanpreet@example.com',
    village: 'Village Name',
    pincode: '140001',
  });
  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);

  useEffect(() => {
  loadProfile();
}, []);

const loadProfile = async () => {
  try {
    const saved = await AsyncStorage.getItem('userProfile');
    console.log('Raw saved data:', saved);
    
    if (saved) {
      const data = JSON.parse(saved);
      
      // Fix invalid phone number
      if (data.phone === '+91undefined' || !data.phone) {
        data.phone = '';
      }
      
      console.log('Parsed profile data:', data);
      setProfile(data);
      setEditedProfile(data);
    } else {
      console.log(' No saved profile found, using default');
    }
  } catch (error) {
    console.error(' Error loading profile:', error);
  }
};





  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            // TODO: Clear auth token
            navigation.replace('Login'); // You'll need to create Login screen
          },
        },
      ]
    );
  };

  const calculateCompletion = () => {
  try {
    const fields = [
      profile?.name,
      profile?.phone,
      profile?.email,
      profile?.village,
      profile?.pincode,
      profile?.aadhaar
    ];
    
    const filled = fields.filter(f => f && typeof f === 'string' && f.trim() !== '').length;
    return Math.round((filled / fields.length) * 100);
  } catch (error) {
    console.error('Calculate completion error:', error);
    return 0;
  }
};
  const completion = calculateCompletion();

  const handleAadhaarVerification = () => {
  // Simple verification (in production, use actual Aadhaar API)
  if (profile.aadhaar && profile.aadhaar.length === 12) {
    Alert.alert(
      'Verify Aadhaar',
      'For demo purposes, Aadhaar will be verified automatically. In production, this would send an OTP to your registered mobile number.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Verify',
          onPress: async () => {
            // Simulate verification process
            const updatedProfile = {
              ...profile,
              aadhaarVerified: true,
              profileCompleted: isProfileComplete({...profile, aadhaarVerified: true})
            };
            
            await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
            await AsyncStorage.setItem('currentUser', JSON.stringify(updatedProfile));
            
            setProfile(updatedProfile);
            setEditedProfile(updatedProfile);
            
            Alert.alert(' Success', 'Aadhaar verified successfully!');
          }
        }
      ]
    );
  } else {
    Alert.alert('Error', 'Please enter a valid 12-digit Aadhaar number');
  }
};

const isProfileComplete = (prof: UserProfile) => {
  try {
    return !!(
      prof?.name?.trim() &&
      prof?.email?.trim() &&
      prof?.village?.trim() &&
      prof?.pincode?.trim() &&
      prof?.aadhaar?.length === 12 &&
      prof?.aadhaarVerified
    );
  } catch (error) {
    console.error('Profile check error:', error);
    return false;
  }
};

const saveProfile = async () => {
  try {
    console.log('💾 Saving profile:', editedProfile);
    
    const profileToSave = {
      ...editedProfile,
      profileCompleted: isProfileComplete(editedProfile)
    };
    
    await AsyncStorage.setItem('userProfile', JSON.stringify(profileToSave));
    await AsyncStorage.setItem('currentUser', JSON.stringify(profileToSave));
    
    const verify = await AsyncStorage.getItem('userProfile');
    console.log('✅ Verified saved data:', verify);
    
    setProfile(profileToSave);
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
  } catch (error) {
    console.error('❌ Error saving profile:', error);
    Alert.alert('Error', 'Failed to save profile');
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a2456" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => {
          if (isEditing) {
            setEditedProfile(profile);
          }
          setIsEditing(!isEditing);
        }}>
          <MaterialCommunityIcons 
            name={isEditing ? "close" : "pencil"} 
            size={24} 
            color="#fff" 
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Profile Picture */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <MaterialCommunityIcons name="account" size={80} color="#fff" />
            </View>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profilePhone}>{profile.phone}</Text>
          </View>


          {/* Profile Completion */}
          <View style={styles.completionCard}>
            <View style={styles.completionHeader}>
              <Text style={styles.completionTitle}>Profile Completion</Text>
              <Text style={styles.completionPercent}>{completion}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${completion}%` }]} />
            </View>
            {completion < 100 && (
              <Text style={styles.completionHint}>
                Complete your profile to access all features
              </Text>
            )}
          </View>

          {/* Profile Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="account" size={24} color="#252d6e" />
                <View style={styles.infoContent}>
                  
                  <Text style={styles.infoLabel}>Full Name</Text>
                  {isEditing ? (
                    <TextInput
                      style={styles.input}
                      value={editedProfile.name}
                      onChangeText={(text) => setEditedProfile({...editedProfile, name: text})}
                      placeholder="Enter your name"
                    />
                  ) : (
                    <Text style={styles.infoValue}>{profile.name}</Text>
                  )}
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="phone" size={24} color="#252d6e" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Phone Number</Text>
                  {isEditing ? (
                    <TextInput
                      style={styles.input}
                      value={editedProfile.phone}
                      onChangeText={(text) => setEditedProfile({...editedProfile, phone: text})}
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <Text style={styles.infoValue}>{profile.phone}</Text>
                  )}
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="email" size={24} color="#252d6e" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email</Text>
                  {isEditing ? (
                    <TextInput
                      style={styles.input}
                      value={editedProfile.email}
                      onChangeText={(text) => setEditedProfile({...editedProfile, email: text})}
                      placeholder="Enter email"
                      keyboardType="email-address"
                    />
                  ) : (
                    <Text style={styles.infoValue}>{profile.email}</Text>
                  )}
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="map-marker" size={24} color="#252d6e" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Village</Text>
                  {isEditing ? (
                    <TextInput
                      style={styles.input}
                      value={editedProfile.village}
                      onChangeText={(text) => setEditedProfile({...editedProfile, village: text})}
                      placeholder="Enter village name"
                    />
                  ) : (
                    <Text style={styles.infoValue}>{profile.village}</Text>
                  )}
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="mailbox" size={24} color="#252d6e" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Pincode</Text>
                  {isEditing ? (
                    <TextInput
                      style={styles.input}
                      value={editedProfile.pincode}
                      onChangeText={(text) => setEditedProfile({...editedProfile, pincode: text})}
                      placeholder="Enter pincode"
                      keyboardType="numeric"
                      maxLength={6}
                    />
                  ) : (
                    <Text style={styles.infoValue}>{profile.pincode}</Text>
                  )}
                </View>
              </View>
            </View>
          </View>
          {/* Aadhaar Verification Section */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Aadhaar Verification</Text>
  
  <View style={styles.infoCard}>
    <View style={styles.infoRow}>
      <MaterialCommunityIcons 
        name={profile.aadhaarVerified ? "shield-check" : "shield-alert"} 
        size={24} 
        color={profile.aadhaarVerified ? "#4CAF50" : "#FF9800"} 
      />
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>Aadhaar Number</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={editedProfile.aadhaar}
            onChangeText={(text) => setEditedProfile({...editedProfile, aadhaar: text})}
            placeholder="XXXX XXXX XXXX"
            keyboardType="numeric"
            maxLength={12}
          />
        ) : (
          <Text style={styles.infoValue}>
            {profile.aadhaar ? `XXXX XXXX ${profile.aadhaar.slice(-4)}` : 'Not provided'}
          </Text>
        )}
      </View>
      {profile.aadhaarVerified && (
        <MaterialCommunityIcons name="check-circle" size={24} color="#4CAF50" />
      )}
    </View>
    
    {!profile.aadhaarVerified && profile.aadhaar && (
      <TouchableOpacity 
        style={styles.verifyButton}
        onPress={() => handleAadhaarVerification()}
      >
        <MaterialCommunityIcons name="shield-check" size={20} color="#fff" />
        <Text style={styles.verifyButtonText}>Verify Aadhaar</Text>
      </TouchableOpacity>
    )}
    
    {!profile.aadhaarVerified && (
      <View style={styles.warningBox}>
        <MaterialCommunityIcons name="alert" size={20} color="#FF9800" />
        <Text style={styles.warningText}>
          Aadhaar verification required to access Report Issues, Book Appointments, and Submit Forms
        </Text>
      </View>
    )}
  </View>
</View>

          {/* Save Button */}
          {isEditing && (
            <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
              <MaterialCommunityIcons name="check" size={24} color="#fff" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          )}

          {/* Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>

            <TouchableOpacity style={styles.settingItem}>
              <MaterialCommunityIcons name="bell-outline" size={24} color="#252d6e" />
              <Text style={styles.settingText}>Notifications</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <MaterialCommunityIcons name="lock-outline" size={24} color="#252d6e" />
              <Text style={styles.settingText}>Privacy</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <MaterialCommunityIcons name="help-circle-outline" size={24} color="#252d6e" />
              <Text style={styles.settingText}>Help & Support</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <MaterialCommunityIcons name="information-outline" size={24} color="#252d6e" />
              <Text style={styles.settingText}>About</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={24} color="#F44336" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          <Text style={styles.version}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1a2456',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#252d6e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a2456',
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 16,
    color: '#666',
  },
  completionCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  completionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a2456',
  },
  completionPercent: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  completionHint: {
    fontSize: 13,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a2456',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoContent: {
    flex: 1,
    marginLeft: 16,
  },
  infoLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1a2456',
    fontWeight: '500',
  },
  input: {
    fontSize: 16,
    color: '#1a2456',
    fontWeight: '500',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
    elevation: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  settingItem: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#1a2456',
    marginLeft: 16,
  },
  logoutButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#F44336',
  },
  logoutText: {
    fontSize: 16,
    color: '#F44336',
    fontWeight: '600',
    marginLeft: 8,
  },
  version: {
    textAlign: 'center',
    fontSize: 13,
    color: '#999',
    marginBottom: 20,
  },
  verifyButton: {
  backgroundColor: '#4CAF50',
  padding: 14,
  borderRadius: 8,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  marginTop: 12,
},
verifyButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
},
warningBox: {
  flexDirection: 'row',
  backgroundColor: '#FFF3E0',
  padding: 12,
  borderRadius: 8,
  marginTop: 12,
  gap: 8,
},
warningText: {
  flex: 1,
  fontSize: 13,
  color: '#F57C00',
  lineHeight: 18,
},
});
