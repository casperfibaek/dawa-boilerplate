import * as DOM from './utils';
import * as parse from './parse';
import { getOptions } from './options';
import searchSingle from './searchSingle';

let options;
let counterRowID = 0;
let booleanHasReplies = false;
let currentRequests = [];
let currentRows = [];
let currentMeta = [];

function startSearch(searchbar, resultList, searchValue, addNewResults) {
    booleanHasReplies = false;

    options.themes.forEach((theme) => {
        const url = `https://dawa.aws.dk/${encodeURIComponent(theme)}/autocomplete?q=${encodeURIComponent(searchValue)}&noformat&per_side=${options.maxResults}${(options.fuzzy) ? '&fuzzy' : ''}`;

        const request = DOM.get(url, (requestError, response) => {
            if (requestError) { throw new Error(response); }

            try {
                const data = JSON.parse(response);
                const fragment = document.createDocumentFragment();

                data.forEach((row) => {
                    const fields = parse.themes(theme, row);

                    currentMeta.push({
                        value: fields.value,
                        uid: fields.uid,
                        theme,
                    });
                    currentRows.push(row);

                    const result = DOM.createElement('li', {
                        value: fields.value,
                        uid: fields.uid,
                        counterRowID,
                        theme,
                        class: 'result',
                    });
                    const resultThemeIcon = DOM.createElement('div', { class: `theme-${theme}` });
                    const resultText = DOM.createElement('span');
                    resultText.innerText = fields.value;

                    result.appendChild(resultThemeIcon);
                    result.appendChild(resultText);

                    counterRowID += 1;
                    fragment.appendChild(result);
                });

                if (!booleanHasReplies) {
                    addNewResults();
                    booleanHasReplies = true;
                }

                resultList.appendChild(fragment);
            } catch (parseError) {
                console.error(parseError);
            }
        });

        currentRequests.push(request);
    });
}

function searchFieldInit(searchbar, searchInput, resultList, clearResults, addNewResults) {
    options = getOptions();
    const localStartSearch = startSearch;

    searchbar.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.target && e.target.nodeName === 'LI') {
            const id = e.target.getAttribute('counterRowID');
            const meta = currentMeta[id];
            const row = currentRows[id];

            const event = new CustomEvent('preliminairy', {
                detail: {
                    meta,
                    information: row,
                    geometry: parse.geometry(meta.theme, row),
                },
            });
            event.detail.theme = meta.theme;
            searchbar.dispatchEvent(event);

            searchSingle(searchbar, meta, currentRows[counterRowID], clearResults);
        }
    });

    ['input', 'focus'].forEach((type) => {
        searchInput.addEventListener(type, (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (currentRequests.length || currentRows.length) {
                currentRequests.forEach((request) => {
                    if (request.readyState !== 4) {
                        request.abort();
                    }
                });
                currentRequests = [];
                currentMeta = [];
                currentRows = [];
                counterRowID = 0;
            }

            const self = e.currentTarget;
            const searchValue = self.value;

            if (searchValue.length >= options.minLength) {
                localStartSearch(searchbar, resultList, searchValue, addNewResults);
            } else if (resultList.childElementCount) {
                clearResults();
            }
        });
    });
}

export default searchFieldInit;
