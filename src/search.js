import * as DOM from './utils';
import { getOptions } from './options';
import { parseThemes, preliminairyToGeometry } from './parse';
import searchSingle from './searchSingle';

let options;
let globalIteration = 0;
let replies = 0;
let currentRequests = [];
let rowID = 0;
let currentRows = [];

function autocompleteURL(theme, searchValue) {
    return `https://dawa.aws.dk/${encodeURIComponent(theme)}/autocomplete?` +
    `q=${encodeURIComponent(searchValue)}` +
    '&noformat' +
    `&per_side=${options.maxResults}` +
    '&fuzzy';
}

function handleData(data, theme, resultList, searchbar) {
    const fragment = document.createDocumentFragment();

    data.forEach((row) => {
        const fields = parseThemes(theme, row);

        row.value = fields.value;   // eslint-disable-line
        row.uid = fields.uid;       // eslint-disable-line
        row.theme = theme;          // eslint-disable-line

        currentRows.push(row);

        const result = DOM.createElement('li', {
            value: fields.value,
            uid: fields.uid,
            rowID,
            theme,
            class: 'result',
        });
        const resultThemeIcon = DOM.createElement('div', { class: `theme-${theme}` });
        const resultText = DOM.createElement('span');
        resultText.innerText = fields.value;

        result.appendChild(resultThemeIcon);
        result.appendChild(resultText);

        rowID += 1;
        fragment.appendChild(result);
    });

    replies += 1;
    if (replies === 1) {
        DOM.clearChildren(resultList);
        DOM.fireEvent(searchbar, 'results-added');
    }

    resultList.appendChild(fragment);
}

function startSearch(searchbar, resultList, searchValue) {
    globalIteration += 1;
    replies = 0;

    const localHandleData = handleData;
    const thisIteration = globalIteration;

    options.themes.forEach((theme) => {
        const url = autocompleteURL(theme, searchValue);
        const request = DOM.get(url, (requestError, response) => {
            if (requestError) { throw new Error(response); }
            if (thisIteration !== globalIteration) { return; }

            try {
                const data = JSON.parse(response);
                localHandleData(data, theme, resultList, searchbar);
            } catch (parseError) {
                console.error(parseError);
            }
        });

        currentRequests.push(request);
    });
}

function searchFieldInit(searchbar, searchInput, resultList) {
    options = getOptions();
    const localStartSearch = startSearch;

    searchbar.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.target && e.target.nodeName === 'LI') {
            const row = currentRows[e.target.getAttribute('rowID')];
            const { value, uid, theme } = row;

            const event = new CustomEvent('preliminairy', {
                detail: {
                    information: row,
                    geometry: preliminairyToGeometry(theme, row),
                },
            });
            event.detail.theme = theme;
            searchbar.dispatchEvent(event);

            searchSingle({ value, uid, theme }, currentRows[rowID], searchbar);
        }
    });

    ['input', 'focus'].forEach((type) => {
        searchInput.addEventListener(type, (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (currentRequests.length > 0 || currentRows.length > 0) {
                currentRequests.forEach((request) => {
                    if (request.readyState !== 4) {
                        request.abort();
                    }
                });
                currentRequests = [];
                currentRows = [];
                rowID = 0;
            }

            const self = e.currentTarget;
            const searchValue = self.value;

            if (searchValue.length >= options.minLength) {
                localStartSearch(searchbar, resultList, searchValue);
            } else {
                DOM.clearChildren(resultList);
                DOM.fireEvent(searchbar, 'results-cleared');
            }
        });
    });
}

export default searchFieldInit;
