const express = require('express');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
require("dotenv").config();

const app = express();
app.use(express.json()); // Untuk parsing JSON dari body request

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const EMAIL = process.env.EMAIL;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendMail(to, subject, text) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: EMAIL,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    const mailOptions = {
      from: EMAIL,
      to: to, // Email penerima dari parameter
      subject: subject, // Subjek email dari parameter
      text: text, // Isi pesan dari parameter
    };

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Endpoint untuk mengirim email
app.post('/send-email', async (req, res) => {
  const { to, subject, text } = req.body;

  try {
    const emailResult = await sendMail(to, subject, text);
    res.status(200).send({ message: 'Email sent successfully', emailResult });
  } catch (error) {
    res.status(500).send({ message: 'Error sending email', error });
  }
});
app.get("/", (req, res) => res.send("wandahoyyy!!"));
// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
