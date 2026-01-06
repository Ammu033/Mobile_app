import React from 'react';
import { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { getActivities, Activity } from '../Api/activitymanger';
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
    const [activities, setActivities] = useState<Activity[]>([]);

  // Load activities when screen comes into focus
    useFocusEffect(
    React.useCallback(() => {
      loadActivities();
    }, [])
  );

  const loadActivities = async () => {
    const recentActivities = await getActivities(5); // Get last 5 activities
    setActivities(recentActivities);
  };
  return (
    <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1a2456" />
        
        {/* Add paddingTop to header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back</Text>
            <Text style={styles.userName}>Amanpreet Singh</Text>
          </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}  // ADD THIS
        >
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

       {/* Recent Activity Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllActivities')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          {activities.length === 0 ? (
            <View style={styles.emptyActivity}>
              <MaterialCommunityIcons name="history" size={40} color="#ccc" />
              <Text style={styles.emptyText}>No recent activity</Text>
            </View>
          ) : (
            activities.map((activity) => (
              <View key={activity.id} style={styles.activityCard}>
                <View style={[styles.activityIcon, { backgroundColor: activity.color }]}>
                  <MaterialCommunityIcons 
                    name={activity.icon as any} 
                    size={24} 
                    color="#fff" 
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityDescription} numberOfLines={2}>
                    {activity.description}
                  </Text>
                  <Text style={styles.activityDate}>{activity.date}</Text>
                </View>
              </View>
            ))
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
  paddingTop: 48,  // Add this - pushes header down from status bar
  paddingBottom: 20,
  paddingHorizontal: 20,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
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
    paddingTop: 10
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
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  
  activityIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
 
  activityDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyActivity: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
  },
  viewAll: {
    fontSize: 14,
    color: '#252d6e',
    fontWeight: '600',
  },
});