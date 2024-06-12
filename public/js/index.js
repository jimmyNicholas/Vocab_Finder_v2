
// FE::constructor
const constructIndexNav = (array) => {
    return {
      array,
      getArrayLength() {
        return this.array.length;
      },
      getItem() {
        return this.array[this.index]
      },
      setArray(newArray) {
        this.resetIndex;
        this.array = newArray;
      },
      
      index: 0,
      decreaseIndex() {
        this.index--;
        if (this.index < 0) {
          this.index = array.length - 1;
        }
      },
      increaseIndex() {
        this.index++;
        if (this.index >= array.length) {
          this.resetIndex()
        }
      },
      resetIndex() {
        this.index = 0;
      },
      getPositionText() {
        return `${this.index + 1}/${this.array.length}`;
      },
    }
  };
  
  // FE::filter
  const formatText = (text) => {
    text = text.replace(/\{b\}(.*?)\{\/b\}/g, '<strong>$1</strong>');
    // removed the bold colon for readability
    text = text.replace(/\{bc\}/g, '');
    text = text.replace(/\{inf\}(.*?)\{\/inf\}/g, '<sub>$1</sub>');
    
    // testing gap fill possibilities
    const test = false;
    if (test) {
      text = text.replace(/\{it\}(.*?)\{\/it\}/g, '__________');
      text = text.replace(/\[(.*?)\]/g, '');
      text = text.replace(/\{phrase\}(.*?)\{\/phrase\}/g, '__________');
    } else {
      text = text.replace(/\{it\}(.*?)\{\/it\}/g, '<em>$1</em>');
      text = text.replace('{phrase}', '');
      text = text.replace('{/phrase}', '');
    }
  
    text = text.replace(/\{ldquo\}/g, '“');
    text = text.replace(/\{rdquo\}/g, '”');
    text = text.replace(/\{sc\}(.*?)\{\/sc\}/g, '<span style="font-variant: small-caps;">$1</span>');
    text = text.replace(/\{sup\}(.*?)\{\/sup\}/g, '<sup>$1</sup>');
    text = text.split('*').join('');
    text = text.split('{dx}')[0];
    
    const pipeIndex = text.indexOf('|');
    if(pipeIndex > 0) {
      for (let i = pipeIndex - 1; i >= 0; i--) {
        if (text[i] === '{') {
          text = text.substring(0, i);
          break;
        }
      }
    }
  
    return text;
  } 
  
  // FE::constructor
  const constructWordsInterface = (wordMeaning) => {
    let filteredWords = wordMeaning.filter(word => word.def);
    const words = constructIndexNav(filteredWords);
  
    //// update functions ////
    const checkDefiningText = (definingText) => {
      if (definingText[0][0] === "uns") {
        definingText = definingText[0][1][0];
      } 
      return definingText;
    }
      // update sseq //
    const filterSseqArray = (sseqArray) => {
      let filteredArray = [];
      sseqArray.forEach(array => {
        let senseArray = [];
        array.forEach(item => {
          if (item[0] === 'sense') {
            senseArray.push(item);
          }
        })
        if (senseArray.length > 0) {
          filteredArray.push(senseArray);
        }
      });
      return filteredArray;
    }
    const updateSseqArray = (words) => {
      const sseqArray = words.getItem().def[0].sseq;
      const filteredSseqArray = filterSseqArray(sseqArray);
      return constructIndexNav(filteredSseqArray);
    };
    const getDefiningText = (sseq) => {
      if (sseq[0][0] === 'sense') {
        return sseq[0][1].dt;
      } else {
        return false;
      }
    }
    let sseqs = updateSseqArray(words);
  
      // update examples //
    const updateExamples = (sseqs) => {
      let definingText = getDefiningText(sseqs.getItem());
      definingText = checkDefiningText(definingText);
      let examples = [];
      definingText.forEach(item => {
        if (item[0] === 'vis') {
          examples = item[1];
          return;
        }
      });
      return constructIndexNav(examples);
    }
    let examples = updateExamples(sseqs);
  
    //// word functions ////
    const nextWord = () => {
      words.increaseIndex();
      sseqs = updateSseqArray(words);
      examples = updateExamples(sseqs);
    };
    const previousWord = () => {
      words.decreaseIndex();
      sseqs = updateSseqArray(words);
      examples = updateExamples(sseqs);
    }
    const getWordText = () => {
      let word = words.getItem().hwi.hw;
      return formatText(word);
    }
    const getWordPos = () => {
      return words.getItem().fl;
    }
    const getWordPositionText = () => {
      return words.getPositionText();
    }
  
    //// definition functions ////
    const nextDefinition = () => {
      sseqs.increaseIndex();
      examples = updateExamples(sseqs);
    };
    const previousDefinition = () => {
      sseqs.decreaseIndex();
      examples = updateExamples(sseqs);
    };
    const getDefinition = () => {
      let definingText = getDefiningText(sseqs.getItem());
      definingText = checkDefiningText(definingText);
      const definition = definingText.find((item) => item[0] === 'text')[1];
      return formatText(definition);
    };
    const getDefinitionPositionText = () => {
      return sseqs.getPositionText();
    }
  
    // example functions ///
    const nextExample = () => {
      examples.increaseIndex();
    }
    const previousExample = () => {
      examples.decreaseIndex();
    };
    const getExample = () => {
      if (examples.getItem()) {
        const example = examples.getItem().t;
        return formatText(example);
      }
      return false;
    }
    const getExamplePositionText = () => {
      if (examples.getArrayLength() > 0) {
        return examples.getPositionText();
      }
    }
  
    return {
      nextWord,
      previousWord,
      getWordText,
      getWordPos,
      getWordPositionText,
  
      nextDefinition,
      previousDefinition,
      getDefinition,
      getDefinitionPositionText,
  
      nextExample,
      previousExample,
      getExample,
      getExamplePositionText,
    }
  };
  
  // FE::display
  const displayWordCard = (wordsInterface) => {
      const getTemplate = (templateName) => {
        const temp = document.querySelector(templateName);
        return temp.content.cloneNode(true);
      };
  
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

const getWordData = async (wordString) => {
    const url = '/getWordData';
    const options = {
        method: 'POST',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify({
            wordString
        }),
    };

    try {
        const wordData = await fetch(url, options);
        return wordData.json();
    } catch (error) {
        
    }
};

const setupSearchWordsButton = async () => {
    const searchWordsButton = document.querySelector("#search-words-button");
    searchWordsButton.addEventListener('click', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target.parentElement);
        const formEntries = Object.fromEntries(formData);
        const wordString = Object.values(formEntries);

        try {
            const wordMeanings = await getWordData(wordString);
            console.log(wordMeanings)
            wordMeanings.forEach((wordMeaning) => {
                const wordsInterface = constructWordsInterface(wordMeaning);
                console.log(wordsInterface);
                displayWordCard(wordsInterface);
            });
        } catch (error) {
            console.log(error);
        }        
    });
  };

