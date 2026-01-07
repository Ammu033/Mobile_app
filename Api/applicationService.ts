import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Application {
  id?: string;
  userId: string;
  serviceName: string;
  serviceCategory: string;
  fullName: string;
  aadhar: string;
  phone: string;
  email: string;
  address: string;
  pincode: string;
  documents: string[];
  status: 'Submitted' | 'Reviewing' | 'Approved' | 'Rejected';
  createdAt: Date;
  updatedAt: Date;
  remarks?: string;
}

const STORAGE_KEY = 'applications';

const getAllApplications = async (): Promise<Application[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const apps = JSON.parse(data);
    return apps.map((a: any) => ({
      ...a,
      createdAt: new Date(a.createdAt),
      updatedAt: new Date(a.updatedAt),
    }));
  } catch (error) {
    return [];
  }
};

export const submitApplication = async (
  application: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>
) => {
  try {
    const applications = await getAllApplications();
    const newApp: Application = {
      ...application,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    applications.unshift(newApp);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
    console.log('✅ Application saved locally');
    return newApp.id;
  } catch (error) {
    console.error('Error submitting application:', error);
    throw error;
  }
};

export const getUserApplications = async (userId: string): Promise<Application[]> => {
  const all = await getAllApplications();
  return all.filter((a) => a.userId === userId);
};

export const subscribeToApplications = (
  userId: string,
  callback: (applications: Application[]) => void
) => {
  getUserApplications(userId).then(callback);
  return () => {};
};

export const updateApplicationStatus = async (
  applicationId: string,
  status: 'Submitted' | 'Reviewing' | 'Approved' | 'Rejected',
  remarks?: string
) => {
  try {
    const applications = await getAllApplications();
    const index = applications.findIndex((a) => a.id === applicationId);
    if (index !== -1) {
      applications[index].status = status;
      applications[index].remarks = remarks || '';
      applications[index].updatedAt = new Date();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
    }
  } catch (error) {
    console.error('Error updating application:', error);
    throw error;
  }
};

export const deleteApplication = async (applicationId: string) => {
  try {
    console.log('🗑️ Deleting application:', applicationId);
    
    const applications = await getAllApplications();
    const filtered = applications.filter((a) => a.id !== applicationId);
    
    console.log(`📊 Applications before: ${applications.length}, after: ${filtered.length}`);
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    console.log('✅ Application deleted successfully');
    
    return true;
  } catch (error) {
    console.error('❌ Error deleting application:', error);
    throw error;
  }
};