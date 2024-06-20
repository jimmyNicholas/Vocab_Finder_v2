//import dictApiService from "../services/dictApiService.js";
const dictApiService = require("../services/dictApiService.js");

const getWordData = async (wordString) => {
    // prepare word array
    const wordList = wordString.split('+');

    //call API on each word and return an array
    const wordData = [];
    const promises = wordList.map(async (word) => {
        try {
            const data = await dictApiService.fetchWordData(word);      
            wordData.push(data)
        } catch (error) {
            console.error('Dictioary Api error', error);
        }
    });
    await Promise.all(promises);
    //wordData.push('test word')
    return wordData;    
};
module.exports = {
    getWordData,
}
