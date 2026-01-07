import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendOTPEmail } from '../Api/emailService';

export default function Login({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSignIn = async () => {
    if (!email) {
      Alert.alert('Required', 'Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Save OTP and email temporarily
      await AsyncStorage.setItem('tempOTP', otp);
      await AsyncStorage.setItem('tempEmail', email);
      await AsyncStorage.setItem('otpTimestamp', Date.now().toString());

      // Send OTP via email
      const emailSent = await sendOTPEmail(email, otp);

      setLoading(false);

      if (emailSent) {
        Alert.alert(
          '✅ OTP Sent!',
          `We've sent a 6-digit verification code to:\n${email}\n\nPlease check your inbox.`,
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('OTPVerify', { email })
            }
          ]
        );
      } else {
        Alert.alert(
          'Email Failed',
          'Could not send OTP. Please check your email and try again.',
          [
            { text: 'Try Again', onPress: () => handleSignIn() },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      }
    } catch (error) {
      setLoading(false);
      console.error('Login error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a2456" />
      
      <LinearGradient
        colors={['#1a2456', '#252d6e', '#2d3787']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoCircle}>
              <MaterialCommunityIcons name="domain" size={50} color="#FFD700" />
            </View>
            <Text style={styles.appName}>EasyAccess</Text>
            <Text style={styles.tagline}>Gram Panchayat Services</Text>
          </View>

          {/* Card Section */}
          <View style={styles.card}>
            <Text style={styles.welcomeText}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons 
                name="email-outline" 
                size={24} 
                color="#666" 
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              style={[styles.signInButton, loading && styles.signInButtonDisabled]}
              onPress={handleSignIn}
              disabled={loading}
            >
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={styles.signInGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#1a2456" size="small" />
                ) : (
                  <>
                    <Text style={styles.signInButtonText}>Sign In</Text>
                    <MaterialCommunityIcons name="arrow-right" size={20} color="#1a2456" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Info Text */}
            <View style={styles.infoContainer}>
              <MaterialCommunityIcons name="information" size={16} color="#666" />
              <Text style={styles.infoText}>
                We'll send a verification code to your email
              </Text>
            </View>
          </View>

          {/* Footer */}
          <Text style={styles.footer}>
            Secure login powered by OTP verification
          </Text>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: '#FFD700',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a2456',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#1a2456',
  },
  signInButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  signInButtonDisabled: {
    opacity: 0.6,
  },
  signInGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  signInButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a2456',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
  },
  footer: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginTop: 30,
  },
});