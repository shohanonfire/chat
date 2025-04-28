require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID;

let lastUpdateId = 0;
let updatesBuffer = [];

// Poll Telegram for new updates every second
async function pollUpdates() {
  try {
    const res = await axios.get(
      `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`,
      { params: { offset: lastUpdateId + 1, timeout: 0 } }
    );
    if (res.data.ok) {
      res.data.result.forEach(update => {
        lastUpdateId = update.update_id;
        updatesBuffer.push(update);
      });
    }
  } catch (err) {
    console.error('Error polling updates:', err.message);
  }
}
setInterval(pollUpdates, 1000);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to send a message via Telegram
app.post('/send', async (req, res) => {
  const { chat_id, text } = req.body;
  try {
    const resp = await axios.get(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      { params: { chat_id, text } }
    );
    res.json(resp.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to fetch buffered updates
app.get('/fetch', (req, res) => {
  const clientLast = parseInt(req.query.lastUpdateId) || 0;
  const newUpdates = updatesBuffer.filter(u => u.update_id > clientLast);
  res.json(newUpdates);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
