import { db } from '../firebaseConfig';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';

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

// Add new report
export const addReport = async (report: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'reports'), {
      ...report,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding report:', error);
    throw error;
  }
};

// Get user's reports
export const getUserReports = async (userId: string): Promise<Report[]> => {
  try {
    const q = query(
      collection(db, 'reports'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const reports: Report[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reports.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Report);
    });
    
    return reports;
  } catch (error) {
    console.error('Error getting reports:', error);
    throw error;
  }
};

// Listen to report updates in real-time
export const subscribeToReports = (
  userId: string,
  callback: (reports: Report[]) => void
) => {
  const q = query(
    collection(db, 'reports'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const reports: Report[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      reports.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Report);
    });
    callback(reports);
  });
};

// Update report status (for admin)
export const updateReportStatus = async (
  reportId: string,
  status: 'Pending' | 'In Progress' | 'Resolved',
  progress: number
) => {
  try {
    const reportRef = doc(db, 'reports', reportId);
    await updateDoc(reportRef, {
      status,
      progress,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating report:', error);
    throw error;
  }
};

// Delete report
export const deleteReport = async (reportId: string) => {
  try {
    await deleteDoc(doc(db, 'reports', reportId));
  } catch (error) {
    console.error('Error deleting report:', error);
    throw error;
  }
};
