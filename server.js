const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Get your Bot Token securely from environment variables
const BOT_TOKEN = process.env.BOT_TOKEN; 

if (!BOT_TOKEN) {
    console.error('ERROR: BOT_TOKEN not set. Please add it in your environment variables.');
    process.exit(1);
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/send-message', async (req, res) => {
    const { chat_id, text } = req.body;

    if (!chat_id || !text) {
        return res.status(400).json({ error: 'chat_id and text are required' });
    }

    try {
        const telegramURL = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

        const response = await axios.post(telegramURL, {
            chat_id,
            text
        });

        res.status(200).json({ message: 'Message sent successfully!', telegramResponse: response.data });
    } catch (error) {
        console.error('Error sending message:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to send message', details: error.message });
    }
});

app.get('/', (req, res) => {
    res.send('Telegram Bot API Backend is Running!');
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
