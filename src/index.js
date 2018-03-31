import * as DOM from './utils';
import { setOptions, getOptions } from './options';
// // import leafletIntegration from './leafletIntergration';
import enableKeyboardSelect from './keyboard';
import geofinderButton from './geofinderButton';
import searchFieldInit from './search';
import './css/dawa.css';

/*
<div id="searchbar">
    <div class="wrapper">
        <div class="input-container">
            <div class="geofinder"></div>
            <input class="search-input"></input>
            <div class="delete-text"></div>
        </div>
        <div class="result-container">
            <ul class="result-list">
                <li class="result">...</li>
                <li class="result">...</li>
                        ...
            </ul>
        </div>
    </div>
</div>
*/

function Dawa(options) {
    setOptions(options || {});
    this.options = getOptions();
    this.state = {
        counterRowID: 0,
        booleanHasReplies: false,
        currentRequests: [],
        currentRows: [],
        currentMeta: [],
    };
    this.getRow = function getRow(num) {
        return this.state.currentRows[num];
    };
    this.elements = {
        searchbar: DOM.createElement('div', { id: 'searchbar' }),
        wrapper: DOM.createElement('div', { class: 'wrapper' }),
        resultContainer: DOM.createElement('div', { class: 'result-container' }),
        resultList: DOM.createElement('ul', { class: 'result-list' }),
        inputContainer: DOM.createElement('div', { class: 'input-container' }),
        searchInput: DOM.createElement('input', {
            class: 'search-input',
            type: 'text',
            placeholder: 'Search places..',
            onfocus: 'this.placeholder=""',
            onblur: 'this.placeholder="Search places.."',
        }),
        geofinder: DOM.createElement('div', { class: 'geofinder' }),
        deleteText: DOM.createElement('div', { class: 'delete-text' }),
    };

    this.elements.resultContainer.appendChild(this.elements.resultList);
    this.elements.inputContainer.appendChild(this.elements.searchInput);
    this.elements.inputContainer.appendChild(this.elements.geofinder);
    this.elements.inputContainer.appendChild(this.elements.deleteText);
    this.elements.wrapper.appendChild(this.elements.inputContainer);
    this.elements.wrapper.appendChild(this.elements.resultContainer);
    this.elements.searchbar.appendChild(this.elements.wrapper);

    this.inputAboveMinimum = function inputAboveMinimum() {
        return this.elements.searchInput.value.length >= this.options.minLength;
    };

    this.clearResults = function clearResults() {
        if (this.inputAboveMinimum()) { this.elements.searchInput.value = ''; }
        DOM.clearChildren(this.elements.resultList);
        this.state.booleanHasReplies = false;
        console.log('cleared');
    };

    this.addNewResults = function addNewResults() {
        if (!this.inputAboveMinimum()) { this.elements.searchInput.value = ''; }
        DOM.clearChildren(this.elements.resultList);
        this.state.booleanHasReplies = false;
        console.log('added');
    };

    this.elements.deleteText.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.clearResults();
    });

    this.elements.resultList.addEventListener('mouseover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('this should only be enabled when open');
        if (e.target && e.target.nodeName === 'LI') {
            this.elements.resultList.querySelectorAll('.hover').forEach((li) => {
                li.classList.remove('hover');
            });
        }
    });

    geofinderButton(this);
    enableKeyboardSelect(this);
    searchFieldInit(this);

    this.addTo = function addTo(element) {
        element.appendChild(this.elements.searchbar);
    };

    // if (map) {
    //     leafletIntegration(searchbar, map, (style) || false);
    // }
}

export default Dawa;
