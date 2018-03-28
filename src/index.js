import { createElement, clearChildren, capitalize, fireEvent, get, isVisible } from './utils';
import { setOptions, getOptions } from './options';
import enableKeyboardSelect from './keyboard';
import startSearch from './search';
import './css/dawa.css';

export default function dawa(options) {
    setOptions(options || {}); const opt = getOptions();

    const searchbar = createElement('div', { id: 'searchbar' });
    const wrapper = createElement('div', { class: 'wrapper' });
    const resultContainer = createElement('div', { class: 'result-container' });
    const resultList = createElement('ul', { class: 'result-list' });
    const inputContainer = createElement('div', { class: 'input-container' });
    const searchInput = createElement('input', {
        class: 'search-input',
        type: 'text',
        placeholder: 'Search places..',
        onfocus: 'this.placeholder=""',
        onblur: 'this.placeholder="Search places.."',
    });
    const geofinder = createElement('div', { class: 'geofinder' });
    const deleteText = createElement('div', { class: 'delete-text' });

    resultContainer.appendChild(resultList);
    inputContainer.appendChild(searchInput);
    inputContainer.appendChild(geofinder);
    inputContainer.appendChild(deleteText);
    wrapper.appendChild(inputContainer);
    wrapper.appendChild(resultContainer);
    searchbar.appendChild(wrapper);

    deleteText.addEventListener('click', () => {
        searchInput.value = '';
        clearChildren(resultList);
        fireEvent(searchbar, 'results-cleared');
    });

    geofinder.addEventListener('click', () => {
        navigator.geolocation.getCurrentPosition((position) => {
            const coords = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            };

            const prelimEvent = new CustomEvent('geolocation-preliminairy', {
                detail: coords,
            });

            searchbar.dispatchEvent(prelimEvent);

            if (opt.reverseGeocode) {
                const url = `https://dawa.aws.dk/adgangsadresser/reverse?x=${coords.longitude}&y=${coords.latitude}&struktur=mini`;

                get(url, (requestError, response) => {
                    if (requestError) { throw new Error(requestError); }
                    try {
                        const data = JSON.parse(response);

                        const finalEvent = new CustomEvent('geolocation-final', {
                            detail: data,
                        });

                        searchbar.dispatchEvent(finalEvent);
                    } catch (parseError) {
                        console.error(parseError);
                    }
                });
            }
        });
    });

    enableKeyboardSelect(searchbar);


    searchInput.addEventListener('input', (e) => {
        e.currentTarget.value = capitalize(e.currentTarget.value);
        const self = e.currentTarget;
        const searchValue = self.value;

        if (searchValue.length >= opt.minLength) {
            startSearch(searchValue, searchbar);
        } else {
            clearChildren(resultList);
            fireEvent(searchbar, 'results-cleared');
        }
    });

    searchInput.addEventListener('focus', (e) => {
        const self = e.currentTarget;
        const searchValue = self.value;

        if (searchValue.length >= opt.minLength && resultList.childElementCount !== 0) {
            startSearch(searchValue, searchbar);
        }
    });

    let cleared = false;
    if (opt.clickClose) {
        const outsideClickListener = (event) => {
            const removeClickListener = () => {
                document.removeEventListener('mousedown', outsideClickListener);
            };

            if (!wrapper.contains(event.target)) {
                if (isVisible(wrapper)) {
                    clearChildren(resultList);
                    removeClickListener();
                }
            }
        };

        // RESULTS CLEARED
        searchbar.addEventListener('results-cleared', () => {
            if (!cleared) {
                document.removeEventListener('mousedown', outsideClickListener);
            }
            cleared = true;
        });

        // RESULTS ADDED
        searchbar.addEventListener('results-added', () => {
            if (cleared) {
                document.addEventListener('mousedown', outsideClickListener);
            }
            cleared = false;
        });
    }

    return searchbar;
}
