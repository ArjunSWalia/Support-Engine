const cors = require('cors'); 

const express = require('express');
const fs = require('fs');
const app = express();
let prompts = require('./tester');

app.use(express.json());
app.use(cors());



app.get('/get-array', (req, res) => {
    res.json(prompts);
});

app.post('/update-array', (req, res) => {
    prompts = req.body; 
    const fileContent = `let tester = ${JSON.stringify(prompts, null, 2)};\nmodule.exports = tester;`;
    fs.writeFile('./tester.js', fileContent, 'utf8', function (err) {
        if (err) {
            console.error('Error writing to file', err);
            res.status(500).send('Error updating file');
            return;
        }
        console.log('Array updated successfully in file');
        res.send('Array updated successfully');
    });
});

const PORT = 3002;
app.listen(PORT, () => {
    console.log('Server running on port 3002');
});
