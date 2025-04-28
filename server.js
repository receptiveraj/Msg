const FormData = require('form-data'); // important
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const BOT_TOKEN = process.env.BOT_TOKEN;

const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Send text route (already working)

app.post('/send-file', upload.single('file'), async (req, res) => {
    const { chat_id, type } = req.body;
    const file = req.file;

    if (!chat_id || !type || !file) {
        return res.status(400).json({ error: 'chat_id, type, and file are required' });
    }

    const formData = new FormData();
    formData.append('chat_id', chat_id);
    formData.append(type, file.buffer, file.originalname); // Correct!

    try {
        const telegramEndpoint = `https://api.telegram.org/bot${BOT_TOKEN}/send${capitalizeType(type)}`;
        
        const response = await axios.post(telegramEndpoint, formData, {
            headers: formData.getHeaders()
        });

        res.status(200).json({ message: `${type} sent successfully!`, telegramResponse: response.data });
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: `Failed to send ${type}`, details: error.message });
    }
});

function capitalizeType(type) {
    if (type === 'photo') return 'Photo';
    if (type === 'video') return 'Video';
    return 'Document'; // fallback for original
}

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
