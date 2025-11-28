const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());

const FRONTEND = process.env.FRONTEND_URL || 'https://bulk-mail-lemon-six.vercel.app';
app.use(cors({ origin: FRONTEND }));

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI not set in env');
  process.exit(1);
}


mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Error connecting to MongoDB', err && err.message);
  });

const Credential = mongoose.model('credential', {}, 'bulkmail');




// try {
//   const { msg, emails } = req.body;
//   if (!msg || !emails) {
//     return res.status(400).json({ success: false, message: 'Missing msg or emails' });
//   }

//   const cleaned = extractEmails(emails);
//   if (cleaned.length === 0) {
//     return res.status(400).json({ success: false, message: 'No valid emails found' });
//   }


//   if (useSendGrid && sgMail) {

//     const FROM = process.env.SENDGRID_FROM || 'fedelhenry.7@gmail.com';
//     if (FROM === 'fedelhenry.7@gmail.com') {
//       console.warn('SendGrid FROM is still the placeholder. Set SENDGRID_FROM env to a verified sender.');
//     }

//     const messages = cleaned.map(to => ({
//       to,
//       from: FROM,
//       subject: 'Message from Bulk Mail App',
//       text: msg,
//     }));

//     try {
//       await sgMail.send(messages);
//       return res.json({ success: true, provider: 'sendgrid', sent: cleaned.length });
//     } catch (err) {
//       console.error('SendGrid send error:', err && (err.response ? err.response.body : err.message));
//       return res.status(502).json({ success: false, provider: 'sendgrid', error: err.message || 'sendgrid error' });
//     }
//   }

app.post('/sendmail', async (req, res) => {
  try {
    const creds = await Credential.find();
    if (!creds.user || !creds.pass) {
      console.error('No email credentials found in DB');
      return res.status(500).json({ success: false, message: 'Mail credentials missing' });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: creds.user, pass: creds.pass },
      connectionTimeout: 20_000
    });


    try {
      await transporter.verify();
      console.log('Transporter verified');
    } catch (err) {
      console.error('Transporter verify failed:', err && err.message);
      return res.status(502).json({ success: false, message: 'SMTP verify failed', error: err && err.message });
    }

    const results = [];
    for (const to of cleaned) {
      try {
        const info = await transporter.sendMail({
          from: creds.user,
          to,
          subject: 'Message from Bulk Mail App',
          text: msg
        });
        console.log('sendMail ok ->', to, 'messageId:', info?.messageId, 'response:', info?.response);
        results.push({ to, ok: true, id: info?.messageId || null, raw: info });
      } catch (err) {
        console.error('sendMail error ->', to, err && (err.message || err));
        results.push({ to, ok: false, error: err && err.message });
      }
    }

    const sentCount = results.filter(r => r.ok).length;
    return res.json({ success: true, provider: 'nodemailer', sent: sentCount, results });

  } catch (err) {
    console.error('Unhandled /sendmail error:', err && (err.message || err));
    return res.status(500).json({ success: false, message: 'Internal server error', error: err && err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on ${PORT}`));
