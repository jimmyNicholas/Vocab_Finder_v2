import { getTemplate } from "../../helpers/domHelpers.js";

const displayWordCard = (wordsInterface) => {
    //define DOM container and get word card template
    const wordContainer = document.querySelector('#word-container');
    let wordCard = getTemplate('#word-card-template');  

    //// DISPLAY FUNCTIONS ////
    const placeHolder = '-';
    const displayExample = (wordCard) => {
      wordCard.querySelector('.example-text').innerHTML = wordsInterface.getExample() || placeHolder;
      wordCard.querySelector('#example-position').textContent = wordsInterface.getExamplePositionText() || placeHolder;
    };

    const displayDefinition = (wordCard) => {
      wordCard.querySelector('.definition-text').innerHTML = wordsInterface.getDefinition() || placeHolder;
      wordCard.querySelector('#definition-position').textContent = wordsInterface.getDefinitionPositionText() || placeHolder;
      displayExample(wordCard);
    };

    const displayWord = (wordCard) => {
      wordCard.querySelector('.word-text').innerHTML = wordsInterface.getWordText() || placeHolder;
      wordCard.querySelector('.phonetic-text').innerHTML = `/${wordsInterface.getWordPhonetic()}/` || placeHolder;
      wordCard.querySelector('#word-position').textContent = wordsInterface.getWordPositionText() || placeHolder;
      wordCard.querySelector('.pos-text').textContent = wordsInterface.getWordPos() || placeHolder;
      displayDefinition(wordCard);
      displayExample(wordCard);
    };

    //// DYNAMIC FUNCTIONS ////
    const setupNavButtons = (wordCard, wordsInterface, buttonSelector, dirrection) => {
      const previousWord = wordCard.querySelector(buttonSelector);
      previousWord.addEventListener('click', (e) => {
        const wordCard = e.target.parentElement;
        if (dirrection === 'previous') {
          if (buttonSelector.includes('word')) {
            wordsInterface.previousWord();
            displayWord(wordCard);
          } else if (buttonSelector.includes('definition')) {
            wordsInterface.previousDefinition();
            displayDefinition(wordCard);
          } else if (buttonSelector.includes('example')) {
            wordsInterface.previousExample();
            displayExample(wordCard);
          }
        } else if (dirrection === 'next') {
          if (buttonSelector.includes('word')) {
            wordsInterface.nextWord();
            displayWord(wordCard);
          } else if (buttonSelector.includes('definition')) {
            wordsInterface.nextDefinition();
            displayDefinition(wordCard);
          } else if (buttonSelector.includes('example')) {
            wordsInterface.nextExample();
            displayExample(wordCard);
          }
        } else { 
          console.error('No dirrection given. Choose between "previous" and "next');
        };
      });
    }

    [
      {direction: 'previous', selectors: [".previous-word", ".previous-definition", ".previous-example"]},
      {direction: 'next', selectors: [".next-word", ".next-definition", ".next-example"]},
    ].forEach((obj) => {
      obj.selectors.forEach(selector => { 
        setupNavButtons(wordCard, wordsInterface, selector, obj.direction)
      });    
    });

    displayWord(wordCard);
    wordContainer.appendChild(wordCard);
};

export {
    displayWordCard,
}