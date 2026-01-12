import { Alert, Platform } from 'react-native';
import * as Calendar from 'expo-calendar';

export const handleAddCalendar = async (
  title: string,
  date: string,
  time: string,
  location: string,
  description: string
) => {
  try {
    console.log('=== Starting Calendar Add ===');
    console.log('Input - Title:', title);
    console.log('Input - Date:', date);
    console.log('Input - Time:', time);

    // Request calendar permissions
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    console.log('Permission status:', status);
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Calendar access is needed to add events.'
      );
      return;
    }

    // Get default calendar for the platform
    let calendarId: string | null = null;
        if (Platform.OS === 'android') {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const selectedCal = calendars.find(cal => cal.id === calendarId);
    console.log('📅 Writing to calendar:', selectedCal?.title);
    console.log('📅 Calendar source:', selectedCal?.source);
    
    Alert.alert(
        'Calendar Info',
        `Writing to: ${selectedCal?.title}\nSource: ${selectedCal?.source?.name || 'Unknown'}`,
        [{ text: 'OK' }]
    );
    }

    if (Platform.OS === 'ios') {
      calendarId = await Calendar.getDefaultCalendarAsync().then(cal => cal.id);
      console.log('iOS default calendar ID:', calendarId);
    } else {
      // Android: Find a writable calendar
      const calendars = await Calendar.getCalendarsAsync(
        Calendar.EntityTypes.EVENT
      );
      
      console.log('Android calendars found:', calendars.length);

      // Try to find primary calendar first
      const primaryCal = calendars.find(
        cal => cal.isPrimary && cal.allowsModifications
      );
      
      if (primaryCal) {
        calendarId = primaryCal.id;
      } else {
        // Find any writable calendar
        const writableCal = calendars.find(cal => cal.allowsModifications);
        calendarId = writableCal?.id || null;
      }

      console.log('Android selected calendar ID:', calendarId);
    }

    if (!calendarId) {
      Alert.alert('Error', 'No writable calendar found');
      return;
    }

    // Parse time range (e.g., "10:00 AM - 8:00 PM")
    const cleanDate = date.trim();
    const cleanTime = time.trim();
    
    let startTime: string;
    let endTime: string;

    // Check if time is a range
    if (cleanTime.includes('-')) {
      const [start, end] = cleanTime.split('-').map(t => t.trim());
      startTime = start;
      endTime = end;
      console.log('Time range detected - Start:', startTime, 'End:', endTime);
    } else {
      // Single time, add 1 hour
      startTime = cleanTime;
      endTime = cleanTime;
      console.log('Single time detected:', startTime);
    }

    // Convert "October 10, 2026" to "2026-10-10" format
    const convertToISODate = (dateStr: string) => {
  console.log('Converting date:', `"${dateStr}"`);
  
  // Month name to number mapping
  const months: { [key: string]: string } = {
    'january': '01', 'february': '02', 'march': '03', 'april': '04',
    'may': '05', 'june': '06', 'july': '07', 'august': '08',
    'september': '09', 'october': '10', 'november': '11', 'december': '12'
  };
  
  // Parse "October 10, 2026" manually
  const parts = dateStr.trim().split(' ');
  
  if (parts.length === 3) {
    const monthName = parts[0].toLowerCase();
    const day = parts[1].replace(',', '').padStart(2, '0');
    const year = parts[2];
    const month = months[monthName];
    
    if (month && day && year) {
      const result = `${year}-${month}-${day}`;
      console.log('Converted to:', result);
      return result;
    }
  }
  
  // Fallback to Date parsing
  const tempDate = new Date(dateStr);
  if (isNaN(tempDate.getTime())) {
    console.error('Date conversion failed');
    return null;
  }
  
  const year = tempDate.getFullYear();
  const month = String(tempDate.getMonth() + 1).padStart(2, '0');
  const day = String(tempDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

    // Parse time "10:00 AM" to 24-hour format "10:00"
    const parseTime = (timeStr: string) => {
      const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!timeMatch) return null;
      
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2];
      const period = timeMatch[3].toUpperCase();
      
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      return `${String(hours).padStart(2, '0')}:${minutes}`;
    };

    // Convert date and times
    const isoDate = convertToISODate(cleanDate);
    const startTime24 = parseTime(startTime);
    const endTime24 = parseTime(endTime);

    console.log('ISO Date:', isoDate);
    console.log('Start Time 24h:', startTime24);
    console.log('End Time 24h:', endTime24);

    if (!isoDate || !startTime24) {
      Alert.alert('Error', 'Invalid date or time format');
      return;
    }

    // Create dates in ISO format
    const eventStartDate = new Date(`${isoDate}T${startTime24}:00`);
    
    let eventEndDate: Date;
    if (cleanTime.includes('-') && endTime24) {
      eventEndDate = new Date(`${isoDate}T${endTime24}:00`);
    } else {
      // Add 1 hour if no end time
      eventEndDate = new Date(eventStartDate.getTime() + 60 * 60 * 1000);
    }

    console.log('Final start:', eventStartDate.toISOString());
    console.log('Final end:', eventEndDate.toISOString());

    if (isNaN(eventStartDate.getTime()) || isNaN(eventEndDate.getTime())) {
      Alert.alert('Error', 'Invalid date or time');
      return;
    }

    // Create event
    const eventDetails = {
      title: title || 'Untitled Event',
      startDate: eventStartDate,
      endDate: eventEndDate,
    //   timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      location: location || '',
      notes: description || '',
      alarms: [{ relativeOffset: -30 }],
    };

    console.log('Creating event with details:', eventDetails);

    const eventId = await Calendar.createEventAsync(calendarId, eventDetails);
    
    console.log('✅ Event created successfully with ID:', eventId);

    Alert.alert(
      'Success', 
      'Event added to your calendar! Open your Calendar app to view it.'
    );
    
  } catch (error) {
    console.error('❌ Calendar Error:', error);
    Alert.alert('Error');
  }
};