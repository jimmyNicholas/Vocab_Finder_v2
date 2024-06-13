import dotenv from 'dotenv';

dotenv.config();

export default {
    port: process.env.PORT || 3000,
    apiKeys: {
        dictionaryKey: process.env.DICTIONARY_API_KEY
    }
};