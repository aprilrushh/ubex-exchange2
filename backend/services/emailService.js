// backend/services/emailService.js
module.exports.sendConfirmationEmail = async (email, token) => {
  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({ sendmail: true });
    await transporter.sendMail({
      from: 'no-reply@ubex.com',
      to: email,
      subject: 'Whitelist Address Confirmation',
      text: `Please confirm your whitelist address using this token: ${token}`
    });
  } catch (err) {
    console.log('[EmailService] Email sending skipped:', err.message);
    console.log(`[EmailService] token for ${email}: ${token}`);
  }
};
