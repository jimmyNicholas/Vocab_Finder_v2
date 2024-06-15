//import express from 'express';
//import dictController from './controllers/dictController.js';
//import path from 'path';
//import { fileURLToPath } from 'url';
//import bodyParser from 'body-parser';

const express = require('express');
const dictController = require('./controllers/dictController.js');
const path = require('path');
const { fileURLToPath } = require('url');
const bodyParser = require('body-parser');


//const __filename = fileURLToPath(import.meta.url);
//const __dirname = path.dirname(__filename);

const app = express();
app.use(bodyParser.json());
app.use(express.json());


app.post('/getWordData', async (req, res) => {
    const wordString = req.body.wordString;
    try {
        const wordData = await dictController.getWordData(wordString);
        res.status(200).send(wordData);
    } catch (error) {
        res.status(500).send({ error: 'Failed to fetch word data' });
    }
    
});

console.log(__dirname);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/index.html'));
});

module.exports = app;