import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Linking, Alert } from 'react-native';

// Share via WhatsApp
export const shareToWhatsApp = async (message: string, phoneNumber?: string) => {
  try {
    let url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    
    if (phoneNumber) {
      // Format: Remove spaces, dashes, etc.
      const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
      url = `whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
    }

    const canOpen = await Linking.canOpenURL(url);
    
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    } else {
      Alert.alert(
        'WhatsApp Not Found',
        'WhatsApp is not installed on this device.'
      );
      return false;
    }
  } catch (error) {
    console.error('Error sharing to WhatsApp:', error);
    Alert.alert('Error', 'Failed to share via WhatsApp.');
    return false;
  }
};

// Share report to WhatsApp
export const shareReportToWhatsApp = (
  reportTitle: string,
  description: string,
  category: string,
  location: string,
  councilPhone?: string
) => {
  const message = `
🚨 *New Report Submitted*

📝 *Title:* ${reportTitle}
📂 *Category:* ${category}
📍 *Location:* ${location}

*Description:*
${description}

---
Submitted via EasyAccess App
  `.trim();

  return shareToWhatsApp(message, councilPhone);
};

// Share appointment to WhatsApp
export const shareAppointmentToWhatsApp = (
  staffName: string,
  date: string,
  time: string,
  reason: string,
  staffPhone?: string
) => {
  const message = `
📅 *Appointment Booked*

👤 *With:* ${staffName}
📆 *Date:* ${date}
🕐 *Time:* ${time}

*Reason:*
${reason}

---
Booked via EasyAccess App
  `.trim();

  return shareToWhatsApp(message, staffPhone);
};

// Share event details
export const shareEvent = async (
  title: string,
  date: string,
  time: string,
  location: string,
  description: string
) => {
  const message = `
🎉 *${title}*

📅 *Date:* ${date}
🕐 *Time:* ${time}
📍 *Location:* ${location}

${description}

---
Shared from EasyAccess App
  `.trim();

  try {
    if (await Sharing.isAvailableAsync()) {
      // For sharing with any app
      await Sharing.shareAsync('data:text/plain;base64,' + btoa(message));
    } else {
      // Fallback to WhatsApp
      await shareToWhatsApp(message);
    }
  } catch (error) {
    console.error('Error sharing event:', error);
  }
};

// Send email
export const sendEmail = async (
  to: string,
  subject: string,
  body: string
) => {
  const url = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    } else {
      Alert.alert('Error', 'No email app found on this device.');
      return false;
    }
  } catch (error) {
    console.error('Error opening email:', error);
    Alert.alert('Error', 'Failed to open email app.');
    return false;
  }
};

// Send appointment confirmation email
export const sendAppointmentEmail = (
  userEmail: string,
  staffName: string,
  date: string,
  time: string,
  reason: string
) => {
  const subject = `Appointment Confirmation - ${staffName}`;
  const body = `
Dear User,

Your appointment has been confirmed with the following details:

Council Member: ${staffName}
Date: ${date}
Time: ${time}
Reason: ${reason}

Please arrive 5 minutes before your scheduled time.

Thank you,
Panchayat Office
  `.trim();

  return sendEmail(userEmail, subject, body);
};
