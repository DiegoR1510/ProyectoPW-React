import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: 'mail.smtp2go.com',
  port: 2525,
  auth: {
    user: '20204879@aloe.ulima.edu.pe',
    pass: '1510Drm1510'
  }
}); 