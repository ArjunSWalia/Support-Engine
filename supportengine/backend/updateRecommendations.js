const cors = require('cors'); //for cross origin requests

const express = require('express');
const fs = require('fs');
const app = express();
let prompts = require('./aiFine');
let prompts2 = require('./aiTune');

app.use(express.json());
app.use(cors());


app.get('/get-array', (req, res) => {
    res.json(prompts);
});

app.get('/get-array2', (req, res) => {
    res.json(prompts2);
});


app.post('/update-array', (req, res) => {
    prompts = req.body; // Update the array with the new data
    const objectStrings = prompts.map(obj => {
        return `{ role: "${obj.role}", content: "${obj.content.replace(/"/g, '\\"')}" },`;
    });

    const fileContent = `let URLRecs = [\n${objectStrings.join('\n')}\n];\nmodule.exports = URLRecs;`;
    fs.writeFile('./aiFine.js', fileContent, 'utf8', function (err) {
        if (err) {
            console.error('Error writing to file', err);
            res.status(500).send('Error updating file');
            return;
        }
        console.log('Array updated successfully in file');
        res.send('Array updated successfully');
    });
});

app.post('/update-array2', (req, res) => {
    prompts = req.body; // Update the array with the new data
    const objectStrings = prompts.map(obj => {
        return `{ role: "${obj.role}", content: "${obj.content.replace(/"/g, '\\"')}" },`;
    });

    const fileContent = `let recommendations = [\n${objectStrings.join('\n')}\n];\nmodule.exports = recommendations;`;
    fs.writeFile('./aiTune.js', fileContent, 'utf8', function (err) {
        if (err) {
            console.error('Error writing to file', err);
            res.status(500).send('Error updating file');
            return;
        }
        console.log('Array updated successfully in file');
        res.send('Array updated successfully');
    });
});


const PORT = 3003;
app.listen(PORT, () => {
    console.log('Server running on port 3003');
});
