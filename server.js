const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Sandbox credentials
const shortcode = '174379';
const passkey = 'bfb279f9aa9bdbcf15e97dd71a467cd2b';
const consumerKey = 'TAAJBJuKCIFA0CdGOoPAbuTbwa5DfYb6WkaxnnuVamzZOLooWCotAAotKGzgFG5z';
const consumerSecret = 'lQBP9LViGkNwNlOxwaYEdUOUboAlkz15lWSmieCd9EUNzLA7';
const callbackURL = 'https://mydomain.com/callback'; // placeholder

const getToken = async () => {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  const res = await axios.get(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    { headers: { Authorization: `Basic ${auth}` } }
  );
  return res.data.access_token;
};

app.post('/pay', async (req, res) => {
  const { phone, amount } = req.body;

  try {
    const token = await getToken();
    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
    const password = Buffer.from(shortcode + passkey + timestamp).toString('base64');

    const stkRes = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phone,
        PartyB: shortcode,
        PhoneNumber: phone,
        CallBackURL: callbackURL,
        AccountReference: 'CytraMboka',
        TransactionDesc: 'Payment for goods'
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    res.json({ message: 'STK Push request sent (sandbox).' });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ message: 'Error processing STK push request' });
  }
});

app.listen(3000, () => {
  console.log('✅ Server is running on http://localhost:3000');
});
