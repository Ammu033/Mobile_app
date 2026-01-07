import { Linking, Alert, Share } from 'react-native';

// Share to WhatsApp (opens contact picker if no phone number)
export const shareToWhatsApp = async (message: string, phoneNumber?: string) => {
  try {
    if (phoneNumber) {
      // Send to specific number
      const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
      const url = `whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
      
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        return true;
      }
    } else {
      // Open WhatsApp to choose contact
      const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
      
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        return true;
      }
    }
    
    // Fallback to native share
    await Share.share({ message });
    return true;
  } catch (error) {
    console.error('Share error:', error);
    try {
      await Share.share({ message });
      return true;
    } catch (e) {
      Alert.alert('Error', 'Failed to share');
      return false;
    }
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
_Submitted via EasyAccess App_
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
📅 *Appointment Confirmed*

👨‍💼 *With:* ${staffName}
📆 *Date:* ${date}
🕐 *Time:* ${time}

*Reason:*
${reason}

---
_Booked via EasyAccess App_
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
_Shared from EasyAccess App_
  `.trim();

  return shareToWhatsApp(message);
};

// Generic share function (uses native share sheet)
export const shareGeneric = async (message: string, title?: string) => {
  try {
    await Share.share({
      message,
      title: title || 'Share',
    });
    return true;
  } catch (error) {
    console.error('Share error:', error);
    return false;
  }
};

// Send email (opens email app)
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
    console.error('Email error:', error);
    Alert.alert('Error', 'Failed to open email app.');
    return false;
  }
};