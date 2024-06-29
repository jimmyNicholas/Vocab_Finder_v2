

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
  const url = `/getWordData/${wordString}`;
  const options = {
      method: 'GET',
      headers: {
          Accept: "application/json",
          "Content-Type": "application/json;charset=UTF-8",
      },
  };

  try {
      const wordData = await fetch(url, options);
      return wordData.json();
  } catch (error) {
      console.error(error);
  }
};


// BE::API(testing)
const getTestWord = () => {
  const testWordArray = [
    [
      {
        "meta": {
          "id": "model:1",
          "uuid": "e7bf25b8-1670-4147-836f-3f78f843f143",
          "src": "learners",
          "section": "alpha",
          "target": {
            "tuuid": "9d9fbd79-f37c-4ef2-8862-423a76028fec",
            "tsrc": "collegiate"
          },
          "highlight": "yes",
          "stems": [
            "model",
            "models",
            "scale model"
          ],
          "app-shortdef": {
            "hw": "model:1",
            "fl": "noun",
            "def": [
              "{bc} a usually small copy of something",
              "{bc} a particular type or version of a product (such as a car or computer)",
              "{bc} a set of ideas and numbers that describe the past, present, or future state of something (such as an economy or a business)"
            ]
          },
          "offensive": false
        },
        "hom": 1,
        "hwi": {
          "hw": "mod*el",
          "prs": [
            {
              "ipa": "ˈmɑːdl̟",
              "sound": {
                "audio": "model001"
              }
            }
          ]
        },
        "fl": "noun",
        "ins": [
          {
            "il": "plural",
            "ifc": "-els",
            "if": "mod*els"
          }
        ],
        "gram": "count",
        "def": [
          {
            "sseq": [
              [
                [
                  "sense",
                  {
                    "sn": "1",
                    "dt": [
                      [
                        "text",
                        "{bc}a usually small copy of something "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "She's building a {it}model{/it} of the Earth for science class."
                          },
                          {
                            "t": "{it}models{/it} of famous buildings"
                          },
                          {
                            "t": "a plastic {it}model{/it} of the human heart"
                          },
                          {
                            "t": "a {phrase}scale model{/phrase} [=a small but exact copy] of a ship"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "2",
                    "dt": [
                      [
                        "text",
                        "{bc}a particular type or version of a product (such as a car or computer) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "We've improved on last year's {it}model{/it}, making the car safer and easier to control."
                          },
                          {
                            "t": "He bought one of the old 1965 {it}models{/it}."
                          },
                          {
                            "t": "We couldn't afford one of the fancy TVs and had to buy the standard {it}model{/it}."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "3",
                    "dt": [
                      [
                        "text",
                        "{bc}a set of ideas and numbers that describe the past, present, or future state of something (such as an economy or a business) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "a mathematical {it}model{/it}"
                          },
                          {
                            "t": "We've developed a computer {it}model{/it} of the economy to predict what will happen in the future."
                          },
                          {
                            "t": "Companies are developing new business {it}models{/it}."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "4 a",
                    "dt": [
                      [
                        "text",
                        "{bc}something or someone that is a very good example {it}of{/it} something "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "The city is now a {it}model of{/it} safety and cleanliness. [=the city is now very safe and clean]"
                          },
                          {
                            "t": "He is a {it}model of{/it} politeness. [=he is very polite]"
                          },
                          {
                            "t": "The country was the {it}model of{/it} a peaceful nation for over 50 years."
                          }
                        ]
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "b",
                    "dt": [
                      [
                        "text",
                        "{bc}something or someone that deserves to be copied by others "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "The country's economy is a {it}model{/it} for the rest of the world."
                          },
                          {
                            "t": "Her work has become a {it}model{/it} to/for other writers."
                          },
                          {
                            "t": "These soldiers serve as {it}models{/it} for their country."
                          }
                        ]
                      ],
                      [
                        "text",
                        "{dx}see also {dxt|role model||}{/dx}"
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "5",
                    "dt": [
                      [
                        "text",
                        "{bc}someone who is paid to wear clothing, jewelry, etc., in photographs, fashion shows, etc., so that people will see and want to buy what is being worn "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "a fashion {it}model{/it}"
                          },
                          {
                            "t": "male {it}models{/it}"
                          },
                          {
                            "t": "She's a {it}model{/it} turned actress. [=a model who later became an actress]"
                          }
                        ]
                      ],
                      [
                        "text",
                        "{dx}see also {dxt|supermodel||}{/dx}"
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "6",
                    "dt": [
                      [
                        "text",
                        "{bc}someone whose image is painted, photographed, etc., by an artist "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "The same {it}model{/it} sat/posed for several of his paintings."
                          },
                          {
                            "t": "drawings of nude {it}models{/it}"
                          },
                          {
                            "t": "an artist's {it}model{/it}"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ]
            ]
          }
        ],
        "shortdef": [
          "a usually small copy of something",
          "a particular type or version of a product (such as a car or computer)",
          "a set of ideas and numbers that describe the past, present, or future state of something (such as an economy or a business)"
        ]
      },
      {
        "meta": {
          "id": "model:2",
          "uuid": "19fa18f6-1604-4206-ac28-56bf127f364a",
          "src": "learners",
          "section": "alpha",
          "target": {
            "tuuid": "ad272a76-c933-4577-9267-21fdbca8caf3",
            "tsrc": "collegiate"
          },
          "stems": [
            "model"
          ],
          "app-shortdef": {
            "hw": "model:2",
            "fl": "adjective",
            "def": [
              "{bc} deserving to be copied by others {bc} very good or excellent",
              "used to describe something that is a small copy of something larger"
            ]
          },
          "offensive": false
        },
        "hom": 2,
        "hwi": {
          "hw": "model",
          "altprs": [
            {
              "ipa": "ˈmɑːdl̟"
            }
          ]
        },
        "fl": "adjective",
        "lbs": [
          "always used before a noun"
        ],
        "def": [
          {
            "sseq": [
              [
                [
                  "sense",
                  {
                    "sn": "1",
                    "dt": [
                      [
                        "text",
                        "{bc}deserving to be copied by others {bc}very good or excellent "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "They're all {it}model{/it} students."
                          },
                          {
                            "t": "He's a {it}model{/it} husband."
                          },
                          {
                            "t": "Our university has a {it}model{/it} program for training its athletes."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "2",
                    "dt": [
                      [
                        "uns",
                        [
                          [
                            [
                              "text",
                              "used to describe something that is a small copy of something larger "
                            ],
                            [
                              "vis",
                              [
                                {
                                  "t": "a {it}model{/it} airplane"
                                },
                                {
                                  "t": "He'll play with his {it}model{/it} trains for hours."
                                }
                              ]
                            ]
                          ]
                        ]
                      ]
                    ]
                  }
                ]
              ]
            ]
          }
        ],
        "shortdef": [
          "deserving to be copied by others : very good or excellent",
          "—used to describe something that is a small copy of something larger"
        ]
      },
      {
        "meta": {
          "id": "model:3",
          "uuid": "56e81a91-a1c6-49b5-a687-709ae7356cb7",
          "src": "learners",
          "section": "alpha",
          "target": {
            "tuuid": "092ce4c8-1063-48bb-b740-fddeb2e99d30",
            "tsrc": "collegiate"
          },
          "stems": [
            "model",
            "modeled",
            "modeler",
            "modelers",
            "modeling",
            "modelled",
            "modeller",
            "modellers",
            "modelling",
            "models",
            "model yourself on",
            "model yourself after"
          ],
          "app-shortdef": {
            "hw": "model:3",
            "fl": "verb",
            "def": [
              "{bc} to design (something) so that it is similar to something else",
              "{bc} to make a small copy of (something) {bc} to create a model of (something)",
              "{bc} to make something by forming or shaping clay or some other material"
            ]
          },
          "offensive": false
        },
        "hom": 3,
        "hwi": {
          "hw": "model",
          "altprs": [
            {
              "ipa": "ˈmɑːdl̟"
            }
          ]
        },
        "fl": "verb",
        "ins": [
          {
            "ifc": "-els",
            "if": "models"
          },
          {
            "il": "US",
            "ifc": "-eled",
            "if": "modeled"
          },
          {
            "il": "or British",
            "ifc": "-elled",
            "if": "modelled"
          },
          {
            "il": "US",
            "ifc": "-el*ing",
            "if": "model*ing"
          },
          {
            "il": "or British",
            "ifc": "-el*ling",
            "if": "model*ling"
          }
        ],
        "def": [
          {
            "sseq": [
              [
                [
                  "sense",
                  {
                    "sn": "1",
                    "sgram": "+ obj",
                    "dt": [
                      [
                        "text",
                        "{bc}to design (something) so that it is similar to something else"
                      ],
                      [
                        "uns",
                        [
                          [
                            [
                              "text",
                              "+ {it}on{/it} or ({it}chiefly US{/it}) {it}after{/it} "
                            ],
                            [
                              "vis",
                              [
                                {
                                  "t": "They {it}modeled{/it} their educational system {it}on{/it} the U.S. system. [=they used the U.S. system as a model when they created their educational system]"
                                },
                                {
                                  "t": "His best dish is closely {it}modeled on{/it} his mother's recipe. [=is based on and very similar to his mother's recipe]"
                                },
                                {
                                  "t": "The church was {it}modeled after{/it} an earlier French design."
                                }
                              ]
                            ]
                          ]
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sen",
                  {
                    "sn": "2",
                    "sgram": "+ obj"
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "a",
                    "dt": [
                      [
                        "text",
                        "{bc}to make a small copy of (something) {bc}to create a model of (something) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "The faces of the gods were {it}modeled{/it} in white stone."
                          }
                        ]
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "b",
                    "dt": [
                      [
                        "text",
                        "{bc}to make something by forming or shaping clay or some other material "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "{it}modeling{/it} [={it}molding{/it}] figures in/from clay = {it}modeling{/it} clay into figures"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "3",
                    "dt": [
                      [
                        "text",
                        "{bc}to wear clothing, jewelry, etc., in photographs, fashion shows, etc., so that people will see and want to buy what you are wearing "
                      ],
                      [
                        "wsgram",
                        "+ obj"
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "They're {it}modeling{/it} this year's new spring fashions."
                          },
                          {
                            "t": "She got a job {it}modeling{/it} shoes for a catalog company."
                          },
                          {
                            "t": "a fashion model who has angered animal lovers by {it}modeling{/it} fur coats"
                          }
                        ]
                      ],
                      [
                        "wsgram",
                        "no obj"
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "She {it}models{/it} [=she works as a fashion model] for the world's most successful modeling agency."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "4",
                    "sgram": "no obj",
                    "dt": [
                      [
                        "text",
                        "{bc}to be a model for an artist {bc}to be painted or photographed by an artist "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "She agreed to {it}model{/it} for him and appeared in many of his most famous works."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ]
            ]
          }
        ],
        "uros": [
          {
            "ure": "mod*el*er",
            "rsl": "US",
            "vrs": [
              {
                "vl": "or British",
                "va": "mod*el*ler",
                "prs": [
                  {
                    "ipa": "ˈmɑːdl̟ɚ",
                    "sound": {
                      "audio": "model003"
                    }
                  }
                ]
              }
            ],
            "fl": "noun",
            "ins": [
              {
                "il": "plural",
                "ifc": "-ers",
                "if": "mod*el*ers"
              }
            ],
            "gram": "count",
            "utxt": [
              [
                "vis",
                [
                  {
                    "t": "a ship {it}modeler{/it} [=someone who makes small copies of ships]"
                  }
                ]
              ]
            ]
          }
        ],
        "dros": [
          {
            "drp": "model yourself on",
            "vrs": [
              {
                "vl": "or chiefly US",
                "va": "model yourself after"
              }
            ],
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{bc}to try to be like and to behave like (someone you admire) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "She {it}models herself on{/it} the leaders that came before her."
                              },
                              {
                                "t": "Children often {it}model themselves after{/it} their parents."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          }
        ],
        "shortdef": [
          "to design (something) so that it is similar to something else—+ on or (chiefly US) after",
          "to make a small copy of (something) : to create a model of (something)",
          "to make something by forming or shaping clay or some other material"
        ]
      },
      {
        "meta": {
          "id": "role model",
          "uuid": "3ea878b5-68bf-4472-90ee-fa2fbfd19d8e",
          "src": "learners",
          "section": "alpha",
          "target": {
            "tuuid": "cf3c60d9-87d1-4721-b5b0-3b8964311dde",
            "tsrc": "collegiate"
          },
          "stems": [
            "role model",
            "role models"
          ],
          "app-shortdef": {
            "hw": "role model",
            "fl": "noun",
            "def": [
              "{bc} someone who another person admires and tries to be like"
            ]
          },
          "offensive": false
        },
        "hwi": {
          "hw": "role model"
        },
        "fl": "noun",
        "ins": [
          {
            "il": "plural",
            "ifc": "~ -els",
            "if": "role models"
          }
        ],
        "gram": "count",
        "def": [
          {
            "sseq": [
              [
                [
                  "sense",
                  {
                    "dt": [
                      [
                        "text",
                        "{bc}someone who another person admires and tries to be like "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "Parents need to be good {it}role models{/it} (for their children)."
                          },
                          {
                            "t": "Athletes should remember that they are {it}role models{/it}."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ]
            ]
          }
        ],
        "shortdef": [
          "someone who another person admires and tries to be like"
        ]
      },
      {
        "meta": {
          "id": "scale:4",
          "uuid": "ad5ddd16-5ae1-4597-b5a7-8649641f3d9c",
          "src": "learners",
          "section": "alpha",
          "stems": [
            "scale",
            "scaled",
            "scaleless",
            "scales",
            "to scale",
            "on a scale of",
            "scale model",
            "on a global scale",
            "on a grand scale"
          ],
          "app-shortdef": {
            "hw": "scale:4",
            "fl": "noun",
            "def": [
              "{bc} a series of musical notes that go up or down in pitch",
              "{bc} a line on a map or chart that shows a specific unit of measure (such as an inch) used to represent a larger unit (such as a mile) {bc} the relationship between the distances on a map and the actual distances",
              "{bc} a range of numbers that is used to show the size, strength, or quality of something"
            ]
          },
          "offensive": false
        },
        "hom": 4,
        "hwi": {
          "hw": "scale",
          "altprs": [
            {
              "ipa": "ˈskeɪl"
            }
          ]
        },
        "fl": "noun",
        "ins": [
          {
            "il": "plural",
            "if": "scales"
          }
        ],
        "def": [
          {
            "sseq": [
              [
                [
                  "sense",
                  {
                    "sn": "1",
                    "sgram": "count",
                    "dt": [
                      [
                        "text",
                        "{bc}a series of musical notes that go up or down in pitch "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "the C-minor {it}scale{/it}"
                          },
                          {
                            "t": "a major {it}scale{/it}"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "2",
                    "sgram": "count",
                    "dt": [
                      [
                        "text",
                        "{bc}a line on a map or chart that shows a specific unit of measure (such as an inch) used to represent a larger unit (such as a mile) {bc}the relationship between the distances on a map and the actual distances "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "The map uses a {it}scale{/it} of one centimeter for every 10 kilometers."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "3",
                    "sgram": "count",
                    "dt": [
                      [
                        "text",
                        "{bc}a range of numbers that is used to show the size, strength, or quality of something"
                      ],
                      [
                        "uns",
                        [
                          [
                            [
                              "text",
                              "usually singular "
                            ],
                            [
                              "vis",
                              [
                                {
                                  "t": "{phrase}On a scale of{/phrase} 1 to 10, I give the movie a 9. [=the movie was extremely good]"
                                },
                                {
                                  "t": "{it}On a scale of{/it} 1 to 5—1 being mild pain and 5 being extreme pain—tell me how much pain you are in."
                                }
                              ]
                            ]
                          ]
                        ]
                      ],
                      [
                        "text",
                        "{dx}see also {dxt|richter scale||}{/dx}"
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "4",
                    "sgram": "count",
                    "dt": [
                      [
                        "text",
                        "{bc}a range of levels of something from lowest to highest "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "He is at the top of the pay {it}scale{/it} for his position."
                          },
                          {
                            "t": "Primates are high up on the evolutionary {it}scale{/it}."
                          }
                        ]
                      ],
                      [
                        "text",
                        "{dx}see also {dxt|sliding scale||}{/dx}"
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "5",
                    "sgram": "noncount",
                    "dt": [
                      [
                        "uns",
                        [
                          [
                            [
                              "text",
                              "used to describe a model, drawing, etc., in which all of the parts of something relate to each other in the same way that they do in the larger form "
                            ],
                            [
                              "vis",
                              [
                                {
                                  "t": "The model of the new city hall is {phrase}to scale{/phrase}. [=the model shows exactly how the parts will relate to each other when it is built]"
                                },
                                {
                                  "t": "The diagram was not drawn {it}to scale{/it}."
                                },
                                {
                                  "t": "a {phrase}scale model{/phrase} of a car"
                                }
                              ]
                            ]
                          ]
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "6",
                    "sgram": "singular",
                    "dt": [
                      [
                        "text",
                        "{bc}the size or level of something especially in comparison to something else "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "The company does things on a larger {it}scale{/it} than most others."
                          },
                          {
                            "t": "The mayor surveyed the full {it}scale{/it} [={it}extent{/it}] of the damage."
                          },
                          {
                            "t": "The war could impact the economy {phrase}on a global scale{/phrase}. [=could impact the economy of the entire world]"
                          },
                          {
                            "t": "They exposed fraud {phrase}on a grand scale{/phrase}."
                          }
                        ]
                      ],
                      [
                        "text",
                        "{dx}see also {dxt|full-scale||} {dxt|large-scale||} {dxt|small-scale||}{/dx}"
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "7",
                    "sgram": "noncount",
                    "sls": [
                      "technical"
                    ],
                    "dt": [
                      [
                        "text",
                        "{bc}a hard substance that is formed in pipes or containers holding water"
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "8",
                    "sgram": "noncount",
                    "sls": [
                      "British"
                    ],
                    "dt": [
                      [
                        "text",
                        "{bc}a hard substance that forms on teeth {bc}{sx|tartar||} "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "buildup of plaque and {it}scale{/it} on the teeth"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ]
            ]
          }
        ],
        "dxnls": [
          "compare {dxt|scale:1||} {dxt|scale:2||}"
        ],
        "shortdef": [
          "a series of musical notes that go up or down in pitch",
          "a line on a map or chart that shows a specific unit of measure (such as an inch) used to represent a larger unit (such as a mile) : the relationship between the distances on a map and the actual distances",
          "a range of numbers that is used to show the size, strength, or quality of something—usually singular"
        ]
      }
    ],
    [
      {
        "meta": {
          "id": "quickly",
          "uuid": "04a82e89-7a7c-4eed-874e-7007ea2cb8b7",
          "src": "learners",
          "section": "alpha",
          "stems": [
            "quickly"
          ],
          "app-shortdef": {
            "hw": "quickly",
            "fl": "adverb",
            "def": [
              "{bc} in a fast or quick manner"
            ]
          },
          "offensive": false
        },
        "hwi": {
          "hw": "quick*ly",
          "prs": [
            {
              "ipa": "ˈkwɪkli",
              "sound": {
                "audio": "quick01ld"
              }
            }
          ]
        },
        "fl": "adverb",
        "gram": "more ~; most ~",
        "def": [
          {
            "sseq": [
              [
                [
                  "sense",
                  {
                    "dt": [
                      [
                        "text",
                        "{bc}in a fast or quick manner "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "They {it}quickly{/it} moved away when they saw the oncoming car."
                          },
                          {
                            "t": "The investigators must act {it}quickly{/it}."
                          },
                          {
                            "t": "Please get here as {it}quickly{/it} as possible."
                          },
                          {
                            "t": "We ate too/very {it}quickly{/it}."
                          },
                          {
                            "t": "They {it}quickly{/it} settled the dispute."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ]
            ]
          }
        ],
        "shortdef": [
          "in a fast or quick manner"
        ]
      },
      {
        "meta": {
          "id": "quick:1",
          "uuid": "7cabc8ef-5ad9-48bc-93fa-a2cb0a159e3f",
          "src": "learners",
          "section": "alpha",
          "target": {
            "tuuid": "8ca1b6f0-2a07-433e-bebd-125379debf5d",
            "tsrc": "collegiate"
          },
          "highlight": "yes",
          "stems": [
            "quick",
            "quicker",
            "quickest",
            "quickly",
            "quickness",
            "quicknesses",
            "be quick on the draw",
            "quick off the mark",
            "the quick and the dead",
            "quick study",
            "quick wit",
            "quick temper",
            "quick fix"
          ],
          "app-shortdef": {
            "hw": "quick:1",
            "fl": "adjective",
            "def": [
              "{bc} done or happening in a short amount of time",
              "{bc} fast in thinking, learning, or understanding",
              "{bc} fast in moving or reacting"
            ]
          },
          "offensive": false
        },
        "hom": 1,
        "hwi": {
          "hw": "quick",
          "prs": [
            {
              "ipa": "ˈkwɪk",
              "sound": {
                "audio": "quick001"
              }
            }
          ]
        },
        "fl": "adjective",
        "ins": [
          {
            "if": "quick*er"
          },
          {
            "ifc": "-est",
            "if": "quick*est"
          }
        ],
        "def": [
          {
            "sseq": [
              [
                [
                  "sense",
                  {
                    "sn": "1",
                    "dt": [
                      [
                        "text",
                        "{bc}done or happening in a short amount of time "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "a {it}quick{/it} look/glance"
                          },
                          {
                            "t": "They had a {it}quick{/it} drink at the bar."
                          },
                          {
                            "t": "She took a {it}quick{/it} shower."
                          },
                          {
                            "t": "She gave him a {it}quick{/it} kiss."
                          },
                          {
                            "t": "You're back already? That was {it}quick{/it}!"
                          },
                          {
                            "t": "We made a {it}quick{/it} decision, but it turned out to be a good one."
                          },
                          {
                            "t": "He got a {it}quick{/it} reply to his inquiry."
                          },
                          {
                            "t": "The car made a {it}quick{/it} [={it}sudden{/it}] left turn."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "2",
                    "dt": [
                      [
                        "text",
                        "{bc}fast in thinking, learning, or understanding "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "a {it}quick{/it} mind/learner"
                          },
                          {
                            "t": "{it}quick{/it} students"
                          },
                          {
                            "t": "His {it}quick{/it} thinking/wits allowed him to escape trouble."
                          },
                          {
                            "t": "({it}US{/it}) She is a {phrase}quick study{/phrase} who learned her job easily."
                          },
                          {
                            "t": "Her friends admired her {phrase}quick wit{/phrase}."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "3 a",
                    "dt": [
                      [
                        "text",
                        "{bc}fast in moving or reacting "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "He walked with {it}quick{/it} steps."
                          },
                          {
                            "t": "She has {it}quick{/it}, agile hands."
                          },
                          {
                            "t": "Please be {it}quick{/it}. We can't wait much longer."
                          },
                          {
                            "t": "He has a {phrase}quick temper{/phrase}. [=he gets angry very quickly and easily]"
                          }
                        ]
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "b",
                    "dt": [
                      [
                        "text",
                        "{bc}tending to do something very quickly or too quickly"
                      ],
                      [
                        "uns",
                        [
                          [
                            [
                              "text",
                              "followed by {it}to{/it} + {it}verb{/it} "
                            ],
                            [
                              "vis",
                              [
                                {
                                  "t": "He is always {it}quick to criticize{/it} other people, but he gets angry if anyone criticizes him."
                                },
                                {
                                  "t": "She was {it}quick to excuse{/it} her son's behavior."
                                }
                              ]
                            ]
                          ]
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "4",
                    "dt": [
                      [
                        "text",
                        "{bc}able to be done, obtained, or achieved easily and in a short amount of time "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "a {it}quick{/it} and easy recipe"
                          },
                          {
                            "t": "He made a {it}quick{/it} profit/buck selling the car."
                          },
                          {
                            "t": "There is no {phrase}quick fix{/phrase} for these problems. [=there is no fast and easy solution for these problems]"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ]
            ]
          }
        ],
        "uros": [
          {
            "ure": "quick*ness",
            "fl": "noun",
            "gram": "noncount",
            "utxt": [
              [
                "vis",
                [
                  {
                    "t": "The track coach was impressed with her {it}quickness{/it}."
                  },
                  {
                    "t": "He is known for his {it}quickness{/it} of wit."
                  },
                  {
                    "t": "The child amazes me with his {it}quickness{/it} to learn."
                  }
                ]
              ]
            ]
          }
        ],
        "dros": [
          {
            "drp": "be quick on the draw",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|draw:2||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "quick off the mark",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|mark:1||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "the quick and the dead",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sls": [
                          "literary"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}living people and dead people"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          }
        ],
        "shortdef": [
          "done or happening in a short amount of time",
          "fast in thinking, learning, or understanding",
          "fast in moving or reacting"
        ]
      },
      {
        "meta": {
          "id": "as:2",
          "uuid": "6dc734c3-55b0-4b62-8280-e44d7ea5322d",
          "src": "learners",
          "section": "alpha",
          "target": {
            "tuuid": "d0fbcabf-2da2-4d82-a701-e46e41a029b4",
            "tsrc": "collegiate"
          },
          "highlight": "yes",
          "stems": [
            "as",
            "as is",
            "as it were",
            "as against",
            "as for",
            "as from",
            "as if",
            "as though",
            "as it is",
            "as of",
            "as to",
            "as was",
            "so as",
            "as…as",
            "as soon/early/quickly as possible",
            "as early as possible",
            "as quickly as possible",
            "as soon as possible",
            "as it happens",
            "as it happened",
            "as it turned out",
            "as is the case",
            "much as",
            "as much as",
            "try as he might",
            "as if i ever would",
            "as if i cared"
          ],
          "app-shortdef": {
            "hw": "as:2",
            "fl": "conjunction",
            "def": [
              "used to make comparisons usually used in the phrase {phrase}as…as{/phrase} sometimes used in negative phrases with {it}so{/it}",
              "used in the phrase {phrase}as…as{/phrase} to say when something should be done, how often something should happen, etc.",
              "{bc} in the way that"
            ]
          },
          "offensive": false
        },
        "hom": 2,
        "hwi": {
          "hw": "as",
          "altprs": [
            {
              "ipa": "ˈæz",
              "pun": ","
            },
            {
              "ipa": "əz"
            }
          ]
        },
        "fl": "conjunction",
        "def": [
          {
            "sseq": [
              [
                [
                  "sense",
                  {
                    "sn": "1 a",
                    "dt": [
                      [
                        "uns",
                        [
                          [
                            [
                              "text",
                              "used to make comparisons "
                            ],
                            [
                              "vis",
                              [
                                {
                                  "t": "The fabric was soft {it}as{/it} silk. [=the softness of the fabric was like the softness of silk]"
                                }
                              ]
                            ]
                          ],
                          [
                            [
                              "text",
                              "usually used in the phrase {phrase}as…as{/phrase} "
                            ],
                            [
                              "vis",
                              [
                                {
                                  "t": "The fabric was {it}as{/it} soft {it}as{/it} silk."
                                },
                                {
                                  "t": "He is every bit {it}as{/it} clever {it}as{/it} she (is)."
                                },
                                {
                                  "t": "There are {it}as{/it} many books here {it}as{/it} (there are) there."
                                },
                                {
                                  "t": "That was {it}as{/it} delicious a meal {it}as{/it} your last one (was). = That was a meal {it}as{/it} delicious {it}as{/it} your last one (was)."
                                },
                                {
                                  "t": "{it}as{/it} hard {it}as{/it} a rock [=very hard]"
                                },
                                {
                                  "t": "{it}as{/it} clear {it}as{/it} crystal [=completely clear]"
                                },
                                {
                                  "t": "{it}as{/it} white {it}as{/it} snow [=snow-white, pure white]"
                                },
                                {
                                  "t": "He is {it}as{/it} brave {it}as{/it} he is loyal."
                                },
                                {
                                  "t": "Her second book is twice {it}as{/it} long {it}as{/it} her first one."
                                },
                                {
                                  "t": "He's not {it}as{/it} old {it}as{/it} he claims to be."
                                }
                              ]
                            ]
                          ],
                          [
                            [
                              "text",
                              "sometimes used in negative phrases with {it}so{/it} "
                            ],
                            [
                              "vis",
                              [
                                {
                                  "t": "He's not {it}so{/it} old {it}as{/it} he claims to be."
                                }
                              ]
                            ]
                          ]
                        ]
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "b",
                    "dt": [
                      [
                        "uns",
                        [
                          [
                            [
                              "text",
                              "used in the phrase {phrase}as…as{/phrase} to say when something should be done, how often something should happen, etc. "
                            ],
                            [
                              "vis",
                              [
                                {
                                  "t": "Come back {it}as{/it} often {it}as{/it} you like."
                                },
                                {
                                  "t": "If you're going to look for a new job, you should do it {phrase}as soon/early/quickly as possible{/phrase}."
                                }
                              ]
                            ]
                          ]
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "2 a",
                    "dt": [
                      [
                        "text",
                        "{bc}in the way that "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "The letter {ldquo}k{rdquo} is sometimes silent, {it}as{/it} it is in {ldquo}knee.{rdquo}"
                          },
                          {
                            "t": "In the word {ldquo}macho{rdquo} the {ldquo}ch{rdquo} should be pronounced {it}as{/it} (it is) in {ldquo}China,{rdquo} not {it}as{/it} (it is) in {ldquo}Chicago.{rdquo}"
                          },
                          {
                            "t": "Knowing him {it}as{/it} I do [=because I know him well], I'm not surprised by his decision."
                          },
                          {
                            "t": "Do (it) {it}as{/it} I do."
                          },
                          {
                            "t": "I'll do it {it}as{/it} I planned (to)."
                          },
                          {
                            "t": "Sometimes a noun comes from a verb ({it}as{/it} {ldquo}publisher{rdquo} comes from {ldquo}publish{rdquo}) and sometimes a verb comes from a noun ({it}as{/it} {ldquo}edit{rdquo} comes from {ldquo}editor{rdquo})."
                          },
                          {
                            "t": "{phrase}As it happens{/phrase}, I know his brother. [=I happen to know his brother]"
                          },
                          {
                            "t": "We planned a picnic but, {phrase}as it happened{/phrase}, it rained that day. [=it happened to rain that day]"
                          },
                          {
                            "t": "We arrived late and, {phrase}as it turned out{/phrase}, all the tickets were already sold. [=we learned that all the tickets were already sold when we arrived late]"
                          },
                          {
                            "t": "He seemed to be having a midlife crisis, {it}as{/it} many men do. = {phrase}As is the case{/phrase} with many men, he seemed to be having a midlife crisis."
                          }
                        ]
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "b",
                    "dt": [
                      [
                        "uns",
                        [
                          [
                            [
                              "text",
                              "used to introduce a statement which indicates that something being mentioned was known, expected, etc. "
                            ],
                            [
                              "vis",
                              [
                                {
                                  "t": "He won the election, {it}as{/it} you know. = {it}As{/it} you know, he won the election."
                                },
                                {
                                  "t": "{it}As{/it} was only to be expected, the election was very close."
                                },
                                {
                                  "t": "He is a foreigner, {it}as{/it} is evident from his accent."
                                },
                                {
                                  "t": "It rained that day, {it}as{/it} often happens."
                                },
                                {
                                  "t": "Just {it}as{/it} I suspected/thought! You've been drinking!"
                                }
                              ]
                            ]
                          ]
                        ]
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "c",
                    "dt": [
                      [
                        "uns",
                        [
                          [
                            [
                              "text",
                              "used in phrases with {it}same{/it} "
                            ],
                            [
                              "vis",
                              [
                                {
                                  "t": "He works in the {it}same{/it} building {it}as{/it} my brother. [=he and my brother work in the same building]"
                                },
                                {
                                  "t": "I've got shoes the {it}same as{/it} his. = I've got the {it}same{/it} type of shoes {it}as{/it} he has. [=my shoes and his shoes are the same]"
                                },
                                {
                                  "t": "He was fooled the {it}same as{/it} I was. [=he and I were both fooled]"
                                }
                              ]
                            ]
                          ]
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "3",
                    "dt": [
                      [
                        "text",
                        "{bc}while or when "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "She spilled the milk just {it}as{/it} she was getting up."
                          },
                          {
                            "t": "I met him {it}as{/it} I was leaving."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "4",
                    "dt": [
                      [
                        "text",
                        "{bc}regardless of the degree to which {bc}{sx|though||} "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "Unaccustomed {it}as{/it} I am to public speaking [=although I am unaccustomed to public speaking], I'd like to say a few words now."
                          },
                          {
                            "t": "Improbable {it}as{/it} it seems, it's still true. = ({it}chiefly US{/it}) {it}As{/it} improbable {it}as{/it} it seems, it's still true. [=although it seems improbable, it's still true]"
                          },
                          {
                            "t": "{phrase}Much as{/phrase} I respect him [=although I respect him very much], I still have to disagree with him on this point. = ({it}chiefly US{/it}) {phrase}As much as{/phrase} I respect him, I still have to disagree with him on this point."
                          },
                          {
                            "t": "{phrase}Try as he might{/phrase} [=no matter how hard he tried], he couldn't do it."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "5",
                    "sls": [
                      "formal"
                    ],
                    "dt": [
                      [
                        "text",
                        "{bc}for the reason that {bc}{sx|because||} "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "She stayed home {it}as{/it} she had no car."
                          },
                          {
                            "t": "{it}As{/it} I'm a pacifist, I'm against all wars."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "6",
                    "dt": [
                      [
                        "uns",
                        [
                          [
                            [
                              "text",
                              "used to indicate that one relationship is like another relationship "
                            ],
                            [
                              "vis",
                              [
                                {
                                  "t": "A puppy is to a dog {it}as{/it} a kitten is to a cat."
                                },
                                {
                                  "t": "Two is to four {it}as{/it} eight is to sixteen."
                                }
                              ]
                            ]
                          ]
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "7",
                    "dt": [
                      [
                        "uns",
                        [
                          [
                            [
                              "text",
                              "used with {it}so{/it} or {it}such{/it} to indicate the result or effect of something "
                            ],
                            [
                              "vis",
                              [
                                {
                                  "t": "The evidence is {it}such as{/it} to leave no doubt of his guilt. [=the evidence leaves no doubt of his guilt]"
                                },
                                {
                                  "t": "He is {it}so{/it} clearly guilty {it}as{/it} to leave no doubt."
                                }
                              ]
                            ]
                          ]
                        ]
                      ],
                      [
                        "text",
                        "{dx}see also {dxt|so as||(below)}{/dx}"
                      ]
                    ]
                  }
                ]
              ]
            ]
          }
        ],
        "dros": [
          {
            "drp": "as against",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{bc}in comparison to (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The government's foreign policy is approved by 54 percent of men {it}as against{/it} 48 percent of women."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "as for",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{bc}with regard to {bc}{sx|concerning||} "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He's here. {it}As for{/it} the others, they'll arrive later. [=the others will arrive later]"
                              },
                              {
                                "t": "He was a nice enough person, but {it}as for{/it} his suggestions, I found them unhelpful."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "as from",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sls": [
                          "chiefly British"
                        ],
                        "dt": [
                          [
                            "uns",
                            [
                              [
                                [
                                  "text",
                                  "used to indicate the time or date when something begins "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "The new law takes effect {it}as from{/it} [={it}as of{/it}] July 1."
                                    }
                                  ]
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "as if",
            "vrs": [
              {
                "vl": "or",
                "va": "as though"
              }
            ],
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sn": "1",
                        "dt": [
                          [
                            "text",
                            "{bc}the way it would be if "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The plane looked {it}as if{/it} it was going to crash."
                              },
                              {
                                "t": "He was as sad {it}as if{/it} he had lost his last friend."
                              },
                              {
                                "t": "The dog wagged its tail {it}as if{/it} to say {ldquo}Welcome back!{rdquo} = The dog wagged its tail {it}as if{/it} it was/were saying {ldquo}Welcome back!{rdquo}"
                              },
                              {
                                "t": "The day seemed {it}as though{/it} it would never end. = It seemed {it}as though{/it} the day would never end."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "2",
                        "dt": [
                          [
                            "text",
                            "{bc}as someone would do if "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He ran {it}as if{/it} ghosts were chasing him."
                              },
                              {
                                "t": "He had his hands together {it}as though{/it} in prayer."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "3",
                        "dt": [
                          [
                            "uns",
                            [
                              [
                                [
                                  "text",
                                  "used in spoken phrases to say that something is not true, will not happen, etc. "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "{ldquo}She's afraid you might try to take the job yourself.{rdquo} {ldquo}{phrase}As if I ever would{/phrase}!{rdquo} [=I never would]"
                                    },
                                    {
                                      "t": "{ldquo}He'll never come back, you know!{rdquo} {ldquo}{phrase}As if I cared{/phrase}!{rdquo} [=I don't care]"
                                    }
                                  ]
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "4",
                        "dt": [
                          [
                            "snote",
                            [
                              [
                                "t",
                                "The phrase {it}as if{/it} is sometimes used informally as an interjection to say that something suggested or claimed is impossible or very unlikely."
                              ],
                              [
                                "vis",
                                [
                                  {
                                    "t": "{ldquo}He thinks you like him.{rdquo} {ldquo}{it}As if{/it}!{rdquo} [=I don't like him at all; there is no chance that I would like him]"
                                  }
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "as is",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sls": [
                          "chiefly US"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}in the present condition without any changes "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The car is being sold {it}as is{/it}."
                              },
                              {
                                "t": "She bought the clock at an auction {it}as is{/it}."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "as it is",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sn": "1",
                        "dt": [
                          [
                            "text",
                            "{bc}in the present condition "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "Leave everything exactly/just {it}as it is{/it}. [=how it is, the way it is]"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "2",
                        "dt": [
                          [
                            "text",
                            "{bc}with the situation that exists now "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "We have enough to do {it}as it is{/it} [={it}already{/it}] without your latest orders!"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "as it were",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "uns",
                            [
                              [
                                [
                                  "text",
                                  "used to say that a statement is true or accurate in a certain way even if it is not literally or completely true "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "His retirement was, {it}as it were{/it} [={it}so to speak{/it}], the beginning of his real career."
                                    }
                                  ]
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "as of",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "uns",
                            [
                              [
                                [
                                  "text",
                                  "used to indicate the time or date when something begins "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "The new law takes effect {it}as of{/it} July 1."
                                    },
                                    {
                                      "t": "{it}As of{/it} July 1, prices will rise."
                                    }
                                  ]
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "as to",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sn": "1",
                        "dt": [
                          [
                            "text",
                            "{bc}{sx|about:2||} "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "I'm at a loss {it}as to{/it} how to explain the error. [=I don't know how to explain the error]"
                              },
                              {
                                "t": "There is disagreement {it}as to{/it} the causes of the fire."
                              },
                              {
                                "t": "I remained uncertain {it}as to{/it} the value of his suggestions."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "2",
                        "dt": [
                          [
                            "text",
                            "{bc}{sx|according to||} {sx|by||} "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The eggs are graded {it}as to{/it} size and color."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "as was",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sls": [
                          "British",
                          "informal"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}{sx|formerly||} {sx|originally||}"
                          ],
                          [
                            "uns",
                            [
                              [
                                [
                                  "text",
                                  "used after a former name "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "Myanmar—Burma {it}as was{/it} [=Myanmar, which was formerly called Burma]"
                                    }
                                  ]
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "so as",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "uns",
                            [
                              [
                                [
                                  "text",
                                  "used to indicate the purpose of something "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "He defended himself {it}so as{/it} [={it}in order{/it}] to prove his innocence."
                                    }
                                  ]
                                ]
                              ]
                            ]
                          ],
                          [
                            "text",
                            "{dx}see also {dxt|as:2||7 (above)}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          }
        ],
        "shortdef": [
          "—used to make comparisons —usually used in the phrase as…as —sometimes used in negative phrases with so",
          "—used in the phrase as…as to say when something should be done, how often something should happen, etc.",
          "in the way that"
        ]
      },
      {
        "meta": {
          "id": "possible:1",
          "uuid": "8ff76bcb-a041-495d-a4fa-146bba4b2aba",
          "src": "learners",
          "section": "alpha",
          "target": {
            "tuuid": "10856967-f277-43bc-9336-a18a90a32cc2",
            "tsrc": "collegiate"
          },
          "highlight": "yes",
          "stems": [
            "possible",
            "whenever possible",
            "if (at all) possible",
            "if at all possible",
            "if possible",
            "as soon/quickly as (humanly) possible",
            "as quickly as humanly possible",
            "as quickly as possible",
            "as soon as humanly possible",
            "as soon as possible"
          ],
          "app-shortdef": {
            "hw": "possible:1",
            "fl": "adjective",
            "def": [
              "{bc} able to be done",
              "{bc} able to happen or exist",
              "{bc} able or suited to be or to become something specified"
            ]
          },
          "offensive": false
        },
        "hom": 1,
        "hwi": {
          "hw": "pos*si*ble",
          "prs": [
            {
              "ipa": "ˈpɑːsəbəl",
              "sound": {
                "audio": "possib02"
              }
            }
          ]
        },
        "fl": "adjective",
        "gram": "more ~; most ~",
        "def": [
          {
            "sseq": [
              [
                [
                  "sense",
                  {
                    "sn": "1",
                    "lbs": [
                      "not usually used before a noun"
                    ],
                    "dt": [
                      [
                        "text",
                        "{bc}able to be done "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "It simply isn't {it}possible{/it}."
                          },
                          {
                            "t": "Would it be {it}possible{/it} for me to use your phone? [=may I use your phone?]"
                          },
                          {
                            "t": "Advances in medicine have made it {it}possible{/it} for people to live longer."
                          },
                          {
                            "t": "It is {it}possible{/it} that she decided not to join us."
                          },
                          {
                            "t": "We tried to spend as little money as {it}possible{/it}."
                          },
                          {
                            "t": "It is not physically {it}possible{/it} to do everything you have planned in one day."
                          },
                          {
                            "t": "I like to go swimming {phrase}whenever possible{/phrase}. [=whenever there is an opportunity to swim]"
                          },
                          {
                            "t": "Do your best to come home from work early, {phrase}if (at all) possible{/phrase}. [=if it can be done]"
                          },
                          {
                            "t": "Come {phrase}as soon/quickly as (humanly) possible{/phrase}. [=as soon as you can]"
                          }
                        ]
                      ],
                      [
                        "text",
                        "{dx}opposite {dxt|impossible||}{/dx}"
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "2",
                    "dt": [
                      [
                        "text",
                        "{bc}able to happen or exist "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "We need to plan against {it}possible{/it} dangers. [=dangers that may occur]"
                          },
                          {
                            "t": "The weather report warned of {it}possible{/it} thunderstorms tonight."
                          },
                          {
                            "t": "Thunderstorms are {it}possible{/it} but not probable tonight."
                          },
                          {
                            "t": "The highest {it}possible{/it} score is 100."
                          },
                          {
                            "t": "How {it}possible{/it} [={it}likely{/it}] is rain today?"
                          },
                          {
                            "t": "What {it}possible{/it} good can it do to argue?"
                          },
                          {
                            "t": "He is in the worst {it}possible{/it} situation."
                          },
                          {
                            "t": "It is {it}possible{/it} that life exists on other planets."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "3",
                    "lbs": [
                      "always used before a noun"
                    ],
                    "dt": [
                      [
                        "text",
                        "{bc}able or suited to be or to become something specified "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "I found a {it}possible{/it} site for a camp."
                          },
                          {
                            "t": "She suggested a {it}possible{/it} solution to the problem."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "4",
                    "dt": [
                      [
                        "text",
                        "{bc}reasonable to believe {bc}perhaps true "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "It's {it}possible{/it} that your computer has a virus."
                          },
                          {
                            "t": "Robbery is one {it}possible{/it} motive for the murder."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ]
            ]
          }
        ],
        "shortdef": [
          "able to be done",
          "able to happen or exist",
          "able or suited to be or to become something specified"
        ]
      }
    ],
    [
      {
        "meta": {
          "id": "above:1",
          "uuid": "7c310121-241b-425d-a134-fd7456cd5a07",
          "src": "learners",
          "section": "alpha",
          "target": {
            "tuuid": "487427fe-b68d-444f-a539-619a029b4878",
            "tsrc": "collegiate"
          },
          "highlight": "yes",
          "stems": [
            "above",
            "from above"
          ],
          "app-shortdef": {
            "hw": "above:1",
            "fl": "adverb",
            "def": [
              "{bc} in or to a higher place",
              "{bc} in or to a higher rank or number",
              "{bc} above zero"
            ]
          },
          "offensive": false
        },
        "hom": 1,
        "hwi": {
          "hw": "above",
          "prs": [
            {
              "ipa": "əˈbʌv",
              "sound": {
                "audio": "above001"
              }
            }
          ]
        },
        "fl": "adverb",
        "def": [
          {
            "sseq": [
              [
                [
                  "sense",
                  {
                    "sn": "1",
                    "dt": [
                      [
                        "text",
                        "{bc}in or to a higher place "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "They stood under the tree and looked at the branches {it}above{/it}. [={it}overhead{/it}]"
                          },
                          {
                            "t": "The stars shone {it}above{/it}. [=in the sky]"
                          },
                          {
                            "t": "The stairs lead {it}above{/it} [={it}upstairs{/it}] to the bedrooms."
                          },
                          {
                            "t": "up {it}above{/it} and down below"
                          }
                        ]
                      ],
                      [
                        "snote",
                        [
                          [
                            "t",
                            "The opposite of every sense of {it}above{/it} is {it}below{/it}."
                          ]
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "2",
                    "dt": [
                      [
                        "text",
                        "{bc}in or to a higher rank or number "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "Students in the grade {it}above{/it} [=in the next grade] study algebra."
                          },
                          {
                            "t": "Groups of six and {it}above{/it} [=of six or more] need reservations."
                          },
                          {
                            "t": "a game that is suitable for children at/of age 10 and {it}above{/it} [={it}older{/it}]"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "3",
                    "dt": [
                      [
                        "text",
                        "{bc}above zero "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "Temperatures range from 5 below to 5 {it}above{/it}."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "4",
                    "dt": [
                      [
                        "text",
                        "{bc}higher, further up, or earlier on the same page or on a preceding page {bc}at a previous point in the same document "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "Write to us at the address shown {it}above{/it}. [=at the above address]"
                          },
                          {
                            "t": "Except as noted {it}above{/it}, all the information can be verified."
                          },
                          {
                            "t": "the person named {it}above{/it} = the {it}above{/it}-named person"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ]
            ]
          }
        ],
        "dros": [
          {
            "drp": "from above",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sn": "1",
                        "dt": [
                          [
                            "text",
                            "{bc}from a higher place or position "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "It looks like a cross when viewed {it}from above{/it}."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "2",
                        "dt": [
                          [
                            "text",
                            "{bc}from someone with greater power or authority "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "waiting for orders {it}from above{/it}"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          }
        ],
        "shortdef": [
          "in or to a higher place",
          "in or to a higher rank or number",
          "above zero"
        ]
      },
      {
        "meta": {
          "id": "above:2",
          "uuid": "d3391d02-40cc-44a7-9934-c193bbfeb1a4",
          "src": "learners",
          "section": "alpha",
          "target": {
            "tuuid": "5779dc2e-a391-4f61-8ef0-541c4ff39077",
            "tsrc": "collegiate"
          },
          "highlight": "yes",
          "stems": [
            "above",
            "above all",
            "above and beyond",
            "get above yourself",
            "over and above"
          ],
          "app-shortdef": {
            "hw": "above:2",
            "fl": "preposition",
            "def": [
              "{bc} in or to a higher place than (something)",
              "{bc} greater in number, quantity, or size than (something) {bc} more than (something)",
              "{bc} to a greater degree or extent than (something)"
            ]
          },
          "offensive": false
        },
        "hom": 2,
        "hwi": {
          "hw": "above",
          "altprs": [
            {
              "ipa": "əˈbʌv"
            }
          ]
        },
        "fl": "preposition",
        "def": [
          {
            "sseq": [
              [
                [
                  "sense",
                  {
                    "sn": "1",
                    "dt": [
                      [
                        "text",
                        "{bc}in or to a higher place than (something) {bc}{sx|over||} "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "He raised his arms {it}above{/it} his head."
                          },
                          {
                            "t": "They hung a mirror {it}above{/it} the mantel."
                          },
                          {
                            "t": "We rented an apartment {it}above{/it} a restaurant."
                          }
                        ]
                      ],
                      [
                        "text",
                        "{dx}opposite {dxt|below||}{/dx}"
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "2",
                    "dt": [
                      [
                        "text",
                        "{bc}greater in number, quantity, or size than (something) {bc}more than (something) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "Temperatures were {it}above{/it} average all week."
                          },
                          {
                            "t": "men {it}above{/it} 50 years old"
                          }
                        ]
                      ],
                      [
                        "text",
                        "{dx}opposite {dxt|below||}{/dx}"
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "3 a",
                    "dt": [
                      [
                        "text",
                        "{bc}to a greater degree or extent than (something) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "She values her private time {it}above{/it} her fame."
                          }
                        ]
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "b",
                    "dt": [
                      [
                        "text",
                        "{bc}in a higher or more important position than (something) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "He puts his child's needs {it}above{/it} his own."
                          }
                        ]
                      ],
                      [
                        "text",
                        "{dx}opposite {dxt|below||}{/dx}"
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "4",
                    "dt": [
                      [
                        "text",
                        "{bc}having more importance or power than (someone) {bc}having a higher rank than (someone) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "A captain is {it}above{/it} a lieutenant. [=a captain outranks a lieutenant]"
                          },
                          {
                            "t": "Who is {it}above{/it} him in that department?"
                          }
                        ]
                      ],
                      [
                        "text",
                        "{dx}opposite {dxt|below||}{/dx}"
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "5",
                    "dt": [
                      [
                        "text",
                        "{bc}too important for (something) {bc}not able to be affected by (something) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "She thinks that she's {it}above{/it} criticism/suspicion. [=that she cannot be criticized/suspected]"
                          }
                        ]
                      ],
                      [
                        "text",
                        "{dx}see also {it}above the law{/it} at {dxt|law||}{/dx}"
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "6",
                    "dt": [
                      [
                        "text",
                        "{bc}too good for (some type of behavior, work, etc.) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "I thought you were {it}above{/it} lying to people. [=I thought such dishonest behavior was beneath you]"
                          },
                          {
                            "t": "He was not {it}above{/it} cheating when it served his purposes. [=he would cheat when it served his purposes]"
                          },
                          {
                            "t": "Does she think she's {it}above{/it} that kind of work? [=does she think that kind of work is beneath her?]"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "7",
                    "dt": [
                      [
                        "text",
                        "{bc}more loudly and clearly than (another sound) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "I heard the whistle {it}above{/it} [={it}over{/it}] the roar of the crowd."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ]
            ]
          }
        ],
        "dros": [
          {
            "drp": "above all",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{bc}as the most important thing {bc}{sx|especially||} "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "{it}Above all{/it}, we must consider what is best for the children."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "above and beyond",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{bc}far beyond what is required by (something, such as a duty) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He went {it}above and beyond{/it} the call of duty. [=he did more than his duty required him to do]"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get above yourself",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sls": [
                          "chiefly British"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to think you are more important than you really are "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "We are pleased by his success, but we worry that he might be {it}getting above himself{/it}."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "over and above",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|over:2||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          }
        ],
        "shortdef": [
          "in or to a higher place than (something) : over",
          "greater in number, quantity, or size than (something) : more than (something)",
          "to a greater degree or extent than (something)"
        ]
      },
      {
        "meta": {
          "id": "above:3",
          "uuid": "34289606-3b9b-435b-9e73-298a65871b45",
          "src": "learners",
          "section": "alpha",
          "target": {
            "tuuid": "2573d3ef-4499-491c-a484-4e36746c65b4",
            "tsrc": "collegiate"
          },
          "stems": [
            "above",
            "the above",
            "none of the above"
          ],
          "app-shortdef": {
            "hw": "above:3",
            "fl": "adjective",
            "def": [
              "{bc} mentioned at an earlier point in the same document {bc} written above"
            ]
          },
          "offensive": false
        },
        "hom": 3,
        "hwi": {
          "hw": "above",
          "altprs": [
            {
              "ipa": "əˈbʌv"
            }
          ]
        },
        "fl": "adjective",
        "def": [
          {
            "sseq": [
              [
                [
                  "sense",
                  {
                    "dt": [
                      [
                        "text",
                        "{bc}mentioned at an earlier point in the same document {bc}written above "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "You can contact me at the {it}above{/it} address. [=at the address shown above]"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ]
            ]
          }
        ],
        "dros": [
          {
            "drp": "the above",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{bc}something that is mentioned at an earlier point in the same document "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "If any of {it}the above{/it} is incorrect, please let me know."
                              },
                              {
                                "t": "Contact any of {it}the above{/it} [=any of the people mentioned above] for more information."
                              },
                              {
                                "t": "The correct answer is {ldquo}{phrase}none of the above{/phrase}.{rdquo}"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          }
        ],
        "shortdef": [
          "mentioned at an earlier point in the same document : written above"
        ]
      },
      {
        "meta": {
          "id": "all:3",
          "uuid": "37ae15d5-96c7-45ea-8c9f-e2a3b14e382d",
          "src": "learners",
          "section": "alpha",
          "target": {
            "tuuid": "f7a2fa9d-6497-4f2a-a931-b91f71011f5c",
            "tsrc": "collegiate"
          },
          "highlight": "yes",
          "stems": [
            "all",
            "above all",
            "after all",
            "all aboard!",
            "all in all",
            "all's fair in love and war",
            "alls fair in love and war",
            "all told",
            "and all",
            "at all",
            "for all",
            "for all i know",
            "for all (someone) cares",
            "for all cares",
            "for all someone cares",
            "give your all",
            "in all",
            "once and for all",
            "that is all",
            "when all is said and done",
            "was all (that) i could do",
            "was all i could do",
            "was all that i could do",
            "that's all",
            "thats all",
            "one and all",
            "come one, come all",
            "not at all"
          ],
          "app-shortdef": {
            "hw": "all:3",
            "fl": "pronoun",
            "def": [
              "{bc} the entire number, quantity, or amount",
              "{bc} the only thing"
            ]
          },
          "offensive": false
        },
        "hom": 3,
        "hwi": {
          "hw": "all",
          "altprs": [
            {
              "ipa": "ˈɑːl"
            }
          ]
        },
        "fl": "pronoun",
        "def": [
          {
            "sseq": [
              [
                [
                  "sense",
                  {
                    "sn": "1",
                    "dt": [
                      [
                        "text",
                        "{bc}the entire number, quantity, or amount "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "{it}All{/it} [={it}everything{/it}] that I have is yours."
                          },
                          {
                            "t": "{it}All{/it} [={it}everything{/it}] will be explained soon."
                          },
                          {
                            "t": "She told us {it}all{/it} about what happened."
                          },
                          {
                            "t": "Her other books were good, but this one is the best of {it}all{/it}."
                          },
                          {
                            "t": "{it}All{/it} are welcome! [=everyone is welcome]"
                          },
                          {
                            "t": "We {it}all{/it} enjoyed the movie. = {it}All{/it} of us enjoyed the movie."
                          },
                          {
                            "t": "Many people were invited and {it}all{/it} came."
                          },
                          {
                            "t": "His stories may be entertaining, but I don't think {it}all{/it} (of them) are true."
                          },
                          {
                            "t": "Thanks to {it}all{/it} who helped out."
                          },
                          {
                            "t": "{it}All{/it} of this money will be yours when I die."
                          },
                          {
                            "t": "Not {it}all{/it} of our students go on to college."
                          },
                          {
                            "t": "It {phrase}was all (that) I could do{/phrase} to keep from laughing! [=I had a hard time trying not to laugh]"
                          },
                          {
                            "t": "{ldquo}Is there anything else to be done?{rdquo} {ldquo}No, {phrase}that's all{/phrase}.{rdquo}"
                          },
                          {
                            "t": "He gave equal attention to {phrase}one and all{/phrase}. [=to everyone]"
                          },
                          {
                            "t": "{phrase}Come one, come all{/phrase}. [=everyone is invited to come]"
                          }
                        ]
                      ],
                      [
                        "urefs",
                        [
                          "altogether"
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "2",
                    "dt": [
                      [
                        "text",
                        "{bc}the only thing "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "That's {it}all{/it} I can do to help."
                          },
                          {
                            "t": "{it}All{/it} I know is that the game was canceled. I don't know why."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ]
            ]
          }
        ],
        "dros": [
          {
            "drp": "above all",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|above:2||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "after all",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|after:2||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "All aboard!",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|aboard:1||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "all in all",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sls": [
                          "informal"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}in a general way {bc}when everything is thought of or considered "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "{it}All in all{/it} [={it}in general, generally, for the most part{/it}], I like the way things have gone."
                              },
                              {
                                "t": "We did lose some money, but we got most of it back. So {it}all in all{/it} things might have been a lot worse."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "all's fair in love and war",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|fair:1||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "all told",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{bc}including everything or everyone"
                          ],
                          [
                            "uns",
                            [
                              [
                                [
                                  "text",
                                  "used to indicate a total "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "The cost of the repairs came to about $300 {it}all told{/it}. [={it}in all{/it}] [=the total cost of the repairs was about $300]"
                                    }
                                  ]
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "and all",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sn": "1",
                        "dt": [
                          [
                            "text",
                            "{bc}and everything else "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "What with the noise outside, the fire {it}and all{/it}, we got hardly any sleep."
                              },
                              {
                                "t": "He endured everything, insults {it}and all{/it}, without getting angry."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "2",
                        "sls": [
                          "British",
                          "informal"
                        ],
                        "dt": [
                          [
                            "uns",
                            [
                              [
                                [
                                  "text",
                                  "used to emphasize a response "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "{ldquo}It's really hot out!{rdquo} {ldquo}It is {it}and all{/it}!{rdquo} [=it certainly is]"
                                    }
                                  ]
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "at all",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "uns",
                            [
                              [
                                [
                                  "text",
                                  "used to make a statement or question more forceful "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "He will go anywhere {it}at all{/it} to get a job."
                                    },
                                    {
                                      "t": "Did you find out anything {it}at all{/it}?"
                                    }
                                  ]
                                ]
                              ],
                              [
                                [
                                  "text",
                                  "used especially in negative statements "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "{ldquo}Did she say anything?{rdquo} {ldquo}No, nothing {it}at all{/it}.{rdquo}"
                                    },
                                    {
                                      "t": "I don't mind cooking {it}at all{/it}."
                                    },
                                    {
                                      "t": "It's not {it}at all{/it} what you think it is. It's something else entirely."
                                    },
                                    {
                                      "t": "I wasn't tired {it}at all{/it}. = I wasn't {it}at all{/it} tired. [=I wasn't even slightly tired]"
                                    },
                                    {
                                      "t": "This chair is not {it}at all{/it} comfortable."
                                    },
                                    {
                                      "t": "I didn't like it {it}at all{/it}."
                                    },
                                    {
                                      "t": "That is not {it}at all{/it} likely."
                                    }
                                  ]
                                ]
                              ]
                            ]
                          ],
                          [
                            "snote",
                            [
                              [
                                "t",
                                "The phrase {phrase}not at all{/phrase} is sometimes used as a polite response when someone thanks you."
                              ],
                              [
                                "vis",
                                [
                                  {
                                    "t": "{ldquo}Thank you for all your trouble.{rdquo} {ldquo}{it}Not at all{/it}.{rdquo}"
                                  },
                                  {
                                    "t": "{ldquo}That was very kind of you.{rdquo} {ldquo}{it}Not at all{/it}. It was the least I could do.{rdquo}"
                                  }
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "for all",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|for:1||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "for all I know",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|know:1||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "for all (someone) cares",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|care:2||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "give your all",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{bc}to do or give as much as you can to achieve something, to support a cause, etc. "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He {it}gave his all{/it} for the cause. = He {it}gave his all{/it} to help the cause."
                              },
                              {
                                "t": "You'll never succeed in this business unless you {it}give (it) your all{/it}."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "in all",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{bc}including everything or everyone"
                          ],
                          [
                            "uns",
                            [
                              [
                                [
                                  "text",
                                  "used to indicate a total "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "There were about a thousand people at the concert {it}in all{/it}. [={it}all told{/it}]"
                                    }
                                  ]
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "once and for all",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|once:1||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "that is all",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|that:1||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "when all is said and done",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{bc}after considering or doing everything"
                          ],
                          [
                            "uns",
                            [
                              [
                                [
                                  "text",
                                  "used for a final general statement or judgment "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "It won't be easy, but {it}when all is said and done{/it}, we'll be glad we did it."
                                    },
                                    {
                                      "t": "The candidates claim to have different views but, {it}when all is said and done{/it}, they're very much alike."
                                    }
                                  ]
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          }
        ],
        "shortdef": [
          "the entire number, quantity, or amount",
          "the only thing"
        ]
      },
      {
        "meta": {
          "id": "average:1",
          "uuid": "feaae112-7ba5-4b4c-9164-33ea77abcecf",
          "src": "learners",
          "section": "alpha",
          "target": {
            "tuuid": "6d626848-d972-433c-85c8-f10d59e0b2e7",
            "tsrc": "collegiate"
          },
          "highlight": "yes",
          "stems": [
            "average",
            "averages",
            "on average",
            "on the average",
            "above/below average",
            "above average",
            "below average"
          ],
          "app-shortdef": {
            "hw": "average:1",
            "fl": "noun",
            "def": [
              "{bc} a number that is calculated by adding quantities together and then dividing the total by the number of quantities",
              "{bc} a level that is typical of a group, class, or series {bc} a middle point between extremes",
              "{it}baseball{/it}"
            ]
          },
          "offensive": false
        },
        "hom": 1,
        "hwi": {
          "hw": "av*er*age",
          "prs": [
            {
              "ipa": "ˈævrɪʤ",
              "sound": {
                "audio": "averag01"
              }
            }
          ]
        },
        "fl": "noun",
        "ins": [
          {
            "il": "plural",
            "ifc": "-ag*es",
            "if": "av*er*ag*es"
          }
        ],
        "def": [
          {
            "sseq": [
              [
                [
                  "sense",
                  {
                    "sn": "1",
                    "dt": [
                      [
                        "text",
                        "{bc}a number that is calculated by adding quantities together and then dividing the total by the number of quantities "
                      ],
                      [
                        "wsgram",
                        "count"
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "The {it}average{/it} of 16, 8, and 6 is 10."
                          },
                          {
                            "t": "Take all these temperatures and find their {it}average{/it}."
                          },
                          {
                            "t": "An {it}average{/it} of 2,000 people attended the show each night."
                          }
                        ]
                      ],
                      [
                        "wsgram",
                        "noncount"
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "Prices have increased {phrase}on average{/phrase} about eight percent."
                          },
                          {
                            "t": "{it}On average{/it}, women live longer than men."
                          },
                          {
                            "t": "({it}US{/it}) He saves {phrase}on the average{/phrase} about five percent of his income."
                          }
                        ]
                      ],
                      [
                        "text",
                        "{dx}see also {dxt|grade point average||} {it}the law of averages{/it} at {dxt|law||}{/dx}"
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "2",
                    "dt": [
                      [
                        "text",
                        "{bc}a level that is typical of a group, class, or series {bc}a middle point between extremes "
                      ],
                      [
                        "wsgram",
                        "noncount"
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "His work has been better/worse than {it}average{/it}. = His work has been {phrase}above/below average{/phrase}."
                          }
                        ]
                      ],
                      [
                        "wsgram",
                        "count"
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "His work has been above the {it}average{/it}."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "3",
                    "sgram": "count",
                    "sls": [
                      "baseball"
                    ],
                    "dt": [
                      [
                        "text",
                        "{bc}{sx|batting average||}"
                      ]
                    ]
                  }
                ]
              ]
            ]
          }
        ],
        "shortdef": [
          "a number that is calculated by adding quantities together and then dividing the total by the number of quantities",
          "a level that is typical of a group, class, or series : a middle point between extremes",
          "batting average"
        ]
      },
      {
        "meta": {
          "id": "beyond:2",
          "uuid": "3edfbb5f-5a54-4ad6-be09-9df6b68572fe",
          "src": "learners",
          "section": "alpha",
          "target": {
            "tuuid": "e6b2c665-1835-43a7-8e51-e4df560e8de3",
            "tsrc": "collegiate"
          },
          "highlight": "yes",
          "stems": [
            "beyond",
            "above and beyond",
            "beyond her wildest dreams",
            "live beyond your means",
            "beyond help",
            "beyond (all) recognition",
            "beyond all recognition",
            "beyond recognition",
            "beyond our control",
            "beyond belief",
            "beyond comprehension/understanding",
            "beyond comprehension",
            "beyond understanding",
            "beyond you"
          ],
          "app-shortdef": {
            "hw": "beyond:2",
            "fl": "preposition",
            "def": [
              "{bc} on or to the farther part or side of (something) {bc} at a greater distance than (something)",
              "{bc} outside the limits or range of (something) {bc} more than (something)",
              "{bc} for a period of time that continues after (a particular date, age, etc.)"
            ]
          },
          "offensive": false
        },
        "hom": 2,
        "hwi": {
          "hw": "beyond",
          "altprs": [
            {
              "ipa": "bɪˈɑːnd"
            }
          ]
        },
        "fl": "preposition",
        "def": [
          {
            "sseq": [
              [
                [
                  "sense",
                  {
                    "sn": "1",
                    "dt": [
                      [
                        "text",
                        "{bc}on or to the farther part or side of (something) {bc}at a greater distance than (something) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "From the house we can see the valley and the mountains {it}beyond{/it} it."
                          },
                          {
                            "t": "The parking area is just {it}beyond{/it} those trees."
                          },
                          {
                            "t": "Our land extends {it}beyond{/it} the fence to those trees."
                          },
                          {
                            "t": "planets {it}beyond{/it} our solar system"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "2",
                    "dt": [
                      [
                        "text",
                        "{bc}outside the limits or range of (something) {bc}more than (something) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "The job is {it}beyond{/it} his ability. [=the job is too hard for him; he is not capable of doing the job well]"
                          },
                          {
                            "t": "Such a project is {it}beyond{/it} the city's budget. [=the project is too expensive]"
                          },
                          {
                            "t": "The results were {it}beyond{/it} our expectations. [=were better than we expected]"
                          },
                          {
                            "t": "His influence does not extend {it}beyond{/it} this department."
                          },
                          {
                            "t": "She became rich {phrase}beyond her wildest dreams{/phrase}. [=became very rich]"
                          }
                        ]
                      ],
                      [
                        "snote",
                        [
                          [
                            "t",
                            "If you {phrase}live beyond your means{/phrase}, you spend more money than you earn."
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "We need to stop {it}living beyond our means{/it} and start saving some money."
                              }
                            ]
                          ]
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "3",
                    "dt": [
                      [
                        "uns",
                        [
                          [
                            [
                              "text",
                              "used to say that something cannot be changed, understood, etc. "
                            ],
                            [
                              "vis",
                              [
                                {
                                  "t": "The situation is {phrase}beyond help{/phrase}. [=the situation cannot be made better; nothing can help the situation]"
                                },
                                {
                                  "t": "The city has changed {phrase}beyond (all) recognition{/phrase}. [=it has changed so much that it looks completely different]"
                                },
                                {
                                  "t": "The circumstances are {phrase}beyond our control{/phrase}. [=we cannot control the circumstances]"
                                },
                                {
                                  "t": "The stories she tells are {phrase}beyond belief{/phrase}. [=are not believable]"
                                },
                                {
                                  "t": "His irresponsible actions are {phrase}beyond comprehension/understanding{/phrase}. [=cannot be understood]"
                                }
                              ]
                            ]
                          ]
                        ]
                      ],
                      [
                        "snote",
                        [
                          [
                            "t",
                            "If something is {phrase}beyond you{/phrase}, you do not understand it."
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "{ldquo}Why is he going?{rdquo} {ldquo}It's {it}beyond me{/it}.{rdquo}"
                              },
                              {
                                "t": "How she was able to afford the trip is {it}beyond me{/it}."
                              }
                            ]
                          ]
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "4",
                    "dt": [
                      [
                        "text",
                        "{bc}for a period of time that continues after (a particular date, age, etc.) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "The program is unlikely to continue {it}beyond{/it} next year. [=it will probably end after next year]"
                          },
                          {
                            "t": "She plans to continue working {it}beyond{/it} the usual retirement age."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "5",
                    "dt": [
                      [
                        "text",
                        "{bc}in addition to "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "There were no other problems with the house {it}beyond{/it} [={it}besides{/it}] the leaky roof."
                          },
                          {
                            "t": "I knew nothing about him {it}beyond{/it} [={it}except{/it}] what he told me."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ]
            ]
          }
        ],
        "dros": [
          {
            "drp": "above and beyond",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|above:2||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          }
        ],
        "shortdef": [
          "on or to the farther part or side of (something) : at a greater distance than (something)",
          "outside the limits or range of (something) : more than (something)",
          "—used to say that something cannot be changed, understood, etc."
        ]
      },
      {
        "meta": {
          "id": "cut:2",
          "uuid": "a8aa6c64-8e57-4952-a43d-b4aaa4103905",
          "src": "learners",
          "section": "alpha",
          "target": {
            "tuuid": "617419ef-b9b3-4eb7-98cf-be69e476ee3e",
            "tsrc": "collegiate"
          },
          "highlight": "yes",
          "stems": [
            "cut",
            "cut of one's jib",
            "cut of her jib",
            "cut of his jib",
            "cut of their jib",
            "cuts",
            "a cut above",
            "cut and thrust",
            "paper cut",
            "pay cut",
            "tax cut",
            "rough cut",
            "director's cut",
            "directors cut",
            "make the cut",
            "miss the cut"
          ],
          "app-shortdef": {
            "hw": "cut:2",
            "fl": "noun",
            "def": [
              "{bc} an opening or hole made with a sharp tool (such as a knife)",
              "{bc} a wound on a person's body that is made by something sharp",
              "{bc} an act of making something smaller in amount"
            ]
          },
          "offensive": false
        },
        "hom": 2,
        "hwi": {
          "hw": "cut",
          "altprs": [
            {
              "ipa": "ˈkʌt"
            }
          ]
        },
        "fl": "noun",
        "ins": [
          {
            "il": "plural",
            "if": "cuts"
          }
        ],
        "gram": "count",
        "def": [
          {
            "sseq": [
              [
                [
                  "sense",
                  {
                    "sn": "1 a",
                    "dt": [
                      [
                        "text",
                        "{bc}an opening or hole made with a sharp tool (such as a knife) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "Make a few small {it}cuts{/it} in the crust to let the air escape."
                          },
                          {
                            "t": "a two-inch {it}cut{/it} in the cloth"
                          }
                        ]
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "b",
                    "dt": [
                      [
                        "text",
                        "{bc}a wound on a person's body that is made by something sharp "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "She had a small {it}cut{/it} [={it}gash{/it}] above her left eye."
                          },
                          {
                            "t": "He came home covered in {it}cuts{/it} and bruises."
                          },
                          {
                            "t": "a deep/superficial {it}cut{/it}"
                          },
                          {
                            "t": "a {phrase}paper cut{/phrase} [=a cut made by the edge of a piece of paper]"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "2",
                    "dt": [
                      [
                        "text",
                        "{bc}an act of making something smaller in amount {bc}{sx|reduction||} "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "Further {it}cuts{/it} in spending are needed."
                          },
                          {
                            "t": "He had to accept a {it}cut{/it} in pay. = He had to accept a {phrase}pay cut{/phrase}."
                          },
                          {
                            "t": "a {phrase}tax cut{/phrase}"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "3",
                    "dt": [
                      [
                        "text",
                        "{bc}the act of removing something from a book, movie, etc. "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "You'll have to make a few {it}cuts{/it} in your manuscript if you want us to publish it."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "4",
                    "dt": [
                      [
                        "text",
                        "{bc}a version of a movie at a particular stage of being edited "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "Fortunately, that scene didn't make the film's final {it}cut{/it}. [=that scene did not appear in the final version of the film]"
                          },
                          {
                            "t": "I saw a {phrase}rough cut{/phrase} [=a version that is not yet finished] of the movie."
                          },
                          {
                            "t": "a {phrase}director's cut{/phrase} [=a special version of a movie that is created by the director and that usually includes scenes that are not included in other versions]"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "5",
                    "dt": [
                      [
                        "text",
                        "{bc}a song on a record, tape, or CD "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "We listened to the same {it}cut{/it} [={it}track{/it}] over and over."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "6",
                    "dt": [
                      [
                        "text",
                        "{bc}the shape and style of a piece of clothing "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "the {it}cut{/it} of his pants"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "7",
                    "dt": [
                      [
                        "text",
                        "{bc}the act or result of cutting someone's hair {bc}{sx|haircut||} "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "I had a shampoo and a {it}cut{/it}."
                          }
                        ]
                      ],
                      [
                        "text",
                        "{dx}see also {dxt|buzz cut||} {dxt|crew cut||}{/dx}"
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "8",
                    "dt": [
                      [
                        "text",
                        "{bc}a piece of meat that is cut from a particular part of an animal's body "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "a thick/tender/expensive {it}cut{/it} of meat"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "9",
                    "dt": [
                      [
                        "text",
                        "{bc}a part of something that is divided and shared among people"
                      ],
                      [
                        "uns",
                        [
                          [
                            [
                              "text",
                              "usually singular "
                            ],
                            [
                              "vis",
                              [
                                {
                                  "t": "We each got a {it}cut{/it} [={it}share{/it}] of the profits."
                                }
                              ]
                            ]
                          ]
                        ]
                      ],
                      [
                        "text",
                        "{dx}see also {it}a cut of the action{/it} at {dxt|action||}{/dx}"
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "10",
                    "dt": [
                      [
                        "text",
                        "{bc}the act of reducing the size of a group (such as a group of competitors) by removing the ones that are not good enough or that have not done well enough"
                      ],
                      [
                        "uns",
                        [
                          [
                            [
                              "text",
                              "usually used with {it}make{/it} or {it}miss{/it} "
                            ],
                            [
                              "vis",
                              [
                                {
                                  "t": "He has to birdie the last hole in order to {phrase}make the cut{/phrase}. [=in order to have a score that is low enough to be among the players allowed to continue playing]"
                                },
                                {
                                  "t": "If he doesn't birdie this hole, he'll {phrase}miss the cut{/phrase}."
                                },
                                {
                                  "t": "Only the best players are good enough to {it}make the cut{/it} when the team is being chosen."
                                }
                              ]
                            ]
                          ]
                        ]
                      ]
                    ]
                  }
                ]
              ]
            ]
          }
        ],
        "dros": [
          {
            "drp": "a cut above",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{bc}better than other people or things "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "All of his books are good, but this one is {it}a cut above{/it} (the rest)."
                              },
                              {
                                "t": "She's {it}a cut above{/it} the other competitors and should win easily."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "cut and thrust",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sls": [
                          "chiefly British"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}the lively and exciting quality of an activity in which people compete or argue with each other "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He has always enjoyed the {it}cut and thrust{/it} of politics."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          }
        ],
        "shortdef": [
          "an opening or hole made with a sharp tool (such as a knife)",
          "a wound on a person's body that is made by something sharp",
          "an act of making something smaller in amount : reduction"
        ]
      },
      {
        "meta": {
          "id": "fray:1",
          "uuid": "491e022f-ff16-422a-b18a-5f42f4217a7a",
          "src": "learners",
          "section": "alpha",
          "stems": [
            "fray",
            "frays",
            "above the fray"
          ],
          "app-shortdef": {
            "hw": "fray:1",
            "fl": "noun",
            "def": [
              "{bc} a fight, struggle, or disagreement that involves many people"
            ]
          },
          "offensive": false
        },
        "hom": 1,
        "hwi": {
          "hw": "fray",
          "prs": [
            {
              "ipa": "ˈfreɪ",
              "sound": {
                "audio": "fray0001"
              }
            }
          ]
        },
        "fl": "noun",
        "ins": [
          {
            "il": "plural",
            "if": "frays"
          }
        ],
        "gram": "count",
        "def": [
          {
            "sseq": [
              [
                [
                  "sense",
                  {
                    "dt": [
                      [
                        "text",
                        "{bc}a fight, struggle, or disagreement that involves many people "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "He threw himself into the {it}fray{/it}."
                          },
                          {
                            "t": "He joined/entered the political {it}fray{/it}."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ]
            ]
          }
        ],
        "dros": [
          {
            "drp": "above the fray",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{bc}not directly involved in an angry or difficult struggle or disagreement "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "His political aides handled the controversy while he remained {it}above the fray{/it}."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          }
        ],
        "shortdef": [
          "a fight, struggle, or disagreement that involves many people"
        ]
      },
      {
        "meta": {
          "id": "get",
          "uuid": "f02d052a-c06d-4786-81ec-0c37b12cd12c",
          "src": "learners",
          "section": "alpha",
          "target": {
            "tuuid": "19112b35-139f-4e2f-9f5d-9bebabbecaf4",
            "tsrc": "collegiate"
          },
          "highlight": "yes",
          "stems": [
            "get",
            "get a life",
            "get a move on",
            "get after",
            "get ahead",
            "get at",
            "get away with",
            "get cracking",
            "get even",
            "get even with",
            "get going",
            "get into",
            "get it",
            "get it on",
            "get on",
            "get one's act together",
            "get her act together",
            "get his act together",
            "get their act together",
            "get one's goat",
            "get her goat",
            "get his goat",
            "get their goat",
            "get over",
            "get real",
            "get religion",
            "get somewhere",
            "get there",
            "get through",
            "get to",
            "get together",
            "get wind of",
            "get with it",
            "gets",
            "gets on",
            "gets over",
            "gets through",
            "getting",
            "getting on",
            "getting over",
            "getting through",
            "got",
            "got on",
            "got over",
            "got through",
            "gotten",
            "gotten on",
            "gotten over",
            "gotten through",
            "get about",
            "get above yourself",
            "get across",
            "get along",
            "get around",
            "get round",
            "get away",
            "get back",
            "get back to (the) basics",
            "get back to basics",
            "get back to the basics",
            "get behind",
            "get by",
            "get down",
            "get hold of",
            "get in",
            "get lost",
            "get lucky",
            "get moving",
            "get off",
            "get onto",
            "get on to",
            "get out",
            "get (something) over with",
            "get over with",
            "get something over with",
            "get over (something)",
            "get over something",
            "get rid of",
            "get rolling",
            "get the best of",
            "get the better of",
            "get your life together",
            "get to sleep",
            "get to work",
            "get up",
            "get up on the wrong side of the bed",
            "get what's coming to you",
            "get whats coming to you",
            "get your bearings",
            "get your goat",
            "have got",
            "you get the picture/idea",
            "you get the idea",
            "you get the picture",
            "you get",
            "getting somewhere",
            "get you nowhere",
            "won't get you anywhere",
            "wont get you anywhere",
            "get it right",
            "get this straight",
            "get me wrong",
            "get your drift",
            "get busy",
            "how stupid/lucky (etc.) can you get",
            "how lucky can you get",
            "how lucky etc. can you get",
            "how stupid can you get",
            "how stupid etc. can you get",
            "you've got me (there)",
            "you've got me",
            "you've got me there",
            "youve got me (there)",
            "youve got me",
            "youve got me there",
            "get this",
            "getting along in years",
            "there's no getting around",
            "theres no getting around",
            "getting at",
            "gotten away from",
            "get away from it all",
            "there's no getting away from",
            "theres no getting away from",
            "get back to work",
            "get down to business",
            "when you get right down to it",
            "get a word in",
            "get in good with",
            "what got into her?",
            "get off to a good/bad (etc.) start",
            "get off to a bad etc. start",
            "get off to a bad start",
            "get off to a good etc. start",
            "get off to a good start",
            "got off to sleep",
            "tell someone where to get off",
            "don't know where someone gets off",
            "dont know where someone gets off",
            "where does he get off",
            "get on with your life",
            "get on with it",
            "getting on his case",
            "get out of here",
            "over and done with"
          ],
          "app-shortdef": {
            "hw": "get",
            "fl": "verb",
            "def": [
              "{bc} to obtain (something): such as",
              "{bc} to receive or be given (something)",
              "{bc} to obtain (something) through effort, chance, etc."
            ]
          },
          "offensive": false
        },
        "hwi": {
          "hw": "get",
          "prs": [
            {
              "ipa": "ˈgɛt",
              "sound": {
                "audio": "get00001"
              }
            }
          ]
        },
        "fl": "verb",
        "ins": [
          {
            "if": "gets"
          },
          {
            "if": "got",
            "prs": [
              {
                "ipa": "ˈgɑːt",
                "sound": {
                  "audio": "get00003"
                }
              }
            ]
          },
          {
            "if": "got"
          },
          {
            "il": "or US",
            "if": "got*ten",
            "prs": [
              {
                "ipa": "ˈgɑːtn̩",
                "sound": {
                  "audio": "get00004"
                }
              }
            ]
          },
          {
            "if": "get*ting"
          }
        ],
        "def": [
          {
            "sseq": [
              [
                [
                  "bs",
                  {
                    "sense": {
                      "sn": "1",
                      "sgram": "+ obj",
                      "dt": [
                        [
                          "text",
                          "{bc}to obtain (something): such as"
                        ]
                      ]
                    }
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "a",
                    "dt": [
                      [
                        "text",
                        "{bc}to receive or be given (something) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "He {it}got{/it} a new bicycle for his birthday."
                          },
                          {
                            "t": "I never did {it}get{/it} an answer to my question."
                          },
                          {
                            "t": "I {it}got{/it} a letter from my lawyer."
                          },
                          {
                            "t": "She {it}got{/it} a phone call from her sister."
                          },
                          {
                            "t": "Did you {it}get{/it} my message?"
                          },
                          {
                            "t": "Can I {it}get{/it} [={it}catch{/it}] a ride to town with you? [=will you give me a ride to town?]"
                          },
                          {
                            "t": "You need to {it}get{/it} your mother's permission to go."
                          }
                        ]
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "b",
                    "dt": [
                      [
                        "text",
                        "{bc}to obtain (something) through effort, chance, etc. "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "She hasn't been able to {it}get{/it} a job."
                          },
                          {
                            "t": "It's nearly impossible to {it}get{/it} [={it}make{/it}] a reservation at that restaurant."
                          },
                          {
                            "t": "If you want to be successful you need to {it}get{/it} a good education."
                          },
                          {
                            "t": "It took us a while to {it}get{/it} the waiter's attention."
                          },
                          {
                            "t": "She {it}got{/it} a look at the thief. [=she managed to look at the thief]"
                          }
                        ]
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "c",
                    "dt": [
                      [
                        "text",
                        "{bc}to obtain the use or services of (something) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "It took us a while to {it}get{/it} a taxi."
                          },
                          {
                            "t": "It's hard to {it}get{/it} good help these days."
                          }
                        ]
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "d",
                    "dt": [
                      [
                        "text",
                        "{bc}to earn or gain (something) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "How much does he {it}get{/it} [={it}make{/it}] a week?"
                          },
                          {
                            "t": "I {it}got{/it} $50 when I sold my old bicycle. = I {it}got{/it} $50 for my old bicycle."
                          },
                          {
                            "t": "He's {it}gotten{/it} a bad reputation (for himself). = He's {it}gotten{/it} himself a bad reputation."
                          },
                          {
                            "t": "I {it}got{/it} an {ldquo}A{rdquo} on my history exam!"
                          }
                        ]
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "e",
                    "dt": [
                      [
                        "text",
                        "{bc}to win (something) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "She {it}got{/it} first prize in the essay contest."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "2",
                    "sgram": "+ obj",
                    "dt": [
                      [
                        "text",
                        "{bc}to buy or pay for (something) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "He {it}got{/it} (himself) a new car at a great price."
                          },
                          {
                            "t": "{ldquo}Did you {it}get{/it} that dress at the mall?{rdquo} {ldquo}Yes, and I {it}got{/it} it for only $20.{rdquo}"
                          },
                          {
                            "t": "Do you {it}get{/it} [=subscribe to] the local newspaper?"
                          },
                          {
                            "t": "I'll {it}get{/it} the next round of drinks."
                          },
                          {
                            "t": "He offered to {it}get{/it} the check, but I insisted on {it}getting{/it} it myself."
                          },
                          {
                            "t": "He {it}got{/it} a beautiful necklace for his wife. = He {it}got{/it} his wife a beautiful necklace."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "3",
                    "sgram": "+ obj",
                    "dt": [
                      [
                        "text",
                        "{bc}to go somewhere and come back with (something or someone) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "I'll {it}get{/it} a pencil from the desk."
                          },
                          {
                            "t": "Can I {it}get{/it} anything for you? = Can I {it}get{/it} you anything?"
                          },
                          {
                            "t": "Someone has to (go) {it}get{/it} the boss from the airport and bring her back here."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "4",
                    "sgram": "+ obj",
                    "dt": [
                      [
                        "text",
                        "{bc}to send or take (something or someone) {it}to{/it} a person or place "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "I have to {it}get{/it} an important message {it}to{/it} her at once!"
                          },
                          {
                            "t": "We have to {it}get{/it} him {it}to{/it} the hospital immediately."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "5 a",
                    "lbs": [
                      "always followed by an adverb or preposition"
                    ],
                    "sgram": "+ obj",
                    "dt": [
                      [
                        "text",
                        "{bc}to cause (someone or something) to move or go "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "He quickly {it}got{/it} himself and his luggage through customs."
                          },
                          {
                            "t": "She {it}got{/it} the car out of the garage."
                          },
                          {
                            "t": "I could barely {it}get{/it} [={it}fit{/it}] the luggage into the car's trunk."
                          },
                          {
                            "t": "I can't {it}get{/it} this ring on/off my finger."
                          }
                        ]
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "b",
                    "lbs": [
                      "always followed by an adverb or preposition"
                    ],
                    "sgram": "no obj",
                    "dt": [
                      [
                        "text",
                        "{bc}to move or go "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "He {it}got{/it} on the horse and rode away."
                          },
                          {
                            "t": "We {it}got{/it} on/off the bus."
                          },
                          {
                            "t": "They quickly {it}got{/it} [={it}passed{/it}] through customs."
                          },
                          {
                            "t": "She never {it}got{/it} out of the house last weekend."
                          },
                          {
                            "t": "He lost weight to be able to {it}get{/it} [={it}fit{/it}] into his jeans again."
                          },
                          {
                            "t": "He {it}got{/it} between them to keep them from fighting."
                          },
                          {
                            "t": "Ouch! {it}Get{/it} off my foot!"
                          }
                        ]
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "c",
                    "lbs": [
                      "always followed by an adverb"
                    ],
                    "sgram": "no obj",
                    "dt": [
                      [
                        "text",
                        "{bc}to arrive at a place "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "When did you {it}get{/it} here/there?"
                          },
                          {
                            "t": "He {it}got{/it} home last night."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "6",
                    "sgram": "+ obj",
                    "dt": [
                      [
                        "text",
                        "{bc}to begin to have (a feeling, an idea, etc.) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "I {it}got{/it} a funny feeling when I saw her again."
                          },
                          {
                            "t": "He somehow {it}got{/it} the idea that I was lying to him."
                          },
                          {
                            "t": "I {it}got{/it} the impression that he wasn't interested."
                          },
                          {
                            "t": "One thing led to another, and—well, {phrase}you get the picture/idea{/phrase}. [=you can easily guess the rest]"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sen",
                  {
                    "sn": "7",
                    "sgram": "+ obj"
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "a",
                    "dt": [
                      [
                        "text",
                        "{bc}to become affected by (a disease) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "I {it}got{/it} a bad cold when I was on vacation."
                          },
                          {
                            "t": "Clean the wound carefully so you don't {it}get{/it} an infection."
                          }
                        ]
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "b",
                    "dt": [
                      [
                        "text",
                        "{bc}to suffer (an injury) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "He {it}got{/it} a broken nose in a fight."
                          },
                          {
                            "t": "Where/how did you {it}get{/it} that bruise on your leg?"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "8",
                    "sgram": "+ obj",
                    "dt": [
                      [
                        "text",
                        "{bc}to have or experience (something) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "We've been {it}getting{/it} a lot of rain recently."
                          },
                          {
                            "t": "I finally {it}got{/it} a good night's sleep last night. [=I finally slept well last night]"
                          },
                          {
                            "t": "The inn doesn't {it}get{/it} many visitors these days."
                          },
                          {
                            "t": "{ldquo}Do people often ask if you're Irish?{rdquo} {ldquo}Yes, I {it}get{/it} that a lot.{rdquo} [=people ask me that often]"
                          },
                          {
                            "t": "{phrase}You get{/phrase} [=there are] so many crazy drivers these days."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "9",
                    "sgram": "+ obj",
                    "dt": [
                      [
                        "text",
                        "{bc}to cause (a particular reaction) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "That joke always {it}gets{/it} a laugh."
                          },
                          {
                            "t": "Her comments {it}got{/it} an angry reaction."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sen",
                  {
                    "sn": "10",
                    "lbs": [
                      "always followed by an adverb"
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "a",
                    "sgram": "no obj",
                    "dt": [
                      [
                        "text",
                        "{bc}to make progress in some activity "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "He hasn't {it}gotten{/it} far with the essay. [=he hasn't made much progress with the essay]"
                          },
                          {
                            "t": "You won't {it}get{/it} anywhere with flattery. [=you won't succeed by using flattery]"
                          },
                          {
                            "t": "At last we're {phrase}getting somewhere{/phrase} (with our work)!"
                          }
                        ]
                      ],
                      [
                        "text",
                        "{dx}see also {dxt|get ahead||(below)}{/dx}"
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "b",
                    "sgram": "+ obj",
                    "dt": [
                      [
                        "text",
                        "{bc}to cause or help (someone) to make progress "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "All that effort didn't really {it}get{/it} us very far."
                          },
                          {
                            "t": "Flattery will {phrase}get you nowhere{/phrase}. = Flattery {phrase}won't get you anywhere{/phrase}."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "11",
                    "sgram": "+ obj",
                    "dt": [
                      [
                        "text",
                        "{bc}to cause (someone or something) to be in a specified position or condition "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "He {it}got{/it} his feet wet when he stepped in a puddle."
                          },
                          {
                            "t": "He {it}got{/it} his nose broken in a fight. [=his nose was broken in a fight]"
                          },
                          {
                            "t": "I told you not to {it}get{/it} yourself dirty."
                          },
                          {
                            "t": "You nearly {it}got{/it} us both killed!"
                          },
                          {
                            "t": "I need to {it}get{/it} [={it}have{/it}] my hair cut."
                          },
                          {
                            "t": "She finally {it}got{/it} her office organized."
                          },
                          {
                            "t": "He promised to {it}get{/it} the work done quickly. [=to do the work quickly]"
                          },
                          {
                            "t": "When you're making a measurement be careful to {phrase}get it right{/phrase}. [=to do it correctly]"
                          },
                          {
                            "t": "Let me {phrase}get this straight{/phrase} [=let me be sure that I understand this correctly]: are you saying that you won't help us?"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "12",
                    "sgram": "+ obj",
                    "dt": [
                      [
                        "text",
                        "{bc}to cause (someone or something) to do something"
                      ],
                      [
                        "uns",
                        [
                          [
                            [
                              "text",
                              "usually followed by {it}to + verb{/it} "
                            ],
                            [
                              "vis",
                              [
                                {
                                  "t": "I can't {it}get{/it} the children {it}to behave{/it}."
                                },
                                {
                                  "t": "How can I {it}get{/it} you {it}to understand{/it} that this isn't a good idea?"
                                },
                                {
                                  "t": "He {it}got{/it} the computer {it}to work{/it} again."
                                }
                              ]
                            ]
                          ],
                          [
                            [
                              "text",
                              "sometimes + {it}-ing verb{/it} "
                            ],
                            [
                              "vis",
                              [
                                {
                                  "t": "He {it}got{/it} the computer {it}working{/it} again."
                                }
                              ]
                            ]
                          ]
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "13",
                    "sgram": "no obj",
                    "dt": [
                      [
                        "text",
                        "{bc}to start {it}doing{/it} something "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "We {it}got talking{/it} about old times."
                          }
                        ]
                      ],
                      [
                        "text",
                        "{dx}see also {dxt|get to||1a (below)}{/dx}"
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "14",
                    "sgram": "no obj",
                    "dt": [
                      [
                        "text",
                        "{bc}to have or be given the chance {it}to do{/it} something {bc}to be able {it}to do{/it} something "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "She never {it}got to go{/it} to college."
                          },
                          {
                            "t": "Why do I never {it}get to drive{/it} the car?"
                          },
                          {
                            "t": "She hopes she'll finally {it}get to spend{/it} more time working on her garden this year."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "bs",
                  {
                    "sense": {
                      "sn": "15",
                      "sgram": "+ obj",
                      "dt": [
                        [
                          "text",
                          "{bc}to deal with (something that needs attention): such as"
                        ]
                      ]
                    }
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "a",
                    "dt": [
                      [
                        "text",
                        "{bc}to answer (a telephone) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "Would somebody please {it}get{/it} the phone?"
                          }
                        ]
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "b",
                    "dt": [
                      [
                        "text",
                        "{bc}to open (a door) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "If you'll {it}get{/it} the door for me, I'll carry that box inside."
                          },
                          {
                            "t": "There's someone at the door. Would you please {phrase}get it{/phrase}? [=open the door and deal with the person who knocked]"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sen",
                  {
                    "sn": "16",
                    "sgram": "+ obj"
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "a",
                    "dt": [
                      [
                        "text",
                        "{bc}to understand (something or someone) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "I just don't {it}get{/it} the point of what you're saying."
                          },
                          {
                            "t": "He didn't {it}get{/it} the joke."
                          },
                          {
                            "t": "I don't {it}get{/it} what you mean."
                          },
                          {
                            "t": "Oh, now I {phrase}get it{/phrase}. [={it}understand{/it}]"
                          },
                          {
                            "t": "He's a strange guy. I just don't {it}get{/it} him."
                          },
                          {
                            "t": "Don't {phrase}get me wrong{/phrase}. [=don't misunderstand what I am saying]"
                          },
                          {
                            "t": "I {phrase}get your drift{/phrase}. [=I understand what you are saying]"
                          }
                        ]
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "b",
                    "dt": [
                      [
                        "text",
                        "{bc}to hear and understand (something) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "I didn't quite {it}get{/it} [={it}catch{/it}] his name."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "17 a",
                    "sgram": "linking verb",
                    "dt": [
                      [
                        "text",
                        "{bc}{sx|become||1} "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "My hands {it}got{/it} dirty when I was working in the garden."
                          },
                          {
                            "t": "I {it}get{/it} very nervous when I have to speak in public."
                          },
                          {
                            "t": "I {it}got{/it} sick last week but I'm feeling better now."
                          },
                          {
                            "t": "I just can't {it}get{/it} used to this cold weather."
                          },
                          {
                            "t": "She sent her sick friend a {ldquo}{it}Get{/it} Well Soon{rdquo} card."
                          },
                          {
                            "t": "I should go; it's {it}getting{/it} late."
                          },
                          {
                            "t": "({it}Brit, informal{/it}) Your daughter's {it}getting{/it} quite a big girl now!"
                          },
                          {
                            "t": "We need to finish by 5 o'clock, so we'd better {phrase}get busy{/phrase}. [=begin to work]"
                          },
                          {
                            "t": "You've never heard of the Internet? Come on, now. {phrase}Get with it{/phrase}. [=become up-to-date in your knowledge]"
                          }
                        ]
                      ],
                      [
                        "snote",
                        [
                          [
                            "t",
                            "People say {phrase}how stupid/lucky (etc.) can you get{/phrase} to mean that someone or something is unusually stupid, lucky, etc."
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He tried to rob a policeman. {it}How stupid can you get{/it}? [=he was very stupid to try to rob a policeman]"
                              },
                              {
                                "t": "Just look at that dress! {it}How tacky can you get{/it}? [=that dress is very tacky]"
                              }
                            ]
                          ]
                        ]
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "b",
                    "sgram": "no obj",
                    "dt": [
                      [
                        "text",
                        "{bc}to change in a specified way as time passes"
                      ],
                      [
                        "uns",
                        [
                          [
                            [
                              "text",
                              "followed by {it}to + verb{/it} "
                            ],
                            [
                              "vis",
                              [
                                {
                                  "t": "Your daughter is {it}getting to be{/it} [=is becoming] quite a big girl now!"
                                }
                              ]
                            ]
                          ]
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "18",
                    "sgram": "no obj",
                    "dt": [
                      [
                        "text",
                        "{bc}to do something specified"
                      ],
                      [
                        "uns",
                        [
                          [
                            [
                              "text",
                              "followed by {it}to + verb{/it} "
                            ],
                            [
                              "vis",
                              [
                                {
                                  "t": "Once you {it}get to know{/it} him, you will like him."
                                }
                              ]
                            ]
                          ]
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "19",
                    "sgram": "auxiliary verb",
                    "dt": [
                      [
                        "uns",
                        [
                          [
                            [
                              "text",
                              "used like {it}be{/it} with the past participle of some verbs to form passive constructions "
                            ],
                            [
                              "vis",
                              [
                                {
                                  "t": "They {it}got{/it} [={it}were{/it}] married last month."
                                },
                                {
                                  "t": "He {it}got{/it} [={it}was{/it}] paid for his work."
                                },
                                {
                                  "t": "She {it}got{/it} arrested for fraud."
                                },
                                {
                                  "t": "I nearly {it}got{/it} killed."
                                }
                              ]
                            ]
                          ]
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sen",
                  {
                    "sn": "20",
                    "sgram": "+ obj"
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "a",
                    "dt": [
                      [
                        "text",
                        "{bc}to have (a meal) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "We {it}got{/it} dinner at an Italian restaurant last night."
                          }
                        ]
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "b",
                    "dt": [
                      [
                        "text",
                        "{bc}to prepare (a meal) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "On weekends, my wife sleeps late while I {it}get{/it} breakfast."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "21",
                    "sgram": "+ obj",
                    "dt": [
                      [
                        "text",
                        "{bc}to receive (punishment) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "He {it}got{/it} five years in prison for his crime."
                          },
                          {
                            "t": "({it}informal{/it}) If you don't stop misbehaving you're going to {phrase}get it{/phrase} when your father gets home! [=your father is going to punish you]"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "22",
                    "sgram": "+ obj",
                    "dt": [
                      [
                        "text",
                        "{bc}to grip and hold (something or someone) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "The dog {it}got{/it} the thief by the leg."
                          },
                          {
                            "t": "He {it}got{/it} [={it}grabbed{/it}] me around/by the neck and wouldn't let go."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "23",
                    "sgram": "+ obj",
                    "dt": [
                      [
                        "text",
                        "{bc}to find and catch (someone) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "The Royal Canadian Mounted Police always {it}get{/it} their man! [=they always capture the man they are trying to capture]"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "24",
                    "sgram": "+ obj",
                    "dt": [
                      [
                        "text",
                        "{bc}to hit (someone) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "The bullet {it}got{/it} him in the leg."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sen",
                  {
                    "sn": "25",
                    "sgram": "+ obj"
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "a",
                    "dt": [
                      [
                        "text",
                        "{bc}to hurt or cause trouble for (someone) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "He's convinced that his ex-wife is out to {it}get{/it} him."
                          },
                          {
                            "t": "I'll {it}get{/it} you if it's the last thing I do!"
                          }
                        ]
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "b",
                    "dt": [
                      [
                        "text",
                        "{bc}to cause the death of (someone) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "He had heart problems for many years, but it was pneumonia that {it}got{/it} him in the end."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sen",
                  {
                    "sn": "26",
                    "sgram": "+ obj",
                    "sls": [
                      "informal"
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "a",
                    "dt": [
                      [
                        "text",
                        "{bc}to bother or annoy (someone) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "It really {it}gets{/it} me that such a foolish man has so much influence."
                          },
                          {
                            "t": "What {it}gets{/it} me is all these delays!"
                          }
                        ]
                      ],
                      [
                        "text",
                        "{dx}see also {dxt|get to||2a (below)}{/dx}"
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "b",
                    "dt": [
                      [
                        "text",
                        "{bc}to make (someone) sad "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "The end of that movie always {it}gets{/it} me."
                          }
                        ]
                      ],
                      [
                        "text",
                        "{dx}see also {dxt|get to||2b (below)}{/dx}"
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "c",
                    "dt": [
                      [
                        "text",
                        "{bc}to cause (someone) to be fooled or unable to think of an answer "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "Well, you {it}got{/it} [={it}fooled, tricked{/it}] me that time. That was very clever."
                          },
                          {
                            "t": "That's a good question. {phrase}You've got me (there){/phrase}. [=I don't know the answer]"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "27",
                    "sgram": "+ obj",
                    "dt": [
                      [
                        "text",
                        "{bc}to make a phone call and hear or speak to (a person or answering machine) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "Where were you? I've been trying to {it}get{/it} [={it}reach{/it}] you (on the phone) all day!"
                          },
                          {
                            "t": "When I tried to call him I {it}got{/it} his answering machine. [=the phone was answered by his answering machine]"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "28",
                    "sgram": "+ obj",
                    "dt": [
                      [
                        "text",
                        "{bc}to receive (a radio or TV station or channel) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "We don't {it}get{/it} this channel at home."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "29",
                    "sgram": "+ obj",
                    "dt": [
                      [
                        "text",
                        "{bc}to produce or provide (a level of performance) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "Our new car {it}gets{/it} [={it}delivers{/it}] excellent gas mileage."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "30",
                    "sgram": "+ obj",
                    "sls": [
                      "informal"
                    ],
                    "dt": [
                      [
                        "text",
                        "{bc}to notice (someone or something) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "Did you {it}get{/it} the way he looked at you?"
                          }
                        ]
                      ],
                      [
                        "uns",
                        [
                          [
                            [
                              "text",
                              "often used to direct someone's attention to a person or thing that is seen as foolish, surprising, etc. "
                            ],
                            [
                              "vis",
                              [
                                {
                                  "t": "Just {it}get{/it} him in his new pants!"
                                },
                                {
                                  "t": "She showed up at the party in—{phrase}get this{/phrase} —a $3,000 designer dress!"
                                }
                              ]
                            ]
                          ]
                        ]
                      ]
                    ]
                  }
                ]
              ]
            ]
          }
        ],
        "dros": [
          {
            "drp": "get about",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|get around||(below)}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get above yourself",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|above:2||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get across",
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sn": "1",
                        "dt": [
                          [
                            "text",
                            "{bc}to be clearly expressed to and understood by someone "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "I hope my point has finally {it}gotten across{/it} to you. [=I hope you finally understand what I am trying to say]"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "2",
                        "phrasev": [
                          {
                            "pva": "get (something) across"
                          },
                          {
                            "pvl": "or",
                            "pva": "get across (something)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to express (something) clearly so that it is understood "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "I don't know if I was able to {it}get{/it} my point {it}across{/it} to you."
                              },
                              {
                                "t": "a politician who is trying hard to {it}get{/it} his message {it}across{/it} (to the voters)"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get after",
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sphrasev": {
                          "phrs": [
                            {
                              "pva": "get after (someone)"
                            }
                          ]
                        },
                        "sls": [
                          "US",
                          "informal"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to tell (someone) repeatedly to do something "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "His parents are always {it}getting after{/it} him about doing his homework. = His parents are always {it}getting after{/it} him to do his homework."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get ahead",
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{bc}to become more successful "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "a book about how to {it}get ahead{/it} in the business world"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get along",
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sn": "1",
                        "dt": [
                          [
                            "text",
                            "{bc}to be or remain friendly "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "We {it}get along{/it} well enough, but we're not really close friends."
                              },
                              {
                                "t": "My brother and my uncle don't really {it}get along{/it} (with each other)."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "2",
                        "dt": [
                          [
                            "text",
                            "{bc}to make progress while doing something "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "How are you {it}getting along{/it} with your work? [=how's your work coming along?]"
                              },
                              {
                                "t": "He never showed up, but we managed to {it}get along{/it} [={it}get by{/it}] without him."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "3",
                        "dt": [
                          [
                            "text",
                            "{bc}to leave a place "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "I really must be {it}getting along{/it}. [={it}going, leaving{/it}]"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "4",
                        "dt": [
                          [
                            "text",
                            "{bc}to become old "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "Her parents are {phrase}getting along in years{/phrase}."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get around",
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sn": "1",
                        "vrs": [
                          {
                            "vl": "or chiefly British",
                            "va": "get about"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to go, walk, or travel to different places "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "She {it}gets around{/it} a lot because of her job."
                              },
                              {
                                "t": "He's having trouble {it}getting around{/it} because of his sore knee."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "2",
                        "vrs": [
                          {
                            "vl": "or chiefly British",
                            "va": "get round"
                          },
                          {
                            "vl": "or",
                            "va": "get about"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to become known by many people "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "People will be shocked when the news about her arrest {it}gets around{/it}."
                              },
                              {
                                "t": "Word {it}got around{/it} that he was resigning."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "3",
                        "phrasev": [
                          {
                            "pva": "get around (something)"
                          },
                          {
                            "pvl": "or chiefly British",
                            "pva": "get round (something)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to avoid being stopped by (something) {bc}to avoid having to deal with (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "I'm sure we can find a way to {it}get around{/it} these problems."
                              },
                              {
                                "t": "{phrase}There's no getting around{/phrase} the fact that the current system isn't working. [=there is no way to deny that the current system isn't working]"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "4",
                        "phrasev": [
                          {
                            "pva": "get around to (something)"
                          },
                          {
                            "pvl": "or chiefly British",
                            "pva": "get round to (something)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to do or deal with (something that you have not yet done or dealt with) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "Don't you think it's about time you {it}got around to{/it} tidying your room?"
                              },
                              {
                                "t": "I've been meaning to call her, but I just haven't {it}gotten around to{/it} it. [=I haven't called her]"
                              },
                              {
                                "t": "Sooner or later we'll have to {it}get around to{/it} the subject of taxation."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get at",
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sn": "1",
                        "phrasev": [
                          {
                            "pva": "get at (something or someone)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to reach (something or someone) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The valve is hard to {it}get at{/it} unless you have a special tool."
                              },
                              {
                                "t": "An angry mob tried to {it}get at{/it} him but the police protected him."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "2",
                        "phrasev": [
                          {
                            "pva": "get at (something)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to find out (information that is hidden or hard to know) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "How can we ever {it}get at{/it} the truth?"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "3",
                        "phrasev": [
                          {
                            "pva": "get at (something)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to say or suggest (something) in an indirect way"
                          ],
                          [
                            "uns",
                            [
                              [
                                [
                                  "text",
                                  "usually used as {phrase}getting at{/phrase} "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "Just what are you {it}getting at{/it}? [=what are you suggesting?]"
                                    }
                                  ]
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "4",
                        "phrasev": [
                          {
                            "pva": "get at (someone)"
                          }
                        ],
                        "sls": [
                          "British"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to criticize (someone) repeatedly "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He says his teachers are always {it}getting at{/it} [=({it}US{/it}) {it}getting on{/it}] him unfairly."
                              },
                              {
                                "t": "He's always being {it}got at{/it} by his teachers."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "5",
                        "phrasev": [
                          {
                            "pva": "get at it"
                          }
                        ],
                        "sls": [
                          "US",
                          "informal"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to start doing something "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "You have a lot of work to do so you'd better {it}get at it{/it}. [={it}get to it{/it}]"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get away",
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sn": "1",
                        "dt": [
                          [
                            "text",
                            "{bc}to go away from a place "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "I'll be busy at work all day and I can't {it}get away{/it} until tonight."
                              }
                            ]
                          ],
                          [
                            "uns",
                            [
                              [
                                [
                                  "text",
                                  "often used figuratively "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "The company is having problems because they've {phrase}gotten away from{/phrase} the things they do best. [=they have stopped doing the things they do best]"
                                    }
                                  ]
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "2",
                        "dt": [
                          [
                            "text",
                            "{bc}to go away from your home for a vacation "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "I'm taking some time off because I really need to {it}get away{/it} for a few days."
                              },
                              {
                                "t": "We went on a cruise to {phrase}get away from it all{/phrase}."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "3",
                        "dt": [
                          [
                            "text",
                            "{bc}to avoid being caught {bc}to escape "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The robbers {it}got away{/it} (from the police) in a fast car."
                              }
                            ]
                          ],
                          [
                            "uns",
                            [
                              [
                                [
                                  "text",
                                  "often + {it}with{/it} "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "The robbers {it}got away with{/it} a lot of stolen jewelry."
                                    }
                                  ]
                                ]
                              ],
                              [
                                [
                                  "text",
                                  "sometimes used figuratively "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "You can't {it}get away{/it} from the facts. = {phrase}There's no getting away from{/phrase} the facts. [=you can't avoid or deny the facts; the facts are known and cannot be ignored]"
                                    }
                                  ]
                                ]
                              ]
                            ]
                          ],
                          [
                            "text",
                            "{dx}see also {dxt|getaway||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sen",
                      {
                        "sn": "4",
                        "phrasev": [
                          {
                            "pva": "get away with (something)"
                          }
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "a",
                        "dt": [
                          [
                            "text",
                            "{bc}to not be criticized or punished for (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "She's incredibly rude. I don't know how she {it}gets away with{/it} it."
                              }
                            ]
                          ],
                          [
                            "uns",
                            [
                              [
                                [
                                  "text",
                                  "often used figuratively "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "There's a chance of rain, but I think I can probably {it}get away with{/it} leaving my umbrella at home. [=I probably will not need my umbrella]"
                                    },
                                    {
                                      "t": "It would be nice to have more food for the party, but I think we can {it}get away with{/it} what we have. [=I think what we have is enough and will not cause problems for us]"
                                    }
                                  ]
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "b",
                        "dt": [
                          [
                            "text",
                            "{bc}to be given only slight or mild punishment for a crime or for doing something wrong "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The policeman stopped her for speeding but let her {it}get away with{/it} just a warning."
                              }
                            ]
                          ],
                          [
                            "text",
                            "{dx}see also {it}get away with murder{/it} at {dxt|murder:1||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get back",
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sn": "1",
                        "dt": [
                          [
                            "text",
                            "{bc}to return to a place after going away "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "When did you {it}get back{/it} from your vacation?"
                              },
                              {
                                "t": "We {it}got back{/it} to the office in the early afternoon."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "2",
                        "dt": [
                          [
                            "text",
                            "{bc}to return to an activity, condition, etc."
                          ],
                          [
                            "uns",
                            [
                              [
                                [
                                  "text",
                                  "usually + {it}to{/it} "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "Things are finally {it}getting back to{/it} normal."
                                    },
                                    {
                                      "t": "Let's {it}get back to{/it} the topic we were discussing yesterday."
                                    },
                                    {
                                      "t": "It's time to {phrase}get back to work{/phrase}. [=to start working again]"
                                    }
                                  ]
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "3",
                        "phrasev": [
                          {
                            "pva": "get (something) back"
                          },
                          {
                            "pvl": "or",
                            "pva": "get back (something)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to get or obtain (something you have lost) again {bc}to recover (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He {it}got{/it} his old job {it}back{/it} after a long struggle."
                              },
                              {
                                "t": "Someone stole his wallet but he {it}got{/it} it {it}back{/it} from the police."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "4",
                        "phrasev": [
                          {
                            "pva": "get (someone) back"
                          },
                          {
                            "pvl": "or",
                            "pva": "get back at (someone)"
                          },
                          {
                            "pvl": "or British",
                            "pva": "get your own back"
                          }
                        ],
                        "sls": [
                          "informal"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to do something bad or unpleasant to someone who has treated you badly or unfairly "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "I'll {it}get{/it} you {it}back{/it} for what you did to me!"
                              },
                              {
                                "t": "After he lost his job, he vowed that he would find a way to {it}get back at{/it} his old boss."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sen",
                      {
                        "sn": "5",
                        "phrasev": [
                          {
                            "pva": "get back to (someone)"
                          }
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "a",
                        "dt": [
                          [
                            "text",
                            "{bc}to talk to or write to (someone) at a later time in order to give more information, answer a question, etc. "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He {it}got back to{/it} me (by e-mail) in a few days with a new offer."
                              },
                              {
                                "t": "{ldquo}How much will it cost?{rdquo} {ldquo}I'm not sure. I'll have to {it}get back to{/it} you on that.{rdquo}"
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "b",
                        "dt": [
                          [
                            "text",
                            "{bc}to call (someone) back on the telephone "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "{ldquo}There's someone on the phone for you, sir.{rdquo} {ldquo}Tell them I can't take their call now but I'll {it}get back to{/it} them as soon as I can.{rdquo}"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get back to (the) basics",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|basic:2||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get behind",
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sn": "1",
                        "dt": [
                          [
                            "text",
                            "{bc}to fail to do something as quickly as required or expected "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "We've been {it}getting{/it} further (and further) {it}behind{/it} (schedule)."
                              },
                              {
                                "t": "We {it}got behind{/it} with our car payments."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "2",
                        "phrasev": [
                          {
                            "pva": "get behind (someone or something)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to support (someone or something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The proposal may succeed if a few more people {it}get behind{/it} it."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get by",
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sn": "1",
                        "dt": [
                          [
                            "text",
                            "{bc}to do enough or to do well enough to avoid failure "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He's doing very well in his history classes, but he's barely {it}getting by{/it} in math."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "2",
                        "dt": [
                          [
                            "text",
                            "{bc}to be able to live or to do what is needed by using what you have even though you do not have much "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "We don't have a lot of money, but we {it}get by{/it}."
                              }
                            ]
                          ],
                          [
                            "uns",
                            [
                              [
                                [
                                  "text",
                                  "often + {it}on{/it} "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "How can you {it}get by on{/it} such a small salary?"
                                    }
                                  ]
                                ]
                              ],
                              [
                                [
                                  "text",
                                  "often + {it}with{/it} "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "We {it}got by with{/it} a minimum of clothing when we went camping."
                                    }
                                  ]
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get cracking",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|crack:1||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get down",
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sn": "1",
                        "phrasev": [
                          {
                            "pva": "get (someone) down"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to cause (someone) to become sad or depressed "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The weather was really {it}getting{/it} her {it}down{/it}."
                              },
                              {
                                "t": "Talking about politics always {it}gets{/it} me {it}down{/it}."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sen",
                      {
                        "sn": "2",
                        "phrasev": [
                          {
                            "pva": "get (something) down"
                          },
                          {
                            "pvl": "or",
                            "pva": "get down (something)"
                          }
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "a",
                        "dt": [
                          [
                            "text",
                            "{bc}to swallow (something) {bc}to eat or drink (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "You'll feel better once you {it}get{/it} this medicine {it}down{/it}."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "b",
                        "dt": [
                          [
                            "text",
                            "{bc}to write (something) down "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "If you have a good idea, you should {it}get{/it} it {it}down{/it} (in writing) so that you won't forget it."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "3",
                        "sls": [
                          "informal"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to play music or dance with skill and enthusiasm "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "She likes to {it}get down{/it} on the dance floor."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sen",
                      {
                        "sn": "4",
                        "phrasev": [
                          {
                            "pva": "get down to (something)"
                          }
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "a",
                        "dt": [
                          [
                            "text",
                            "{bc}to start to do (something) {bc}to begin to give your attention or effort to (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "It's time to stop delaying and {it}get down to{/it} work."
                              },
                              {
                                "t": "Let's {phrase}get down to business{/phrase}."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "b",
                        "dt": [
                          [
                            "text",
                            "{bc}to talk about or describe (something) in a very simple and accurate way "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "{phrase}When you get right down to it{/phrase}, this movie is just not very good."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get even",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|even:1||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get going",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sn": "1",
                        "dt": [
                          [
                            "text",
                            "{bc}to leave "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "We ought to {it}get going{/it} if we don't want to be late."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "2",
                        "dt": [
                          [
                            "text",
                            "{bc}to start doing something "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "You should {it}get going{/it} on that assignment."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "3 a",
                        "dt": [
                          [
                            "text",
                            "{bc}to start talking "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "Once he {it}gets going{/it} about the war you can't shut him up."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "b",
                        "dt": [
                          [
                            "text",
                            "{bc}to cause (someone) to start talking "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "Don't {it}get{/it} him {it}going{/it} about the war or you'll never shut him up!"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get hold of",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|hold:2||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get in",
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sn": "1 a",
                        "dt": [
                          [
                            "text",
                            "{bc}to enter a place "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The burglar {it}got in{/it} through an unlocked window."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "b",
                        "dt": [
                          [
                            "text",
                            "{bc}to arrive at a place "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The train {it}got in{/it} late."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "c",
                        "dt": [
                          [
                            "text",
                            "{bc}to arrive home "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "Her husband was out late last night. He didn't {it}get in{/it} until almost midnight."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "2",
                        "dt": [
                          [
                            "text",
                            "{bc}to become involved in an activity "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The people who have become rich in this business are the ones who {it}got in{/it} at the beginning."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "3",
                        "dt": [
                          [
                            "text",
                            "{bc}to be chosen or elected for office "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The mayor {it}got in{/it} by a very slim margin."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "4",
                        "phrasev": [
                          {
                            "pva": "get in"
                          },
                          {
                            "pvl": "or",
                            "pva": "get (someone) in"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to be accepted or to cause (someone) to be accepted as a student, member, etc. "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "It's a very good school. I hope your daughter {it}gets in{/it}."
                              },
                              {
                                "t": "I hope you {it}get{/it} your daughter {it}in{/it}."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "5",
                        "phrasev": [
                          {
                            "pva": "get (someone) in"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to have (someone) come to your home, business, etc., to do work "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "We had to {it}get{/it} a doctor/plumber {it}in{/it} to deal with the emergency."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sen",
                      {
                        "sn": "6",
                        "phrasev": [
                          {
                            "pva": "get (something) in"
                          },
                          {
                            "pvl": "or",
                            "pva": "get in (something)"
                          }
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "a",
                        "dt": [
                          [
                            "text",
                            "{bc}to do or say (something) by making an effort "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He managed to {it}get{/it} a few good punches {it}in{/it} before they stopped the fight."
                              },
                              {
                                "t": "May I {phrase}get a word in{/phrase} here? [=may I say something here?]"
                              }
                            ]
                          ],
                          [
                            "text",
                            "{dx}see also {it}get a word in edgewise{/it} at {dxt|edgewise||}{/dx}"
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "b",
                        "dt": [
                          [
                            "text",
                            "{bc}to send or deliver (something) to the proper person or place "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "Did you {it}get{/it} your assignment {it}in{/it} on time?"
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "c",
                        "dt": [
                          [
                            "text",
                            "{bc}to do (something) in the amount of time that is available "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "I was able to {it}get in{/it} a few hours of reading last night."
                              },
                              {
                                "t": "I hope we can {it}get in{/it} a visit to the art museum the next time we're in the city."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "d",
                        "dt": [
                          [
                            "text",
                            "{bc}to harvest (a crop) and put it in a safe or dry place "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "It's time to {it}get{/it} the crop/harvest {it}in{/it}."
                              },
                              {
                                "t": "We'd better {it}get{/it} the hay {it}in{/it} before it rains."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "7",
                        "phrasev": [
                          {
                            "pva": "get in on (something)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to become involved in (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "It sounds like an interesting project and I'd like to {it}get in on{/it} it."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "8",
                        "phrasev": [
                          {
                            "pva": "get in with (someone)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to become friends with (someone) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "She {it}got in with{/it} [={it}fell in with{/it}] a bad crowd and got into trouble."
                              },
                              {
                                "t": "He managed to {phrase}get in good with{/phrase} the boss. [=he got the boss to like him]"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get into",
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sen",
                      {
                        "sn": "1",
                        "phrasev": [
                          {
                            "pva": "get into (a place)"
                          }
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "a",
                        "dt": [
                          [
                            "text",
                            "{bc}to enter (a place) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The burglar {it}got into{/it} the house through an unlocked window."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "b",
                        "dt": [
                          [
                            "text",
                            "{bc}to arrive at (a place) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The train {it}got into{/it} New York late last night."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sen",
                      {
                        "sn": "2",
                        "phrasev": [
                          {
                            "pva": "get into (something)"
                          }
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "a",
                        "dt": [
                          [
                            "text",
                            "{bc}to become involved in (an activity) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The people who have become rich in this business are the ones who {it}got into{/it} it at the beginning."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "b",
                        "dt": [
                          [
                            "text",
                            "{bc}to begin to be interested in and to enjoy (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "It's only recently that I've really {it}gotten into{/it} music."
                              },
                              {
                                "t": "I tried reading the book, but I just couldn't {it}get into{/it} it."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sen",
                      {
                        "sn": "3",
                        "phrasev": [
                          {
                            "pva": "get into (something)"
                          },
                          {
                            "pvl": "or",
                            "pva": "get (someone) into (something)"
                          }
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "a",
                        "dt": [
                          [
                            "text",
                            "{bc}to be accepted or to cause (someone) to be accepted in (a school, organization, etc.) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "I hope your daughter {it}gets into{/it} the school."
                              },
                              {
                                "t": "I hope you {it}get{/it} your daughter {it}into{/it} the school."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "b",
                        "dt": [
                          [
                            "text",
                            "{bc}to become involved or to cause (someone) to become involved in (something bad, such as trouble or a fight) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He {it}got into{/it} a lot of trouble when he was a teenager."
                              },
                              {
                                "t": "They {it}got into{/it} an argument."
                              },
                              {
                                "t": "His friends {it}got{/it} him {it}into{/it} trouble."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "4",
                        "phrasev": [
                          {
                            "pva": "get into (something)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to talk about (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "I'll tell you what happened, but I don't want to {it}get into{/it} [={it}go into{/it}] all the reasons for why it happened."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "5",
                        "phrasev": [
                          {
                            "pva": "get into (someone)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to affect the behavior of (someone)"
                          ],
                          [
                            "uns",
                            [
                              [
                                [
                                  "text",
                                  "used to say that someone is behaving in an unusual way and you don't know why "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "I don't know what has {it}gotten into{/it} him lately."
                                    },
                                    {
                                      "t": "She never used to be so rude to people. {phrase}What got into her?{/phrase} [=why is she behaving this way?]"
                                    }
                                  ]
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get lost",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|lost:2||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get lucky",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|lucky||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get moving",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|move:1||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get off",
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sn": "1",
                        "dt": [
                          [
                            "text",
                            "{bc}to leave at the start of a journey "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "We {it}got off{/it} early on our camping trip."
                              }
                            ]
                          ],
                          [
                            "uns",
                            [
                              [
                                [
                                  "text",
                                  "often used figuratively in the phrase {phrase}get off to a good/bad (etc.) start{/phrase} "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "He and I {it}got off to a bad start{/it}, but now we get along well."
                                    },
                                    {
                                      "t": "The project {it}got off to a slow start{/it}."
                                    }
                                  ]
                                ]
                              ]
                            ]
                          ],
                          [
                            "text",
                            "{dx}see also {it}get off on the right/wrong foot{/it} at {dxt|foot:1||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sen",
                      {
                        "sn": "2",
                        "phrasev": [
                          {
                            "pva": "get off"
                          },
                          {
                            "pvl": "or",
                            "pva": "get (someone) off"
                          }
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "a",
                        "dt": [
                          [
                            "text",
                            "{bc}to not be punished for a crime {bc}to be judged not guilty of a crime "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He's been arrested several times, but he always {it}gets off{/it}."
                              }
                            ]
                          ],
                          [
                            "text",
                            "{bc}to help (someone) to be judged not guilty "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "His lawyer {it}got{/it} him {it}off{/it}."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "b",
                        "dt": [
                          [
                            "text",
                            "{bc}to be given or to help (someone) to be given only a slight punishment for a crime "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "She {it}got off{/it} lightly."
                              }
                            ]
                          ],
                          [
                            "uns",
                            [
                              [
                                [
                                  "text",
                                  "usually + {it}with{/it} "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "He {it}got off with{/it} a light sentence."
                                    },
                                    {
                                      "t": "His lawyer tried to {it}get{/it} him {it}off with{/it} a light sentence."
                                    }
                                  ]
                                ]
                              ],
                              [
                                [
                                  "text",
                                  "sometimes used figuratively "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "It was a bad accident. You're lucky that you {it}got off with{/it} just a broken leg—you could have been killed!"
                                    }
                                  ]
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "3",
                        "dt": [
                          [
                            "text",
                            "{bc}to stop being on or against someone or something "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "{it}Get off{/it}—you're hurting me!"
                              },
                              {
                                "t": "I took the subway and {it}got off{/it} at the downtown station."
                              }
                            ]
                          ],
                          [
                            "text",
                            "{dx}see also {dxt|get||5a}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "4",
                        "phrasev": [
                          {
                            "pva": "get off (something)"
                          },
                          {
                            "pvl": "or",
                            "pva": "get (someone) off (something)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to stop talking about (something) or to cause (someone) to stop talking about (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "We somehow {it}got off{/it} (the subject of) work and started talking about our personal lives."
                              },
                              {
                                "t": "I tried to change the subject, but I couldn't {it}get{/it} her {it}off{/it} it."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "5",
                        "phrasev": [
                          {
                            "pva": "get off"
                          },
                          {
                            "pvl": "or",
                            "pva": "get off work"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to finish working and leave the place where you work "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "I {it}get off{/it} early on Fridays."
                              },
                              {
                                "t": "I {it}got off work{/it} early last Thursday so I could see the parade."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sen",
                      {
                        "sn": "6",
                        "phrasev": [
                          {
                            "pva": "get (something) off"
                          },
                          {
                            "pvl": "or",
                            "pva": "get off (something)"
                          }
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "a",
                        "dt": [
                          [
                            "text",
                            "{bc}to write and send (a letter, an e-mail message, etc.) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "I'll {it}get{/it} the letter {it}off{/it} (to them) tomorrow."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "b",
                        "dt": [
                          [
                            "text",
                            "{bc}to shoot (something) from a gun "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The policeman {it}got off{/it} [={it}fired{/it}] several shots before the criminal escaped."
                              }
                            ]
                          ],
                          [
                            "uns",
                            [
                              [
                                [
                                  "text",
                                  "sometimes used figuratively "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "He managed to {it}get off{/it} a few good jokes in his speech."
                                    }
                                  ]
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "7",
                        "phrasev": [
                          {
                            "pva": "get off"
                          },
                          {
                            "pvl": "or",
                            "pva": "get (someone) off"
                          }
                        ],
                        "sls": [
                          "chiefly British"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to fall asleep or to help (someone, such as a baby) to fall asleep "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "I had just {it}got off{/it} [={it}dropped off{/it}] when the doorbell rang. = I had just {phrase}got off to sleep{/phrase} when the doorbell rang."
                              },
                              {
                                "t": "I just {it}got{/it} the baby {it}off to sleep{/it}."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "8",
                        "phrasev": [
                          {
                            "pva": "get off"
                          },
                          {
                            "pvl": "or",
                            "pva": "get (someone) off"
                          }
                        ],
                        "sls": [
                          "US",
                          "informal"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to have an orgasm or to cause (someone) to have an orgasm"
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "9",
                        "phrasev": [
                          {
                            "pva": "get off on (something)"
                          }
                        ],
                        "sls": [
                          "informal + sometimes disapproving"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to enjoy or be excited by (something) especially in a sexual way "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He's one of those guys who seem to {it}get off on{/it} making other people feel guilty."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "10",
                        "phrasev": [
                          {
                            "pva": "get off with (someone)"
                          }
                        ],
                        "sls": [
                          "British",
                          "informal"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to have sex with (someone) {bc}to begin a sexual relationship with (someone) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "She found out he'd {it}gotten off with{/it} another woman."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sen",
                      {
                        "sn": "11",
                        "sls": [
                          "informal"
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "a",
                        "dt": [
                          [
                            "snote",
                            [
                              [
                                "t",
                                "To {phrase}tell someone where to get off{/phrase} is to criticize or disagree with someone in a very direct and angry way."
                              ],
                              [
                                "vis",
                                [
                                  {
                                    "t": "I was sick of listening to his constant complaints, so I {it}told him where to get off{/it}."
                                  }
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "b",
                        "sls": [
                          "US"
                        ],
                        "dt": [
                          [
                            "snote",
                            [
                              [
                                "t",
                                "If you {phrase}don't know where someone gets off{/phrase} (doing something), you are angry because someone has done something that is not right."
                              ],
                              [
                                "vis",
                                [
                                  {
                                    "t": "I {it}don't know where he gets off{/it} telling me what to do. = {phrase}Where does he get off{/phrase} telling me what to do? [=he has no right to tell me what to do]"
                                  }
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get on",
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sn": "1",
                        "phrasev": [
                          {
                            "pva": "get on with (something)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to continue doing (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "I didn't mean to interrupt you. I'll let you {it}get on with{/it} your work."
                              },
                              {
                                "t": "You need to stop feeling sorry for yourself and just {phrase}get on with your life{/phrase}. [=return to doing the things you do in your normal life]"
                              },
                              {
                                "t": "This introduction is taking forever. I wish they'd just {phrase}get on with it{/phrase}. [=stop delaying and get to the interesting or important part]"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "2",
                        "sls": [
                          "chiefly British"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to be or remain friendly {bc}to get along "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "They've never really {it}got on{/it} (with each other)."
                              },
                              {
                                "t": "We {it}get on{/it} well enough, but we're not really close friends."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sen",
                      {
                        "sn": "3",
                        "sls": [
                          "chiefly British"
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "a",
                        "dt": [
                          [
                            "text",
                            "{bc}to make progress while doing something "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "How is your daughter {it}getting on{/it} in/at school?"
                              },
                              {
                                "t": "We can {it}get on{/it} [={it}get along, get by, manage{/it}] just fine without them."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "b",
                        "dt": [
                          [
                            "text",
                            "{bc}to achieve greater success {bc}to get ahead "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "an ambitious young woman trying to {it}get on{/it} in business"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "4",
                        "phrasev": [
                          {
                            "pva": "get on (something)"
                          }
                        ],
                        "sls": [
                          "US"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to start to do or deal with (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "{ldquo}These files need to be organized.{rdquo} {ldquo}I'll {it}get on{/it} it right away.{rdquo}"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "5",
                        "phrasev": [
                          {
                            "pva": "get on (someone)"
                          }
                        ],
                        "sls": [
                          "US"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to criticize (someone) repeatedly "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "His boss has been {it}getting on{/it} him about the quality of his work."
                              },
                              {
                                "t": "She's always {phrase}getting on his case{/phrase} about cleaning his room. [=she's always telling him to clean it]"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "6",
                        "phrasev": [
                          {
                            "pva": "get it on"
                          }
                        ],
                        "sls": [
                          "US slang"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to have sex"
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sen",
                      {
                        "sn": "7",
                        "sls": [
                          "informal"
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "a",
                        "phrasev": [
                          {
                            "pva": "get on"
                          },
                          {
                            "pvl": "or",
                            "pva": "get on in years"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to grow old "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "My grandmother is {it}getting on{/it} [={it}aging{/it}] a bit, but she's still very active."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "b",
                        "dt": [
                          [
                            "text",
                            "{bc}to become late "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "It's {it}getting on{/it}, and we really ought to go."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "8",
                        "phrasev": [
                          {
                            "pva": "get on for (something)"
                          }
                        ],
                        "sls": [
                          "British",
                          "informal"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to move toward becoming (a specified age, time, etc.) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He's {it}getting on for{/it} 70. [=he's approaching 70; he is nearly 70]"
                              },
                              {
                                "t": "It was {it}getting on for{/it} noon."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get onto",
            "vrs": [
              {
                "vl": "or",
                "va": "get on to"
              }
            ],
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sn": "1",
                        "phrasev": [
                          {
                            "pva": "get onto (something)"
                          },
                          {
                            "pvl": "or",
                            "pva": "get on to (something)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to start to do or deal with (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "{ldquo}We need someone to send out the invitations.{rdquo} {ldquo}I'll {it}get onto{/it} [={it}get on{/it}] it right away.{rdquo}"
                              }
                            ]
                          ],
                          [
                            "text",
                            "{bc}to start to talk about something "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "How did we {it}get onto{/it} this topic?"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "2",
                        "phrasev": [
                          {
                            "pva": "get onto (someone)"
                          },
                          {
                            "pvl": "or",
                            "pva": "get on to (someone)"
                          }
                        ],
                        "sls": [
                          "British"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to speak to or write to (someone) about a particular problem, job, etc. "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "I'll {it}get onto{/it} [={it}get in touch with{/it}] the doctor/plumber straightaway and see if he'll come round."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get out",
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sn": "1 a",
                        "dt": [
                          [
                            "text",
                            "{bc}to leave or escape from a place, a vehicle, etc. "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He was trapped in the burning building/car, but he was somehow able to {it}get out{/it} (of it) alive."
                              }
                            ]
                          ],
                          [
                            "uns",
                            [
                              [
                                [
                                  "text",
                                  "used as an angry way to tell someone to leave "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "{it}Get out{/it}! I never want to see you again!"
                                    }
                                  ]
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "b",
                        "phrasev": [
                          {
                            "pva": "get (someone) out"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to cause or help (someone) to leave or escape "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The firemen managed to {it}get{/it} him {it}out{/it} (of the burning building) alive."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "c",
                        "phrasev": [
                          {
                            "pva": "get (something) out"
                          },
                          {
                            "pvl": "or",
                            "pva": "get out (something)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to remove (something) from storage so that it can be used "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "It's raining. I'd better {it}get out{/it} the umbrella."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "2",
                        "dt": [
                          [
                            "text",
                            "{bc}to go to places outside your home for social occasions, events, etc. "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "You spend too much time at home. You need to {it}get out{/it} more."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "3",
                        "dt": [
                          [
                            "text",
                            "{bc}to become known "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "Their secret {it}got out{/it}."
                              },
                              {
                                "t": "Word {it}got out{/it} that she was resigning."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "4",
                        "phrasev": [
                          {
                            "pva": "get (something) out"
                          },
                          {
                            "pvl": "or",
                            "pva": "get out (something)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to say (something) by making an effort "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He managed to {it}get out{/it} a few words before he collapsed."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "5",
                        "sls": [
                          "US",
                          "informal"
                        ],
                        "dt": [
                          [
                            "uns",
                            [
                              [
                                [
                                  "text",
                                  "used in speech to show that you are surprised by something or do not believe it "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "{ldquo}They gave the job to Jane.{rdquo} {ldquo}{it}Get out{/it}!{rdquo} = {ldquo}{phrase}Get out of here{/phrase}!{rdquo}"
                                    }
                                  ]
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sen",
                      {
                        "sn": "6",
                        "phrasev": [
                          {
                            "pva": "get out of (something)"
                          },
                          {
                            "pvl": "or",
                            "pva": "get (someone or something) out of (something)"
                          }
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "a",
                        "dt": [
                          [
                            "text",
                            "{bc}to avoid doing (something) or to help (someone) to avoid doing (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "I didn't want to go to the lecture, but I couldn't {it}get out of{/it} it."
                              },
                              {
                                "t": "He tried to {it}get out of{/it} doing his homework."
                              },
                              {
                                "t": "My sister said she could {it}get{/it} me {it}out of{/it} going to the party if I really didn't want to go"
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "b",
                        "dt": [
                          [
                            "text",
                            "{bc}to stop having (a habit) or to cause (someone) to stop having (a habit) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "I used to exercise every day, but I {it}got out of{/it} the habit."
                              },
                              {
                                "t": "All the extra work I've been doing has {it}gotten{/it} me {it}out of{/it} the habit of exercising."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "c",
                        "dt": [
                          [
                            "text",
                            "{bc}to stop being in or involved in (something) or to cause (someone or something) to stop being in or involved in (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The company has decided to {it}get{/it} (itself) {it}out of{/it} the computer business."
                              },
                              {
                                "t": "She {it}got{/it} her money {it}out of{/it} the stock market."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "7",
                        "phrasev": [
                          {
                            "pva": "get (something) out of (something or someone)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to take (something) from (something or someone) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The police officer {it}got{/it} the gun {it}out of{/it} the suspect's hand."
                              },
                              {
                                "t": "The police officer {it}got{/it} a confession {it}out of{/it} the suspect."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "8",
                        "phrasev": [
                          {
                            "pva": "get (something) out of (something)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to gain (something) from (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "What do you hope to {it}get out of{/it} this experience?"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get over",
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sen",
                      {
                        "sn": "1",
                        "phrasev": [
                          {
                            "pva": "get over (something)"
                          }
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "a",
                        "dt": [
                          [
                            "text",
                            "{bc}to stop being controlled or bothered by (something, such as a problem or feeling) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "You need to {it}get over{/it} [={it}overcome{/it}] your fear of being lied to."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "b",
                        "dt": [
                          [
                            "text",
                            "{bc}to stop feeling unhappy about (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "She's disappointed about their decision, but she'll {it}get over{/it} it eventually."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "c",
                        "sls": [
                          "informal"
                        ],
                        "dt": [
                          [
                            "uns",
                            [
                              [
                                [
                                  "text",
                                  "used to say that you are very surprised or impressed by something "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "I just can't {it}get over{/it} how much weight you've lost!"
                                    }
                                  ]
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "2",
                        "phrasev": [
                          {
                            "pva": "get over (an illness)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to become healthy again after (an illness) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He had a bad cold, and he still hasn't {it}gotten over{/it} it completely."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "3",
                        "phrasev": [
                          {
                            "pva": "get over (someone)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to stop feeling unhappy after ending a relationship with (someone) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He broke up with his girlfriend a couple of months ago, and he still hasn't {it}gotten over{/it} her."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sen",
                      {
                        "sn": "4",
                        "phrasev": [
                          {
                            "pva": "get (something) over"
                          }
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "a",
                        "vrs": [
                          {
                            "vl": "or",
                            "va": "get (something) over with"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to cause or experience the end of (something) {bc}to finish (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "I just want to {it}get{/it} this ordeal {it}over{/it}! = I just want to {it}get{/it} this ordeal {it}over with{/it}! = I just want to {phrase}get{/phrase} this ordeal {phrase}over and done with{/phrase}! [=I want this ordeal to end]"
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "b",
                        "vrs": [
                          {
                            "vl": "or",
                            "va": "get over (something)"
                          }
                        ],
                        "sls": [
                          "chiefly British"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to express (something) clearly so that it is understood "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "I don't know if I was able to {it}get{/it} my message {it}over{/it} [={it}across{/it}] to them."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get real",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|real:1||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get rid of",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|rid||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get rolling",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|roll:1||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get round",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|get around||(above)}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get the best of",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|best:3||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get the better of",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|better:3||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get there",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{bc}to reach a goal {bc}to do what you are trying to do "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "We haven't made a profit yet, but we'll {it}get there{/it} eventually. [=we'll make a profit eventually]"
                              }
                            ]
                          ],
                          [
                            "text",
                            "{bc}to come closer to reaching a goal "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "We haven't made a profit yet, but we're {it}getting there{/it}."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get through",
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sn": "1 a",
                        "sls": [
                          "chiefly US"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to finish a job or activity "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "When you {it}get through{/it} (with that job), I've got something else for you to do."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "b",
                        "phrasev": [
                          {
                            "pva": "get through (something)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to do or finish (something, such as an amount of work) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "We {it}got through{/it} [={it}covered{/it}] all of the material that we wanted to cover."
                              },
                              {
                                "t": "There's still a lot of paperwork to be {it}gotten through{/it}."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "c",
                        "phrasev": [
                          {
                            "pva": "get through (something)"
                          },
                          {
                            "pvl": "or",
                            "pva": "get (someone) through (something)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to complete or to help (someone) to complete (a test, an exam, etc.) successfully "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "She studied hard and {it}got through{/it} [={it}passed{/it}] her exams."
                              },
                              {
                                "t": "The extra hours of study are what {it}got{/it} her {it}through{/it} her exams."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "2",
                        "phrasev": [
                          {
                            "pva": "get through"
                          },
                          {
                            "pvl": "or",
                            "pva": "get through (something)"
                          },
                          {
                            "pvl": "or",
                            "pva": "get (something) through (something)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to pass through or beyond something that blocks you or slows you down "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "Traffic was very heavy, but we managed to {it}get through{/it} (it)."
                              },
                              {
                                "t": "Rescuers are having trouble {it}getting through{/it} to the flood victims."
                              }
                            ]
                          ],
                          [
                            "text",
                            "{bc}to cause (something) to pass through or beyond something "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "Traffic was very heavy, but we managed to {it}get{/it} our truck {it}through{/it} (it)."
                              },
                              {
                                "t": "Rescuers are having trouble {it}getting{/it} supplies {it}through{/it} to the flood victims."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "3",
                        "phrasev": [
                          {
                            "pva": "get through (something)"
                          },
                          {
                            "pvl": "or",
                            "pva": "get (someone) through (something)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to have the experience of living through (something that is difficult, dangerous, etc.) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "It was a very difficult time in our marriage, but we {it}got through{/it} it."
                              },
                              {
                                "t": "I don't know how those early settlers managed to {it}get through{/it} [={it}survive{/it}] the winter."
                              }
                            ]
                          ],
                          [
                            "text",
                            "{bc}to help (someone) to live through (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "It was pure determination that {it}got{/it} them {it}through{/it} that crisis."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "4",
                        "phrasev": [
                          {
                            "pva": "get through (something)"
                          }
                        ],
                        "sls": [
                          "chiefly British"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to spend or use all of (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He {it}got through{/it} [={it}went through{/it}] all the money he inherited in just a few years."
                              },
                              {
                                "t": "They {it}got through{/it} [={it}went through{/it}] three bottles of wine with dinner."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "5 a",
                        "phrasev": [
                          {
                            "pva": "get through"
                          },
                          {
                            "pvl": "or",
                            "pva": "get through to (someone)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to be clearly expressed to and understood by someone "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "I hope my message has finally {it}gotten through to{/it} you. [=I hope you finally understand my message]"
                              },
                              {
                                "t": "I think my message finally {it}got through{/it}."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "b",
                        "phrasev": [
                          {
                            "pva": "get through to (someone)"
                          },
                          {
                            "pvl": "or",
                            "pva": "get (something) through to (someone)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to express something clearly so that it is understood by (someone) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "I've talked to him many times, but I just can't seem to {it}get through to{/it} him."
                              },
                              {
                                "t": "I hope I've finally {it}gotten{/it} my message {it}through to{/it} him."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "6",
                        "phrasev": [
                          {
                            "pva": "get through"
                          },
                          {
                            "pvl": "or",
                            "pva": "get through to (someone)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to make a successful telephone call to someone "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "I tried to call home but I couldn't {it}get through{/it}."
                              },
                              {
                                "t": "Where were you? I've been trying to {it}get through to{/it} you (on the phone) all day!"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "7",
                        "phrasev": [
                          {
                            "pva": "get through"
                          },
                          {
                            "pvl": "or",
                            "pva": "get through (something)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to be accepted or approved by an official group "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The bill finally {it}got through{/it} [={it}passed{/it}] and eventually became a law."
                              },
                              {
                                "t": "The bill finally {it}got through{/it} [={it}passed{/it}] Congress and eventually became a law."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get to",
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sen",
                      {
                        "sn": "1",
                        "phrasev": [
                          {
                            "pva": "get to (something)"
                          }
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "a",
                        "dt": [
                          [
                            "text",
                            "{bc}to start ({it}doing{/it} something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "She sometimes {it}gets to worrying{/it} over her health."
                              },
                              {
                                "t": "We {it}got to talking{/it} about old times."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "b",
                        "dt": [
                          [
                            "text",
                            "{bc}to deal with (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The letter is on my desk, but I haven't {it}gotten to{/it} it yet."
                              },
                              {
                                "t": "I'll {it}get to{/it} the accounts as soon as I can."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sen",
                      {
                        "sn": "2",
                        "phrasev": [
                          {
                            "pva": "get to (someone)"
                          }
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "a",
                        "dt": [
                          [
                            "text",
                            "{bc}to bother or annoy (someone) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "All these delays are starting to {it}get to{/it} me."
                              }
                            ]
                          ],
                          [
                            "text",
                            "{dx}see also {dxt|get||26a (above)}{/dx}"
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "b",
                        "dt": [
                          [
                            "text",
                            "{bc}to make (someone) feel sad "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The movie's sad ending really {it}got to{/it} me."
                              }
                            ]
                          ],
                          [
                            "text",
                            "{dx}see also {dxt|get||26b (above)}{/dx}"
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "c",
                        "sls": [
                          "chiefly US"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to change or influence the behavior of (someone) wrongly or illegally by making threats, paying money, etc. "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The witness changed his story. Someone must have {it}gotten to{/it} him."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "3",
                        "phrasev": [
                          {
                            "pva": "get to (somewhere)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to go to or reach (somewhere) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "We {it}got to{/it} the station/airport just in time."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get together",
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sn": "1 a",
                        "dt": [
                          [
                            "text",
                            "{bc}to meet and spend time together "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "I'd like to {it}get together{/it} with you soon."
                              },
                              {
                                "t": "He often {it}gets together{/it} with his friends after work."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "b",
                        "dt": [
                          [
                            "text",
                            "{bc}to begin to have a sexual or romantic relationship "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He and his wife first {it}got together{/it} in college."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "c",
                        "phrasev": [
                          {
                            "pva": "get (people) together"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to cause (people) to meet or to have a relationship "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "Their shared interest in photography is what {it}got{/it} them {it}together{/it}."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "2",
                        "dt": [
                          [
                            "text",
                            "{bc}to agree to do or accept something"
                          ],
                          [
                            "uns",
                            [
                              [
                                [
                                  "text",
                                  "often + {it}on{/it} "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "The two sides have been unable to {it}get together on{/it} a new contract."
                                    }
                                  ]
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "3",
                        "phrasev": [
                          {
                            "pva": "get together (things or people)"
                          },
                          {
                            "pvl": "or",
                            "pva": "get (things or people) together"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to collect (things) or gather (people) into one place or group "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He {it}got together{/it} [={it}assembled{/it}] a great art collection."
                              },
                              {
                                "t": "The government {it}got together{/it} a group of experts to study the problem."
                              },
                              {
                                "t": "We're still trying to {it}get together{/it} [={it}obtain{/it}] the money we need to buy a new car."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sen",
                      {
                        "sn": "4",
                        "phrasev": [
                          {
                            "pva": "get your act together"
                          },
                          {
                            "pvl": "or",
                            "pva": "get yourself together"
                          },
                          {
                            "pvl": "or",
                            "pva": "get it together"
                          }
                        ],
                        "sls": [
                          "informal"
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "a",
                        "vrs": [
                          {
                            "vl": "or",
                            "va": "get your life together"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to begin to live in a good and sensible way {bc}to stop being confused, foolish, etc. "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "His life got much better when he stopped drinking and {it}got his act together{/it}."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "b",
                        "dt": [
                          [
                            "text",
                            "{bc}to begin to function in a skillful or effective way "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The company finally {it}got its act together{/it} and started making a profit this year."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get to sleep",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{bc}to start sleeping {bc}to fall asleep "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "She finally {it}got to sleep{/it} after midnight."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get to work",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{bc}to start working "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "We need to stop delaying and {it}get to work{/it}."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get up",
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sn": "1",
                        "phrasev": [
                          {
                            "pva": "get up"
                          },
                          {
                            "pvl": "or",
                            "pva": "get (someone) up"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to rise or to cause (someone) to rise after lying or sleeping in a bed "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "I {it}got up{/it} [=got out of bed] early this morning."
                              },
                              {
                                "t": "I woke up early but I didn't {it}get up{/it} till later."
                              },
                              {
                                "t": "The alarm clock {it}got{/it} me {it}up{/it} earlier than usual."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "2",
                        "dt": [
                          [
                            "text",
                            "{bc}to stand up "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He {it}got up{/it} to greet her when she entered the room."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sen",
                      {
                        "sn": "3",
                        "phrasev": [
                          {
                            "pva": "get (something) up"
                          },
                          {
                            "pvl": "or",
                            "pva": "get up (something)"
                          }
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "a",
                        "dt": [
                          [
                            "text",
                            "{bc}to produce (something, such as courage) in yourself by trying or making an effort "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He couldn't {it}get up{/it} the courage to ask her out on a date."
                              },
                              {
                                "t": "She was so tired she could hardly {it}get up{/it} the energy to make dinner."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "b",
                        "dt": [
                          [
                            "text",
                            "{bc}to prepare or organize (something that involves a group of people) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "They're trying to {it}get up{/it} a petition to have the movie theater reopened."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "4",
                        "phrasev": [
                          {
                            "pva": "get it up"
                          }
                        ],
                        "sls": [
                          "slang"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to get an erection"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get up on the wrong side of the bed",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|bed:1||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get what's coming to you",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|come:1||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get wind of",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|wind:1||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get your bearings",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|bearing||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get your goat",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|goat||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "have got",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|have||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          }
        ],
        "shortdef": [
          "to obtain (something): such as",
          "to receive or be given (something)",
          "to obtain (something) through effort, chance, etc."
        ]
      },
      {
        "meta": {
          "id": "ground:1",
          "uuid": "293e48bc-1731-447a-aa8b-5dc6112b4e3a",
          "src": "learners",
          "section": "alpha",
          "target": {
            "tuuid": "dc823b43-746c-4ff8-a9c2-6d159a2087dc",
            "tsrc": "collegiate"
          },
          "highlight": "yes",
          "stems": [
            "ground",
            "from the ground up",
            "grounds",
            "into the ground",
            "off the ground",
            "on the ground",
            "to ground",
            "earth",
            "above ground",
            "below ground",
            "break ground",
            "break new ground",
            "burn to the ground",
            "down to the ground",
            "gain ground",
            "make up ground",
            "get off the ground",
            "give ground",
            "have/keep your feet on the ground",
            "have your feet on the ground",
            "keep your feet on the ground",
            "hit the ground running",
            "hold/stand your ground",
            "hold your ground",
            "stand your ground",
            "lose ground",
            "ground forces/troops",
            "ground forces",
            "ground troops",
            "ground war",
            "ground transportation",
            "burial ground",
            "familiar ground",
            "testing ground",
            "proving ground",
            "common ground",
            "on dangerous ground",
            "middle ground",
            "on the grounds that",
            "suits her down to the ground"
          ],
          "app-shortdef": {
            "hw": "ground:1",
            "fl": "noun",
            "def": [
              "{b}{it}the ground{/it}{/b} {bc} the surface of the earth",
              "{bc} the soil that is on or under the surface of the earth",
              "{bc} an area of land"
            ]
          },
          "offensive": false
        },
        "hom": 1,
        "hwi": {
          "hw": "ground",
          "prs": [
            {
              "ipa": "ˈgraʊnd",
              "sound": {
                "audio": "ground01"
              }
            }
          ]
        },
        "fl": "noun",
        "ins": [
          {
            "il": "plural",
            "if": "grounds"
          }
        ],
        "def": [
          {
            "sseq": [
              [
                [
                  "sense",
                  {
                    "sn": "1",
                    "bnote": "the ground",
                    "dt": [
                      [
                        "text",
                        "{bc}the surface of the earth "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "An apple fell to {it}the ground{/it}."
                          },
                          {
                            "t": "Mechanical problems kept the plane on {it}the ground{/it}."
                          },
                          {
                            "t": "They were lying/sitting on {it}the ground{/it}."
                          },
                          {
                            "t": "close to {it}the ground{/it} = low to {it}the ground{/it}"
                          },
                          {
                            "t": "The flight was watched by many observers on {it}the ground{/it}."
                          },
                          {
                            "t": "They sent in {phrase}ground forces/troops{/phrase}. [=soldiers who fight on the ground instead of in the air or at sea]"
                          },
                          {
                            "t": "a {phrase}ground war{/phrase} [=a war fought by soldiers on the ground]"
                          },
                          {
                            "t": "{phrase}ground transportation{/phrase} [=transportation that is over the ground instead of on water or in the air]"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "2",
                    "sgram": "noncount",
                    "dt": [
                      [
                        "text",
                        "{bc}the soil that is on or under the surface of the earth "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "planting seeds in the {it}ground{/it}"
                          },
                          {
                            "t": "She drove a spike into the {it}ground{/it}."
                          },
                          {
                            "t": "damp/frozen {it}ground{/it}"
                          },
                          {
                            "t": "solid/firm/dry {it}ground{/it}"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "3 a",
                    "sgram": "noncount",
                    "dt": [
                      [
                        "text",
                        "{bc}an area of land "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "They built their house on bare/level/flat {it}ground{/it}."
                          },
                          {
                            "t": "We realized that we were on hallowed/sacred {it}ground{/it}."
                          },
                          {
                            "t": "They built their house on high {it}ground{/it}."
                          }
                        ]
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "b",
                    "sgram": "count",
                    "dt": [
                      [
                        "text",
                        "{bc}an area of land or sea that is used for a particular purpose "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "a camping {it}ground{/it}"
                          },
                          {
                            "t": "fishing/hunting {it}grounds{/it}"
                          },
                          {
                            "t": "Each fall the birds return to their wintering {it}grounds{/it}."
                          },
                          {
                            "t": "({it}Brit{/it}) a football {it}ground{/it} [=({it}US{/it}) a soccer field]"
                          },
                          {
                            "t": "an ancient {phrase}burial ground{/phrase} [=a place where people were buried in ancient times]"
                          }
                        ]
                      ],
                      [
                        "text",
                        "{dx}see also {dxt|spawning ground||}{/dx}"
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "c",
                    "bnote": "grounds",
                    "sgram": "plural",
                    "dt": [
                      [
                        "text",
                        "{bc}the land around a building "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "the capitol {it}grounds{/it}"
                          },
                          {
                            "t": "He was trespassing on school {it}grounds{/it}."
                          },
                          {
                            "t": "We toured the {it}grounds{/it} of the estate."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "4",
                    "sgram": "noncount",
                    "dt": [
                      [
                        "text",
                        "{bc}the bottom of the ocean, a lake, etc. "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "The boat struck {it}ground{/it}."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "5",
                    "sgram": "noncount",
                    "dt": [
                      [
                        "text",
                        "{bc}an area of knowledge or interest "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "We have a lot of {it}ground{/it} to go over before the test."
                          },
                          {
                            "t": "We covered much more {it}ground{/it} [=we went over more information] than we expected to at the meeting."
                          },
                          {
                            "t": "The book covers {phrase}familiar ground{/phrase}. [=subjects that have often been discussed before]"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "6",
                    "sgram": "singular",
                    "dt": [
                      [
                        "text",
                        "{bc}a place or situation in which someone or something is developed or tested "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "The laboratory has become a {phrase}testing ground{/phrase} for ideas about the origins of the universe."
                          },
                          {
                            "t": "The tournament has come to be regarded as a {phrase}proving ground{/phrase} for young players."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "7",
                    "dt": [
                      [
                        "text",
                        "{bc}a set of beliefs, opinions, or attitudes "
                      ],
                      [
                        "wsgram",
                        "noncount"
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "The two sides are trying to find some {phrase}common ground{/phrase} [=an area in which they can agree with each other] on these issues."
                          },
                          {
                            "t": "When a politician talks about raising taxes, he's {phrase}on dangerous ground{/phrase}. [=he is doing or saying something that may cause anger or criticism]"
                          }
                        ]
                      ],
                      [
                        "wsgram",
                        "singular"
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "The two sides continue to look for a {phrase}middle ground{/phrase} [=a middle position] between two extremes."
                          }
                        ]
                      ],
                      [
                        "text",
                        "{dx}see also {dxt|high ground||}{/dx}"
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "8",
                    "sgram": "count",
                    "dt": [
                      [
                        "text",
                        "{bc}a reason for doing or thinking something"
                      ],
                      [
                        "uns",
                        [
                          [
                            [
                              "text",
                              "usually plural "
                            ],
                            [
                              "vis",
                              [
                                {
                                  "t": "The company has been accused of discriminating on the {it}grounds{/it} of race."
                                },
                                {
                                  "t": "We have no {it}grounds{/it} for believing that the crisis will end soon."
                                },
                                {
                                  "t": "Her husband's infidelity was {it}grounds{/it} for divorce."
                                },
                                {
                                  "t": "Many critics have objected to the proposal {phrase}on the grounds that{/phrase} [=because] it would be too costly."
                                },
                                {
                                  "t": "The law was rejected {it}on the grounds that{/it} it was not constitutional. = The law was rejected on constitutional {it}grounds{/it}."
                                }
                              ]
                            ]
                          ]
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "9",
                    "bnote": "grounds",
                    "sgram": "plural",
                    "dt": [
                      [
                        "text",
                        "{bc}very small pieces of crushed coffee beans "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "coffee {it}grounds{/it}"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "10",
                    "sgram": "count",
                    "sls": [
                      "US"
                    ],
                    "dt": [
                      [
                        "text",
                        "{bc}a wire or metal object that makes an electrical connection with the earth"
                      ],
                      [
                        "uns",
                        [
                          [
                            [
                              "text",
                              "usually singular "
                            ],
                            [
                              "vis",
                              [
                                {
                                  "t": "This metal bracket provides the {it}ground{/it}."
                                }
                              ]
                            ]
                          ]
                        ]
                      ],
                      [
                        "ca",
                        {
                          "intro": "called also ({it}British{/it})",
                          "cats": [
                            {
                              "cat": "earth"
                            }
                          ]
                        }
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "11",
                    "sgram": "count",
                    "dt": [
                      [
                        "text",
                        "{bc}the area behind or around a design "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "The wallpaper has red tulips on a white {it}ground{/it}. [={it}background{/it}]"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ]
            ]
          }
        ],
        "dros": [
          {
            "drp": "above ground",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{bc}on top of the earth's surface "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The bird's nest is located high {it}above ground{/it}."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "below ground",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{bc}under the earth's surface "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The seeds should be planted a few inches {it}below ground{/it}."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "break ground",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sn": "1",
                        "dt": [
                          [
                            "text",
                            "{bc}to dig into the ground at the start of building something "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "Workers {it}broke ground{/it} on the new stadium last week."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "2",
                        "vrs": [
                          {
                            "vl": "or",
                            "va": "break new ground"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to make new discoveries "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "Critics say that the study does not {it}break{/it} (any) {it}new ground{/it} in the search for a cure for cancer."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "burn to the ground",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|burn:1||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "down to the ground",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sls": [
                          "British",
                          "informal"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}completely or perfectly "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The job {phrase}suits her down to the ground{/phrase}. [=suits her perfectly]"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "from the ground up",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sn": "1",
                        "dt": [
                          [
                            "text",
                            "{bc}completely or thoroughly "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The car has been redesigned {it}from the ground up{/it}."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "2",
                        "dt": [
                          [
                            "text",
                            "{bc}from a point at which nothing has been done {bc}from the very beginning "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "They built the resort {it}from the ground up{/it}."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "gain ground",
            "vrs": [
              {
                "vl": "or",
                "va": "make up ground"
              }
            ],
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{bc}to move faster so that you come closer to someone or something that is in front of you "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "She was trailing in the race, but she was beginning to {it}gain ground{/it} (on the leaders)."
                              }
                            ]
                          ],
                          [
                            "uns",
                            [
                              [
                                [
                                  "text",
                                  "often used figuratively "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "Alternative forms of energy are quickly {it}gaining ground{/it}. [=becoming more popular or successful]"
                                    },
                                    {
                                      "t": "The company has been {it}gaining ground on{/it} [={it}catching up with{/it}] its competitors."
                                    },
                                    {
                                      "t": "The campaign is trying to {it}make up ground{/it} by advertising heavily in key states."
                                    }
                                  ]
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get off the ground",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sn": "1",
                        "dt": [
                          [
                            "text",
                            "{bc}to begin to operate or proceed in a successful way "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "{it}The project{/it} never really {it}got off the ground{/it}."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "2",
                        "phrasev": [
                          {
                            "pva": "get (something) off the ground"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to cause (something) to begin to operate or proceed in successful way "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "We're still trying to {it}get{/it} this project {it}off the ground{/it}."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "give ground",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{bc}to move backward when you are being attacked {bc}{sx|retreat||} "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The troops were forced to {it}give ground{/it}."
                              }
                            ]
                          ],
                          [
                            "uns",
                            [
                              [
                                [
                                  "text",
                                  "often used figuratively "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "The controversy has continued, and both sides are still refusing to {it}give ground{/it}."
                                    }
                                  ]
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "have/keep your feet on the ground",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|foot:1||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "hit the ground running",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|hit:1||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "hold/stand your ground",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{bc}to not change your position when you are being attacked {bc}to not retreat "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The troops managed to {it}hold their ground{/it} despite a fierce enemy attack."
                              }
                            ]
                          ],
                          [
                            "uns",
                            [
                              [
                                [
                                  "text",
                                  "often used figuratively "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "The company has managed to {it}hold its ground{/it} in the marketplace."
                                    },
                                    {
                                      "t": "The president has continued to {it}stand his ground{/it} despite criticism."
                                    }
                                  ]
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "into the ground",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sn": "1",
                        "dt": [
                          [
                            "text",
                            "{bc}to the point of being very tired or exhausted "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "She's been working/running/driving herself {it}into the ground{/it}."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "2",
                        "dt": [
                          [
                            "text",
                            "{bc}to the point of complete failure or ruin "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He ran that company {it}into the ground{/it}. [=he destroyed that company]"
                              },
                              {
                                "t": "She drove that old car {it}into the ground{/it}. [=she drove it until it would not run anymore]"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "lose ground",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{bc}to move slower so that you are farther away from someone or something that is in front of you "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "She was beginning to {it}lose ground{/it} (to the leaders) in the race."
                              }
                            ]
                          ],
                          [
                            "uns",
                            [
                              [
                                [
                                  "text",
                                  "often used figuratively "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "The political party {it}lost ground{/it} [=became less popular or successful; did not do well] in the election."
                                    },
                                    {
                                      "t": "The company is {it}losing ground to{/it} [=falling behind; not doing as well as] its competitors."
                                    }
                                  ]
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          }
        ],
        "shortdef": [
          "the surface of the earth",
          "the soil that is on or under the surface of the earth",
          "an area of land"
        ]
      }
    ],
    [
      {
        "meta": {
          "id": "happy",
          "uuid": "cc6fd301-d1e6-4142-aef4-a56b5abf9354",
          "src": "learners",
          "section": "alpha",
          "target": {
            "tuuid": "bea1b580-e5aa-49c2-8823-40174d5fd750",
            "tsrc": "collegiate"
          },
          "highlight": "yes",
          "stems": [
            "happy",
            "happier",
            "happiest",
            "(as) happy as a clam",
            "as happy as a clam",
            "happy as a clam",
            "happy medium",
            "happy returns",
            "happy ending",
            "happy for"
          ],
          "app-shortdef": {
            "hw": "happy",
            "fl": "adjective",
            "def": [
              "{bc} feeling pleasure and enjoyment because of your life, situation, etc.",
              "{bc} showing or causing feelings of pleasure and enjoyment",
              "{bc} pleased or glad about a particular situation, event, etc."
            ]
          },
          "offensive": false
        },
        "hwi": {
          "hw": "hap*py",
          "prs": [
            {
              "ipa": "ˈhæpi",
              "sound": {
                "audio": "happy001"
              }
            }
          ]
        },
        "fl": "adjective",
        "ins": [
          {
            "if": "hap*pi*er"
          },
          {
            "ifc": "-est",
            "if": "hap*pi*est"
          }
        ],
        "def": [
          {
            "sseq": [
              [
                [
                  "sense",
                  {
                    "sn": "1 a",
                    "dt": [
                      [
                        "text",
                        "{bc}feeling pleasure and enjoyment because of your life, situation, etc. "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "She was a very {it}happy{/it} child."
                          },
                          {
                            "t": "I can see that you're not {it}happy{/it} in your work. [=I can see that you do not enjoy your work]"
                          },
                          {
                            "t": "You don't look {it}happy{/it}. What's the problem?"
                          },
                          {
                            "t": "We're all one big, {it}happy{/it} family here."
                          },
                          {
                            "t": "I'd do anything to make/keep her {it}happy{/it}."
                          },
                          {
                            "t": "She's {it}happy{/it} playing with her toys. = She's {it}happy{/it} when she plays with her toys."
                          }
                        ]
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "b",
                    "dt": [
                      [
                        "text",
                        "{bc}showing or causing feelings of pleasure and enjoyment "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "I could hear the children's {it}happy{/it} laughter in the other room."
                          },
                          {
                            "t": "She had a very {it}happy{/it} childhood."
                          },
                          {
                            "t": "They've had a very {it}happy{/it} marriage."
                          },
                          {
                            "t": "remembering {it}happier{/it} times"
                          },
                          {
                            "t": "a {it}happy{/it} event/occasion"
                          },
                          {
                            "t": "I was glad the movie had a {phrase}happy ending{/phrase}."
                          }
                        ]
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "c",
                    "lbs": [
                      "not used before a noun"
                    ],
                    "dt": [
                      [
                        "text",
                        "{bc}pleased or glad about a particular situation, event, etc. "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "We are so {it}happy{/it} that you were able to come to the party."
                          },
                          {
                            "t": "They are not at all {it}happy{/it} about the rise in taxes."
                          },
                          {
                            "t": "He's not {it}happy{/it} with the way the project is going."
                          },
                          {
                            "t": "It's great that he won the scholarship. I'm very {phrase}happy for{/phrase} him. [=I am glad something good happened to him]"
                          }
                        ]
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "d",
                    "dt": [
                      [
                        "text",
                        "{bc}very willing to do something"
                      ],
                      [
                        "uns",
                        [
                          [
                            [
                              "text",
                              "usually followed by {it}to + verb{/it} "
                            ],
                            [
                              "vis",
                              [
                                {
                                  "t": "I would be {it}happy to assist{/it} you."
                                }
                              ]
                            ]
                          ]
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "2",
                    "dt": [
                      [
                        "uns",
                        [
                          [
                            [
                              "text",
                              "used as part of a greeting or wish for someone on a special holiday or occasion "
                            ],
                            [
                              "vis",
                              [
                                {
                                  "t": "{it}Happy{/it} birthday, Mom!"
                                },
                                {
                                  "t": "{it}Happy{/it} Holidays!"
                                }
                              ]
                            ]
                          ]
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "3",
                    "lbs": [
                      "always used before a noun"
                    ],
                    "dt": [
                      [
                        "text",
                        "{bc}lucky or fortunate "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "We were brought together by a series of {it}happy{/it} accidents."
                          },
                          {
                            "t": "a {it}happy{/it} coincidence"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "4",
                    "lbs": [
                      "always used before a noun"
                    ],
                    "dt": [
                      [
                        "text",
                        "{bc}fitting or suitable "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "a {it}happy{/it} choice of words"
                          },
                          {
                            "t": "He was a {it}happy{/it} choice for chairman of the committee."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ]
            ]
          }
        ],
        "dros": [
          {
            "drp": "(as) happy as a clam",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|clam:1||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "happy medium",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|medium:1||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "happy returns",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|return:2||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          }
        ],
        "dxnls": [
          "see also {dxt|trigger-happy||}"
        ],
        "shortdef": [
          "feeling pleasure and enjoyment because of your life, situation, etc.",
          "showing or causing feelings of pleasure and enjoyment",
          "pleased or glad about a particular situation, event, etc."
        ]
      },
      {
        "meta": {
          "id": "back:1",
          "uuid": "5ad30ae4-800b-4a24-8730-5e2056326255",
          "src": "learners",
          "section": "alpha",
          "target": {
            "tuuid": "fb0a9f98-eac6-4e03-9848-9422d78f3149",
            "tsrc": "collegiate"
          },
          "highlight": "yes",
          "stems": [
            "back",
            "back of one's hand",
            "back of her hand",
            "back of his hand",
            "back of their hand",
            "back of one's mind",
            "back of her mind",
            "back of his mind",
            "back of their mind",
            "back of the hand",
            "backed",
            "backless",
            "backs",
            "behind one's back",
            "behind her back",
            "behind his back",
            "behind their back",
            "in back of",
            "a pat on the back",
            "a stab in the back",
            "at/in the back of your mind",
            "at the back of your mind",
            "in the back of your mind",
            "back is to/against the wall",
            "back is against the wall",
            "back is to the wall",
            "back to back",
            "back to front",
            "behind someone's back",
            "behind someones back",
            "break the back of",
            "eyes in the back of your head",
            "get your back up",
            "have someone's back",
            "have someones back",
            "in back",
            "on the back of",
            "on/off your back",
            "off your back",
            "on your back",
            "out back",
            "out the back",
            "round the back",
            "put someone's back up",
            "put someones back up",
            "put your back into",
            "scratch someone's back",
            "scratch someones back",
            "see the back of",
            "stab (someone) in the back",
            "stab in the back",
            "stab someone in the back",
            "the shirt off your back",
            "turn your back",
            "watch someone's back",
            "watch someones back",
            "watch your back",
            "went behind his back",
            "get off your back",
            "glad/happy (etc.) to see the back of",
            "glad etc. to see the back of",
            "glad to see the back of",
            "happy etc. to see the back of",
            "happy to see the back of",
            "i've got your back",
            "ive got your back"
          ],
          "app-shortdef": {
            "hw": "back:1",
            "fl": "noun",
            "def": [
              "{bc} the rear part of the body {bc} the part of the body that is opposite to the stomach and chest and that goes from the neck to the top of the legs",
              "{bc} the part of an animal that is like a person's back",
              "{bc} the side or surface of something that is opposite the front or face {bc} the rear side or surface of something"
            ]
          },
          "offensive": false
        },
        "hom": 1,
        "hwi": {
          "hw": "back",
          "prs": [
            {
              "ipa": "ˈbæk",
              "sound": {
                "audio": "back0001"
              }
            }
          ]
        },
        "fl": "noun",
        "ins": [
          {
            "il": "plural",
            "if": "backs"
          }
        ],
        "gram": "count",
        "def": [
          {
            "sseq": [
              [
                [
                  "sense",
                  {
                    "sn": "1 a",
                    "dt": [
                      [
                        "text",
                        "{bc}the rear part of the body {bc}the part of the body that is opposite to the stomach and chest and that goes from the neck to the top of the legs "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "She was carrying her little daughter on her {it}back{/it}."
                          },
                          {
                            "t": "He injured his {it}back{/it}. = He suffered a {it}back{/it} injury."
                          },
                          {
                            "t": "She has a pain in the small of her {it}back{/it}."
                          },
                          {
                            "t": "an aching {it}back{/it}"
                          },
                          {
                            "t": "I slapped/patted him on his/the {it}back{/it} to congratulate him."
                          },
                          {
                            "t": "He broke his {it}back{/it} [={it}spine{/it}] in a fall."
                          },
                          {
                            "t": "She stabbed/shot him in the {it}back{/it}."
                          },
                          {
                            "t": "He had his hands behind his {it}back{/it}."
                          }
                        ]
                      ],
                      [
                        "text",
                        "{dx}see picture at {dxt|human||}{/dx}"
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "b",
                    "dt": [
                      [
                        "text",
                        "{bc}the part of an animal that is like a person's back "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "a bird with a dark {it}back{/it}"
                          },
                          {
                            "t": "riding on the {it}back{/it} of a horse/donkey/camel"
                          }
                        ]
                      ],
                      [
                        "text",
                        "{dx}see also {dxt|horseback||}{/dx}"
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "2 a",
                    "dt": [
                      [
                        "text",
                        "{bc}the side or surface of something that is opposite the front or face {bc}the rear side or surface of something"
                      ],
                      [
                        "uns",
                        [
                          [
                            [
                              "text",
                              "usually singular "
                            ],
                            [
                              "vis",
                              [
                                {
                                  "t": "the {it}back{/it} of the head"
                                },
                                {
                                  "t": "the {it}back{/it} of a mirror/spoon"
                                },
                                {
                                  "t": "the {it}back{/it} of the hand/leg/foot"
                                },
                                {
                                  "t": "The book has fallen down the {it}back{/it} of the couch."
                                }
                              ]
                            ]
                          ]
                        ]
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "b",
                    "dt": [
                      [
                        "text",
                        "{bc}the side or surface of something (such as a piece of paper) that is not usually used or seen first"
                      ],
                      [
                        "uns",
                        [
                          [
                            [
                              "text",
                              "usually singular "
                            ],
                            [
                              "vis",
                              [
                                {
                                  "t": "She wrote something on the {it}back{/it} of an envelope."
                                },
                                {
                                  "t": "He signed his name on the {it}back{/it} of the check."
                                }
                              ]
                            ]
                          ]
                        ]
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "c",
                    "dt": [
                      [
                        "text",
                        "{bc}a place, position, or area that is at or near the rear of something"
                      ],
                      [
                        "uns",
                        [
                          [
                            [
                              "text",
                              "usually singular "
                            ],
                            [
                              "vis",
                              [
                                {
                                  "t": "He put the letter in the {it}back{/it} of the drawer."
                                },
                                {
                                  "t": "The kitchen is at/in the {it}back{/it} of the house and the living room is at/in the front."
                                },
                                {
                                  "t": "Since our plane was leaving soon we were moved to the front of the line while others remained at the {it}back{/it}."
                                },
                                {
                                  "t": "Please move to the {it}back{/it} of the elevator to make room for others."
                                }
                              ]
                            ]
                          ]
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "3",
                    "dt": [
                      [
                        "text",
                        "{bc}the part of a chair or seat that supports a person's back "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "a comfortable chair with a padded {it}back{/it}"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "4 a",
                    "dt": [
                      [
                        "text",
                        "{bc}the section of a book, magazine, etc., that includes the last pages"
                      ],
                      [
                        "uns",
                        [
                          [
                            [
                              "text",
                              "usually singular "
                            ],
                            [
                              "vis",
                              [
                                {
                                  "t": "There is an index in the {it}back{/it} of the book."
                                }
                              ]
                            ]
                          ]
                        ]
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "b",
                    "dt": [
                      [
                        "text",
                        "{bc}the part of a book's cover that can be seen when the book is on a shelf "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "The title of the book is shown on its {it}back{/it}. [={it}spine{/it}]"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "5",
                    "sls": [
                      "sports"
                    ],
                    "dt": [
                      [
                        "text",
                        "{bc}a player in some games (such as soccer and American football) who is positioned behind the front line of players "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "a defensive {it}back{/it}"
                          }
                        ]
                      ],
                      [
                        "text",
                        "{dx}see also {dxt|fullback||} {dxt|halfback||} {dxt|quarterback||} {dxt|running back||}{/dx}"
                      ]
                    ]
                  }
                ]
              ]
            ]
          }
        ],
        "uros": [
          {
            "ure": "back*less",
            "prs": [
              {
                "ipa": "ˈbækləs",
                "sound": {
                  "audio": "back0003"
                }
              }
            ],
            "fl": "adjective",
            "utxt": [
              [
                "vis",
                [
                  {
                    "t": "a {it}backless{/it} evening gown"
                  }
                ]
              ]
            ]
          }
        ],
        "dros": [
          {
            "drp": "a pat on the back",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|pat:1||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "a stab in the back",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|stab:1||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "at/in the back of your mind",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{bc}in the part of your mind where thoughts and memories are kept"
                          ],
                          [
                            "uns",
                            [
                              [
                                [
                                  "text",
                                  "used to describe ideas, memories, etc., that someone has but that are not usually thought about or not perfectly remembered "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "The thought of retiring and moving out into the country has been {it}in the back of her mind{/it} for many years."
                                    },
                                    {
                                      "t": "Somewhere {it}in the back of my mind{/it} I knew I'd met him before."
                                    }
                                  ]
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "back is to/against the wall",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "snote",
                            [
                              [
                                "t",
                                "When {it}your back is to/against the wall{/it} or {it}you have your back to/against the wall{/it} you are in a bad position in which you are forced to do something in order to avoid failure."
                              ],
                              [
                                "vis",
                                [
                                  {
                                    "t": "{it}With our backs to the wall{/it} we made a last desperate effort to finish on time."
                                  },
                                  {
                                    "t": "We knew that with so little time left {it}we had our backs to the wall{/it}."
                                  }
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "back to back",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sn": "1",
                        "dt": [
                          [
                            "text",
                            "{bc}with backs opposite or against each other "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The soldiers stood {it}back to back{/it}."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "2",
                        "dt": [
                          [
                            "text",
                            "{bc}happening one after the other "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "She won the annual competition two times {it}back to back{/it}. [={it}in a row{/it}]"
                              },
                              {
                                "t": "I've scheduled two appointments {it}back to back{/it}."
                              }
                            ]
                          ],
                          [
                            "text",
                            "{dx}see also {dxt|back-to-back||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "back to front",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sls": [
                          "of a piece of clothing"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}with the back where the front should be "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He accidentally put the sweater on {it}back to front{/it}. [={it}front to back, backwards{/it}]"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "behind someone's back",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{bc}without someone's knowledge {bc}in secret "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "You shouldn't gossip about people {it}behind their back(s){/it}."
                              },
                              {
                                "t": "If you have something to say, why not say it to my face instead of whispering it {it}behind my back{/it}?!"
                              },
                              {
                                "t": "She {phrase}went behind his back{/phrase} and spoke directly to his supervisor."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "break the back of",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{bc}to get control of (something you are trying to stop or defeat) {bc}to greatly weaken or subdue (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He says the government's new policies will {it}break the back of{/it} inflation."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "eyes in the back of your head",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|eye:1||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "get your back up",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{bc}to become angry or annoyed and want to fight or argue "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He {it}gets his back up{/it} and becomes defensive whenever someone questions his work."
                              }
                            ]
                          ],
                          [
                            "text",
                            "{dx}compare {dxt|put someone's back up||(below)}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "have someone's back",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|watch someone's back||(below)}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "in back",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{bc}in an area at the back of something "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "There was only room for one passenger in front. The rest of us sat {it}in back{/it}. [={it}in the back{/it}]"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "in back of",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sls": [
                          "chiefly US"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}directly behind (something or someone) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "There's a small yard {it}in back of{/it} the house."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "on the back of",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sn": "1",
                        "dt": [
                          [
                            "text",
                            "{bc}because of (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "Profits have increased {it}on the back of{/it} [={it}on the strength of{/it}] improved international sales."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "2",
                        "sls": [
                          "disapproving"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}by using the efforts of (other people) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The company has achieved record profits {it}on the back of{/it} cheap labor."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "on/off your back",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "snote",
                            [
                              [
                                "t",
                                "Someone who is always or frequently criticizing you or telling you what to do is {it}on your back{/it} and won't {phrase}get off your back{/phrase}."
                              ],
                              [
                                "vis",
                                [
                                  {
                                    "t": "He says his wife is always {it}on his back{/it} about doing chores around the house."
                                  },
                                  {
                                    "t": "{it}Get off my back{/it}! I'm working as hard as I can!"
                                  },
                                  {
                                    "t": "My boss is always criticizing me. I wish I knew some way to {it}get him off my back{/it}."
                                  }
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "on your back",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "snote",
                            [
                              [
                                "t",
                                "If you are {it}(flat) on your back{/it} you are lying with your back against the ground, on a bed, etc."
                              ],
                              [
                                "vis",
                                [
                                  {
                                    "t": "The accident left him (lying) {it}flat on his back{/it} (in bed) for two weeks."
                                  }
                                ]
                              ],
                              [
                                "t",
                                "This phrase is sometimes used figuratively."
                              ],
                              [
                                "vis",
                                [
                                  {
                                    "t": "The stock market has been {it}flat on its back{/it} [=has been doing very poorly] in recent weeks."
                                  }
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "out back",
            "rsl": "US",
            "vrs": [
              {
                "vl": "or chiefly British",
                "va": "out the back"
              },
              {
                "vl": "or",
                "va": "round the back"
              }
            ],
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{bc}in the area behind something (such as a building) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "In my youth we didn't have a toilet in the house but there was one {it}out back{/it}."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "put someone's back up",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{bc}to offend or annoy someone {bc}to make someone angry or ready to argue "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "I don't want to question his decision because that will just {it}put his back up{/it}."
                              }
                            ]
                          ],
                          [
                            "text",
                            "{dx}compare {dxt|get your back up||(above)}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "put your back into",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{bc}to work very hard at (something) {bc}to put a lot of effort into (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "To clean that floor you'll have to {it}put your back into{/it} it."
                              },
                              {
                                "t": "You'll really have to {it}put your back into{/it} this project if you want it to succeed."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "scratch someone's back",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|scratch:1||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "see the back of",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "snote",
                            [
                              [
                                "t",
                                "In British English, to be {phrase}glad/happy (etc.) to see the back of{/phrase} someone is to be glad to see someone finally going away."
                              ],
                              [
                                "vis",
                                [
                                  {
                                    "t": "He's done nothing but make trouble and I'll be {it}glad to see the back of{/it} him! [=I'll be glad when he has gone]"
                                  }
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "stab (someone) in the back",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|stab:2||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "the shirt off your back",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|shirt||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "turn your back",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{bc}to turn so that you are facing away from someone "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He {it}turned his back{/it} and walked away from me."
                              }
                            ]
                          ],
                          [
                            "uns",
                            [
                              [
                                [
                                  "text",
                                  "often + {it}on{/it} "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "He {it}turned his back on{/it} me and walked away."
                                    }
                                  ]
                                ]
                              ],
                              [
                                [
                                  "text",
                                  "often used figuratively "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "His former supporters have {it}turned their backs on{/it} him. [=have abandoned him]"
                                    }
                                  ]
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "watch someone's back",
            "vrs": [
              {
                "vl": "or",
                "va": "have someone's back"
              }
            ],
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{bc}to protect someone who is doing something that is dangerous or risky "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The police officer's partner always {it}watches his back{/it}."
                              },
                              {
                                "t": "Don't worry, {phrase}I've got your back{/phrase}."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "watch your back",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "snote",
                            [
                              [
                                "t",
                                "If people tell you to {it}watch your back{/it}, they are telling you to be careful."
                              ],
                              [
                                "vis",
                                [
                                  {
                                    "t": "I hear the boss is in a bad mood this morning, so you'd better {it}watch your back{/it}."
                                  }
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          }
        ],
        "shortdef": [
          "the rear part of the body : the part of the body that is opposite to the stomach and chest and that goes from the neck to the top of the legs",
          "the part of an animal that is like a person's back",
          "the side or surface of something that is opposite the front or face : the rear side or surface of something—usually singular"
        ]
      },
      {
        "meta": {
          "id": "clam:1",
          "uuid": "4de18f59-790d-4e4e-ac03-be7f1c36f431",
          "src": "learners",
          "section": "alpha",
          "stems": [
            "clam",
            "clams",
            "(as) happy as a clam",
            "as happy as a clam",
            "happy as a clam"
          ],
          "app-shortdef": {
            "hw": "clam:1",
            "fl": "noun",
            "def": [
              "{bc} a type of shellfish that lives in sand or mud, has a light-colored shell with two parts, and is eaten both cooked and raw",
              "{b}{it}clams{/it}{/b} {it}US slang{/it}, {it}somewhat old-fashioned{/it} {bc} dollars"
            ]
          },
          "offensive": false
        },
        "hom": 1,
        "hwi": {
          "hw": "clam",
          "prs": [
            {
              "ipa": "ˈklæm",
              "sound": {
                "audio": "clam0001"
              }
            }
          ]
        },
        "fl": "noun",
        "ins": [
          {
            "il": "plural",
            "if": "clams"
          }
        ],
        "def": [
          {
            "sseq": [
              [
                [
                  "sense",
                  {
                    "sn": "1",
                    "sgram": "count",
                    "dt": [
                      [
                        "text",
                        "{bc}a type of shellfish that lives in sand or mud, has a light-colored shell with two parts, and is eaten both cooked and raw "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "steamed {it}clams{/it}"
                          },
                          {
                            "t": "{it}clam{/it} chowder"
                          }
                        ]
                      ],
                      [
                        "text",
                        ""
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "2",
                    "bnote": "clams",
                    "sgram": "plural",
                    "sls": [
                      "US slang",
                      "somewhat old-fashioned"
                    ],
                    "dt": [
                      [
                        "text",
                        "{bc}dollars "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "He won 20 {it}clams{/it} [=(more commonly) {it}bucks{/it}] playing poker."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ]
            ]
          }
        ],
        "dros": [
          {
            "drp": "(as) happy as a clam",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sls": [
                          "US",
                          "informal"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}very happy "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "She spent the afternoon reading and was {it}as happy as a clam{/it}."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          }
        ],
        "shortdef": [
          "a type of shellfish that lives in sand or mud, has a light-colored shell with two parts, and is eaten both cooked and raw",
          "dollars"
        ]
      },
      {
        "meta": {
          "id": "happy camper",
          "uuid": "dec68cb4-d2f7-4b17-9d47-da14e127c4f5",
          "src": "learners",
          "section": "alpha",
          "target": {
            "tuuid": "1b4ede1e-b974-4328-8e36-80d9e12bb44c",
            "tsrc": "collegiate"
          },
          "stems": [
            "happy camper",
            "happy campers"
          ],
          "app-shortdef": {
            "hw": "happy camper",
            "fl": "noun",
            "def": [
              "{it}chiefly US{/it}, {it}informal{/it} {bc} someone who is pleased or happy"
            ]
          },
          "offensive": false
        },
        "hwi": {
          "hw": "happy camper"
        },
        "fl": "noun",
        "ins": [
          {
            "il": "plural",
            "ifc": "~ -ers",
            "if": "happy campers"
          }
        ],
        "gram": "count",
        "def": [
          {
            "sseq": [
              [
                [
                  "sense",
                  {
                    "sls": [
                      "chiefly US",
                      "informal"
                    ],
                    "dt": [
                      [
                        "text",
                        "{bc}someone who is pleased or happy "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "I was one {it}happy camper{/it} when I heard the news."
                          }
                        ]
                      ],
                      [
                        "uns",
                        [
                          [
                            [
                              "text",
                              "often used in negative statements "
                            ],
                            [
                              "vis",
                              [
                                {
                                  "t": "When she found out that the report wasn't ready, she was not a {it}happy camper{/it}. [=she was angry or upset]"
                                }
                              ]
                            ]
                          ]
                        ]
                      ]
                    ]
                  }
                ]
              ]
            ]
          }
        ],
        "shortdef": [
          "someone who is pleased or happy —often used in negative statements"
        ]
      },
      {
        "meta": {
          "id": "happy-go-lucky",
          "uuid": "22060cbe-2cf6-4450-9c1a-abaa3fe238f7",
          "src": "learners",
          "section": "alpha",
          "target": {
            "tuuid": "26352061-8c60-4d34-a877-81baf5236ec4",
            "tsrc": "collegiate"
          },
          "stems": [
            "happy-go-lucky"
          ],
          "app-shortdef": {
            "hw": "happy-go-lucky",
            "fl": "adjective",
            "def": [
              "{bc} not worried about anything"
            ]
          },
          "offensive": false
        },
        "hwi": {
          "hw": "hap*py-go-lucky",
          "prs": [
            {
              "ipa": "ˌhæpigoʊˈlʌki",
              "sound": {
                "audio": "happyg01"
              }
            }
          ]
        },
        "fl": "adjective",
        "gram": "more ~; most ~",
        "def": [
          {
            "sseq": [
              [
                [
                  "sense",
                  {
                    "dt": [
                      [
                        "text",
                        "{bc}not worried about anything "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "He's always been a {it}happy-go-lucky{/it} guy."
                          },
                          {
                            "t": "She has a {it}happy-go-lucky{/it} disposition."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ]
            ]
          }
        ],
        "shortdef": [
          "not worried about anything"
        ]
      },
      {
        "meta": {
          "id": "happy hour",
          "uuid": "0caa70b1-348c-4073-99c9-83bb39f010c4",
          "src": "learners",
          "section": "alpha",
          "target": {
            "tuuid": "0553b2ad-da07-4d1c-84eb-43f1db36e008",
            "tsrc": "collegiate"
          },
          "stems": [
            "happy hour",
            "happy hours"
          ],
          "app-shortdef": {
            "hw": "happy hour",
            "fl": "noun",
            "def": [
              "{bc} a time at a bar when drinks are sold at a lower price than usual"
            ]
          },
          "offensive": false
        },
        "hwi": {
          "hw": "happy hour"
        },
        "fl": "noun",
        "ins": [
          {
            "il": "plural",
            "ifc": "~ hours",
            "if": "happy hours"
          }
        ],
        "gram": "count, noncount",
        "def": [
          {
            "sseq": [
              [
                [
                  "sense",
                  {
                    "dt": [
                      [
                        "text",
                        "{bc}a time at a bar when drinks are sold at a lower price than usual "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "{it}Happy hour{/it} runs from 5:00 to 7:00."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ]
            ]
          }
        ],
        "shortdef": [
          "a time at a bar when drinks are sold at a lower price than usual"
        ]
      },
      {
        "meta": {
          "id": "medium:1",
          "uuid": "164f05f6-970f-4b10-b59d-9de22442406a",
          "src": "learners",
          "section": "alpha",
          "target": {
            "tuuid": "c295fa45-8515-47c4-840e-7ebbdaf1088b",
            "tsrc": "collegiate"
          },
          "highlight": "yes",
          "stems": [
            "medium",
            "mediums",
            "media",
            "happy medium"
          ],
          "app-shortdef": {
            "hw": "medium:1",
            "fl": "noun",
            "def": [
              "{bc} something that is sold in a medium size {bc} something that is the middle size when compared with things that are larger and smaller",
              "{bc} a particular form or system of communication (such as newspapers, radio, or television)",
              "{bc} the materials or methods used by an artist"
            ]
          },
          "offensive": false
        },
        "hom": 1,
        "hwi": {
          "hw": "me*di*um",
          "prs": [
            {
              "ipa": "ˈmiːdijəm",
              "sound": {
                "audio": "medium01"
              }
            }
          ]
        },
        "fl": "noun",
        "ins": [
          {
            "il": "plural",
            "if": "me*di*ums"
          },
          {
            "il": "or",
            "if": "me*dia",
            "prs": [
              {
                "ipa": "ˈmiːdijə",
                "sound": {
                  "audio": "medium02"
                }
              }
            ]
          }
        ],
        "gram": "count",
        "def": [
          {
            "sseq": [
              [
                [
                  "sense",
                  {
                    "sn": "1",
                    "ins": [
                      {
                        "il": "plural",
                        "if": "mediums"
                      }
                    ],
                    "dt": [
                      [
                        "text",
                        "{bc}something that is sold in a medium size {bc}something that is the middle size when compared with things that are larger and smaller "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "I take a {it}medium{/it}."
                          },
                          {
                            "t": "These shirts are all {it}mediums{/it} and I take a large."
                          },
                          {
                            "t": "Make my French fries a {it}medium{/it}."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "2",
                    "ins": [
                      {
                        "il": "plural usually",
                        "if": "media"
                      }
                    ],
                    "dt": [
                      [
                        "text",
                        "{bc}a particular form or system of communication (such as newspapers, radio, or television) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "an effective advertising {it}medium{/it} = an effective {it}medium{/it} for advertising"
                          }
                        ]
                      ],
                      [
                        "text",
                        "{dx}see also {dxt|media||}{/dx}"
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "3",
                    "dt": [
                      [
                        "text",
                        "{bc}the materials or methods used by an artist "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "Her preferred {it}medium{/it} is sculpture."
                          },
                          {
                            "t": "The artist works in two {it}media/mediums{/it}, pencil and watercolor."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "4",
                    "dt": [
                      [
                        "text",
                        "{bc}the thing by which or through which something is done "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "Money is a {it}medium{/it} [={it}means{/it}] of exchange."
                          },
                          {
                            "t": "English is an important {it}medium{/it} of international communication."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "5",
                    "ins": [
                      {
                        "il": "plural",
                        "if": "mediums"
                      }
                    ],
                    "dt": [
                      [
                        "text",
                        "{bc}a person who claims to be able to communicate with the spirits of dead people "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "She visited a {it}medium{/it} to try to talk to her dead son."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "6",
                    "sls": [
                      "formal"
                    ],
                    "dt": [
                      [
                        "text",
                        "{bc}a surrounding condition or environment "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "Ocean fish live in a {it}medium{/it} of salt water."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ]
            ]
          }
        ],
        "dros": [
          {
            "drp": "happy medium",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{bc}a good choice or condition that avoids any extremes "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "They are looking for a {it}happy medium{/it}: a house that is not too big but that has lots of storage space."
                              },
                              {
                                "t": "The car's designers have found/struck a {it}happy medium{/it} between affordability and luxury."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          }
        ],
        "shortdef": [
          "something that is sold in a medium size : something that is the middle size when compared with things that are larger and smaller",
          "a particular form or system of communication (such as newspapers, radio, or television)",
          "the materials or methods used by an artist"
        ]
      },
      {
        "meta": {
          "id": "put:1",
          "uuid": "f14ffa7c-9ca6-4988-b2b0-6204ce542043",
          "src": "learners",
          "section": "alpha",
          "target": {
            "tuuid": "aed5cc51-547f-4687-b86a-93024616683f",
            "tsrc": "collegiate"
          },
          "highlight": "yes",
          "stems": [
            "put",
            "put forth",
            "put forward",
            "put in mind",
            "put one's finger on",
            "put her finger on",
            "put his finger on",
            "put their finger on",
            "put one's foot down",
            "put her foot down",
            "put his foot down",
            "put their foot down",
            "put one's foot in one's mouth",
            "put her foot in her mouth",
            "put his foot in his mouth",
            "put their foot in their mouth",
            "put paid to",
            "put the arm on",
            "put the bite on",
            "put the finger on",
            "put the make on",
            "put to bed",
            "put to it",
            "put together",
            "puts",
            "puts together",
            "putting",
            "putting together",
            "i wouldn't put it past (someone)",
            "i wouldn't put it past",
            "i wouldn't put it past someone",
            "i wouldnt put it past (someone)",
            "i wouldnt put it past",
            "i wouldnt put it past someone",
            "put about",
            "put across",
            "put a foot wrong",
            "put aside",
            "put at",
            "put away",
            "put back",
            "put before",
            "put behind",
            "put by",
            "put down",
            "put in",
            "put into",
            "put it there",
            "put her there",
            "put off",
            "put on",
            "put out",
            "put over",
            "put (someone) in mind of",
            "put in mind of",
            "put someone in mind of",
            "put through",
            "put to death",
            "put up",
            "put pen to paper",
            "put us at ease",
            "out of your mind",
            "out of its misery",
            "out of business",
            "put him out of a job",
            "put him out of work",
            "to bed",
            "put to use",
            "put it to good use",
            "to put it bluntly",
            "to put it mildly",
            "put her feelings into words",
            "put it away",
            "puts himself down",
            "put down the phone",
            "put the phone down on him",
            "putting in a good word for",
            "put in your two cents",
            "put in a call to",
            "put in an appearance",
            "put her heart into",
            "put me off him",
            "put on a happy/brave face",
            "put on a brave face",
            "put on a happy face",
            "put the word out",
            "put through its paces"
          ],
          "app-shortdef": {
            "hw": "put:1",
            "fl": "verb",
            "def": [
              "{bc} to cause (someone or something) to be in a particular place or position",
              "{bc} to cause (something) to go into or through something in a forceful way",
              "{bc} to cause (someone) to be in a particular place or send (someone) to a particular place"
            ]
          },
          "offensive": false
        },
        "hom": 1,
        "hwi": {
          "hw": "put",
          "prs": [
            {
              "ipa": "ˈpʊt",
              "sound": {
                "audio": "put00001"
              }
            }
          ]
        },
        "fl": "verb",
        "ins": [
          {
            "if": "puts"
          },
          {
            "if": "put"
          },
          {
            "if": "put*ting"
          }
        ],
        "gram": "+ obj",
        "def": [
          {
            "sseq": [
              [
                [
                  "sen",
                  {
                    "sn": "1",
                    "lbs": [
                      "always followed by an adverb or preposition"
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "a",
                    "dt": [
                      [
                        "text",
                        "{bc}to cause (someone or something) to be in a particular place or position "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "She {it}put{/it} [={it}placed, set{/it}] the plant near the window."
                          },
                          {
                            "t": "{it}Put{/it} the car in the garage."
                          },
                          {
                            "t": "I {it}put{/it} the keys on the table."
                          },
                          {
                            "t": "He {it}put{/it} his arms around her and held her tight."
                          }
                        ]
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "b",
                    "dt": [
                      [
                        "text",
                        "{bc}to cause (something) to go into or through something in a forceful way "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "He fell and accidentally {it}put{/it} his hand through a window."
                          }
                        ]
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "c",
                    "dt": [
                      [
                        "text",
                        "{bc}to cause (someone) to be in a particular place or send (someone) to a particular place "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "The illness {it}put{/it} her in the hospital for three days."
                          },
                          {
                            "t": "They {it}put{/it} her in prison for forgery."
                          },
                          {
                            "t": "Her parents decided to {it}put{/it} her in a special school for deaf children."
                          },
                          {
                            "t": "If she drove 55 mph for 20 minutes, that would {it}put{/it} her about halfway there by now."
                          }
                        ]
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "d",
                    "dt": [
                      [
                        "text",
                        "{bc}to show that (someone or something) is in a particular place "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "The evidence/report {it}puts{/it} the defendant at the scene of the crime. [=it shows that the defendant was at the scene of the crime]"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "2",
                    "dt": [
                      [
                        "text",
                        "{bc}to write (something) with a pen or pencil in or on something "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "Don't forget to {it}put{/it} your signature on the check."
                          },
                          {
                            "t": "He {it}put{/it} his phone number on a napkin."
                          },
                          {
                            "t": "{it}Put{/it} a circle around the correct answer."
                          },
                          {
                            "t": "I wrote that the answer was option B. What did you {it}put{/it}?"
                          },
                          {
                            "t": "She had always dreamed of writing a novel, but she never actually {phrase}put pen to paper{/phrase}. [=started writing]"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "3",
                    "lbs": [
                      "always followed by an adverb or preposition"
                    ],
                    "dt": [
                      [
                        "text",
                        "{bc}to cause (someone or something) to be in a particular state or condition "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "Not exercising {it}puts{/it} you at greater risk of developing heart disease."
                          },
                          {
                            "t": "{it}Put{/it} the TV on channel 5, please."
                          },
                          {
                            "t": "Who {it}put{/it} you in charge/command/control?"
                          },
                          {
                            "t": "I told her some jokes to {it}put{/it} her in/into a good mood."
                          },
                          {
                            "t": "His careless spending {it}put{/it} him in/into debt."
                          },
                          {
                            "t": "Their actions have {it}put{/it} them in serious danger."
                          },
                          {
                            "t": "Her reassuring words {phrase}put us at ease{/phrase}. [=made us feel calm and relaxed]"
                          },
                          {
                            "t": "{phrase}Put{/phrase} that idea {phrase}out of your mind{/phrase}. [=stop thinking about that idea]"
                          },
                          {
                            "t": "They said they shot the injured horse to {phrase}put{/phrase} it {phrase}out of its misery{/phrase}. [=so that it would not continue to suffer]"
                          },
                          {
                            "t": "They have {phrase}put{/phrase} their competitors {phrase}out of business{/phrase}."
                          },
                          {
                            "t": "The new technology could {phrase}put him out of a job{/phrase}. = It could {phrase}put him out of work{/phrase}. [=it could make him lose his job]"
                          },
                          {
                            "t": "He's {phrase}putting{/phrase} the children {phrase}to bed{/phrase}. [=helping them get into their beds]"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sen",
                  {
                    "sn": "4",
                    "lbs": [
                      "always followed by an adverb or preposition"
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "a",
                    "dt": [
                      [
                        "text",
                        "{bc}to cause (someone or something) to do work or perform a task"
                      ],
                      [
                        "uns",
                        [
                          [
                            [
                              "text",
                              "often + {it}to{/it} "
                            ],
                            [
                              "vis",
                              [
                                {
                                  "t": "She {it}put{/it} the kids {it}to{/it} work cleaning the basement."
                                }
                              ]
                            ]
                          ]
                        ]
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "b",
                    "dt": [
                      [
                        "text",
                        "{bc}to use (something) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "They are ready to {it}put{/it} the plan in action/motion."
                          },
                          {
                            "t": "{it}putting{/it} an idea into action/effect/practice"
                          },
                          {
                            "t": "The new weapon was immediately {phrase}put to use{/phrase} by the military."
                          },
                          {
                            "t": "I don't need this camera, but maybe you can {phrase}put it to good use{/phrase}."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "5",
                    "lbs": [
                      "always followed by an adverb or preposition"
                    ],
                    "dt": [
                      [
                        "text",
                        "{bc}to cause (something) to have an effect on someone or something"
                      ],
                      [
                        "uns",
                        [
                          [
                            [
                              "text",
                              "usually + {it}on{/it} "
                            ],
                            [
                              "vis",
                              [
                                {
                                  "t": "He {it}puts{/it} [={it}places{/it}] great emphasis {it}on{/it} the need for new leadership. [=he strongly emphasizes the need for new leadership]"
                                },
                                {
                                  "t": "She has been {it}putting{/it} pressure {it}on{/it} us to finish the project early."
                                },
                                {
                                  "t": "Another child would {it}put{/it} a heavy strain {it}on{/it} their finances. [=would strain their finances very much]"
                                },
                                {
                                  "t": "A special tax/duty/surcharge was {it}put on{/it} luxury items."
                                },
                                {
                                  "t": "They want to {it}put{/it} a limit {it}on{/it} government spending."
                                }
                              ]
                            ]
                          ]
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "6",
                    "dt": [
                      [
                        "text",
                        "{bc}to say or express (something) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "As she {it}put{/it} it, {ldquo}You can't please everyone.{rdquo}"
                          },
                          {
                            "t": "How should I {it}put{/it} this? I don't think you're cut out for this job."
                          },
                          {
                            "t": "Well {it}put{/it}!"
                          },
                          {
                            "t": "Let me {it}put{/it} it another way."
                          },
                          {
                            "t": "I think you're incompetent, {phrase}to put it bluntly{/phrase}."
                          },
                          {
                            "t": "It was a difficult experience, {phrase}to put it mildly{/phrase}. [=it was a very difficult experience]"
                          },
                          {
                            "t": "She finds it hard to {phrase}put her feelings into words{/phrase}. [=to say what her feelings are]"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sen",
                  {
                    "sn": "7",
                    "lbs": [
                      "always followed by an adverb or preposition"
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "a",
                    "dt": [
                      [
                        "text",
                        "{bc}to ask (a question) or make (a suggestion) to someone "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "Let me {it}put{/it} this question to you [=let me ask you this question]: what do we do now?"
                          },
                          {
                            "t": "I {it}put{/it} my plan/proposal before the board of directors for consideration."
                          }
                        ]
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "b",
                    "dt": [
                      [
                        "text",
                        "{bc}to ask a group of people to formally vote on (something) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "They plan on {it}putting{/it} the motion/resolution to a/the vote this afternoon."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "8",
                    "dt": [
                      [
                        "text",
                        "{bc}to add music to (words) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "She writes the lyrics and he {it}puts{/it} [={it}sets{/it}] them to music."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "9",
                    "sls": [
                      "sports"
                    ],
                    "dt": [
                      [
                        "text",
                        "{bc}to throw (a shot put)"
                      ]
                    ]
                  }
                ]
              ]
            ]
          }
        ],
        "dros": [
          {
            "drp": "I wouldn't put it past (someone)",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|past:2||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "put about",
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sn": "1",
                        "phrasev": [
                          {
                            "pva": "put (something) about"
                          },
                          {
                            "pvl": "or",
                            "pva": "put about (something)"
                          }
                        ],
                        "sls": [
                          "British"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to tell many people about (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "They {it}put about{/it} the news that he was resigning. = They {it}put{/it} it {it}about{/it} that he was resigning."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "2 a",
                        "sls": [
                          "of a boat or ship"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to change direction "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The ship {it}put about{/it} and sailed back out to sea."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "b",
                        "phrasev": [
                          {
                            "pva": "put (something) about"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to cause (a boat or ship) to change direction "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "a boat that can be {it}put about{/it} quickly"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "put across",
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sn": "1",
                        "phrasev": [
                          {
                            "pva": "put (something) across"
                          },
                          {
                            "pvl": "or",
                            "pva": "put across (something)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to cause (something) to be clearly understood {bc}to get (something) across "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "She has had trouble {it}putting{/it} her message {it}across{/it} to voters."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "2",
                        "phrasev": [
                          {
                            "pva": "put (yourself) across as (something)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to cause (yourself) to appear to be (a particular type of person) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He tries to {it}put himself across as{/it} [=to make other people believe that he is] a nice guy."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "put a foot wrong",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|foot:1||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "put aside",
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sphrasev": {
                          "phrs": [
                            {
                              "pva": "put (something) aside"
                            },
                            {
                              "pvl": "or",
                              "pva": "put aside (something)"
                            }
                          ]
                        },
                        "sn": "1",
                        "dt": [
                          [
                            "text",
                            "{bc}to save or keep (something, such as money) to be used at a later time "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "She's been {it}putting aside{/it} some money for a vacation."
                              },
                              {
                                "t": "Can you {it}put{/it} a few minutes {it}aside{/it} for a short meeting?"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "2",
                        "dt": [
                          [
                            "text",
                            "{bc}to stop worrying or thinking about (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "We need to {it}put{/it} these problems {it}aside{/it} for now and get the work done."
                              },
                              {
                                "t": "It's time to {it}put aside{/it} our differences and start working together."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "put at",
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sphrasev": {
                          "phrs": [
                            {
                              "pva": "put (something) at (something)"
                            }
                          ]
                        },
                        "dt": [
                          [
                            "text",
                            "{bc}to guess or estimate (something) to be (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The coroner {it}put{/it} his time of death {it}at{/it} 7:00. [=the coroner estimated that the time of his death was 7:00]"
                              },
                              {
                                "t": "Recent estimates {it}put{/it} the number of unreported cases {it}at{/it} 2,000 each year."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "put away",
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sen",
                      {
                        "sn": "1",
                        "phrasev": [
                          {
                            "pva": "put (something) away"
                          },
                          {
                            "pvl": "or",
                            "pva": "put away (something)"
                          }
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "a",
                        "dt": [
                          [
                            "text",
                            "{bc}to return (something) to the place where it belongs "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He washed, dried, and {it}put away{/it} the dishes after dinner."
                              },
                              {
                                "t": "She {it}put{/it} the pictures {it}away{/it} for safekeeping."
                              },
                              {
                                "t": "{it}Put{/it} your notes {it}away{/it}. It's time for the test."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "b",
                        "dt": [
                          [
                            "text",
                            "{bc}to save or keep (something, such as money) to be used at a later time "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "Her parents started {it}putting away{/it} money for her education the year she was born."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "c",
                        "sls": [
                          "informal"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to eat (a large amount of food) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "I used to {it}put away{/it} huge meals before I went on a diet."
                              },
                              {
                                "t": "That guy can really {phrase}put it away{/phrase}!"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "2",
                        "phrasev": [
                          {
                            "pva": "put (someone) away"
                          },
                          {
                            "pvl": "or",
                            "pva": "put away (someone)"
                          }
                        ],
                        "sls": [
                          "informal"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to cause (someone) to be kept in a prison or mental hospital "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He's a vicious criminal. I hope they {it}put{/it} him {it}away{/it} for the rest of his life."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "put back",
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sphrasev": {
                          "phrs": [
                            {
                              "pva": "put (something) back"
                            },
                            {
                              "pvl": "or",
                              "pva": "put back (something)"
                            }
                          ]
                        },
                        "sn": "1",
                        "dt": [
                          [
                            "text",
                            "{bc}to return (something) to the place where it belongs "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "Remember to {it}put{/it} the vacuum cleaner {it}back{/it} in the closet after you've used it."
                              },
                              {
                                "t": "The books had been {it}put back{/it} neatly on the shelf."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "2",
                        "sls": [
                          "British"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to change (a planned event) to start at a later date or time "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "They {it}put back{/it} [={it}pushed back{/it}, {it}postponed{/it}] the game until next week."
                              },
                              {
                                "t": "The meeting has been {it}put back{/it} from 1 p.m. to 3 p.m."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "put before",
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sphrasev": {
                          "phrs": [
                            {
                              "pva": "put (something) before (someone or something)"
                            }
                          ]
                        },
                        "dt": [
                          [
                            "text",
                            "{bc}to ask (a person or group) to make a decision about (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The problem of downtown parking was {it}put before{/it} the mayor/council."
                              },
                              {
                                "t": "We should {it}put{/it} this question {it}before{/it} the voters."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "put behind",
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sphrasev": {
                          "phrs": [
                            {
                              "pva": "put (something) behind you"
                            }
                          ]
                        },
                        "dt": [
                          [
                            "text",
                            "{bc}to stop worrying about or being upset by (something that happened in the past) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "It was a disappointing loss, but we need to {it}put it behind us{/it} and focus on winning the next game."
                              },
                              {
                                "t": "{it}Put{/it} the past {it}behind you{/it}."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "put by",
            "gram": "phrasal verb",
            "def": [
              {
                "sphrasev": {
                  "phrs": [
                    {
                      "pva": "put (something) by"
                    },
                    {
                      "pvl": "or",
                      "pva": "put by (something)"
                    }
                  ]
                },
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sls": [
                          "chiefly British"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to save (money) for a later time "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "She has {it}put{/it} some money {it}by{/it} [={it}put aside{/it}] for emergencies."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "put down",
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sen",
                      {
                        "sn": "1",
                        "phrasev": [
                          {
                            "pva": "put (someone or something) down"
                          },
                          {
                            "pvl": "also",
                            "pva": "put down (someone or something)"
                          }
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "a",
                        "dt": [
                          [
                            "text",
                            "{bc}to place (someone or something that you have been holding or carrying) on a table, on the floor, etc. "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "She carefully {it}put{/it} the vase {it}down{/it} on the table."
                              },
                              {
                                "t": "The police ordered him to {it}put down{/it} the gun."
                              },
                              {
                                "t": "I don't need you to carry me. {it}Put{/it} me {it}down{/it}!"
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "b",
                        "dt": [
                          [
                            "text",
                            "{bc}to add (someone or something) to a list "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "Don't forget to {it}put down{/it} milk and bread on the shopping list."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "c",
                        "sls": [
                          "informal"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to say critical or insulting things about (someone or something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He frequently {it}puts down{/it} her work."
                              },
                              {
                                "t": "Her parents are always {it}putting{/it} her {it}down{/it}."
                              },
                              {
                                "t": "He {phrase}puts himself down{/phrase} a lot, but he's really quite an attractive man."
                              }
                            ]
                          ],
                          [
                            "text",
                            "{dx}see also {dxt|put-down||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sen",
                      {
                        "sn": "2",
                        "phrasev": [
                          {
                            "pva": "put (something) down"
                          },
                          {
                            "pvl": "or",
                            "pva": "put down (something)"
                          }
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "a",
                        "dt": [
                          [
                            "text",
                            "{bc}to write (something) {bc}to record (something) in writing "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "She says that the reporter {it}put{/it} her quote {it}down{/it} incorrectly."
                              },
                              {
                                "t": "Every night, he {it}puts{/it} his thoughts {it}down{/it} in a journal."
                              },
                              {
                                "t": "I need to {it}put down{/it} my thoughts on paper before I forget them."
                              },
                              {
                                "t": "What answer did you {it}put down{/it} on the test?"
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "b",
                        "dt": [
                          [
                            "text",
                            "{bc}to give (an amount of money) as a first payment when you are buying something that costs a lot of money "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "We {it}put{/it} 10 percent {it}down{/it} on the house. = We {it}put down{/it} a 10 percent deposit on the house."
                              },
                              {
                                "t": "{it}Put{/it} no money {it}down{/it} and pay no interest on the car until next year."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "c",
                        "dt": [
                          [
                            "text",
                            "{bc}to put (something) in place on the floor or ground "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "{it}Putting down{/it} [={it}installing{/it}] a new hardwood floor would greatly increase the value of your home."
                              },
                              {
                                "t": "We {it}put down{/it} a layer of mulch in the rose garden."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "d",
                        "dt": [
                          [
                            "text",
                            "{bc}to stop (a violent or dangerous activity) by using force "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "Federal troops were brought in to help {it}put down{/it} the riot."
                              },
                              {
                                "t": "{it}put down{/it} a rebellion/revolt/uprising"
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "e",
                        "dt": [
                          [
                            "text",
                            "{bc}to kill (an animal) in a way that causes it little pain usually because it is injured or sick "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "They had to have their dog {it}put down{/it} [={it}put to sleep{/it}] by the vet."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "f",
                        "sls": [
                          "British"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to end a telephone connection "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "She said goodbye and {phrase}put down the phone{/phrase}. [={it}hung up the phone{/it}]"
                              },
                              {
                                "t": "She {phrase}put the phone down on him{/phrase}. [=she hung up the phone while he was still talking to her]"
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "g",
                        "sls": [
                          "British"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to formally suggest (something) as an idea to be discussed and voted on by a group of people {bc}to propose or introduce (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "{it}putting down{/it} an amendment in Parliament"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "3",
                        "phrasev": [
                          {
                            "pva": "put down"
                          },
                          {
                            "pvl": "or",
                            "pva": "put (something) down"
                          },
                          {
                            "pvl": "or",
                            "pva": "put down (something)"
                          }
                        ],
                        "sls": [
                          "chiefly British"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to land or to cause (an airplane) to land "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "Our plane {it}put down{/it} [={it}landed{/it}] in New York around 2 p.m."
                              },
                              {
                                "t": "The pilot was forced to {it}put{/it} [={it}set{/it}] the plane {it}down{/it} in a field."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "4",
                        "phrasev": [
                          {
                            "pva": "put (someone) down"
                          },
                          {
                            "pvl": "or",
                            "pva": "put down (someone)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to place (a baby or child) in a bed to sleep "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He {it}put{/it} the baby {it}down{/it} (in her crib) for a nap."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "5",
                        "phrasev": [
                          {
                            "pva": "put (someone) down as (something)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to think of (someone) as (a specified kind of person or thing) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "Most people {it}put{/it} him {it}down as{/it} [=believe that he is] a fanatic."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "6",
                        "phrasev": [
                          {
                            "pva": "put (someone) down for (something)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to write the name of (someone) on a list of people who will do or give (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "Can I {it}put you down for{/it} a donation? [=can I write that you will give a donation?]"
                              },
                              {
                                "t": "Sure, {it}put me down for{/it} $20."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "7",
                        "phrasev": [
                          {
                            "pva": "put (something) down to (something)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to say or think that (something) happened because of (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "Let's {it}put{/it} the mistake {it}down to{/it} your inexperience and forget about it."
                              },
                              {
                                "t": "The mistake was {it}put down to{/it} [={it}attributed to{/it}] his inexperience."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "put forth",
            "gram": "phrasal verb",
            "def": [
              {
                "sls": [
                  "somewhat formal"
                ],
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sphrasev": {
                          "phrs": [
                            {
                              "pva": "put forth (something)"
                            },
                            {
                              "pvl": "or",
                              "pva": "put (something) forth"
                            }
                          ]
                        },
                        "sn": "1",
                        "dt": [
                          [
                            "text",
                            "{bc}to suggest (an idea, plan, etc.) for people to think about or consider "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The same argument has been {it}put forth{/it} by many people in the opposition."
                              },
                              {
                                "t": "I would like to {it}put forth{/it} some alternatives."
                              },
                              {
                                "t": "{it}putting forth{/it} a plan/proposal/theory"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "2",
                        "dt": [
                          [
                            "text",
                            "{bc}to use (something, such as energy) for a particular purpose "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "She {it}put forth{/it} all her energy to win the race."
                              },
                              {
                                "t": "They {it}put forth{/it} a good effort."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "3",
                        "sls": [
                          "of a plant"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to produce or send out (something) by growing "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The trees are starting to {it}put forth{/it} new leaves."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "put forward",
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sphrasev": {
                          "phrs": [
                            {
                              "pva": "put (something) forward"
                            },
                            {
                              "pvl": "or",
                              "pva": "put forward (something)"
                            }
                          ]
                        },
                        "sls": [
                          "somewhat formal"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to suggest (something) for consideration {bc}{sx|propose||} "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He {it}put forward{/it} [={it}put forth{/it}] a theory about how the accident may have occurred."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "put in",
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sen",
                      {
                        "sn": "1",
                        "phrasev": [
                          {
                            "pva": "put (something) in"
                          },
                          {
                            "pvl": "or",
                            "pva": "put in (something)"
                          }
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "a",
                        "dt": [
                          [
                            "text",
                            "{bc}to make (something) ready to be used in a certain place {bc}{sx|install||} "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "We {it}put in{/it} new cabinets just last year."
                              },
                              {
                                "t": "In order to fix the car they have to {it}put in{/it} a new engine."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "b",
                        "dt": [
                          [
                            "text",
                            "{bc}to add (a comment) to a conversation or argument "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "She {it}put{/it} a quick comment {it}in{/it} about her busy schedule."
                              },
                              {
                                "t": "I'd like to {it}put in{/it} a few words on his behalf. [=to say something that supports him]"
                              },
                              {
                                "t": "Would you mind {phrase}putting in a good word for{/phrase} me? [=would you say something good about me?]"
                              },
                              {
                                "t": "You will each have a chance to {phrase}put in your two cents{/phrase}. [=to express your opinion]"
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "c",
                        "dt": [
                          [
                            "text",
                            "{bc}to make an official statement, offer, or request "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "She {it}put in{/it} a plea of not guilty. [=she pleaded not guilty]"
                              },
                              {
                                "t": "I need to {it}put in{/it} [={it}make, submit{/it}] a report about this."
                              },
                              {
                                "t": "You have two weeks to {it}put in{/it} [={it}submit{/it}] a claim with the insurance company."
                              },
                              {
                                "t": "They are {it}putting in{/it} [={it}making{/it}] a $300,000 offer for the house."
                              },
                              {
                                "t": "I'd like to {it}put in{/it} [={it}place{/it}] an order for a dozen roses."
                              },
                              {
                                "t": "Contractors have begun {it}putting in{/it} bids for the job."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "d",
                        "dt": [
                          [
                            "text",
                            "{bc}to perform (a particular action) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "They {it}put in{/it} an amazing performance last night."
                              },
                              {
                                "t": "The prime minister {phrase}put in a call to{/phrase} [={it}called{/it}] the White House."
                              },
                              {
                                "t": "I won't be able to stay at the party long, but I'll at least try to {phrase}put in an appearance{/phrase}. [=to go to the party for a short time]"
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "e",
                        "dt": [
                          [
                            "text",
                            "{bc}to work or do something for (an amount of time) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "She {it}put in{/it} 10 hours at the office yesterday."
                              },
                              {
                                "t": "She {it}put in{/it} a long day at work."
                              },
                              {
                                "t": "He has {it}put in{/it} his time (in jail), and now he is a free man."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "2",
                        "phrasev": [
                          {
                            "pva": "put in (something)"
                          },
                          {
                            "pvl": "or",
                            "pva": "put (something) in (something)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to use (a certain amount of energy or effort) when doing something "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "If we {it}put in{/it} a little more effort, we could finish by this afternoon."
                              },
                              {
                                "t": "He {it}puts{/it} a lot of energy {it}in{/it} his performances."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sen",
                      {
                        "sn": "3",
                        "phrasev": [
                          {
                            "pva": "put (something) in (something)"
                          }
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "a",
                        "dt": [
                          [
                            "text",
                            "{bc}to invest (money) into (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "She {it}put{/it} her money {it}in{/it} stocks and bonds."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "b",
                        "dt": [
                          [
                            "uns",
                            [
                              [
                                [
                                  "text",
                                  "used to say what causes you to have faith, confidence, etc. "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "He {it}puts{/it} his faith {it}in{/it} reason/science."
                                    },
                                    {
                                      "t": "{it}putting{/it} her trust {it}in{/it} God"
                                    }
                                  ]
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "4",
                        "phrasev": [
                          {
                            "pva": "put in for (something)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to ask for (something) in an official way {bc}to formally request (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He {it}put in for{/it} a leave of absence."
                              },
                              {
                                "t": "{it}putting in for{/it} a promotion"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "5",
                        "sls": [
                          "of a boat or ship"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to enter a harbor or port "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The ship {it}put in{/it} at Sydney."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "put into",
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sphrasev": {
                          "phrs": [
                            {
                              "pva": "put (something) into (something)"
                            }
                          ]
                        },
                        "sn": "1",
                        "dt": [
                          [
                            "text",
                            "{bc}to use (a certain amount of energy or effort) when doing (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He {it}puts{/it} a lot of energy {it}into{/it} his performances."
                              },
                              {
                                "t": "She {phrase}put her heart into{/phrase} (writing) the letter. [=she expressed her feelings in a very open and honest way]"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "2",
                        "dt": [
                          [
                            "text",
                            "{bc}to invest (time, money, etc.) in (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "They {it}put{/it} their entire life savings {it}into{/it} the company."
                              },
                              {
                                "t": "We {it}put{/it} a lot of money {it}into{/it} (fixing up) that house."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "put it there",
            "vrs": [
              {
                "vl": "or",
                "va": "put her there"
              }
            ],
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sls": [
                          "informal + old-fashioned"
                        ],
                        "dt": [
                          [
                            "uns",
                            [
                              [
                                [
                                  "text",
                                  "used to invite someone to shake hands with you "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "{it}Put her there{/it}, pal!"
                                    }
                                  ]
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "put off",
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sn": "1",
                        "phrasev": [
                          {
                            "pva": "put (something) off"
                          },
                          {
                            "pvl": "or",
                            "pva": "put off (something)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to decide that (something) will happen at a later time {bc}{sx|postpone||} "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The meeting has been {it}put off{/it} until next week. = We {it}put off{/it} (holding) the meeting until next week."
                              },
                              {
                                "t": "I've been meaning to call him, but I keep {it}putting{/it} it {it}off{/it}."
                              },
                              {
                                "t": "I've been {it}putting off{/it} calling him."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sen",
                      {
                        "sn": "2",
                        "phrasev": [
                          {
                            "pva": "put (someone) off"
                          },
                          {
                            "pvl": "or",
                            "pva": "put off (someone)"
                          }
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "a",
                        "dt": [
                          [
                            "text",
                            "{bc}to cause (someone) to wait "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "I need to come up with an excuse to {it}put off{/it} the bill collector."
                              },
                              {
                                "t": "She finally called him after {it}putting{/it} him {it}off{/it} all week."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "b",
                        "dt": [
                          [
                            "text",
                            "{bc}to cause (someone) to dislike someone or something "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "Don't let the restaurant's dingy appearance {it}put{/it} you {it}off{/it}—their food is great."
                              },
                              {
                                "t": "I was {it}put off{/it} by his rudeness."
                              },
                              {
                                "t": "({it}chiefly Brit{/it}) His rudeness {phrase}put me off him{/phrase} [=made me dislike him] at once."
                              }
                            ]
                          ],
                          [
                            "text",
                            "{dx}see also {dxt|off-putting||}{/dx}"
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "c",
                        "sls": [
                          "British"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to allow (someone) to get off a bus or other vehicle "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "Could you {it}put{/it} [={it}let{/it}] me {it}off{/it} (the bus) at the next stop, please?"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "put on",
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sen",
                      {
                        "sn": "1",
                        "phrasev": [
                          {
                            "pva": "put (something) on"
                          },
                          {
                            "pvl": "or",
                            "pva": "put on (something)"
                          }
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "a",
                        "dt": [
                          [
                            "text",
                            "{bc}to dress yourself in (clothing) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "She {it}put on{/it} her new dress."
                              },
                              {
                                "t": "{it}Put on{/it} a hat and gloves."
                              },
                              {
                                "t": "I'll {it}put{/it} some clothes {it}on{/it} and be right there."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "b",
                        "dt": [
                          [
                            "text",
                            "{bc}to apply (something) to your face or body "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "{it}putting on{/it} lipstick/mascara/lotion"
                              },
                              {
                                "t": "She {it}puts on{/it} far too much makeup."
                              },
                              {
                                "t": "We tried to {phrase}put on a happy/brave face{/phrase} [=we tried to appear happy/brave] despite our concern."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "c",
                        "dt": [
                          [
                            "text",
                            "{bc}to add to or increase the amount of (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The fire was getting low and we needed to {it}put on{/it} more wood."
                              },
                              {
                                "t": "She {it}put on{/it} [={it}gained{/it}] 40 pounds during her pregnancy."
                              },
                              {
                                "t": "He's {it}put on{/it} some weight recently."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "d",
                        "dt": [
                          [
                            "text",
                            "{bc}to cause (a machine, a light, etc.) to begin to work "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "Would you mind if I {it}put{/it} [={it}turned{/it}] the TV {it}on{/it}?"
                              },
                              {
                                "t": "Somebody {it}put on{/it} the lights."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "e",
                        "dt": [
                          [
                            "text",
                            "{bc}to cause (something) to begin to be heard, seen, produced, etc. "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "{it}put on{/it} a record/CD/album"
                              },
                              {
                                "t": "{it}putting on{/it} some music"
                              },
                              {
                                "t": "We {it}put on{/it} the air-conditioning/heat in the car."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "f",
                        "dt": [
                          [
                            "text",
                            "{bc}to start cooking or making (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "Let me know when to {it}put on{/it} the rice."
                              },
                              {
                                "t": "He {it}put on{/it} a pot of coffee for his guests."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "g",
                        "dt": [
                          [
                            "text",
                            "{bc}to produce (something that entertains people, such as a play, a party, etc.) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "They're {it}putting on{/it} a concert."
                              },
                              {
                                "t": "He always {it}puts on{/it} a great show/performance."
                              },
                              {
                                "t": "The town {it}puts on{/it} a fireworks display every Independence Day."
                              },
                              {
                                "t": "We are {it}putting on{/it} a barbecue for everyone in the neighborhood."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sen",
                      {
                        "sn": "2",
                        "phrasev": [
                          {
                            "pva": "put (something) on (someone or something)"
                          }
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "a",
                        "dt": [
                          [
                            "text",
                            "{bc}to say that (someone or something) is responsible for or guilty of (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "Responsibility for the accident was {it}put on{/it} the other driver."
                              },
                              {
                                "t": "He {it}puts{/it} much of the blame for his problems {it}on{/it} the government."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "b",
                        "dt": [
                          [
                            "text",
                            "{bc}to bet (an amount of money) on (someone or something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "We {it}put{/it} $2 {it}on{/it} the favorite to win."
                              },
                              {
                                "t": "{it}putting{/it} money {it}on{/it} horse races"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "3",
                        "phrasev": [
                          {
                            "pva": "put (someone or something) on (something)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to add (someone or something) to (a list or group of related things) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "She asked to have her name {it}put on{/it} the list of candidates."
                              },
                              {
                                "t": "They {it}put{/it} her {it}on{/it} the list."
                              },
                              {
                                "t": "We {it}put{/it} several new dishes {it}on{/it} the menu."
                              },
                              {
                                "t": "{ldquo}Bartender, I'll have another beer.{rdquo} {ldquo}Okay, I'll {it}put{/it} it {it}on{/it} your bill.{rdquo}"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "4",
                        "phrasev": [
                          {
                            "pva": "put (someone) on"
                          },
                          {
                            "pvl": "or",
                            "pva": "put on (someone)"
                          }
                        ],
                        "sls": [
                          "chiefly US",
                          "informal"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to say things that are not true to (someone) in a joking way {bc}to trick or fool (someone) for amusement "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He said he knew the President, but I think he was just {it}putting me on{/it}. [=({it}Brit{/it}) {it}having me on{/it}]"
                              }
                            ]
                          ],
                          [
                            "text",
                            "{dx}see also {dxt|put-on:2||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "5",
                        "dt": [
                          [
                            "uns",
                            [
                              [
                                [
                                  "text",
                                  "used to say that you would like to speak to someone on the phone "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "Hi Dad. Could you {it}put{/it} Mom {it}on{/it}? [=could you give Mom the phone so that I can speak to her?]"
                                    },
                                    {
                                      "t": "{it}Put{/it} Dave {it}on{/it} the phone, please."
                                    }
                                  ]
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "6",
                        "phrasev": [
                          {
                            "pva": "put (someone) on (something)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to tell (someone) to use or do (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "Her doctor {it}put{/it} her {it}on{/it} medication. [=her doctor prescribed medication for her]"
                              },
                              {
                                "t": "He decided to {it}put{/it} himself {it}on{/it} a diet. [=to go on a diet]"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "7",
                        "phrasev": [
                          {
                            "pva": "put (someone) on to (something)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to give (someone) information about (something) {bc}to tell (someone) about (something that he or she did not know about before) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "A friend of mine {it}put{/it} me {it}on to{/it} this book in high school."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "put out",
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sen",
                      {
                        "sn": "1",
                        "phrasev": [
                          {
                            "pva": "put (something) out"
                          },
                          {
                            "pvl": "or",
                            "pva": "put out (something)"
                          }
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "a",
                        "dt": [
                          [
                            "text",
                            "{bc}to cause (something) to stop burning {bc}{sx|extinguish||} "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "She {it}put{/it} the fire {it}out{/it} by pouring water on it."
                              },
                              {
                                "t": "She {it}put out{/it} her cigarette in an ashtray."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "b",
                        "dt": [
                          [
                            "text",
                            "{bc}to stop (something) from working "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "Who {it}put out{/it} [={it}turned off{/it}] the lights?"
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "c",
                        "dt": [
                          [
                            "text",
                            "{bc}to take (something) outside and leave it there "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "I {it}put{/it} the dog {it}out{/it} in the backyard before leaving the house."
                              },
                              {
                                "t": "{it}putting{/it} horses {it}out{/it} to graze"
                              },
                              {
                                "t": "({it}US{/it}) Don't forget to {it}put out{/it} the trash/garbage. = ({it}Brit{/it}) Don't forget to {it}put out{/it} the rubbish."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "d",
                        "dt": [
                          [
                            "text",
                            "{bc}to extend (something) outward "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "I {it}put out{/it} my hand and he shook it eagerly."
                              },
                              {
                                "t": "She {it}put out{/it} her arm for them to stop."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "e",
                        "dt": [
                          [
                            "text",
                            "{bc}to place (something) where people may use it "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He always {it}put out{/it} a bowl of candy for the grandchildren."
                              },
                              {
                                "t": "We should {it}put out{/it} a few extra chairs in case more people arrive."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "f",
                        "dt": [
                          [
                            "text",
                            "{bc}to produce (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "This small radiator {it}puts out{/it} a surprising amount of heat."
                              },
                              {
                                "t": "They will have to {it}put out{/it} considerable effort to meet the deadline."
                              },
                              {
                                "t": "It was early spring, and the trees were just starting to {it}put out{/it} their leaves."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "g",
                        "dt": [
                          [
                            "text",
                            "{bc}to make (something) available to be bought, used, etc. "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "She plans to {it}put out{/it} a new album in March."
                              },
                              {
                                "t": "They need to be {it}putting out{/it} cars that get better gas mileage."
                              },
                              {
                                "t": "The information was given in a pamphlet {it}put out{/it} by the university's health department."
                              },
                              {
                                "t": "Researchers recently {it}put out{/it} a report/study on the issue."
                              },
                              {
                                "t": "The police have {it}put out{/it} [={it}issued{/it}] a warrant for his arrest."
                              },
                              {
                                "t": "Someone {phrase}put the word out{/phrase} [=started telling people] that the police were looking for her."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sen",
                      {
                        "sn": "2",
                        "phrasev": [
                          {
                            "pva": "put (someone) out"
                          },
                          {
                            "pvl": "or",
                            "pva": "put out (someone)"
                          }
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "a",
                        "dt": [
                          [
                            "text",
                            "{bc}to annoy or bother (someone) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "All the attention didn't seem to {it}put{/it} her {it}out{/it} at all."
                              },
                              {
                                "t": "I'm a little {it}put out{/it} that no one called to tell me they would be late."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "b",
                        "dt": [
                          [
                            "text",
                            "{bc}to cause (someone) to do extra work {bc}to cause trouble for (someone) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "I hope my visit didn't {it}put{/it} you {it}out{/it}. [=didn't inconvenience you]"
                              },
                              {
                                "t": "Please don't {it}put{/it} yourself {it}out{/it} just for us."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "c",
                        "dt": [
                          [
                            "text",
                            "{bc}to make (someone) unconscious "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The anesthesia {it}put{/it} him {it}out{/it} for a little over three hours."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "d",
                        "sls": [
                          "sports"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to cause (someone) to be out in baseball or cricket "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The runner was {it}put out{/it} at second base."
                              }
                            ]
                          ],
                          [
                            "text",
                            "{dx}see also {dxt|putout||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "3",
                        "sls": [
                          "chiefly US",
                          "informal + impolite"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to have sex with someone "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "Did she {it}put out{/it} last night?"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "4",
                        "sls": [
                          "of a boat or ship"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to leave a harbor or port "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The ship {it}put out{/it} to sea."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "put over",
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sn": "1",
                        "phrasev": [
                          {
                            "pva": "put (something) over"
                          },
                          {
                            "pvl": "or",
                            "pva": "put over (something)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to cause (something) to be clearly understood {bc}to put (something) across "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He {it}puts over{/it} very complicated concepts in a way that his students can understand."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "2",
                        "phrasev": [
                          {
                            "pva": "put (yourself) over as (something)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to cause (yourself) to appear to be (a particular type of person) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "She {it}puts herself over as{/it} [=makes other people believe that she is] a modern, independent woman."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "3",
                        "phrasev": [
                          {
                            "pva": "put (something) over on (someone)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to lie about (something) to (someone) {bc}to trick or deceive someone "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "Don't try to {it}put{/it} anything {it}over on{/it} her. She'll see right through you."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "put paid to",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|paid:2||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "put (someone) in mind of",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|mind:1||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "put through",
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sn": "1",
                        "phrasev": [
                          {
                            "pva": "put (something) through"
                          },
                          {
                            "pvl": "or",
                            "pva": "put through (something)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to cause (something) to be accepted or done successfully "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "They {it}put through{/it} a number of reforms."
                              },
                              {
                                "t": "tax cuts that were {it}put through{/it} by former administrations"
                              },
                              {
                                "t": "I asked Human Resources to help me {it}put through{/it} [=to help me get] a transfer to a different department."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "2",
                        "phrasev": [
                          {
                            "pva": "put (someone) through (something)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to pay for (someone) to attend (school) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "She has a full-time job and is {it}putting{/it} herself {it}through{/it} college."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "3",
                        "phrasev": [
                          {
                            "pva": "put (someone or something) through (something)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to cause (someone or something) to experience (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "His doctor {it}put{/it} him {it}through{/it} a series of tests."
                              },
                              {
                                "t": "She {it}put{/it} her parents {it}through{/it} a lot when she was a teenager."
                              },
                              {
                                "t": "You've been {it}put through{/it} quite an ordeal."
                              },
                              {
                                "t": "I've been {it}put through{/it} hell!"
                              },
                              {
                                "t": "We {it}put{/it} that truck {it}through{/it} a lot when we owned it."
                              },
                              {
                                "t": "The new software still needs to be {phrase}put through its paces{/phrase} [=it still needs to be tested] before it can be made available to the public."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sen",
                      {
                        "sn": "4",
                        "phrasev": [
                          {
                            "pva": "put (someone or something) through"
                          },
                          {
                            "pvl": "or",
                            "pva": "put through (someone or something)"
                          }
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "a",
                        "dt": [
                          [
                            "text",
                            "{bc}to cause a phone call from (someone) to be sent to another person's phone "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "Please hold while I {it}put{/it} you {it}through{/it} (to the manager)."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "b",
                        "dt": [
                          [
                            "text",
                            "{bc}to cause (a phone call) to be sent to another person's phone "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "Please hold while I {it}put{/it} your call {it}through{/it} (to the manager)."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "put to death",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|death||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "put together",
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sen",
                      {
                        "sn": "1",
                        "phrasev": [
                          {
                            "pva": "put (something) together"
                          },
                          {
                            "pvl": "or",
                            "pva": "put together (something)"
                          }
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "a",
                        "dt": [
                          [
                            "text",
                            "{bc}to create (something) by joining or gathering parts together "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "You'll need a screwdriver to {it}put{/it} the toy {it}together{/it}."
                              },
                              {
                                "t": "They {it}put{/it} their first band {it}together{/it} when they were in high school."
                              },
                              {
                                "t": "Help me {it}put together{/it} a list of what we need at the store."
                              },
                              {
                                "t": "She {it}put{/it} a proposal {it}together{/it} to give to the committee for consideration."
                              },
                              {
                                "t": "Her outfit was very well {it}put together{/it}. [=the parts looked good together]"
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "b",
                        "dt": [
                          [
                            "uns",
                            [
                              [
                                [
                                  "text",
                                  "used to say that someone or something is greater than the total of all the other people or things mentioned "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "You're smarter than all of those other guys {it}put together{/it}."
                                    }
                                  ]
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "2",
                        "phrasev": [
                          {
                            "pva": "put (something) together with (something)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to add or combine (something) with (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "I never would have thought of {it}putting{/it} this wine {it}together with{/it} fish."
                              },
                              {
                                "t": "The lack of rain {it}put together with{/it} [=along with, combined with] the heat ruined many of the region's crops."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "put up",
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sen",
                      {
                        "sn": "1",
                        "phrasev": [
                          {
                            "pva": "put (something) up"
                          },
                          {
                            "pvl": "or",
                            "pva": "put up (something)"
                          }
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "a",
                        "dt": [
                          [
                            "text",
                            "{bc}to place (something) in a higher position "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "They {it}put up{/it} the flag in the morning and take it down at night."
                              },
                              {
                                "t": "Sit down. {it}Put{/it} your feet {it}up{/it} and relax."
                              },
                              {
                                "t": "If you have a question, please {it}put up{/it} [={it}raise{/it}] your hand."
                              },
                              {
                                "t": "Stop! {it}Put{/it} your hands {it}up{/it} (over your head)!"
                              },
                              {
                                "t": "When she goes to work, she usually {it}puts{/it} her hair {it}up{/it} (in a ponytail)."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "b",
                        "dt": [
                          [
                            "text",
                            "{bc}to cause (something) to be on a wall, to hang from a ceiling, etc. "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "She went around town {it}putting up{/it} posters for the concert."
                              },
                              {
                                "t": "I just {it}put up{/it} new curtains."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "c",
                        "dt": [
                          [
                            "text",
                            "{bc}to set or place (something) so that it stands up "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "{it}putting up{/it} a tent"
                              },
                              {
                                "t": "They {it}put up{/it} a display of new products."
                              },
                              {
                                "t": "They {it}put up{/it} a {ldquo}for sale{rdquo} sign in front of their house."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "d",
                        "dt": [
                          [
                            "text",
                            "{bc}to build (something) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "They're {it}putting up{/it} a new office building on Main Street."
                              },
                              {
                                "t": "{it}putting up{/it} a fence"
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "e",
                        "dt": [
                          [
                            "text",
                            "{bc}to make (something) available for people to buy or have "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The lamps were {it}put up{/it} at auction."
                              }
                            ]
                          ],
                          [
                            "uns",
                            [
                              [
                                [
                                  "text",
                                  "often + {it}for{/it} "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "They {it}put{/it} all of their possessions {it}up for{/it} sale."
                                    },
                                    {
                                      "t": "They {it}put{/it} the puppies {it}up for{/it} adoption."
                                    }
                                  ]
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "f",
                        "dt": [
                          [
                            "text",
                            "{bc}to provide (money, property, etc.) in order to pay for something "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "They decided not to {it}put up{/it} the money for her bail."
                              },
                              {
                                "t": "They {it}put up{/it} the company's assets as collateral on the loan."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "g",
                        "dt": [
                          [
                            "text",
                            "{bc}to offer (something) as a prize "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The police have {it}put up{/it} a $1,000 reward for information leading to his capture."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "h",
                        "sls": [
                          "chiefly British"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to increase (something) {bc}{sx|raise||} "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "They are likely to {it}put up{/it} interest rates again this year."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "i",
                        "sls": [
                          "US"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to return (something) to the place where it belongs "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "It's time to {it}put up{/it} [={it}put away{/it}] your toys and get ready for bed."
                              },
                              {
                                "t": "He washed, dried, and {it}put up{/it} the dishes after dinner."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "j",
                        "sls": [
                          "chiefly US"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to preserve (fruits, vegetables, etc.) to be used later {bc}{sx|can||} "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "Their grandmother spent the afternoon {it}putting up{/it} peaches."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sen",
                      {
                        "sn": "2",
                        "phrasev": [
                          {
                            "pva": "put up (something)"
                          }
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "a",
                        "dt": [
                          [
                            "text",
                            "{bc}to do (something) as a way of resisting or struggling against someone or something "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "We're not leaving without {it}putting up{/it} a fight. [=without fighting]"
                              },
                              {
                                "t": "As expected, the kids {it}put up{/it} a fuss when we said it was time for bed."
                              },
                              {
                                "t": "They are likely to {it}put up{/it} stiff resistance to any new proposals."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "b",
                        "dt": [
                          [
                            "text",
                            "{bc}to offer (something) as an argument, a suggestion, etc. "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "She {it}put up{/it} a good/solid argument in his defense."
                              },
                              {
                                "t": "{it}putting up{/it} a proposal"
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "c",
                        "dt": [
                          [
                            "text",
                            "{bc}to score (points) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "They {it}put up{/it} 20 points in the first half."
                              },
                              {
                                "t": "She needs to {it}put up{/it} big numbers [=to score a lot of points] in today's game."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "3 a",
                        "phrasev": [
                          {
                            "pva": "put (someone) up"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to give food and shelter to (someone) {bc}to allow or pay for (someone) to stay in someone's home, a hotel, etc., for the night "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "Could you {it}put{/it} me {it}up{/it} for the night?"
                              },
                              {
                                "t": "His employers {it}put{/it} him {it}up{/it} at a hotel."
                              },
                              {
                                "t": "We {it}put{/it} our guests {it}up{/it} in the spare bedroom."
                              }
                            ]
                          ]
                        ]
                      }
                    ],
                    [
                      "sense",
                      {
                        "sn": "b",
                        "sls": [
                          "chiefly British"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to stay in someone's home, a hotel, etc., for the night "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He {it}put up{/it} with a friend while he was in town."
                              },
                              {
                                "t": "{it}putting up{/it} at a hotel"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "4",
                        "phrasev": [
                          {
                            "pva": "put (someone) up"
                          },
                          {
                            "pvl": "or",
                            "pva": "put up (someone)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to choose or suggest (someone) to be a candidate or competitor "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The party {it}put{/it} her {it}up{/it} (as its candidate) for governor."
                              },
                              {
                                "t": "They {it}put up{/it} their best man to compete against the champion."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "5",
                        "phrasev": [
                          {
                            "pva": "put (someone) up to (something)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to convince (someone) to do (something stupid or foolish) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "His friends {it}put{/it} him {it}up to{/it} (playing) the prank."
                              },
                              {
                                "t": "Who {it}put{/it} you {it}up{/it} to this?"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "6",
                        "phrasev": [
                          {
                            "pva": "put up with (something or someone)"
                          }
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to allow (someone or something unpleasant or annoying) to exist or happen {bc}{sx|tolerate||} "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "At this school, we will not {it}put up with{/it} bad behavior."
                              },
                              {
                                "t": "I can't {it}put up with{/it} much more of this."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "7",
                        "phrasev": [
                          {
                            "pva": "put up or shut up"
                          }
                        ],
                        "sls": [
                          "informal"
                        ],
                        "dt": [
                          [
                            "uns",
                            [
                              [
                                [
                                  "text",
                                  "used to tell someone in a somewhat rude way to start doing something or to stop talking about it "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "You've complained long enough. It's time to {it}put up or shut up{/it}."
                                    }
                                  ]
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          }
        ],
        "shortdef": [
          "to cause (someone or something) to be in a particular place or position",
          "to cause (something) to go into or through something in a forceful way",
          "to cause (someone) to be in a particular place or send (someone) to a particular place"
        ]
      },
      {
        "meta": {
          "id": "return:2",
          "uuid": "d1eb8088-2daf-43d6-905f-6eea4672f2fc",
          "src": "learners",
          "section": "alpha",
          "target": {
            "tuuid": "3c972f33-a0c4-465c-b836-f059243ec872",
            "tsrc": "collegiate"
          },
          "highlight": "yes",
          "stems": [
            "return",
            "in return",
            "returns",
            "by return",
            "by return of post",
            "happy returns",
            "upon/on his return",
            "upon his return",
            "on his return",
            "return home",
            "on my return home",
            "on her return from",
            "return as",
            "safe return",
            "(income) tax return",
            "income tax return",
            "tax return",
            "day return"
          ],
          "app-shortdef": {
            "hw": "return:2",
            "fl": "noun",
            "def": [
              "{bc} the act of coming or going back to the place you started from or to a place where you were before",
              "{bc} the act of going back to an activity, job, situation, etc. {bc} the act of starting to do something again after stopping",
              "{bc} the fact that something (such as a condition, feeling, or situation) happens again"
            ]
          },
          "offensive": false
        },
        "hom": 2,
        "hwi": {
          "hw": "return",
          "altprs": [
            {
              "ipa": "rɪˈtɚn"
            }
          ]
        },
        "fl": "noun",
        "ins": [
          {
            "il": "plural",
            "ifc": "-turns",
            "if": "returns"
          }
        ],
        "def": [
          {
            "sseq": [
              [
                [
                  "sense",
                  {
                    "sn": "1",
                    "sgram": "singular",
                    "dt": [
                      [
                        "text",
                        "{bc}the act of coming or going back to the place you started from or to a place where you were before "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "We are looking forward to your {it}return{/it}."
                          },
                          {
                            "t": "We're looking forward to our {it}return{/it} to Europe."
                          },
                          {
                            "t": "What is the date of her {it}return{/it} from Mexico? [=when is she coming back from Mexico?]"
                          },
                          {
                            "t": "{phrase}Upon/on his return{/phrase} [=(less formally) when he returned; when he came back], he found a note taped to the door."
                          },
                          {
                            "t": "The bad weather delayed his {phrase}return home{/phrase}. [=his return to his home]"
                          },
                          {
                            "t": "I stopped by your house {phrase}on my return home{/phrase}. [=on my way home]"
                          },
                          {
                            "t": "She became sick {phrase}on her return from{/phrase} America. [=she became sick at the time she returned from America]"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "2",
                    "sgram": "singular",
                    "dt": [
                      [
                        "text",
                        "{bc}the act of going back to an activity, job, situation, etc. {bc}the act of starting to do something again after stopping "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "The team looked forward to his {it}return{/it} to coaching."
                          },
                          {
                            "t": "a {it}return{/it} to the old ways of farming"
                          },
                          {
                            "t": "He managed the team last year, so his {phrase}return as{/phrase} a player [=his return to the team as a player and not as a manager] was a surprise."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sen",
                  {
                    "sn": "3",
                    "sgram": "singular"
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "a",
                    "dt": [
                      [
                        "text",
                        "{bc}the fact that something (such as a condition, feeling, or situation) happens again"
                      ],
                      [
                        "uns",
                        [
                          [
                            [
                              "text",
                              "+ {it}of{/it} "
                            ],
                            [
                              "vis",
                              [
                                {
                                  "t": "the {it}return of{/it} peace to the region"
                                },
                                {
                                  "t": "Scientists noticed a {it}return{/it} [={it}recurrence{/it}] {it}of{/it} the disease in the monkeys."
                                },
                                {
                                  "t": "She noticed a {it}return of{/it} his old habits."
                                },
                                {
                                  "t": "the {it}return of{/it} spring"
                                }
                              ]
                            ]
                          ]
                        ]
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "b",
                    "dt": [
                      [
                        "text",
                        "{bc}the fact that someone or something changes {it}to{/it} a condition or state that existed before "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "the department's {it}return to{/it} normal"
                          },
                          {
                            "t": "The people celebrated their leader's {it}return to{/it} power."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "4",
                    "sgram": "singular",
                    "dt": [
                      [
                        "text",
                        "{bc}the act of taking someone or something back to the proper place"
                      ],
                      [
                        "uns",
                        [
                          [
                            [
                              "text",
                              "+ {it}of{/it} "
                            ],
                            [
                              "vis",
                              [
                                {
                                  "t": "The police arranged for the {it}return of{/it} the stolen goods. [=for the goods to be taken to the place they were stolen from]"
                                },
                                {
                                  "t": "The mother demanded a {phrase}safe return{/phrase} {it}of{/it} her child. [=demanded that her child would be brought back to her and not be hurt]"
                                }
                              ]
                            ]
                          ]
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "5 a",
                    "sgram": "count",
                    "dt": [
                      [
                        "text",
                        "{bc}something that is brought or sent back to a store or business because it does not work or fit properly, is damaged, is not needed, etc. "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "The store does not accept {it}returns{/it} more than 30 days after purchase."
                          }
                        ]
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "b",
                    "bnote": "returns",
                    "sgram": "plural",
                    "sls": [
                      "chiefly US"
                    ],
                    "dt": [
                      [
                        "text",
                        "{bc}empty cans or bottles that are brought back to a store so that they can be used again"
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "6",
                    "sls": [
                      "finance"
                    ],
                    "dt": [
                      [
                        "text",
                        "{bc}the profit from an investment or business "
                      ],
                      [
                        "wsgram",
                        "count"
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "Investors are promised a {it}return{/it}."
                          },
                          {
                            "t": "The company had poor {it}returns{/it} last year."
                          }
                        ]
                      ],
                      [
                        "uns",
                        [
                          [
                            [
                              "text",
                              "often + {it}on{/it} "
                            ],
                            [
                              "vis",
                              [
                                {
                                  "t": "He received a large {it}return on{/it} his investment. [=he made a lot of money on his investment]"
                                }
                              ]
                            ]
                          ]
                        ]
                      ],
                      [
                        "wsgram",
                        "noncount"
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "The stock has had a high rate of {it}return{/it}."
                          }
                        ]
                      ],
                      [
                        "uns",
                        [
                          [
                            [
                              "text",
                              "sometimes used figuratively "
                            ],
                            [
                              "vis",
                              [
                                {
                                  "t": "Her son's success in college was an excellent {it}return{/it} on her investment."
                                },
                                {
                                  "t": "She expected some {it}return{/it} from the company for all her years of loyal service."
                                }
                              ]
                            ]
                          ]
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "7",
                    "bnote": "returns",
                    "sgram": "plural",
                    "dt": [
                      [
                        "text",
                        "{bc}a report of the results of voting "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "election {it}returns{/it}"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "8",
                    "sgram": "count",
                    "dt": [
                      [
                        "text",
                        "{bc}a report that you send to the government about the money that you have earned and the taxes that you have paid in one year "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "He has copies of his {it}returns{/it} for the last 15 years."
                          },
                          {
                            "t": "We filed our {phrase}(income) tax return{/phrase}. [=we sent our tax return to the government]"
                          },
                          {
                            "t": "He filed his 2007 {it}tax return{/it} in February of 2008."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "9",
                    "sgram": "count",
                    "sls": [
                      "sports"
                    ],
                    "dt": [
                      [
                        "text",
                        "{bc}the act of returning a ball "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "({it}tennis{/it}) She hit a powerful {it}return{/it}. [=she hit back the ball that was served to her very hard]"
                          },
                          {
                            "t": "({it}American football{/it}) a 50-yard kickoff/punt/fumble {it}return{/it} [=a 50-yard run with the ball after getting it on a kickoff/punt/fumble]"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "10",
                    "sgram": "count",
                    "sls": [
                      "British"
                    ],
                    "dt": [
                      [
                        "text",
                        "{bc}a ticket for a trip that takes you to a place and back to the place you started from {bc}a round-trip ticket "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "One {it}return{/it} is often less expensive than buying two one-way tickets."
                          },
                          {
                            "t": "a {phrase}day return{/phrase} [=a reduced-price ticket for traveling to a place and back on the same day]"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ]
            ]
          }
        ],
        "dros": [
          {
            "drp": "by return",
            "vrs": [
              {
                "vl": "or",
                "va": "by return of post"
              }
            ],
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sls": [
                          "British"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}immediately by mail "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "I replied {it}by return of post{/it}."
                              },
                              {
                                "t": "I wrote you {it}by return{/it}."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "happy returns",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sls": [
                          "old fashioned"
                        ],
                        "dt": [
                          [
                            "uns",
                            [
                              [
                                [
                                  "text",
                                  "used for wishing someone a happy birthday and to express the hope that he or she will live to celebrate many more birthdays in the future "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "They wished me (many) {it}happy returns{/it}."
                                    }
                                  ]
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "in return",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{bc}in payment or exchange "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He helps out and expects nothing {it}in return{/it}."
                              },
                              {
                                "t": "He will not help unless he gets something {it}in return{/it}."
                              },
                              {
                                "t": "The prisoner told the police who had ordered the killing. {it}In return{/it}, his sentence was reduced by two years."
                              }
                            ]
                          ],
                          [
                            "uns",
                            [
                              [
                                [
                                  "text",
                                  "often + {it}for{/it} "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "I will lend you the money {it}in return for{/it} a favor."
                                    },
                                    {
                                      "t": "He worked {it}in return for{/it} a free meal."
                                    }
                                  ]
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          }
        ],
        "dxnls": [
          "see also {dxt|point of no return||}"
        ],
        "shortdef": [
          "the act of coming or going back to the place you started from or to a place where you were before",
          "the act of going back to an activity, job, situation, etc. : the act of starting to do something again after stopping",
          "the fact that something (such as a condition, feeling, or situation) happens again—+ of"
        ]
      },
      {
        "meta": {
          "id": "trigger-happy",
          "uuid": "b4d0a508-3b0e-4d27-8498-26fe09e9c84c",
          "src": "learners",
          "section": "alpha",
          "target": {
            "tuuid": "19f6b8cc-3944-4342-84eb-af096de0ca10",
            "tsrc": "collegiate"
          },
          "stems": [
            "trigger-happy"
          ],
          "app-shortdef": {
            "hw": "trigger-happy",
            "fl": "adjective",
            "def": [
              "{it}informal + disapproving{/it} {bc} eager to fire a gun"
            ]
          },
          "offensive": false
        },
        "hwi": {
          "hw": "trig*ger-hap*py",
          "prs": [
            {
              "ipa": "ˈtrɪgɚˌhæpi",
              "sound": {
                "audio": "trigge05"
              }
            }
          ]
        },
        "fl": "adjective",
        "gram": "more ~; most ~",
        "def": [
          {
            "sseq": [
              [
                [
                  "sense",
                  {
                    "sls": [
                      "informal + disapproving"
                    ],
                    "dt": [
                      [
                        "text",
                        "{bc}eager to fire a gun "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "{it}trigger-happy{/it} hunters"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ]
            ]
          }
        ],
        "shortdef": [
          "eager to fire a gun"
        ]
      }
    ],
    [
      {
        "meta": {
          "id": "fly:1",
          "uuid": "a98cb199-5d00-44d3-974a-dc640bedea5a",
          "src": "learners",
          "section": "alpha",
          "highlight": "yes",
          "stems": [
            "fly",
            "flied",
            "flies",
            "flying",
            "flew",
            "flown",
            "as the crow flies",
            "fly at",
            "fly high",
            "fly in the face of",
            "fly in the teeth of",
            "fly into",
            "fly off the handle",
            "fly the coop",
            "let fly",
            "let fly with",
            "went flying",
            "rumors are flying",
            "accusations are flying"
          ],
          "app-shortdef": {
            "hw": "fly:1",
            "fl": "verb",
            "def": [
              "{bc} to move through the air with wings",
              "{bc} to move through the air especially at a high speed",
              "{bc} to control an airplane, helicopter, etc., as it moves through the air {bc} to be the pilot of an aircraft"
            ]
          },
          "offensive": false
        },
        "hom": 1,
        "hwi": {
          "hw": "fly",
          "prs": [
            {
              "ipa": "ˈflaɪ",
              "sound": {
                "audio": "fly00001"
              }
            }
          ]
        },
        "fl": "verb",
        "ins": [
          {
            "if": "flies"
          },
          {
            "if": "flew",
            "prs": [
              {
                "ipa": "ˈfluː",
                "sound": {
                  "audio": "fly00002"
                }
              }
            ]
          },
          {
            "if": "flown",
            "prs": [
              {
                "ipa": "ˈfloʊn",
                "sound": {
                  "audio": "flown001"
                }
              }
            ]
          },
          {
            "if": "fly*ing"
          }
        ],
        "def": [
          {
            "sseq": [
              [
                [
                  "sense",
                  {
                    "sn": "1",
                    "sgram": "no obj",
                    "dt": [
                      [
                        "text",
                        "{bc}to move through the air with wings "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "A bird {it}flew{/it} in through the open window."
                          },
                          {
                            "t": "insects {it}flying{/it} over the water"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "2",
                    "sgram": "no obj",
                    "dt": [
                      [
                        "text",
                        "{bc}to move through the air especially at a high speed "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "We watched as clouds {it}flew{/it} across the sky."
                          },
                          {
                            "t": "Waves crashed on the rocks and spray {it}flew{/it} up into the air."
                          },
                          {
                            "t": "Bullets were {it}flying{/it} in all directions."
                          },
                          {
                            "t": "He tripped and {phrase}went flying{/phrase} (through the air)."
                          }
                        ]
                      ],
                      [
                        "uns",
                        [
                          [
                            [
                              "text",
                              "often used figuratively "
                            ],
                            [
                              "vis",
                              [
                                {
                                  "t": "{phrase}Rumors are flying{/phrase} [=there are a lot of rumors] that he'll be announcing his candidacy soon."
                                },
                                {
                                  "t": "{phrase}Accusations are flying{/phrase}. [=people are making a lot of accusations]"
                                }
                              ]
                            ]
                          ]
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "3 a",
                    "dt": [
                      [
                        "text",
                        "{bc}to control an airplane, helicopter, etc., as it moves through the air {bc}to be the pilot of an aircraft "
                      ],
                      [
                        "wsgram",
                        "+ obj"
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "{it}fly{/it} a plane"
                          },
                          {
                            "t": "He {it}flies{/it} jets."
                          }
                        ]
                      ],
                      [
                        "wsgram",
                        "no obj"
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "He learned to {it}fly{/it} while he was in the Air Force."
                          },
                          {
                            "t": "She {it}flies{/it} for a major airline."
                          },
                          {
                            "t": "She's taking {it}flying{/it} lessons."
                          }
                        ]
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "b",
                    "sgram": "+ obj",
                    "dt": [
                      [
                        "text",
                        "{bc}to journey over (something, such as an ocean) by flying an airplane "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "Charles Lindbergh was the first person to {it}fly{/it} the Atlantic solo."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "4 a",
                    "sgram": "no obj",
                    "dt": [
                      [
                        "text",
                        "{bc}to travel in an aircraft or spacecraft "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "They {it}flew{/it} to California for vacation."
                          },
                          {
                            "t": "I'm {it}flying{/it} to Canada to visit my family."
                          },
                          {
                            "t": "He insists on {it}flying{/it} first-class."
                          },
                          {
                            "t": "A doctor {it}flew{/it} in from the mainland."
                          },
                          {
                            "t": "She {it}flew{/it} on a shuttle mission last year."
                          }
                        ]
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "b",
                    "sgram": "+ obj",
                    "dt": [
                      [
                        "text",
                        "{bc}to travel by flying on (a particular airline) "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "He always {it}flies{/it} the same airline. [=he always flies on the same airline]"
                          }
                        ]
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "c",
                    "sgram": "+ obj",
                    "dt": [
                      [
                        "text",
                        "{bc}to carry (someone or something) to a place in an aircraft "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "Supplies were {it}flown{/it} to the disaster area."
                          },
                          {
                            "t": "They {it}fly{/it} cargo around the world."
                          },
                          {
                            "t": "A doctor was {it}flown{/it} in from the mainland."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "5 a",
                    "dt": [
                      [
                        "text",
                        "{bc}to show (something, such as a flag) by putting it in a high place "
                      ],
                      [
                        "wsgram",
                        "+ obj"
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "We {it}flew{/it} a banner across the entrance."
                          }
                        ]
                      ],
                      [
                        "wsgram",
                        "no obj"
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "A flag {it}flies{/it} in front of the building. = There is a flag {it}flying{/it} in front of the building."
                          }
                        ]
                      ],
                      [
                        "text",
                        "{dx}see also {it}fly the flag{/it} at {dxt|flag:1||}{/dx}"
                      ]
                    ]
                  }
                ],
                [
                  "sense",
                  {
                    "sn": "b",
                    "sgram": "+ obj",
                    "dt": [
                      [
                        "text",
                        "{bc}to cause (something, such as a kite) to fly in the air "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "Children were {it}flying{/it} kites in the park."
                          }
                        ]
                      ],
                      [
                        "text",
                        "{dx}see also {it}go fly a kite{/it} at {dxt|kite||}{/dx}"
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "6",
                    "sgram": "no obj",
                    "dt": [
                      [
                        "text",
                        "{bc}to move or go quickly "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "She {it}flew{/it} to the window when she heard the car."
                          },
                          {
                            "t": "The door {it}flew{/it} open and he rushed into the room."
                          },
                          {
                            "t": "I {it}flew{/it} up the stairs to answer the phone."
                          },
                          {
                            "t": "I must {it}fly{/it} or I'll be late for my appointment."
                          },
                          {
                            "t": "That horse really {it}flies{/it}."
                          },
                          {
                            "t": "Cars were {it}flying{/it} past us on the highway."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "7",
                    "sgram": "no obj",
                    "dt": [
                      [
                        "text",
                        "{bc}to move freely "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "As she ran, her hair {it}flew{/it} in every direction."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "8",
                    "sgram": "no obj",
                    "dt": [
                      [
                        "text",
                        "{bc}to pass very quickly "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "Time {it}flies{/it}."
                          },
                          {
                            "t": "Our vacation {it}flew{/it} by before we knew it."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "9",
                    "sgram": "no obj",
                    "sls": [
                      "chiefly US",
                      "informal"
                    ],
                    "dt": [
                      [
                        "text",
                        "{bc}to be approved or accepted"
                      ],
                      [
                        "uns",
                        [
                          [
                            [
                              "text",
                              "usually used in negative statements "
                            ],
                            [
                              "vis",
                              [
                                {
                                  "t": "This plan will never {it}fly{/it}."
                                },
                                {
                                  "t": "His budget proposals didn't {it}fly{/it} with voters. [=voters didn't like his proposals]"
                                }
                              ]
                            ]
                          ]
                        ]
                      ]
                    ]
                  }
                ]
              ]
            ]
          }
        ],
        "dros": [
          {
            "drp": "as the crow flies",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{dx}see {dxt|crow:1||}{/dx}"
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "fly at",
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sphrasev": {
                          "phrs": [
                            {
                              "pva": "fly at (someone)"
                            }
                          ]
                        },
                        "dt": [
                          [
                            "text",
                            "{bc}to attack (someone) with sudden violence "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He {it}flew at{/it} me in a rage."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "fly high",
            "def": [
              {
                "sls": [
                  "informal"
                ],
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sn": "1",
                        "dt": [
                          [
                            "text",
                            "{bc}to be very happy and excited "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "She was {it}flying high{/it} after her excellent exam results."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "2",
                        "dt": [
                          [
                            "text",
                            "{bc}to be very successful "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "After some difficult years, the company is {it}flying high{/it} again."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "fly in the face of",
            "vrs": [
              {
                "vl": "also US",
                "va": "fly in the teeth of"
              }
            ],
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{bc}to fail completely to agree with (something) {bc}to oppose or contradict (something) directly "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "His explanation {it}flies in the face of{/it} the evidence. [=his explanation is not supported at all by the evidence]"
                              },
                              {
                                "t": "a theory that {it}flies in the face of{/it} logic [=a theory that is not logical at all]"
                              },
                              {
                                "t": "a policy that {it}flies in the face of{/it} reason [=a policy that is extremely unreasonable]"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "fly into",
            "gram": "phrasal verb",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sphrasev": {
                          "phrs": [
                            {
                              "pva": "fly into (something)"
                            }
                          ]
                        },
                        "dt": [
                          [
                            "text",
                            "{bc}to be overcome by (sudden extreme emotion) "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He {it}flew into{/it} a rage. [=he suddenly became very angry]"
                              },
                              {
                                "t": "They {it}flew into{/it} a panic. [=they suddenly panicked]"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "fly off the handle",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sls": [
                          "informal"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to lose control of your emotions {bc}to become very angry "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "He tends to {it}fly off the handle{/it} when people disagree with him."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "fly the coop",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sls": [
                          "informal"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to leave suddenly or secretly {bc}to escape or go away "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "In the morning the suspect had {it}flown the coop{/it}."
                              },
                              {
                                "t": "All their children have {it}flown the coop{/it}. [=have moved away from home]"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "let fly",
            "vrs": [
              {
                "vl": "or",
                "va": "let fly with"
              }
            ],
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sls": [
                          "informal"
                        ],
                        "dt": [
                          [
                            "text",
                            "{bc}to throw (something) in a forceful way "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The quarterback {it}let fly{/it} (with) a long pass."
                              }
                            ]
                          ],
                          [
                            "uns",
                            [
                              [
                                [
                                  "text",
                                  "often used figuratively "
                                ],
                                [
                                  "vis",
                                  [
                                    {
                                      "t": "She {it}let fly{/it} (with) a few angry words. [=she shouted a few angry words]"
                                    }
                                  ]
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          }
        ],
        "dxnls": [
          "compare {dxt|fly:2||}"
        ],
        "shortdef": [
          "to move through the air with wings",
          "to move through the air especially at a high speed —often used figuratively",
          "to control an airplane, helicopter, etc., as it moves through the air : to be the pilot of an aircraft"
        ]
      },
      {
        "meta": {
          "id": "fly:2",
          "uuid": "db2cb8ed-dea7-4124-9918-cbb4b370c8b4",
          "src": "learners",
          "section": "alpha",
          "stems": [
            "fly",
            "flied",
            "flies",
            "flying"
          ],
          "app-shortdef": {
            "hw": "fly:2",
            "fl": "verb",
            "def": [
              "{it}baseball{/it} {bc} to hit a fly ball"
            ]
          },
          "offensive": false
        },
        "hom": 2,
        "hwi": {
          "hw": "fly",
          "altprs": [
            {
              "ipa": "ˈflaɪ"
            }
          ]
        },
        "fl": "verb",
        "ins": [
          {
            "if": "flies"
          },
          {
            "if": "flied"
          },
          {
            "if": "fly*ing"
          }
        ],
        "gram": "no obj",
        "def": [
          {
            "sseq": [
              [
                [
                  "sense",
                  {
                    "sls": [
                      "baseball"
                    ],
                    "dt": [
                      [
                        "text",
                        "{bc}to hit a fly ball "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "The batter {it}flied{/it} to left field."
                          },
                          {
                            "t": "He {it}flied{/it} out to left field. [=he made an out by hitting a fly ball that was caught by the left fielder]"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ]
            ]
          }
        ],
        "dxnls": [
          "compare {dxt|fly:1||}"
        ],
        "shortdef": [
          "to hit a fly ball"
        ]
      },
      {
        "meta": {
          "id": "fly:3",
          "uuid": "5a6f03e2-cf0f-4128-ae59-15580e3af62f",
          "src": "learners",
          "section": "alpha",
          "stems": [
            "fly",
            "flies",
            "fly in the ointment",
            "on the fly",
            "drop like flies",
            "die like flies",
            "fly on the wall",
            "no flies on",
            "wouldn't hurt a fly",
            "wouldnt hurt a fly",
            "dropping/dying like flies",
            "dropping like flies",
            "dying like flies",
            "there are no flies on"
          ],
          "app-shortdef": {
            "hw": "fly:3",
            "fl": "noun",
            "def": [
              "{bc} a small insect that has two wings",
              "{bc} a hook that is designed to look like an insect and that is used for catching fish"
            ]
          },
          "offensive": false
        },
        "hom": 3,
        "hwi": {
          "hw": "fly",
          "altprs": [
            {
              "ipa": "ˈflaɪ"
            }
          ]
        },
        "fl": "noun",
        "ins": [
          {
            "il": "plural",
            "if": "flies"
          }
        ],
        "gram": "count",
        "def": [
          {
            "sseq": [
              [
                [
                  "sense",
                  {
                    "sn": "1",
                    "dt": [
                      [
                        "text",
                        "{bc}a small insect that has two wings "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "swat a {it}fly{/it}"
                          },
                          {
                            "t": "the buzz of a {it}fly{/it}"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "2",
                    "dt": [
                      [
                        "text",
                        "{bc}a hook that is designed to look like an insect and that is used for catching fish "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "an artificial {it}fly{/it}"
                          }
                        ]
                      ],
                      [
                        "text",
                        "{dx}see also {dxt|fly-fishing||}{/dx}"
                      ]
                    ]
                  }
                ]
              ]
            ]
          }
        ],
        "dros": [
          {
            "drp": "drop like flies",
            "vrs": [
              {
                "vl": "also",
                "va": "die like flies"
              }
            ],
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sls": [
                          "informal"
                        ],
                        "dt": [
                          [
                            "snote",
                            [
                              [
                                "t",
                                "If people or animals are {phrase}dropping/dying like flies{/phrase}, they are dropping or dying very quickly in large numbers."
                              ],
                              [
                                "vis",
                                [
                                  {
                                    "t": "The heat was so intense that people were {it}dropping like flies{/it}. [=many people were fainting from the heat]"
                                  },
                                  {
                                    "t": "Horses and cattle {it}dropped/died like flies{/it} during the drought."
                                  }
                                ]
                              ],
                              [
                                "t",
                                "These phrases are often used figuratively."
                              ],
                              [
                                "vis",
                                [
                                  {
                                    "t": "Candidates were {it}dropping like flies{/it} during the early part of the campaign."
                                  }
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "fly in the ointment",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{bc}someone or something that causes problems "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "We're almost ready to start work. Getting the permit is the only {it}fly in the ointment{/it}."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "fly on the wall",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "text",
                            "{bc}someone who secretly watches or listens to other people "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "I would like to be a {it}fly on the wall{/it} during the negotiations. [=I would like to be able to hear what is being said during the negotiations]"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "no flies on",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sls": [
                          "chiefly British",
                          "informal"
                        ],
                        "dt": [
                          [
                            "snote",
                            [
                              [
                                "t",
                                "If {phrase}there are no flies on{/phrase} you, you are a smart person who is quick to understand things and not easily fooled."
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          },
          {
            "drp": "wouldn't hurt a fly",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "dt": [
                          [
                            "snote",
                            [
                              [
                                "t",
                                "Someone who {it}wouldn't hurt a fly{/it} is too gentle to want to hurt anyone."
                              ],
                              [
                                "vis",
                                [
                                  {
                                    "t": "He looks big and dangerous, but he {it}wouldn't hurt a fly{/it}."
                                  }
                                ]
                              ]
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          }
        ],
        "dxnls": [
          "compare {dxt|fly:4||}"
        ],
        "shortdef": [
          "a small insect that has two wings",
          "a hook that is designed to look like an insect and that is used for catching fish"
        ]
      },
      {
        "meta": {
          "id": "fly:4",
          "uuid": "3d0a40d3-f641-40e4-bded-0d8bc1f73a5e",
          "src": "learners",
          "section": "alpha",
          "stems": [
            "fly",
            "flies",
            "fly in the ointment",
            "on the fly"
          ],
          "app-shortdef": {
            "hw": "fly:4",
            "fl": "noun",
            "def": [
              "{bc} an opening in a piece of clothing (such as a pair of trousers, shorts, or a skirt) that is hidden by a fold of cloth and that is closed by a zipper or a row of buttons",
              "{it}baseball{/it}"
            ]
          },
          "offensive": false
        },
        "hom": 4,
        "hwi": {
          "hw": "fly",
          "altprs": [
            {
              "ipa": "ˈflaɪ"
            }
          ]
        },
        "fl": "noun",
        "ins": [
          {
            "il": "plural",
            "if": "flies"
          }
        ],
        "gram": "count",
        "def": [
          {
            "sseq": [
              [
                [
                  "sense",
                  {
                    "sn": "1",
                    "dt": [
                      [
                        "text",
                        "{bc}an opening in a piece of clothing (such as a pair of trousers, shorts, or a skirt) that is hidden by a fold of cloth and that is closed by a zipper or a row of buttons "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "He zipped/buttoned his {it}fly{/it}."
                          }
                        ]
                      ],
                      [
                        "uns",
                        [
                          [
                            [
                              "text",
                              "sometimes plural in British English "
                            ],
                            [
                              "vis",
                              [
                                {
                                  "t": "He zipped his {it}flies{/it}."
                                }
                              ]
                            ]
                          ]
                        ]
                      ],
                      [
                        "text",
                        ""
                      ]
                    ]
                  }
                ]
              ],
              [
                [
                  "sense",
                  {
                    "sn": "2",
                    "sls": [
                      "baseball"
                    ],
                    "dt": [
                      [
                        "text",
                        "{bc}{sx|fly ball||} "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "He hit a {it}fly{/it} to the left fielder."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ]
            ]
          }
        ],
        "dros": [
          {
            "drp": "on the fly",
            "def": [
              {
                "sseq": [
                  [
                    [
                      "sense",
                      {
                        "sn": "1",
                        "dt": [
                          [
                            "text",
                            "{bc}quickly and often without preparation "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "You'll have to make decisions {it}on the fly{/it}."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "2",
                        "dt": [
                          [
                            "text",
                            "{bc}through the air {bc}without hitting the ground "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "The home run went 450 feet {it}on the fly{/it}."
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ],
                  [
                    [
                      "sense",
                      {
                        "sn": "3",
                        "dt": [
                          [
                            "text",
                            "{bc}while something else is also being done on a computer "
                          ],
                          [
                            "vis",
                            [
                              {
                                "t": "software that handles formatting {it}on the fly{/it}"
                              }
                            ]
                          ]
                        ]
                      }
                    ]
                  ]
                ]
              }
            ]
          }
        ],
        "dxnls": [
          "compare {dxt|fly:3||}"
        ],
        "shortdef": [
          "an opening in a piece of clothing (such as a pair of trousers, shorts, or a skirt) that is hidden by a fold of cloth and that is closed by a zipper or a row of buttons —sometimes plural in British English",
          "fly ball"
        ]
      },
      {
        "meta": {
          "id": "flew",
          "uuid": "02bff79d-c511-48d4-82f2-48800e00d069",
          "src": "learners",
          "section": "alpha",
          "target": {
            "tuuid": "79770eb5-3ab1-4d6f-9684-78711bb5d4c3",
            "tsrc": "collegiate"
          },
          "stems": [
            "flew",
            "fly"
          ],
          "app-shortdef": null,
          "offensive": false
        },
        "hwi": {
          "hw": "flew"
        },
        "cxs": [
          {
            "cxl": "past tense of",
            "cxtis": [
              {
                "cxt": "fly:1"
              }
            ]
          }
        ],
        "shortdef": []
      },
      {
        "meta": {
          "id": "flown",
          "uuid": "3eb5f466-d4de-470f-9b9b-fba2119339c1",
          "src": "learners",
          "section": "alpha",
          "target": {
            "tuuid": "ed0c026b-e85b-4d30-a41f-43281850d03d",
            "tsrc": "collegiate"
          },
          "stems": [
            "flown",
            "fly"
          ],
          "app-shortdef": null,
          "offensive": false
        },
        "hwi": {
          "hw": "flown"
        },
        "cxs": [
          {
            "cxl": "past participle of",
            "cxtis": [
              {
                "cxt": "fly:1"
              }
            ]
          }
        ],
        "shortdef": []
      },
      {
        "meta": {
          "id": "fly ball",
          "uuid": "e3c81d91-1fba-4c15-a026-337accde64d5",
          "src": "learners",
          "section": "alpha",
          "target": {
            "tuuid": "e8cbb59c-9c73-4fd1-b49f-41657c8982f6",
            "tsrc": "collegiate"
          },
          "stems": [
            "fly ball",
            "fly balls"
          ],
          "app-shortdef": {
            "hw": "fly ball",
            "fl": "noun",
            "def": [
              "{it}baseball{/it} {bc} a baseball that is hit high into the air"
            ]
          },
          "offensive": false
        },
        "hwi": {
          "hw": "fly ball"
        },
        "fl": "noun",
        "ins": [
          {
            "il": "plural",
            "ifc": "~ balls",
            "if": "fly balls"
          }
        ],
        "gram": "count",
        "def": [
          {
            "sseq": [
              [
                [
                  "sense",
                  {
                    "sls": [
                      "baseball"
                    ],
                    "dt": [
                      [
                        "text",
                        "{bc}a baseball that is hit high into the air "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "He hit a long {it}fly ball{/it} to left field."
                          }
                        ]
                      ],
                      [
                        "text",
                        "{dx}compare {dxt|ground ball||}{/dx}"
                      ]
                    ]
                  }
                ]
              ]
            ]
          }
        ],
        "shortdef": [
          "a baseball that is hit high into the air"
        ]
      },
      {
        "meta": {
          "id": "fly-by-night",
          "uuid": "a66bafc4-aa31-4827-aefa-837f021e335f",
          "src": "learners",
          "section": "alpha",
          "target": {
            "tuuid": "059e170b-f378-4dd0-bef0-b82825d59fd0",
            "tsrc": "collegiate"
          },
          "stems": [
            "fly-by-night"
          ],
          "app-shortdef": {
            "hw": "fly-by-night",
            "fl": "adjective",
            "def": [
              "{it}informal{/it} {bc} trying to make money quickly by using dishonest or illegal methods"
            ]
          },
          "offensive": false
        },
        "hwi": {
          "hw": "fly-by-night",
          "prs": [
            {
              "ipa": "ˈflaɪbaɪˌnaɪt",
              "sound": {
                "audio": "fly_by01"
              }
            }
          ]
        },
        "fl": "adjective",
        "lbs": [
          "always used before a noun"
        ],
        "def": [
          {
            "sseq": [
              [
                [
                  "sense",
                  {
                    "sls": [
                      "informal"
                    ],
                    "dt": [
                      [
                        "text",
                        "{bc}trying to make money quickly by using dishonest or illegal methods "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "a {it}fly-by-night{/it} insurance company"
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ]
            ]
          }
        ],
        "shortdef": [
          "trying to make money quickly by using dishonest or illegal methods"
        ]
      },
      {
        "meta": {
          "id": "fly-fishing",
          "uuid": "7dbb85e2-c452-49f8-aaee-3fd9a6f1beb9",
          "src": "learners",
          "section": "alpha",
          "target": {
            "tuuid": "2a85cf4f-36c1-450b-9e17-ab14efb39b24",
            "tsrc": "collegiate"
          },
          "stems": [
            "fly-fishing",
            "go fly-fishing"
          ],
          "app-shortdef": {
            "hw": "fly-fishing",
            "fl": "noun",
            "def": [
              "{bc} the activity of catching fish by using artificial flies"
            ]
          },
          "offensive": false
        },
        "hwi": {
          "hw": "fly-fish*ing",
          "prs": [
            {
              "ipa": "ˈflaɪˌfɪʃɪŋ",
              "sound": {
                "audio": "fly_fi01"
              }
            }
          ]
        },
        "fl": "noun",
        "gram": "noncount",
        "def": [
          {
            "sseq": [
              [
                [
                  "sense",
                  {
                    "dt": [
                      [
                        "text",
                        "{bc}the activity of catching fish by using artificial flies "
                      ],
                      [
                        "vis",
                        [
                          {
                            "t": "do some {it}fly-fishing{/it}"
                          },
                          {
                            "t": "He plans to {phrase}go fly-fishing{/phrase} this weekend."
                          }
                        ]
                      ]
                    ]
                  }
                ]
              ]
            ]
          }
        ],
        "shortdef": [
          "the activity of catching fish by using artificial flies"
        ]
      },
      {
        "meta": {
          "id": "fly-past",
          "uuid": "77bb676a-21e7-4858-9ed2-4f7fc1a1fe64",
          "src": "learners",
          "section": "alpha",
          "stems": [
            "fly-past",
            "fly-pasts"
          ],
          "app-shortdef": {
            "hw": "fly-past",
            "fl": "noun",
            "def": [
              "{it}British{/it}"
            ]
          },
          "offensive": false
        },
        "hwi": {
          "hw": "fly-past",
          "prs": [
            {
              "ipa": "ˈflaɪˌpæst",
              "pun": ","
            },
            {
              "l": "British",
              "ipa": "ˈflaɪˌpɑːst"
            }
          ]
        },
        "fl": "noun",
        "ins": [
          {
            "il": "plural",
            "ifc": "-pasts",
            "if": "fly-pasts"
          }
        ],
        "gram": "count",
        "def": [
          {
            "sseq": [
              [
                [
                  "sense",
                  {
                    "sls": [
                      "British"
                    ],
                    "dt": [
                      [
                        "text",
                        "{bc}{sx|flyby||1}"
                      ]
                    ]
                  }
                ]
              ]
            ]
          }
        ],
        "shortdef": [
          "flyby"
        ]
      }
    ]
  ]
  return testWordArray;
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

const setupSearchWordsEvent = async () => {
    const searchWordsForm = document.querySelector("#words-search-form");
    console.log(searchWordsForm);
    searchWordsForm.addEventListener('submit', async (e) => {
        e.preventDefault();    
        const formData = new FormData(e.target);        
        const formEntries = Object.fromEntries(formData);
        const wordString = Object.values(formEntries)[0].replaceAll(', ', ',').split(',').join('+');
        console.log(wordString);
        const testingModeIsOn = document.querySelector('#test').checked; 
        
        try {
            let wordMeanings;
            if (testingModeIsOn) {
              wordMeanings = getTestWord();
            } else {
              wordMeanings = await getWordData(wordString);
            }            
            console.log(wordMeanings)
            wordMeanings.forEach((wordMeaning) => {
                const wordsInterface = constructWordsInterface(wordMeaning);
                console.log(wordsInterface);
                displayWordCard(wordsInterface);
            });
            setRowColours();
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
      const wordContainer = document.querySelector('#word-container');
      wordContainer.classList.remove('content-container');
      addHideClass(wordContainer);

      const header = document.querySelector('.header');
      header.classList.remove('header');
      addHideClass(header);
      
      const extractText = (elements) => {
        let ret = [];
        elements.forEach((t) => {
          ret.push(t.textContent);
        });
        return ret;
      };

      const titleElements = document.querySelectorAll('.title');
      const titles = extractText(titleElements);

      const wordCards = document.querySelectorAll('.word-card');
      let content = [];
      wordCards.forEach((card) => {
        const cardElements = card.querySelectorAll('.word-content');
        content.push(extractText(cardElements));
      });

      const createTable = (titles, content) => {
        const table = document.createElement('table');
        table.classList.add('print-table');

        const addRow = (stringArray, tableElement) => {
          const row = tableElement.insertRow();
          stringArray.forEach((string) => {
            const cell = row.insertCell();
            cell.innerHTML = string;
            cell.classList.add('print-cel');
          });
        };

        const tHeader = table.createTHead();
        tHeader.classList.add('header-table');
        addRow(titles, tHeader);
     
        const tBody = table.createTBody();
        tBody.classList.add('body-table');
        content.forEach((words) => {
          addRow(words, tBody);
        });

        document.body.appendChild(table);
      };
      createTable(titles, content);
      window.print();
      document.querySelector('.print-table').remove();
      
      header.classList.add('header');
      removeHideClass(header);
      wordContainer.classList.add('content-container');
      removeHideClass(wordContainer);
      

      //previous implementation
      /*
      const positionTexts = document.querySelectorAll('.position-text');
      const previousButtons = document.querySelectorAll('.previous-button');
      const nextButtons = document.querySelectorAll('.next-button');
  
      const wordContainerText = wordContainer.querySelectorAll('.print');
      const wordDividers = wordContainer.querySelectorAll('.word-container-divider');
      console.log(wordDividers);
      
      let elementArray = [];
      for (const child of pageElements.children) {
        if (child.id !== 'word-container') {
          elementArray.push(child);
          const childElements = child.querySelectorAll('*');
          elementArray = [...elementArray, ...childElements];
        } 
      }
      
      //console.log(wordContainerText);
      //console.log(elementArray);

      [positionTexts, previousButtons, nextButtons].forEach(array => {
        array.forEach(element => addHideClass(element));
      });
      wordContainerText.forEach(text => text.classList.add('buttoned-title'));
      //elementArray.forEach(element => addHideClass(element));
      
      window.print();

      [positionTexts, previousButtons, nextButtons].forEach(array => {
        array.forEach(element => removeHideClass(element));
      });
      wordContainerText.forEach(text => text.classList.remove('buttoned-title'));
      //elementArray.forEach(element => removeHideClass(element));
      */
      
    });
  }

document.addEventListener('DOMContentLoaded', () => {
    setupSearchWordsEvent();
    setupPrintButton();
});
