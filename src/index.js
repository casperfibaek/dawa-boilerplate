import { createElement, clearChildren, fireEvent, get, isVisible, createGeojsonPoint } from './utils';
import { setOptions, getOptions } from './options';
// import leafletIntegration from './leafletIntergration';
import enableKeyboardSelect from './keyboard';
import searchFieldInit from './search';
import './css/dawa.css';

// export default function dawa(options, map, style) {
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

    deleteText.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        searchInput.value = '';
        clearChildren(resultList);
        fireEvent(searchbar, 'results-cleared');
    });

    geofinder.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.geolocation.getCurrentPosition((position) => {
            const geometry = createGeojsonPoint({}, [
                position.coords.longitude,
                position.coords.latitude,
            ]);

            const prelimEvent = new CustomEvent('geolocation-preliminairy', {
                detail: {
                    information: false,
                    geometry,
                },
            });

            searchbar.dispatchEvent(prelimEvent);

            if (opt.reverseGeocode) {
                const url = `https://dawa.aws.dk/adgangsadresser/reverse?x=${position.coords.latitude}&y=${position.coords.longitude}&struktur=mini`;

                get(url, (requestError, response) => {
                    if (requestError) { throw new Error(requestError); }
                    try {
                        const data = JSON.parse(response);

                        const geometryWithAttributes = createGeojsonPoint(data, [
                            position.coords.longitude,
                            position.coords.latitude,
                        ]);

                        const finalEvent = new CustomEvent('geolocation-final', {
                            detail: {
                                geometry: geometryWithAttributes,
                                information: data,
                            },
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
    searchFieldInit(searchbar, searchInput, resultList, opt);

    let cleared = false;
    if (opt.clickClose) {
        const outsideClickListener = (event) => {
            const removeClickListener = () => {
                document.removeEventListener('mousedown', outsideClickListener);
            };

            if (!wrapper.contains(event.target)) {
                if (isVisible(wrapper)) {
                    clearChildren(resultList);
                    fireEvent(searchbar, 'results-cleared');
                    removeClickListener();
                }
            }
        };

        // RESULTS CLEARED
        searchbar.addEventListener('results-cleared', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!cleared) {
                document.removeEventListener('mousedown', outsideClickListener);
            }
            cleared = true;
        });

        // RESULTS ADDED
        searchbar.addEventListener('results-added', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (cleared) {
                document.addEventListener('mousedown', outsideClickListener);
            }
            cleared = false;
        });
    }

    // if (map) {
    //     leafletIntegration(searchbar, map, (style) || false);
    // }

    return searchbar;
}
