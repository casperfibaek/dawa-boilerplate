import * as DOM from './utils';
import { setOptions, getOptions } from './options';
// import leafletIntegration from './leafletIntergration';
import enableKeyboardSelect from './keyboard';
import attachButtons from './buttons';
import searchFieldInit from './search';
import './css/dawa.css';

// export default function dawa(options, map, style) {
export default function dawa(options) {
    setOptions(options || {}); const opt = getOptions();

    const searchbar = DOM.createElement('div', { id: 'searchbar' });
    const wrapper = DOM.createElement('div', { class: 'wrapper' });
    const resultContainer = DOM.createElement('div', { class: 'result-container' });
    const resultList = DOM.createElement('ul', { class: 'result-list' });
    const inputContainer = DOM.createElement('div', { class: 'input-container' });
    const searchInput = DOM.createElement('input', {
        class: 'search-input',
        type: 'text',
        placeholder: 'Search places..',
        onfocus: 'this.placeholder=""',
        onblur: 'this.placeholder="Search places.."',
    });
    const geofinder = DOM.createElement('div', { class: 'geofinder' });
    const deleteText = DOM.createElement('div', { class: 'delete-text' });

    resultContainer.appendChild(resultList);
    inputContainer.appendChild(searchInput);
    inputContainer.appendChild(geofinder);
    inputContainer.appendChild(deleteText);
    wrapper.appendChild(inputContainer);
    wrapper.appendChild(resultContainer);
    searchbar.appendChild(wrapper);

    attachButtons(searchbar, searchInput, resultList, deleteText, geofinder);
    enableKeyboardSelect(searchbar);
    searchFieldInit(searchbar, searchInput, resultList);

    let cleared = false;
    if (opt.clickClose) {
        const outsideClickListener = (event) => {
            const removeClickListener = () => {
                document.removeEventListener('mousedown', outsideClickListener);
            };

            if (!wrapper.contains(event.target)) {
                if (DOM.isVisible(wrapper)) {
                    DOM.clearChildren(resultList);
                    DOM.fireEvent(searchbar, 'results-cleared');
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
