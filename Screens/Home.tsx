import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ImageSlider from '../Components/slider';
import Button from '../Components/Button';

export default function Home({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a2456" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome Back</Text>
          <Text style={styles.userName}>Amanpreet Singh</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <MaterialCommunityIcons name="account-circle" size={40} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Event Slider */}
        <View style={styles.sliderContainer}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <ImageSlider onPress={() => navigation.navigate('News')} />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.buttonGrid}>
            <View style={styles.buttonWrapper}>
              <Button
                title="Book Appointment"
                iconname="calendar-clock"
                onPress={() => navigation.navigate('Calendar')}
              />
            </View>
            
            <View style={styles.buttonWrapper}>
              <Button
                title="Report Issue"
                iconname="alert-circle"
                onPress={() => navigation.navigate('Report')}
              />
            </View>
          </View>

          <View style={styles.buttonGrid}>
            <View style={styles.buttonWrapper}>
              <Button
                title="Apply for Services"
                iconname="file-document"
                onPress={() => navigation.navigate('Form')}
              />
            </View>
            
            <View style={styles.buttonWrapper}>
              <Button
                title="News & Updates"
                iconname="newspaper"
                onPress={() => navigation.navigate('News')}
              />
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.recentActivity}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          <View style={styles.activityCard}>
            <View style={styles.activityIconContainer}>
              <MaterialCommunityIcons name="check-circle" size={24} color="#4CAF50" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Pension Application</Text>
              <Text style={styles.activityStatus}>Approved • 2 days ago</Text>
            </View>
          </View>

          <View style={styles.activityCard}>
            <View style={styles.activityIconContainer}>
              <MaterialCommunityIcons name="clock-outline" size={24} color="#FF9800" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Water Pipe Complaint</Text>
              <Text style={styles.activityStatus}>In Progress • 1 week ago</Text>
            </View>
          </View>
        </View>

        {/* Footer Info */}
        <View style={styles.footer}>
          <MaterialCommunityIcons name="information" size={20} color="#666" />
          <Text style={styles.footerText}>
            Need help? Contact Panchayat Office
          </Text>
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
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  greeting: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  userName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  profileButton: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sliderContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a2456',
    marginBottom: 12,
  },
  quickActions: {
    padding: 20,
    paddingTop: 10,
  },
  buttonGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 6,
  },
  recentActivity: {
    padding: 20,
    paddingTop: 10,
  },
  activityCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  activityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a2456',
    marginBottom: 4,
  },
  activityStatus: {
    fontSize: 13,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
});