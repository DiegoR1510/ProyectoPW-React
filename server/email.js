import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

console.log('EMAIL_USER:', process.env.EMAIL_USER, 'EMAIL_PASS:', process.env.EMAIL_PASS);

export const transporter = nodemailer.createTransport({
  host: 'mail.smtp2go.com',
  port: 2525,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
}); 