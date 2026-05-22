const nodemailer = require('nodemailer');

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('📧 Ethereal email:', testAccount.user);
  }
  return transporter;
}

async function sendTicketEmail({ to, ticketCode, eventName, eventDate, eventLocation, buyerName }) {
  const t = await getTransporter();
  const info = await t.sendMail({
    from: '"PassMaster" <noreply@passmaster.app>',
    to,
    subject: `🎟️ Tu ticket para ${eventName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#0F0A1A;color:white;border-radius:12px;">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="width:48px;height:48px;background:linear-gradient(135deg,#7C3AED,#F59E0B);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;color:white;">P</div>
          <h2 style="margin:12px 0 0;">PassMaster</h2>
        </div>
        <h3 style="margin:0 0 8px;">🎟️ Ticket confirmado</h3>
        <p style="color:#A78BFA;margin:0 0 20px;">Hola <strong>${buyerName}</strong>, tu compra fue exitosa.</p>
        <div style="background:#1E1B2E;border-radius:8px;padding:16px;margin-bottom:20px;">
          <p style="margin:0 0 4px;"><strong>${eventName}</strong></p>
          <p style="margin:0;color:#9CA3AF;font-size:14px;">📅 ${new Date(eventDate).toLocaleDateString()} 📍 ${eventLocation}</p>
        </div>
        <div style="background:rgba(255,255,255,0.1);border:1px dashed rgba(167,139,250,0.4);border-radius:8px;padding:16px;text-align:center;margin-bottom:20px;">
          <p style="margin:0 0 4px;font-size:12px;color:#9CA3AF;">CÓDIGO DE INGRESO</p>
          <p style="margin:0;font-family:monospace;font-size:20px;letter-spacing:3px;color:#A78BFA;">${ticketCode}</p>
        </div>
        <p style="font-size:12px;color:#6B7280;text-align:center;">Presenta este código en la entrada del evento.</p>
      </div>
    `,
  });

  if (process.env.NODE_ENV !== 'production') {
    console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
  }
  return info;
}

async function sendPasswordResetEmail({ to, name, resetLink }) {
  const t = await getTransporter();
  const info = await t.sendMail({
    from: '"PassMaster" <noreply@passmaster.app>',
    to,
    subject: '🔑 Restablece tu contraseña',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#0F0A1A;color:white;border-radius:12px;">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="width:48px;height:48px;background:linear-gradient(135deg,#7C3AED,#F59E0B);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;color:white;">P</div>
          <h2 style="margin:12px 0 0;">PassMaster</h2>
        </div>
        <h3 style="margin:0 0 8px;">🔑 Restablecer contraseña</h3>
        <p style="color:#9CA3AF;margin:0 0 20px;">Hola <strong>${name}</strong>, haz clic en el botón para crear una nueva contraseña.</p>
        <div style="text-align:center;margin-bottom:20px;">
          <a href="${resetLink}" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#7C3AED,#A78BFA);color:white;text-decoration:none;border-radius:8px;font-weight:600;">Restablecer contraseña</a>
        </div>
        <p style="font-size:12px;color:#6B7280;text-align:center;">Este enlace expira en 1 hora. Si no solicitaste esto, ignora este correo.</p>
      </div>
    `,
  });

  if (process.env.NODE_ENV !== 'production') {
    console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
  }
  return info;
}

module.exports = { sendTicketEmail, sendPasswordResetEmail };
