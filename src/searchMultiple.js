import * as DOM from './utils';
import * as parse from './parse';

export default function searchMultiple(self, searchValue) {
    self.setters.hasReplies(false);
    let replies = 0;
    let counterRowID = 0;

    self.methods.isLoading(true);
    self.options.themes.forEach((theme) => {
        const url = parse.multiSearchUrl(theme, searchValue, self.options);

        const request = DOM.get(url, (requestError, response) => {
            replies += 1;
            if (replies === self.options.themes.length) { self.methods.isLoading(false); }
            if (requestError) {
                if (response.type === 'abort') { return; }
                console.warn(response);
                return;
            }

            try {
                const data = JSON.parse(response);
                const fragment = document.createDocumentFragment();

                data.forEach((row) => {
                    const fields = parse.themes(theme, row);

                    self.setters.addMeta({ value: fields.value, uid: fields.uid, theme });
                    self.setters.addRow(row);

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

                if (!self.getters.hasReplies()) {
                    self.methods.addNewResults();
                    self.setters.hasReplies(true);
                }

                self.elements.resultList.appendChild(fragment);
            } catch (parseError) {
                console.error(parseError);
            }
        });

        self.setters.addRequest(request);
    });
}
