const express = require('express');
const dictController = require('./controllers/dictController.js');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(express.json());


app.get('/getWordData/:words', async (req, res) => {
    const wordString = req.params.words;
    console.log(wordString);
    try {
        const wordData = await dictController.getWordData(wordString);
        console.log(wordData);
        res.status(200).send(wordData);
    } catch (error) {
        res.status(500).send({ error: 'Failed to fetch word data' });
    }
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Server Error');
});

module.exports = app;
