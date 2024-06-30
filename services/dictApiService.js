const config = require('../config/config.js');
const apiKey = config.apiKeys.dictionaryKey;

const fetchWordData= async (word) => {
    const dictUrl = `https://www.dictionaryapi.com/api/v3/references/learners/json/`;

    try {
        const fetch = (await import('node-fetch')).default;
        const dictResponse = await fetch(dictUrl + word + `?key=` + apiKey);
        return dictResponse.json();
    } catch (error) {
        console.error(error);
    }
};

module.exports = {
    fetchWordData,
}