import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Activity {
  id: string;
  type: 'report' | 'complaint' | 'service' | 'payment' | 'document';
  title: string;
  description: string;
  timestamp: number;
  date: string;
  icon: string;
  color: string;
  status?: string;
  metadata?: any; // Additional data specific to each activity type
}

const ACTIVITIES_KEY = '@activities';

// Add a new activity
export const addActivity = async (
  type: Activity['type'],
  title: string,
  description: string,
  metadata?: any
): Promise<boolean> => {
  try {
    const newActivity: Activity = {
      id: `${type}_${Date.now()}`,
      type,
      title,
      description,
      timestamp: Date.now(),
      date: new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      icon: getIconForType(type),
      color: getColorForType(type),
      metadata,
    };

    // Get existing activities
    const existing = await AsyncStorage.getItem(ACTIVITIES_KEY);
    const activities: Activity[] = existing ? JSON.parse(existing) : [];

    // Add new activity at the beginning
    activities.unshift(newActivity);

    // Keep only last 50 activities to avoid storage issues
    const limitedActivities = activities.slice(0, 50);

    // Save back to storage
    await AsyncStorage.setItem(ACTIVITIES_KEY, JSON.stringify(limitedActivities));

    return true;
  } catch (error) {
    console.error('Error adding activity:', error);
    return false;
  }
};

// Get all activities
export const getActivities = async (limit?: number): Promise<Activity[]> => {
  try {
    const existing = await AsyncStorage.getItem(ACTIVITIES_KEY);
    const activities: Activity[] = existing ? JSON.parse(existing) : [];

    // Return limited number if specified
    return limit ? activities.slice(0, limit) : activities;
  } catch (error) {
    console.error('Error getting activities:', error);
    return [];
  }
};

// Get activities by type
export const getActivitiesByType = async (
  type: Activity['type'],
  limit?: number
): Promise<Activity[]> => {
  try {
    const allActivities = await getActivities();
    const filtered = allActivities.filter((activity) => activity.type === type);
    return limit ? filtered.slice(0, limit) : filtered;
  } catch (error) {
    console.error('Error getting activities by type:', error);
    return [];
  }
};

// Clear all activities
export const clearActivities = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(ACTIVITIES_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing activities:', error);
    return false;
  }
};

// Delete specific activity
export const deleteActivity = async (activityId: string): Promise<boolean> => {
  try {
    const existing = await AsyncStorage.getItem(ACTIVITIES_KEY);
    const activities: Activity[] = existing ? JSON.parse(existing) : [];

    const filtered = activities.filter((activity) => activity.id !== activityId);

    await AsyncStorage.setItem(ACTIVITIES_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting activity:', error);
    return false;
  }
};

// Helper functions
function getIconForType(type: Activity['type']): string {
  switch (type) {
    case 'report':
      return 'file-document';
    case 'complaint':
      return 'alert-circle';
    case 'service':
      return 'hand-heart';
    case 'payment':
      return 'cash';
    case 'document':
      return 'file-pdf-box';
    default:
      return 'information';
  }
}

function getColorForType(type: Activity['type']): string {
  switch (type) {
    case 'report':
      return '#2196F3';
    case 'complaint':
      return '#FF9800';
    case 'service':
      return '#4CAF50';
    case 'payment':
      return '#9C27B0';
    case 'document':
      return '#F44336';
    default:
      return '#757575';
  }
}