import { setupWordsSearch } from './setup/setupWordSearch/setupWordsSearch.js';
import { setupPrintButton } from './setup/setupPrintButton.js';

document.addEventListener('DOMContentLoaded', () => {
    setupWordsSearch();
    setupPrintButton();
});
