import config from "../config/config.mjs";
const apiKey = config.apiKeys.dictionaryKey;

const fetchWordData= async (word) => {
    const dictUrl = `https://www.dictionaryapi.com/api/v3/references/learners/json/`;

    try {
        const dictResponse = await fetch(dictUrl + word + `?key=` + apiKey);
        return dictResponse.json();;
    } catch (error) {
        console.error(error);
    }
};

export default {
    fetchWordData,
}