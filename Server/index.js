const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

const FRONTEND = process.env.FRONTEND_URL || 'https://bulk-mail-lemon-six.vercel.app';
app.use(cors({
  origin: FRONTEND,
}));

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI not set in env');
  process.exit(1);
}
mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 }).then(function () {
  console.log('Connected to MongoDB');
}).catch(function (err) {
  console.log('Error connecting to MongoDB', err && err.message);
});

const credential = mongoose.model('credential', {}, 'bulkmail');

app.post('/sendmail', async (req, res) => {
  try {
    const { msg, emails } = req.body || {};

    if (!msg || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ success: false, message: 'Missing message or emails' });
    }

    const creds = await credential.findOne().lean().exec();
    if (!creds || !creds.user || !creds.pass) {
      console.error('No email credentials found in DB');
      return res.status(500).json({ success: false, message: 'Mail credentials missing' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: creds.user, pass: creds.pass },
    });

    console.log('transporter type before verify:', typeof transporter);
    await transporter.verify(); 
    console.log('Transporter verified');

    const results = [];
    for (const to of emails) {
      try {
        const info = await transporter.sendMail({
          from: creds.user,
          to,
          subject: 'Message from Bulk Mail App',
          text: msg
        });

        console.log('sendMail ok ->', to, 'messageId:', info.messageId, 'response:', info.response);
        results.push({ to, ok: true, id: info.messageId || null, raw: info });

      } catch (err) {
        console.error('sendMail error ->', to, err && (err.message || err));
        results.push({ to, ok: false, error: err?.message || 'send error' });
      }
    }

    const sentCount = results.filter(r => r.ok).length;
    return res.json({ success: true, sent: sentCount, results });

  } catch (err) {
    console.error('Unhandled /sendmail error:', err && (err.stack || err));
    return res.status(500).json({ success: false, message: 'Internal server error', error: err?.message });
  }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on ${PORT}`));