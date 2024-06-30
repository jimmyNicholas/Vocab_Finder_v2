import { constructWordsInterface } from './constructWordsInterface.js';
import { displayWordCard }  from './displayWordCard.js';
import { getWordData } from './getWordData.js';
import { getTestWord } from './getTestWord.js';

const setRowColours = () => {
  const rows = document.querySelectorAll('.word-card');
  rows.forEach((row, index) => {
    if (index % 2 === 0) {
      row.style.backgroundColor = "#E1F2FB";
    } else {
      row.style.backgroundColor = "#E8EBEB";
    };
  });
};

const setupWordsSearch = async () => {
    const searchWordsForm = document.querySelector("#words-search-form");
    searchWordsForm.addEventListener('submit', async (e) => {
        e.preventDefault();    
        const formData = new FormData(e.target);        
        const formEntries = Object.fromEntries(formData);
        const wordString = Object.values(formEntries)[0].replaceAll(', ', ',').split(',').join('+');
        const testingModeIsOn = document.querySelector('#test').checked; 
        
        try {
            let wordMeanings;
            if (testingModeIsOn) {
              wordMeanings = getTestWord();
            } else {
              wordMeanings = await getWordData(wordString);
            }            
            wordMeanings.forEach((wordMeaning) => {
                const wordsInterface = constructWordsInterface(wordMeaning);
                displayWordCard(wordsInterface);
            });
            setRowColours();
        } catch (error) {
            console.log(error);
        }    
    });
  };

export {
    setupWordsSearch,
}