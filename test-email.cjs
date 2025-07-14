require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'mail.smtp2go.com',
  port: 2525,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.sendMail({
  from: `Diego <${process.env.EMAIL_USER}>`,
  to: 'sf85lbximv@qacmjeq.com', // Cambia esto por tu correo real
  subject: 'Prueba de correo',
  text: '¡Esto es una prueba!'
}, (err, info) => {
  if (err) {
    console.error('Error al enviar:', err);
  } else {
    console.log('Correo enviado:', info);
  }
}); 