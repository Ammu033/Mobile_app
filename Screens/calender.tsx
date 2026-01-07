import React, { useState,  useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { bookAppointment } from '../Api/appointmentService';
import { shareAppointmentToWhatsApp } from '../Api/shareUtils';
import { sendAppointmentEmail } from '../Api/emailService';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  available: boolean;
  phone: string;
}

export default function Calendar({ navigation }: any) {
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [dates, setDates] = useState<any[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);

  // Generate next 14 days dynamically
  const generateDates = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const dateArray = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      dateArray.push({
        day: date.getDate().toString(),
        label: days[date.getDay()],
        month: months[date.getMonth()],
        fullDate: date.toISOString().split('T')[0], // YYYY-MM-DD format
        isPast: false,
      });
    }
    
    return dateArray;
  };

  // Generate time slots (9 AM - 5 PM, excluding lunch 12-2 PM)
  const generateTimeSlots = () => {
    const slots = [];
    
    // Morning slots (9 AM - 12 PM)
    for (let hour = 9; hour <= 11; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00 AM`);
    }
    
    slots.push('12:00 PM');
    
    // Afternoon slots (2 PM - 5 PM)
    for (let hour = 2; hour <= 5; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00 PM`);
    }
    
    return slots;
  };

  // Check if time slot is available (not in the past)
  const isTimeSlotAvailable = (date: string, time: string) => {
    if (!date) return true;
    
    const now = new Date();
    const selectedDateTime = new Date(date);
    
    // Parse time
    const [timeStr, period] = time.split(' ');
    let [hours, minutes] = timeStr.split(':').map(Number);
    
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    selectedDateTime.setHours(hours, minutes, 0, 0);
    
    // Return true if the selected time is in the future
    return selectedDateTime > now;
  };

  useEffect(() => {
    // Generate dates and time slots on mount
    setDates(generateDates());
    setTimeSlots(generateTimeSlots());
  }, []);

  const staffMembers = [
    {
      id: '1',
      name: 'Harpreet Singh',
      role: 'Sarpanch (Head)',
      available: true,
      phone: '+91 98765 43210',
    },
    {
      id: '2',
      name: 'Kulwinder Kaur',
      role: 'Secretary',
      available: true,
      phone: '+91 98765 43211',
    },
    {
      id: '3',
      name: 'Manjeet Singh',
      role: 'Panch Member',
      available: false,
      phone: '+91 98765 43212',
    },
    {
      id: '4',
      name: 'Gurpreet Kaur',
      role: 'Panch Member',
      available: true,
      phone: '+91 98765 43213',
    },
  ];

  const handleBooking = async () => {
  if (!selectedStaff || !selectedDate || !selectedTime || !reason) {
    Alert.alert('Error', 'Please fill all required fields');
    return;
  }

  const staff = staffMembers.find(s => s.id === selectedStaff);

  try {
    // Get user info from AsyncStorage (or use profile state)
    const userProfile = await AsyncStorage.getItem('userProfile');
    const user = userProfile ? JSON.parse(userProfile) : null;

    const userName = user?.name || 'Amanpreet Singh';
    const userEmail = user?.email || 'amaanpreet03@gmail.com';
    const userPhone = user?.phone || '+91XXXXXXXXXX';

    // Save appointment
    await bookAppointment({
      userId: 'USER_123',
      userName: userName,
      userPhone: userPhone,
      userEmail: userEmail,
      staffId: selectedStaff,
      staffName: staff?.name || '',
      staffPhone: staff?.phone || '',
      date: selectedDate,
      time: selectedTime,
      reason,
      status: 'Pending',
    });

    // Send email with dynamic user info
    const emailSent = await sendAppointmentEmail(
      userName,              // Uses actual user name
      userEmail,             // Uses actual user email
      staff?.name || '',
      selectedDate,
      selectedTime,
      reason
    );

    if (emailSent) {
      Alert.alert(
        '✅ Success!',
        `Appointment booked! Confirmation email sent to ${userEmail}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } else {
      Alert.alert(
        'Appointment Booked',
        'Appointment saved successfully, but email failed to send.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  } catch (error) {
    console.error('Booking error:', error);
    Alert.alert('Error', 'Failed to book appointment. Please try again.');
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
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, selectedStaff && styles.stepCircleActive]}>
                <Text style={[styles.stepNumber, selectedStaff && styles.stepNumberActive]}>1</Text>
              </View>
              <Text style={styles.stepLabel}>Select Staff</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, selectedDate && styles.stepCircleActive]}>
                <Text style={[styles.stepNumber, selectedDate && styles.stepNumberActive]}>2</Text>
              </View>
              <Text style={styles.stepLabel}>Pick Date & Time</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, reason && styles.stepCircleActive]}>
                <Text style={[styles.stepNumber, reason && styles.stepNumberActive]}>3</Text>
              </View>
              <Text style={styles.stepLabel}>Confirm</Text>
            </View>
          </View>

          {/* Staff Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Council Member</Text>
            {staffMembers.map((staff) => (
              <TouchableOpacity
                key={staff.id}
                style={[
                  styles.staffCard,
                  selectedStaff === staff.id && styles.staffCardActive,
                  !staff.available && styles.staffCardDisabled,
                ]}
                onPress={() => staff.available && setSelectedStaff(staff.id)}
                disabled={!staff.available}
              >
                <View style={styles.staffAvatar}>
                  <MaterialCommunityIcons
                    name="account"
                    size={32}
                    color={selectedStaff === staff.id ? '#fff' : '#252d6e'}
                  />
                </View>
                <View style={styles.staffInfo}>
                  <Text
                    style={[
                      styles.staffName,
                      selectedStaff === staff.id && styles.staffNameActive,
                    ]}
                  >
                    {staff.name}
                  </Text>
                  <Text style={styles.staffRole}>{staff.role}</Text>
                  <Text style={styles.staffPhone}>{staff.phone}</Text>
                </View>
                {staff.available ? (
                  <View style={styles.availableBadge}>
                    <View style={styles.availableDot} />
                    <Text style={styles.availableText}>Available</Text>
                  </View>
                ) : (
                  <View style={styles.unavailableBadge}>
                    <Text style={styles.unavailableText}>Unavailable</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Date Selection */}
          {selectedStaff && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Date</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.dateScroll}
              >
                {dates.map((date, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dateCard,
                      selectedDate === `${date.day} ${date.month}` && styles.dateCardActive,
                    ]}
                    onPress={() => setSelectedDate(`${date.day} ${date.month}`)}
                  >
                    <Text
                      style={[
                        styles.dateLabel,
                        selectedDate === `${date.day} ${date.month}` && styles.dateLabelActive,
                      ]}
                    >
                      {date.label}
                    </Text>
                    <Text
                      style={[
                        styles.dateDay,
                        selectedDate === `${date.day} ${date.month}` && styles.dateDayActive,
                      ]}
                    >
                      {date.day}
                    </Text>
                    <Text
                      style={[
                        styles.dateMonth,
                        selectedDate === `${date.day} ${date.month}` && styles.dateMonthActive,
                      ]}
                    >
                      {date.month}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Time Selection */}
          {selectedDate && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Time</Text>
              <View style={styles.timeGrid}>
                {timeSlots.map((time, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.timeSlot,
                      selectedTime === time && styles.timeSlotActive,
                    ]}
                    onPress={() => setSelectedTime(time)}
                  >
                    <Text
                      style={[
                        styles.timeText,
                        selectedTime === time && styles.timeTextActive,
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Reason */}
          {selectedTime && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reason for Visit</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Please describe the purpose of your visit"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={reason}
                onChangeText={setReason}
              />
            </View>
          )}

          {/* Booking Summary */}
          {reason && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Booking Summary</Text>
              <View style={styles.summaryRow}>
                <MaterialCommunityIcons name="account" size={20} color="#666" />
                <Text style={styles.summaryText}>
                  {staffMembers.find(s => s.id === selectedStaff)?.name}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <MaterialCommunityIcons name="calendar" size={20} color="#666" />
                <Text style={styles.summaryText}>{selectedDate}</Text>
              </View>
              <View style={styles.summaryRow}>
                <MaterialCommunityIcons name="clock-outline" size={20} color="#666" />
                <Text style={styles.summaryText}>{selectedTime}</Text>
              </View>
            </View>
          )}

          {/* Book Button */}
          {reason && (
            <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
              <Text style={styles.bookButtonText}>Confirm Booking</Text>
              <MaterialCommunityIcons name="check-circle" size={20} color="#fff" />
            </TouchableOpacity>
          )}
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
  paddingHorizontal: 16,
  paddingTop: 48,
  paddingBottom: 16,
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
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: '#4CAF50',
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#999',
  },
  stepNumberActive: {
    color: '#fff',
  },
  stepLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a2456',
    marginBottom: 16,
  },
  staffCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  staffCardActive: {
    borderColor: '#252d6e',
    backgroundColor: '#252d6e',
  },
  staffCardDisabled: {
    opacity: 0.5,
  },
  staffAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a2456',
    marginBottom: 4,
  },
  staffNameActive: {
    color: '#fff',
  },
  staffRole: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  staffPhone: {
    fontSize: 12,
    color: '#999',
  },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  availableDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  availableText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  unavailableBadge: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  unavailableText: {
    fontSize: 12,
    color: '#F44336',
    fontWeight: '600',
  },
  dateScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  dateCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 12,
    width: 80,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  dateCardActive: {
    backgroundColor: '#252d6e',
    borderColor: '#252d6e',
  },
  dateLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  dateLabelActive: {
    color: '#fff',
  },
  dateDay: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a2456',
    marginBottom: 2,
  },
  dateDayActive: {
    color: '#fff',
  },
  dateMonth: {
    fontSize: 12,
    color: '#666',
  },
  dateMonthActive: {
    color: '#fff',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeSlot: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    minWidth: '30%',
    alignItems: 'center',
  },
  timeSlotActive: {
    backgroundColor: '#252d6e',
    borderColor: '#252d6e',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a2456',
  },
  timeTextActive: {
    color: '#fff',
  },
  textArea: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#1a2456',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 100,
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a2456',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  summaryText: {
    fontSize: 16,
    color: '#666',
  },
  bookButton: {
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});