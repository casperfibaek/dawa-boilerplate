import { get } from './utils';
import { singleSearchUrl } from './parse';

export default function searchSingle(self, meta, row) {
    const information = row;
    let geometry = false;
    const url = singleSearchUrl(meta);
    if (!url) {
        const event = new CustomEvent('final', {
            detail: { geometry, information },
        });

        self.clearResults();
        self.elements.searchbar.dispatchEvent(event);
    } else {
        self.elements.deleteText.classList.add('spinner');
        get(url, (requestError, response) => {
            self.elements.deleteText.classList.remove('spinner');
            if (requestError) { throw new Error(requestError); }
            try {
                geometry = JSON.parse(response);
                const event = new CustomEvent('final', {
                    detail: { geometry, information },
                });

                self.clearResults();
                self.elements.searchbar.dispatchEvent(event);
            } catch (parseError) {
                console.error(parseError);
            }
        });
    }
}
