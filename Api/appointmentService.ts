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

export interface Appointment {
  id?: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail?: string;
  staffId: string;
  staffName: string;
  staffPhone: string;
  date: string;
  time: string;
  reason: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  createdAt: Date;
  updatedAt: Date;
  reminderSent?: boolean;
}

// Book new appointment
export const bookAppointment = async (
  appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'reminderSent'>
) => {
  try {
    const docRef = await addDoc(collection(db, 'appointments'), {
      ...appointment,
      status: 'Pending',
      reminderSent: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error booking appointment:', error);
    throw error;
  }
};

// Get user's appointments
export const getUserAppointments = async (userId: string): Promise<Appointment[]> => {
  try {
    const q = query(
      collection(db, 'appointments'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const appointments: Appointment[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      appointments.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Appointment);
    });
    
    return appointments;
  } catch (error) {
    console.error('Error getting appointments:', error);
    throw error;
  }
};

// Subscribe to appointment updates
export const subscribeToAppointments = (
  userId: string,
  callback: (appointments: Appointment[]) => void
) => {
  const q = query(
    collection(db, 'appointments'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const appointments: Appointment[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      appointments.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Appointment);
    });
    callback(appointments);
  });
};

// Update appointment status
export const updateAppointmentStatus = async (
  appointmentId: string,
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed'
) => {
  try {
    const appRef = doc(db, 'appointments', appointmentId);
    await updateDoc(appRef, {
      status,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw error;
  }
};

// Mark reminder as sent
export const markReminderSent = async (appointmentId: string) => {
  try {
    const appRef = doc(db, 'appointments', appointmentId);
    await updateDoc(appRef, {
      reminderSent: true,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error marking reminder:', error);
    throw error;
  }
};
