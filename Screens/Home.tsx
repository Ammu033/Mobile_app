import React from 'react';
import { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getRecentActivities, Activity } from '../Api/activitymanger';
import { getCurrentUser } from '../Api/userService';
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
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function Home({ navigation }: any) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [userName, setUserName] = useState('User');

  // Load user name
 
  const loadUserName = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setUserName(user.name);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  useEffect(() => {
  const initializeUser = async () => {
    await migrateUserData();
    await loadUserName();
  };
  
  initializeUser();
  }, []);

const migrateUserData = async () => {
  try {
    const userProfile = await AsyncStorage.getItem('userProfile');
    const currentUser = await AsyncStorage.getItem('currentUser');
    
    // If userProfile exists but currentUser doesn't, copy it
    if (userProfile && !currentUser) {
      await AsyncStorage.setItem('currentUser', userProfile);
      console.log('✅ Migrated userProfile to currentUser');
    }
  } catch (error) {
    console.error('Migration error:', error);
  }
};
  // Load activities when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadActivities();
    }, [])
  );

  const loadActivities = async () => {
    try {
      const recentActivities = await getRecentActivities();
      console.log('📊 Loaded activities:', recentActivities.length);
      setActivities(recentActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
      setActivities([]);
    }
  };

  // Format timestamp to readable date
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a2456" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
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
            <TouchableOpacity onPress={() => {
              // Navigate to all activities or show message
              if (activities.length > 0) {
                // You can create an AllActivities screen later
                console.log('View all activities');
              }
            }}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          {activities.length === 0 ? (
            <View style={styles.emptyActivity}>
              <MaterialCommunityIcons name="history" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No recent activity</Text>
              <Text style={styles.emptySubtext}>
                Your reports, appointments, and applications will appear here
              </Text>
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
                  
                    
                      
                    </View>
                    <Text style={styles.activityDate}>{formatDate(activity.timestamp)}</Text>
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
    paddingTop: 48,
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
    paddingTop: 10,
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
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAll: {
    fontSize: 14,
    color: '#252d6e',
    fontWeight: '600',
  },
  emptyActivity: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  activityCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
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
  activityDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  activityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activityDate: {
    fontSize: 12,
    color: '#999',
  },
});