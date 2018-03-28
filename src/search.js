import { createElement, clearChildren, fireEvent, get } from './utils';
import { getOptions } from './options';
import { parseThemes, preliminairyToGeometry } from './parse';
import searchSingle from './searchSingle';

let options;
let themes;
let maxResults;
let globalIteration = 0;
let replies = 0;

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

    for (let i = 0; i < data.length; i += 1) {
        const row = data[i];
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

        result.addEventListener('click', searchSingleDelegate({
            value: fields.value,
            uid: fields.uid,
            theme,
        }, row, searchbar));

        fragment.appendChild(result);
    }

    replies += 1;
    if (replies === 1) {
        clearChildren(resultList);
        fireEvent(searchbar, 'results-added');
    }

    resultList.appendChild(fragment);
}

function startSearch(searchValue, searchbar) {
    options = getOptions();
    themes = options.themes;
    maxResults = options.maxResults;
    globalIteration += 1;
    replies = 0;

    const searchInput = searchbar.querySelector('.search-input');
    const resultList = searchbar.querySelector('.result-list');
    const thisIteration = globalIteration;

    themes.forEach((theme) => {
        const url = autocompleteURL(theme, searchValue);
        const request = get(url, (requestError, response) => {
            if (requestError) { throw new Error(response); }
            if (thisIteration !== globalIteration) { return; }

            try {
                const data = JSON.parse(response);
                handleData(data, theme, resultList, searchbar);
            } catch (parseError) {
                console.error(parseError);
            }
        });

        searchInput.addEventListener('input', () => {
            request.abort();
        }, { once: true });
    });
}

export default startSearch;
