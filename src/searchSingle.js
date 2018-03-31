import { get } from './utils';
import { singleSearchUrl } from './parse';

function sendEvent(searchbar, meta, geometry, information, clearResults) {
    const event = new CustomEvent('final', {
        detail: { geometry, information },
    });

    clearResults();
    searchbar.dispatchEvent(event);
}

export default function searchSingle(searchbar, meta, row, clearResults) {
    const url = singleSearchUrl(meta);
    if (!url) { sendEvent(searchbar, meta, false, row, clearResults); return; }

    const spinner = searchbar.querySelector('.delete-text');
    spinner.classList.add('spinner');

    console.log('remove this call to the DOM');

    get(url, (requestError, response) => {
        spinner.classList.remove('spinner');
        if (requestError) { throw new Error(requestError); }
        try {
            const geometry = JSON.parse(response);
            sendEvent(searchbar, meta, geometry, row, clearResults);
        } catch (parseError) {
            console.error(parseError);
        }
    });
}
