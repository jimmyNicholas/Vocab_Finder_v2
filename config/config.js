//import dotenv from 'dotenv';
const dotenv = require('dotenv');

dotenv.config();

//export default 
module.exports = {
    port: process.env.PORT || 3000,
    apiKeys: {
        dictionaryKey: process.env.DICTIONARY_API_KEY
    }
};