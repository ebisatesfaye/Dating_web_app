import axios from 'axios';

const sendEmailApi = async (toEmail: string, toName: string, subject: string, message: string) => {
  try {
    await axios.post('/api/send-email', {
      toEmail,
      toName,
      subject,
      message,
    });
  } catch (err) {
    console.error('Failed to trigger email notification:', err);
  }
};

export const sendWelcomeEmail = async (email: string, name: string) => {
  await sendEmailApi(
    email,
    name,
    'Welcome to Whaatachi!',
    `Hello ${name},\n\nWelcome to Whaatachi - the premier Ethiopian dating and social connection platform!\n\nYour profile has been created successfully and is currently under review by our moderation team. You will receive an email once it is approved and goes live.\n\nThank you for choosing Whaatachi!\nBest regards,\nThe Whaatachi Team`
  );
};

export const sendPaymentSuccessEmail = async (email: string, name: string, transactionId: string) => {
  await sendEmailApi(
    email,
    name,
    'Payment Confirmed - Whaatachi Premium Unlocked',
    `Hello ${name},\n\nWe have successfully verified your payment of 200 ETB. Your Premium Membership has been unlocked!\n\nTransaction ID: ${transactionId}\n\nYou can now view contact details (phone number, Telegram, Instagram) for all verified female profiles on Whaatachi.\n\nEnjoy finding your perfect connection!\n\nBest regards,\nThe Whaatachi Team`
  );
};

export const sendProfileApprovedEmail = async (email: string, name: string) => {
  await sendEmailApi(
    email,
    name,
    'Profile Approved - Whaatachi',
    `Hello ${name},\n\nCongratulations! Your Whaatachi profile has been reviewed and approved by our team.\n\nIt is now visible in the browse feed for other members to see. You can start exploring and connecting today!\n\nBest regards,\nThe Whaatachi Team`
  );
};

export const sendAdminReportNotification = async (reporterName: string, reportedName: string, reason: string) => {
  // Notify admin when a user is reported
  await sendEmailApi(
    'admin@whaatachi.com',
    'Administrator',
    'ALERT: Profile Report Filed',
    `Hello Admin,\n\nA new report has been filed against a user profile.\n\nReporter: ${reporterName}\nReported User: ${reportedName}\nReason: ${reason}\n\nPlease review this profile in the admin dashboard moderation queue.\n\nBest regards,\nWhaatachi Safety Guard`
  );
};
