import React, { useState, useRef, useEffect } from 'react';
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
  Dimensions 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendOTPEmail } from '../Api/emailService';


export default function OTPVerify({ route, navigation }: any) {
  const { email } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // Start timer
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOTPChange = (value: string, index: number) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const enteredOTP = otp.join('');

    if (enteredOTP.length !== 6) {
      Alert.alert('Incomplete', 'Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);

    try {
      const savedOTP = await AsyncStorage.getItem('tempOTP');
      const timestamp = await AsyncStorage.getItem('otpTimestamp');

      // Check if OTP expired (10 minutes)
      if (timestamp) {
        const timePassed = Date.now() - parseInt(timestamp);
        if (timePassed > 10 * 60 * 1000) {
          Alert.alert('Expired', 'OTP has expired. Please request a new one.');
          setLoading(false);
          return;
        }
      }

      if (enteredOTP === savedOTP) {
        // Check if user exists
        const existingUser = await AsyncStorage.getItem('userProfile');

        if (existingUser) {
          // Existing user - login
          await AsyncStorage.setItem('isLoggedIn', 'true');
          await AsyncStorage.setItem('userEmail', email);
          
          Alert.alert(
            '✅ Welcome Back!',
            'You have been logged in successfully',
            [{ text: 'Continue', onPress: () => navigation.replace('Home') }]
          );
        } else {
          // New user - go to verification (optional)
          await AsyncStorage.setItem('userEmail', email);
          
          Alert.alert(
            '✅ Email Verified!',
            'First time? No worries! Just fill in a few details on the next page and you are all set',
            [
              {
                text: 'ok',
                onPress: () => navigation.replace('ProfileSetup', { email, skipVerification: true })
              }
              
            ]
          );
        }
      } else {
        Alert.alert('Invalid OTP', 'The code you entered is incorrect. Please try again.');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Verification failed. Please try again.');
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    try {
      const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
      await AsyncStorage.setItem('tempOTP', newOTP);
      await AsyncStorage.setItem('otpTimestamp', Date.now().toString());

      const sent = await sendOTPEmail(email, newOTP);

      if (sent) {
        Alert.alert('✅ OTP Resent!', 'A new code has been sent to your email');
        setTimer(300);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        Alert.alert('Failed', 'Could not resend OTP. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a2456" />
      
      <LinearGradient
        colors={['#1a2456', '#252d6e', '#2d3787']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="email-check" size={60} color="#FFD700" />
            </View>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to{'\n'}
              <Text style={styles.email}>{email}</Text>
            </Text>

            {/* OTP Inputs */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  style={[styles.otpInput, digit && styles.otpInputFilled]}
                  value={digit}
                  onChangeText={(value) => handleOTPChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>

            {/* Timer */}
            <View style={styles.timerContainer}>
              <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
              <Text style={styles.timerText}>
                Code expires in: {formatTime(timer)}
              </Text>
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
              onPress={handleVerify}
              disabled={loading}
            >
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={styles.verifyGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#1a2456" />
                ) : (
                  <>
                    <Text style={styles.verifyButtonText}>Verify & Continue</Text>
                    <MaterialCommunityIcons name="check-circle" size={20} color="#1a2456" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Resend */}
            <TouchableOpacity
              style={styles.resendContainer}
              onPress={handleResendOTP}
              disabled={!canResend}
            >
              <Text style={styles.resendText}>Didn't receive the code? </Text>
              <Text style={[styles.resendLink, !canResend && styles.resendLinkDisabled]}>
                {canResend ? 'Resend OTP' : `Wait ${formatTime(timer)}`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
const { width } = Dimensions.get('window');
const boxSize = Math.min((width - 100) / 6, 50);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFD700',
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a2456',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  email: {
    fontWeight: '600',
    color: '#252d6e',
  },
  otpContainer: {
  flexDirection: 'row',
  justifyContent: 'center',
  gap: 6,
  marginBottom: 24,
  paddingHorizontal: 20,
  // flexWrap: 'wrap', 
},
  otpInput: {
  width: boxSize,
  height: boxSize + 5,
  borderWidth: 2,
  borderColor: '#e0e0e0',
  borderRadius: 12,
  fontSize: 22,
  fontWeight: 'bold',
  textAlign: 'center',
  color: '#1a2456',
  backgroundColor: '#f5f5f5',
},
  otpInputFilled: {
    borderColor: '#FFD700',
    backgroundColor: '#fffbf0',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 20,
  },
  timerText: {
    fontSize: 13,
    color: '#666',
  },
  verifyButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    marginBottom: 20,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  verifyButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a2456',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#666',
  },
  resendLink: {
    fontSize: 14,
    color: '#252d6e',
    fontWeight: '600',
  },
  resendLinkDisabled: {
    color: '#999',
  },
});