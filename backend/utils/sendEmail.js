
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Check if credentials exist. If not, log to console (Dev Mode Mock)
  if (!process.env.SMTP_HOST || !process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
      console.log('================================================');
      console.log('⚠️  SMTP Credentials Missing. Mocking Email Send.');
      console.log(`To: ${options.email}`);
      console.log(`Subject: ${options.subject}`);
      console.log('--- Message Content ---');
      console.log(options.message);
      console.log('================================================');
      return; // Return successfully so the request continues without error
  }

  // Create transporter using environment variables
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    // secure: true for 465, false for other ports (587).
    // Loose equality check to handle string vs number env vars
    secure: process.env.SMTP_PORT == 465, 
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const message = {
    from: `${process.env.FROM_NAME || 'Farmers Market'} <${process.env.FROM_EMAIL || 'noreply@farmersmarket.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message, // Plain text fallback
    html: options.html // HTML version
  };

  try {
      const info = await transporter.sendMail(message);
      console.log('Message sent: %s', info.messageId);
  } catch (error) {
      console.error("Error sending email:", error);
      // Log error but don't crash request if email fails in dev
      // throw new Error("Email service failed"); 
  }
};

module.exports = sendEmail;
