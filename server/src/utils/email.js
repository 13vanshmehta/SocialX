/**
 * SocialX - Email Utility
 * Send emails using Nodemailer (OTP, notifications, etc.)
 */

const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send OTP email for password reset
 */
const sendOtpEmail = async (email, otp, userName) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'SocialX <noreply@socialx.com>',
    to: email,
    subject: 'SocialX — Password Reset OTP',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #0A0A1A; color: #EAEAFF; margin: 0; padding: 0; }
          .container { max-width: 500px; margin: 0 auto; padding: 40px 20px; }
          .card { background: #12122A; border-radius: 16px; padding: 40px; border: 1px solid rgba(255,255,255,0.06); }
          .logo { text-align: center; margin-bottom: 24px; }
          .logo img { width: 60px; height: 60px; }
          h1 { text-align: center; font-size: 22px; margin-bottom: 16px; color: #EAEAFF; }
          p { color: #A0A0CC; font-size: 14px; line-height: 1.6; margin-bottom: 16px; }
          .otp-box { text-align: center; margin: 24px 0; }
          .otp-code { display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 8px; padding: 16px 32px; border-radius: 12px; background: linear-gradient(135deg, rgba(232,67,147,0.1), rgba(9,132,227,0.1)); border: 1px solid rgba(232,67,147,0.3); color: #E84393; }
          .expiry { text-align: center; color: #FF7675; font-size: 12px; margin-top: 8px; }
          .footer { text-align: center; margin-top: 24px; color: #5A5A80; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="logo">
              <h1>🔐 Password Reset</h1>
            </div>
            <p>Hi ${userName || 'there'},</p>
            <p>We received a request to reset your SocialX account password. Use the following OTP to proceed:</p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
              <div class="expiry">Expires in 10 minutes</div>
            </div>
            <p>If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} SocialX. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send email verification OTP after registration
 */
const sendVerificationOtpEmail = async (email, otp, userName) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'SocialX <noreply@socialx.com>',
    to: email,
    subject: 'SocialX — Verify Your Email',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #F8F8F8; color: #333; margin: 0; padding: 0; }
          .container { max-width: 500px; margin: 0 auto; padding: 40px 20px; }
          .card { background: #FFFFFF; border-radius: 16px; padding: 40px; border: 1px solid #EAEAEA; }
          h1 { text-align: center; font-size: 22px; margin-bottom: 16px; color: #1A1A1A; }
          p { color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 16px; }
          .otp-box { text-align: center; margin: 24px 0; }
          .otp-code { display: inline-block; font-size: 36px; font-weight: 800; letter-spacing: 12px; padding: 16px 32px; border-radius: 12px; background: linear-gradient(135deg, rgba(232,67,147,0.08), rgba(9,132,227,0.08)); border: 2px solid rgba(232,67,147,0.2); color: #E84393; }
          .expiry { text-align: center; color: #999; font-size: 12px; margin-top: 8px; }
          .footer { text-align: center; margin-top: 24px; color: #BBB; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <h1>Verify Your Email</h1>
            <p>Hi ${userName || 'there'},</p>
            <p>Welcome to SocialX! Please use the following code to verify your email address:</p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
              <div class="expiry">Expires in 10 minutes</div>
            </div>
            <p>If you didn't create an account, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} SocialX. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail, sendVerificationOtpEmail };
