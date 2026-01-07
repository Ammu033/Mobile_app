import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Report {
  id?: string;
  userId: string;
  category: string;
  title: string;
  description: string;
  postcode: string;
  imageUrl?: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

const STORAGE_KEY = 'reports';

// Get all reports from storage
const getAllReports = async (): Promise<Report[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const reports = JSON.parse(data);
    return reports.map((r: any) => ({
      ...r,
      createdAt: new Date(r.createdAt),
      updatedAt: new Date(r.updatedAt),
    }));
  } catch (error) {
    console.error('Error loading reports:', error);
    return [];
  }
};

// Add new report
export const addReport = async (report: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const reports = await getAllReports();
    const newReport: Report = {
      ...report,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    reports.unshift(newReport); // Add to beginning
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    console.log('✅ Report saved locally');
    return newReport.id;
  } catch (error) {
    console.error('Error adding report:', error);
    throw error;
  }
};

// Get user's reports
export const getUserReports = async (userId: string): Promise<Report[]> => {
  const all = await getAllReports();
  return all.filter((r) => r.userId === userId);
};

// Subscribe to reports (mock real-time)
export const subscribeToReports = (
  userId: string,
  callback: (reports: Report[]) => void
) => {
  getUserReports(userId).then(callback);
  return () => {};
};

// Update report status
export const updateReportStatus = async (
  reportId: string,
  status: 'Pending' | 'In Progress' | 'Resolved',
  progress: number
) => {
  try {
    const reports = await getAllReports();
    const index = reports.findIndex((r) => r.id === reportId);
    if (index !== -1) {
      reports[index].status = status;
      reports[index].progress = progress;
      reports[index].updatedAt = new Date();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    }
  } catch (error) {
    console.error('Error updating report:', error);
    throw error;
  }
};

// Delete report

export const deleteReport = async (reportId: string) => {
  try {
    console.log('🗑️ Deleting report:', reportId);
    
    const reports = await getAllReports();
    const filtered = reports.filter((r) => r.id !== reportId);
    
    console.log(`📊 Reports before: ${reports.length}, after: ${filtered.length}`);
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    console.log('✅ Report deleted successfully');
    
    return true;
  } catch (error) {
    console.error('❌ Error deleting report:', error);
    throw error;
  }
};