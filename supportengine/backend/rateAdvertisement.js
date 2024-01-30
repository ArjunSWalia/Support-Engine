const express = require('express');
const { OpenAI } = require('openai');
const cors = require('cors');
const multer = require('multer');

const app = express();
const port = 3005;
app.use(cors());


const openai = new OpenAI({
    apiKey: process.env.REACT_APP_API_KEY
});

app.post('/rate-advertisement',async (req, res) => {
    try {

        const image1 = req.body.image1; 
        const image2 = req.body.image2;
        const productName = req.body.productName;
        const response = await openai.chat.completions.create({
            model: "gpt-4-vision-preview",
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: `Describe the pros and cons of each advertisement for this given product: ${productName} and determine which one is more effective.`},
                  {
                    type: "image_url",
                    image_url: {
                      "url": image1,
                    },
                  },
                  {
                    type: "image_url",
                    image_url: {
                      "url": image2,
                    },
                  }
                ],
              },
            ],
          });
        console.log(response);
        res.json(response.data);
  } catch (error) {
        res.status(500).send('Error processing your request');
  }
});

app.listen(port, () => {
  console.log(`Server running on ${port}`);
});

