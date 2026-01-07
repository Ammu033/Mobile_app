

const SERVICE_ID = 'service_1ia7mwm';
const TEMPLATE_ID = 'template_rrk8nkz';
const PUBLIC_KEY = 'k8UyKb0b6TurR5SDx';


export const sendAppointmentEmail = async (
  userName: string,
  userEmail: string,
  staffName: string,
  date: string,
  time: string,
  reason: string
) => {
  try {
    console.log('📧 Sending email to:', userEmail);

    const emailData = {
      service_id: SERVICE_ID,
      template_id: TEMPLATE_ID,
      user_id: PUBLIC_KEY,
      template_params: {
        to_name: userName,
        to_email: userEmail,
        staff_name: staffName,
        appointment_date: date,
        appointment_time: time,
        reason: reason,
        from_name: 'EasyAccess Panchayat',
      }
    };

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (response.ok) {
      const result = await response.text();
      console.log('✅ Email sent successfully:', result);
      return true;
    } else {
      const error = await response.text();
      console.error('❌ Email failed:', error);
      return false;
    }
  } catch (error) {
    console.error('❌ Email error:', error);
    return false;
  }
};


export const sendReportConfirmation = async (
  userName: string,
  userEmail: string,
  reportTitle: string,
  reportId: string
) => {
  try {
    const emailData = {
      service_id: SERVICE_ID,
      template_id: 'template_report', 
      user_id: PUBLIC_KEY,
      template_params: {
        to_name: userName,
        to_email: userEmail,
        report_title: reportTitle,
        report_id: reportId,
        from_name: 'EasyAccess Panchayat',
      }
    };

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    return response.ok;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
};

export const sendOTPEmail = async (
  userEmail: string,
  otp: string,
  userName: string = 'User'
) => {
  try {
    console.log('📧 Sending OTP to:', userEmail);

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: SERVICE_ID,
        template_id: 'template_4jiagh5', 
        user_id: PUBLIC_KEY,
        template_params: {
          to_name: userName,
          to_email: userEmail,
          otp_code: otp,
          from_name: 'EasyAccess Panchayat',
          message: `Your verification code is: ${otp}`,
        }
      }),
    });

    if (response.ok) {
      console.log('✅ OTP email sent successfully!');
      return true;
    } else {
      console.error('❌ OTP email failed:', await response.text());
      return false;
    }
  } catch (error) {
    console.error('❌ Email error:', error);
    return false;
  }
};