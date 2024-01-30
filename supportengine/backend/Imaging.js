const express = require('express');
const fs = require('fs');
const FormData = require('form-data');
const { OpenAI } = require('openai');
const cors = require('cors');
const multer = require('multer');

const app = express();
const port = 3005;
app.use(cors());

const upload = multer({dest: 'uploads/'});

const openai = new OpenAI({
    apiKey: process.env.REACT_APP_API_KEY
});

app.post('/edit-image', upload.single('image'), async (req, res) => {
    try {
        if(!req.file)
        {
            return res.status(400).send('No file uploaded.');
        }
        const imagePath = req.file.path; 
        const prompt = req.body.prompt; 


        const response = await openai.images.edit({
            image: fs.createReadStream(imagePath),
            prompt: prompt,
        });
        console.log(response);
        res.json(response.data);
        fs.unlinkSync(imagePath);
  } catch (error) {
        console.error('Error editing image:', error);
        res.status(500).send('Error processing your request');
  }
});

app.listen(port, () => {
  console.log(`Server running on ${port}`);
});

