import { clearChildren, fireEvent, get } from './utils';
import { singleURL } from './parse';

function sendEvent(geometry, information, searchValues, searchbar) {
    const resultList = searchbar.querySelector('.result-list');
    const event = new CustomEvent('final', {
        detail: { geometry, information },
    });

    event.detail.information.theme = searchValues.theme;

    clearChildren(resultList);
    fireEvent(searchbar, 'results-cleared');
    searchbar.dispatchEvent(event);
}

export default function searchSingle(searchValues, row, searchbar) {
    const url = singleURL(searchValues);
    if (!url) {
        sendEvent(false, row, searchValues, searchbar);
        return;
    }

    const spinner = searchbar.querySelector('.delete-text');
    spinner.classList.add('spinner');

    get(url, (requestError, response) => {
        spinner.classList.remove('spinner');
        if (requestError) { throw new Error(requestError); }
        try {
            const data = JSON.parse(response);
            sendEvent(data, row, searchValues, searchbar);
        } catch (parseError) {
            console.error(parseError);
        }
    });
}
