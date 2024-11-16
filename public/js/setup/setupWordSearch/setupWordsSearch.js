import { constructWordsInterface } from './constructWordsInterface.js';
import { displayWordCard }  from './displayWordCard.js';
import { getWordData } from './getWordData.js';
import { getTestWord } from './getTestWord.js';

const extractFormData = (form) => {
  const formData = new FormData(form);        
  const formEntries = Object.fromEntries(formData);
  return Object.values(formEntries)[0].replaceAll(', ', ',').split(',').join('+');
};

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

const setupDeleteButtons = () => {
  const deleteButtons = document.querySelectorAll('.delete-word-card');
  deleteButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      e.target.parentElement.remove();
      setRowColours();
    });
  });
};

const setupWordsSearch = async () => {
    const searchWordsForm = document.querySelector("#words-search-form");
    searchWordsForm.addEventListener('submit', async (e) => {
        e.preventDefault();    
        const wordString = extractFormData(e.target);
        const testingModeIsOn =  false //document.querySelector('#test').checked; 

        try {
            const wordMeanings = testingModeIsOn ? getTestWord() : await getWordData(wordString);      
            wordMeanings.forEach((wordMeaning) => {
                const wordsInterface = constructWordsInterface(wordMeaning);
                displayWordCard(wordsInterface);
            });
            setRowColours();
            setupDeleteButtons();
        } catch (error) {
            console.log(error);
        }    
    });
  };

export {
    setupWordsSearch,
}