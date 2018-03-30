import { createElement, clearChildren, fireEvent, get } from './utils';
import { getOptions } from './options';
import { parseThemes, preliminairyToGeometry } from './parse';
import searchSingle from './searchSingle';

let options;
let themes;
let maxResults;
let globalIteration = 0;
let replies = 0;
let currentRequests = [];

function autocompleteURL(theme, searchValue) {
    return `https://dawa.aws.dk/${encodeURIComponent(theme)}/autocomplete?` +
    `q=${encodeURIComponent(searchValue)}` +
    '&noformat' +
    `&per_side=${maxResults}` +
    '&fuzzy';
}

function searchSingleDelegate(searchValues, row, searchbar) {
    return function internalDelegate() {
        const event = new CustomEvent('preliminairy', {
            detail: {
                information: row,
                geometry: preliminairyToGeometry(searchValues.theme, row),
            },
        });
        event.detail.theme = searchValues.theme;
        searchbar.dispatchEvent(event);

        searchSingle(searchValues, row, searchbar);
    };
}

function handleData(data, theme, resultList, searchbar) {
    const fragment = document.createDocumentFragment();

    data.forEach((row) => {
        const fields = parseThemes(theme, row);

        const result = createElement('li', {
            value: fields.value,
            uid: fields.uid,
            theme,
            class: 'result',
        });
        const resultThemeIcon = createElement('div', { class: `theme-${theme}` });
        const resultText = createElement('span');
        resultText.innerText = fields.value;

        result.appendChild(resultThemeIcon);
        result.appendChild(resultText);

        console.log('move eventlistener up, use delegation and stop propagation');
        result.addEventListener('click', searchSingleDelegate({
            value: fields.value,
            uid: fields.uid,
            theme,
        }, row, searchbar));

        fragment.appendChild(result);
    });

    replies += 1;
    if (replies === 1) {
        clearChildren(resultList);
        fireEvent(searchbar, 'results-added');
    }

    resultList.appendChild(fragment);
}

function startSearch(searchbar, resultList, searchValue) {
    themes = options.themes;
    maxResults = options.maxResults;
    globalIteration += 1;
    replies = 0;

    const localHandleData = handleData;
    const thisIteration = globalIteration;

    themes.forEach((theme) => {
        const url = autocompleteURL(theme, searchValue);
        const request = get(url, (requestError, response) => {
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
    // const localSingleSearch = searchSingleDelegate;

    searchbar.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.target && e.target.nodeName === 'LI') {
            const value = e.target.getAttribute('value');
            const uid = e.target.getAttribute('uid');
            const theme = e.target.getAttribute('theme');
            console.log(value, uid, theme, 'clicked');
            // searchSingleDelegate
        }
    });

    ['input', 'focus'].forEach((type) => {
        searchInput.addEventListener(type, (e) => {
            e.preventDefault();
            e.stopPropagation();

            currentRequests.forEach((request) => {
                if (request.readyState !== 4) {
                    request.abort();
                }
            });

            currentRequests = [];

            const self = e.currentTarget;
            const searchValue = self.value;

            if (searchValue.length >= options.minLength) {
                localStartSearch(searchbar, resultList, searchValue);
            } else {
                clearChildren(resultList);
                fireEvent(searchbar, 'results-cleared');
            }
        });
    });
}

export default searchFieldInit;
