const express = require('express');
const axios = require('axios');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

const BOT_TOKEN = process.env.BOT_TOKEN; 

if (!BOT_TOKEN) {
    console.error('ERROR: BOT_TOKEN not set.');
    process.exit(1);
}

const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Send Text Messages
app.post('/send-message', async (req, res) => {
    const { chat_id, text } = req.body;

    if (!chat_id || !text) {
        return res.status(400).json({ error: 'chat_id and text are required' });
    }

    try {
        const telegramURL = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

        const response = await axios.post(telegramURL, { chat_id, text });
        res.status(200).json({ message: 'Text message sent!', response: response.data });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send text', details: error.message });
    }
});

// Send Files (Photo, Video, Document)
app.post('/send-file', upload.single('file'), async (req, res) => {
    const { chat_id, type } = req.body;
    const file = req.file;

    if (!chat_id || !type || !file) {
        return res.status(400).json({ error: 'chat_id, type, and file are required' });
    }

    let telegramEndpoint;
    if (type === 'photo') telegramEndpoint = 'sendPhoto';
    else if (type === 'video') telegramEndpoint = 'sendVideo';
    else telegramEndpoint = 'sendDocument'; // default for other files

    const formData = new FormData();
    formData.append('chat_id', chat_id);
    formData.append(type, file.buffer, { filename: file.originalname });

    try {
        const response = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/${telegramEndpoint}`, formData, {
            headers: formData.getHeaders(),
        });
        res.status(200).json({ message: `${type} sent successfully!`, response: response.data });
    } catch (error) {
        res.status(500).json({ error: `Failed to send ${type}`, details: error.message });
    }
});

app.get('/', (req, res) => {
    res.send('Telegram Bot API Server is Running (Text + File Upload Ready)');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
