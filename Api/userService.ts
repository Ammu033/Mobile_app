import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  village: string;
  pincode: string;
  isVerified: boolean;
  createdAt: string;
  lastLogin: string;
}

// Check if email already exists
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const users = await getAllUsers();
    return users.some(user => user.email.toLowerCase() === email.toLowerCase());
  } catch (error) {
    return false;
  }
};

// Get all registered users
const getAllUsers = async (): Promise<User[]> => {
  try {
    const data = await AsyncStorage.getItem('registeredUsers');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
};

// Register new user
export const registerUser = async (
  email: string,
  name: string,
  phone: string,
  village: string,
  pincode: string,
  isVerified: boolean = false
): Promise<string> => {
  try {
    const users = await getAllUsers();
    
    // Check if email exists
    if (await checkEmailExists(email)) {
      throw new Error('Email already registered');
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      email,
      name,
      phone,
      village,
      pincode,
      isVerified,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    users.push(newUser);
    await AsyncStorage.setItem('registeredUsers', JSON.stringify(users));
    
    // Set as current user
    await AsyncStorage.setItem('currentUser', JSON.stringify(newUser));
    await AsyncStorage.setItem('isLoggedIn', 'true');

    return newUser.id;
  } catch (error) {
    throw error;
  }
};

// Login existing user
export const loginUser = async (email: string): Promise<User | null> => {
  try {
    const users = await getAllUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (user) {
      // Update last login
      user.lastLogin = new Date().toISOString();
      await AsyncStorage.setItem('registeredUsers', JSON.stringify(users));
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));
      await AsyncStorage.setItem('isLoggedIn', 'true');
      return user;
    }

    return null;
  } catch (error) {
    return null;
  }
};

// Get current logged in user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const data = await AsyncStorage.getItem('currentUser');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (updates: Partial<User>): Promise<void> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return;

    const users = await getAllUsers();
    const index = users.findIndex(u => u.id === currentUser.id);

    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      await AsyncStorage.setItem('registeredUsers', JSON.stringify(users));
      await AsyncStorage.setItem('currentUser', JSON.stringify(users[index]));
    }
  } catch (error) {
    console.error('Update profile error:', error);
  }
};

// Logout
export const logoutUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('currentUser');
    await AsyncStorage.setItem('isLoggedIn', 'false');
  } catch (error) {
    console.error('Logout error:', error);
  }
};