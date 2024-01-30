const cors = require('cors');

const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.json());
app.use(cors());


app.post('/write-file', (req, res) => {
    const data = req.body.data;
    fs.appendFile('scoredPrompts.txt', data, (err) => {
        if (err) {
            res.status(500).send('Error writing to file');
        } else {
            res.send('File written successfully');
        }
    });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log('Server running on port 3001');
});
