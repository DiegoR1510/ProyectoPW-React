import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: 'mail.smtp2go.com',
  port: 587,
  auth: {
    user: 'TU_USUARIO_SMTP2GO',
    pass: 'TU_CONTRASEÑA_SMTP2GO'
  }
}); 