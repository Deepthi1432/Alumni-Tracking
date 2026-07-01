// backend/utils/mailer.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendNotification(to, subject, message) {
  await transporter.sendMail({
    from: `"ANECAA Career Interaction Gateway" <${process.env.EMAIL_USER}>`,
    bcc: to, // alumni list
    subject,
    text: message
  });
}

module.exports = { sendNotification };
