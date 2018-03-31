import * as DOM from './utils';
import * as parse from './parse';
import searchSingle from './searchSingle';

function startSearch(self, searchValue) {
    self.options.themes.forEach((theme) => {
        const url = `https://dawa.aws.dk/${encodeURIComponent(theme)}/autocomplete?q=${encodeURIComponent(searchValue)}&noformat&per_side=${self.options.maxResults}${(self.options.fuzzy) ? '&fuzzy' : ''}`;

        const request = DOM.get(url, (requestError, response) => {
            if (requestError) { throw new Error(response); }

            try {
                const data = JSON.parse(response);
                const fragment = document.createDocumentFragment();

                data.forEach((row) => {
                    const fields = parse.themes(theme, row);

                    self.state.currentMeta.push({
                        value: fields.value,
                        uid: fields.uid,
                        theme,
                    });
                    self.state.currentRows.push(row);

                    const result = DOM.createElement('li', {
                        value: fields.value,
                        uid: fields.uid,
                        counterRowID: self.state.counterRowID,
                        theme,
                        class: 'result',
                    });
                    const resultThemeIcon = DOM.createElement('div', { class: `theme-${theme}` });
                    const resultText = DOM.createElement('span');
                    resultText.innerText = fields.value;

                    result.appendChild(resultThemeIcon);
                    result.appendChild(resultText);

                    self.state.counterRowID += 1;
                    fragment.appendChild(result);
                });

                if (!self.state.booleanHasReplies) {
                    self.addNewResults();
                    self.state.booleanHasReplies = true;
                }

                self.elements.resultList.appendChild(fragment);
            } catch (parseError) {
                console.error(parseError);
            }
        });

        self.state.currentRequests.push(request);
    });
}

function searchFieldInit(self) {
    self.elements.searchbar.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.target && e.target.nodeName === 'LI') {
            const rowID = e.target.getAttribute('counterRowID');
            const meta = self.state.currentMeta[rowID];
            const row = self.state.currentRows[rowID];

            const event = new CustomEvent('preliminairy', {
                detail: {
                    meta,
                    information: row,
                    geometry: parse.geometry(meta.theme, row),
                },
            });
            event.detail.theme = meta.theme;
            self.elements.searchbar.dispatchEvent(event);

            searchSingle(self, meta, self.getRow[rowID]);
        }
    });

    ['input', 'focus'].forEach((type) => {
        self.elements.searchInput.addEventListener(type, (e) => {
            e.preventDefault();
            e.stopPropagation();

            console.log('focus should not clear, only hide/unhide');

            if (self.state.currentRequests.length || self.state.currentRows.length) {
                self.state.currentRequests.forEach((request) => {
                    if (request.readyState !== 4) {
                        request.abort();
                    }
                });
                self.state.currentRequests = [];
                self.state.currentMeta = [];
                self.state.currentRows = [];
                self.state.counterRowID = 0;
            }

            const searchValue = e.currentTarget.value;

            if (self.inputAboveMinimum()) {
                startSearch(self, searchValue);
            } else if (self.elements.resultList.childElementCount) {
                self.clearResults();
            }
        });
    });
}

export default searchFieldInit;
