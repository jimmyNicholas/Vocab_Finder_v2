import { addHideClass, removeHideClass } from "../helpers/domHelpers.js";
import { ensureArray } from "../helpers/utils.js";

const addRow = (stringArray, tableElement) => {
  const row = tableElement.insertRow();
  stringArray.forEach((string) => {
    const cell = row.insertCell();
    cell.innerHTML = string;
    cell.classList.add('print-cel');
  });
};

const createTable = (titles, content) => {
  const table = document.createElement('table');
  table.classList.add('print-table');

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

const extractText = (elements) => {
  let ret = [];
  elements.forEach((t) => {
    ret.push(t.textContent);
  });
  return ret;
};

const getElementObj = (selector) => {
  const element = document.querySelector(selector);
  const classes = element.classList.value.split(' '); 
  return {
    element: document.querySelector(selector),
    classes,
    addClasses: function() {
      const array = ensureArray(this.classes);
      array.forEach((item) => { this.element.classList.add(item)});
    },
    removeClasses: function() {
      const array = ensureArray(this.classes);
      array.forEach((item) => { this.element.classList.remove(item)});
    },
  }
};

const setupPrintButton = () => {
    const printWords = document.querySelector('#print-word-container');
    printWords.addEventListener('click', () => {

      // save and remove classes page elements and add hide 
      const elementsToHide = ['.header', '#word-container'];
      const elementObjects = elementsToHide.map(getElementObj);
      elementObjects.forEach((obj) => {
        obj.removeClasses();
        addHideClass(obj.element);
      });

      // extract the column titles
      const titleElements = document.querySelectorAll('.title');
      const titles = extractText(titleElements);

      // extract content without the interface
      const wordCards = document.querySelectorAll('.word-card');
      let content = [];
      wordCards.forEach((card) => {
        const cardElements = card.querySelectorAll('.word-content');
        content.push(extractText(cardElements));
      });
      
      createTable(titles, content);
      window.print();
      document.querySelector('.print-table').remove();
      
      // return the classes to their earlier state
      elementObjects.forEach((obj) => {
        obj.addClasses();
        removeHideClass(obj.element);
      });      
    });
  }

export {
    setupPrintButton,
}