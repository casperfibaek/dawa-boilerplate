import * as DOM from './utils';
import * as parse from './parse';

export default function searchMultiple(searchValue) {
    this.setters.hasReplies(false);
    let replies = 0;
    let counterRowID = 0;

    this._methods.isLoading(true);
    this.options.themes.forEach((theme) => {
        const autocompleteURL = parse.multiSearchUrl(theme, searchValue, this.options);

        const request = DOM.get(autocompleteURL, (requestError, response) => {
            replies += 1;
            if (replies === this.options.themes.length) { this._methods.isLoading(false); }
            if (requestError) {
                if (response.type === 'abort') { return; }
                console.warn(response);
                return;
            }

            try {
                const data = JSON.parse(response);
                const fragment = document.createDocumentFragment();

                data.forEach((row) => {
                    const parsed = parse.themes(theme, row);
                    const uid = parsed.uid;
                    const value = parsed.value;
                    const url = parsed.url;

                    this.setters.addMeta({
                        value, uid, theme, autocompleteURL, url,
                    });
                    this.setters.addRow(row);

                    const result = DOM.createElement('li', {
                        value, uid, counterRowID, theme, class: 'result',
                    });
                    const resultThemeIcon = DOM.createElement('div', { class: `theme-${theme}` });
                    const resultText = DOM.createElement('span');
                    resultText.innerText = value;

                    result.appendChild(resultThemeIcon);
                    result.appendChild(resultText);

                    counterRowID += 1;
                    fragment.appendChild(result);
                });

                if (!this.getters.hasReplies()) {
                    this._methods.addNewResults();
                    this.setters.hasReplies(true);
                }

                this._elements.resultList.appendChild(fragment);
            } catch (parseError) {
                console.error(parseError);
            }
        });

        this.setters.addRequest(request);
    });
}
