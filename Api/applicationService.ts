import { db } from '../firebaseConfig';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';

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
  documents: string[]; // URLs of uploaded documents
  status: 'Submitted' | 'Reviewing' | 'Approved' | 'Rejected';
  createdAt: Date;
  updatedAt: Date;
  remarks?: string;
}

// Submit new application
export const submitApplication = async (
  application: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>
) => {
  try {
    const docRef = await addDoc(collection(db, 'applications'), {
      ...application,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error submitting application:', error);
    throw error;
  }
};

// Get user's applications
export const getUserApplications = async (userId: string): Promise<Application[]> => {
  try {
    const q = query(
      collection(db, 'applications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const applications: Application[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      applications.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Application);
    });
    
    return applications;
  } catch (error) {
    console.error('Error getting applications:', error);
    throw error;
  }
};

// Subscribe to application updates
export const subscribeToApplications = (
  userId: string,
  callback: (applications: Application[]) => void
) => {
  const q = query(
    collection(db, 'applications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const applications: Application[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      applications.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Application);
    });
    callback(applications);
  });
};

// Update application status (for admin)
export const updateApplicationStatus = async (
  applicationId: string,
  status: 'Submitted' | 'Reviewing' | 'Approved' | 'Rejected',
  remarks?: string
) => {
  try {
    const appRef = doc(db, 'applications', applicationId);
    await updateDoc(appRef, {
      status,
      remarks: remarks || '',
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating application:', error);
    throw error;
  }
};