//FE::setup
const setupPrintButton = () => {
    const addHideClass = (element) => {
      element.classList.add('hide');
    };
    
    const removeHideClass = (element) => {
      element.classList.remove('hide');
    }
  
    const printWords = document.querySelector('#print-word-container');
    printWords.addEventListener('click', () => {
      const pageElements = document.querySelector('body');
      const wordContainer = document.querySelector('#word-container');
    
      const positionTexts = document.querySelectorAll('.position-text');
      const previousButtons = document.querySelectorAll('.previous-button');
      const nextButtons = document.querySelectorAll('.next-button');
  
      const wordContainerText = wordContainer.querySelectorAll('.text');
  
      let elementArray = [];
      for (const child of pageElements.children) {
        if (child.id !== 'word-container') {
          elementArray.push(child);
          const childElements = child.querySelectorAll('*');
          elementArray = [...elementArray, ...childElements];
        } 
      }
  
      [positionTexts, previousButtons, nextButtons].forEach(array => {
        array.forEach(element => addHideClass(element));
      });
      wordContainerText.forEach(text => text.classList.add('buttoned-title'));
      elementArray.forEach(element => addHideClass(element));
      
      window.print();
  
      [positionTexts, previousButtons, nextButtons].forEach(array => {
        array.forEach(element => removeHideClass(element));
      });
      wordContainerText.forEach(text => text.classList.remove('buttoned-title'));
      elementArray.forEach(element => removeHideClass(element));
  
    });
  }

document.addEventListener('DOMContentLoaded', () => {
    setupSearchWordsButton();
    setupPrintButton();
});
