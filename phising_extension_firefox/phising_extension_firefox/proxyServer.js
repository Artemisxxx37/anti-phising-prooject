const express = require('express');
const app = express();

app.get('/proxy', async (req, res) => {
  const { default: fetch } = await import('node-fetch');
  const url = req.query.url;
  const apiKey = '1be91a59b6ca271f733393f2bacb7ffa73309a363305a74ee9d9fffd46cb3eb1'; // Replace with your VirusTotal API key
  try {
    const response = await fetch(url, {
      headers: {
        'x-apikey': apiKey
      }
    });
    const data = await response.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching data' });
  }
});

app.listen(3000, () => {
  console.log('Proxy server running on http://localhost:3000');
});
