import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser } from './userService';

export interface Activity {
  id: string;
  userId: string;
  type: 'report' | 'application' | 'appointment' | 'event';
  title: string;
  description: string;
  status: string;
  timestamp: string;
  icon: string;
  color: string;
  metadata?: any; // Store additional data
}

const ACTIVITY_KEY = 'userActivities';

// Add activity
export const addActivity = async (
  type: Activity['type'],
  title: string,
  description: string,
  status: string,
  metadata?: any
): Promise<void> => {
  try {
    const user = await getCurrentUser();
    const userId = user?.id || 'USER_123'; // Fallback if no user or no id
    
    console.log('📝 Adding activity for user:', userId);
    
    const activities = await getAllActivities();
    
    const iconMap = {
      report: 'alert-circle',
      application: 'file-document',
      appointment: 'calendar-clock',
      event: 'calendar-star',
    };
    
    const colorMap = {
      report: '#FF9800',
      application: '#2196F3',
      appointment: '#4CAF50',
      event: '#9C27B0',
    };
    
    const newActivity: Activity = {
      id: `activity_${Date.now()}`,
      userId: userId,
      type,
      title,
      description,
      status,
      timestamp: new Date().toISOString(),
      icon: iconMap[type],
      color: colorMap[type],
      metadata,
    };
    
    activities.unshift(newActivity);
    
    // Keep only last 50 activities
    const trimmed = activities.slice(0, 50);
    
    await AsyncStorage.setItem(ACTIVITY_KEY, JSON.stringify(trimmed));
    
    console.log('✅ Activity added:', newActivity.id);
  } catch (error) {
    console.error('Add activity error:', error);
  }
};


// Get all activities for current user
export const getAllActivities = async (): Promise<Activity[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const data = await AsyncStorage.getItem(ACTIVITY_KEY);
    const allActivities: Activity[] = data ? JSON.parse(data) : [];

    // Filter by current user
    return allActivities.filter(activity => activity.userId === user.id);
  } catch (error) {
    return [];
  }
};

// Get recent activities (last 5)
export const getRecentActivities = async (): Promise<Activity[]> => {
  try {
    const activities = await getAllActivities();
    return activities.slice(0, 5);
  } catch (error) {
    return [];
  }
};
 

// Update activity status
export const updateActivityStatus = async (
  activityId: any,
  newStatus: string
): Promise<void> => {
  try {
    const data = await AsyncStorage.getItem(ACTIVITY_KEY);
    if (!data) return;

    const activities: Activity[] = JSON.parse(data);
    const index = activities.findIndex(a => a.id === activityId);

    if (index !== -1) {
      activities[index].status = newStatus;
      await AsyncStorage.setItem(ACTIVITY_KEY, JSON.stringify(activities));
    }
  } catch (error) {
    console.error('Update activity error:', error);
  }
};

// Clear all activities
export const clearAllActivities = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ACTIVITY_KEY);
  } catch (error) {
    console.error('Clear activities error:', error);
  }
};