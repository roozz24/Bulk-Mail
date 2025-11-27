const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
app.use(cors({
  origin: '*',
}));

mongoose.connect('mongodb+srv://roozo:rooso1234@cluster0.ij3k6ck.mongodb.net/passkey?appName=Cluster0').then(function () {
  console.log('Connected to MongoDB');
}).catch(function () {
  console.log('Error connecting to MongoDB');
});

const credential = mongoose.model('credential', {}, 'bulkmail');

app.post('/sendmail', (req, res) => {

  var msg = req.body.msg;
  var emails = req.body.emails;
  credential.find().then(function (data) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: data[0].toJSON().user,
        pass: data[0].toJSON().pass,
      }
    });


    new Promise(async function (resolve, reject) {
      try {
        for (let i = 0; i < emails.length; i++) {

          await transporter.sendMail(
            {
              from: 'fedelhenry.7@gmail.com',
              to: emails[i],
              subject: 'Msg from Bulk Mail App',
              text: msg,
            }
          )
          console.log('Email sent to ' + emails[i]);
        };
        resolve('All emails sent');

      } catch (error) {
        reject('Error sending emails');
      }
    }).then(function () {
      res.send(true);
    }).catch(function () {
      res.send(false);
    });
  }).catch(function (err) {
    console.log(err);
  });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on ${PORT}`));