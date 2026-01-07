import AsyncStorage from '@react-native-async-storage/async-storage';

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

const STORAGE_KEY = 'appointments';

const getAllAppointments = async (): Promise<Appointment[]> => {
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

export const bookAppointment = async (
  appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'reminderSent'>
) => {
  try {
    const appointments = await getAllAppointments();
    const newApp: Appointment = {
      ...appointment,
      id: Date.now().toString(),
      status: 'Pending',
      reminderSent: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    appointments.unshift(newApp);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
    console.log('✅ Appointment saved locally');
    return newApp.id;
  } catch (error) {
    console.error('Error booking appointment:', error);
    throw error;
  }
};

export const getUserAppointments = async (userId: string): Promise<Appointment[]> => {
  const all = await getAllAppointments();
  return all.filter((a) => a.userId === userId);
};

export const subscribeToAppointments = (
  userId: string,
  callback: (appointments: Appointment[]) => void
) => {
  getUserAppointments(userId).then(callback);
  return () => {};
};

export const updateAppointmentStatus = async (
  appointmentId: string,
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed'
) => {
  try {
    const appointments = await getAllAppointments();
    const index = appointments.findIndex((a) => a.id === appointmentId);
    if (index !== -1) {
      appointments[index].status = status;
      appointments[index].updatedAt = new Date();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
    }
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw error;
  }
};

export const markReminderSent = async (appointmentId: string) => {
  try {
    const appointments = await getAllAppointments();
    const index = appointments.findIndex((a) => a.id === appointmentId);
    if (index !== -1) {
      appointments[index].reminderSent = true;
      appointments[index].updatedAt = new Date();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
    }
  } catch (error) {
    console.error('Error marking reminder:', error);
    throw error;
  }
};