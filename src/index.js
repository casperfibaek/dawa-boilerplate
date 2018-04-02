import * as DOM from './utils';
import extendSearchMultiple from './extendSearchMultiple';
import extendSearchSingle from './extendSearchSingle';
import extendInit from './extendInit';
import './css/dawa.css';

function Dawa(parent, options) {
    const self = this;
    this.options = {
        minLength: 3,
        maxResults: 3,
        clickClose: true,
        reverseGeocode: true,
        fuzzy: true,
        themes: [
            // 'adresser',
            'adgangsadresser',
            // 'vejnavne',
            // 'vejstykker',
            'supplerendebynavne',
            'postnumre',
            'sogne',
            'kommuner',
            'regioner',
            // 'storkredse',
            // 'retskredse',
            // 'opstillingskredse',
            // 'politikredse',
            // 'ejerlav',
            'stednavne',
        ],
    };

    Object.keys(options).forEach((key) => {
        if (self.options[key]) { self.options[key] = options[key]; }
    });

    this._state = {
        hasReplies: false,
        resultsHidden: false,
        requests: [],
        rows: [],
        meta: [],
    };

    this._events = {
        'search-preliminairy': [],
        'search-final': [],
        'geolocation-preliminairy': [],
        'geolocation-final': [],
    };

    this._elements = {
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

    this._elements.resultContainer.appendChild(this._elements.resultList);
    this._elements.inputContainer.appendChild(this._elements.searchInput);
    this._elements.inputContainer.appendChild(this._elements.geofinder);
    this._elements.inputContainer.appendChild(this._elements.deleteText);
    this._elements.wrapper.appendChild(this._elements.inputContainer);
    this._elements.wrapper.appendChild(this._elements.resultContainer);
    this._elements.searchbar.appendChild(this._elements.wrapper);

    this.getters = {
        singleRow(num) { return self._state.rows[num]; },
        singleMeta(num) { return self._state.meta[num]; },
        hasReplies() { return self._state.hasReplies; },
        resultsHidden() { return self._state.resultsHidden; },
        requests() { return self._state.requests; },
        rows() { return self._state.rows; },
        meta() { return self._state.meta; },
    };

    this.setters = {
        hasReplies(bool) { self._state.hasReplies = bool; },
        toggleResults(bool) { self._state.resultsHidden = bool; },
        addRequest(obj) { self._state.requests.push(obj); },
        addRow(obj) { self._state.rows.push(obj); },
        addMeta(obj) { self._state.meta.push(obj); },
        clearRequests() { self._state.requests = []; },
        clearRows() { self._state.rows = []; },
        clearMeta() { self._state.meta = []; },
    };

    const _hoverClear = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.target && e.target.nodeName === 'LI') {
            this._elements.resultList.querySelectorAll('.hover').forEach((li) => {
                li.classList.remove('hover');
            });
        }
    };

    const _hideResultsOnClick = (e) => {
        const isClickInside = this._elements.wrapper.contains(e.target);
        if (!isClickInside) {
            this._methods.hideResults();
            this.setters.toggleResults(true);
        }
    };

    this._methods = {
        isLoading: (bool) => {
            if (bool) {
                this._elements.deleteText.classList.add('spinner');
            } else {
                this._elements.deleteText.classList.remove('spinner');
            }
        },
        inputAboveMinimum: () => this._elements.searchInput.value.length >= this.options.minLength,
        clearResults: () => {
            if (this._methods.inputAboveMinimum()) { this._elements.searchInput.value = ''; }
            this._elements.resultList.removeEventListener('mouseover', _hoverClear);
            DOM.clearChildren(this._elements.resultList);
            this.setters.hasReplies(false);
            if (this.options.clickClose) {
                document.body.removeEventListener('click', _hideResultsOnClick);
            }
        },
        addNewResults: () => {
            if (!this._methods.inputAboveMinimum()) { this._elements.searchInput.value = ''; }
            this._elements.resultList.addEventListener('mouseover', _hoverClear);
            DOM.clearChildren(this._elements.resultList);
            this.setters.hasReplies(false);
            if (this.options.clickClose) {
                document.body.addEventListener('click', _hideResultsOnClick);
            }
        },
        showResults: () => {
            this._elements.resultList.style.display = 'block';
            this.setters.toggleResults(true);
        },
        hideResults() {
            this._elements.resultList.style.display = 'none';
            this.setters.toggleResults(false);
        },
    };

    this.on = (type, fn) => {
        if (!this._events[type] || !fn) {
            console.warn('Event type not available on object or no function specified');
        } else {
            let alreadyExists = false;
            for (let i = 0; i < this._events[type].length; i += 1) {
                const event = this._events[type][i];
                if (fn === event) {
                    alreadyExists = true;
                    break;
                }
            }

            if (alreadyExists) {
                console.warn('Function already added to eventlistener');
            } else {
                this._events[type].push(fn);
            }
        }

        return this;
    };

    this.off = (type, fn) => {
        if (!fn && !type) {
            console.warn('No function or type specified');
        } else if (!fn && this._events[type]) {
            this._events[type] = [];
        } else if (fn && this.events[type]) {
            let found = false;
            for (let i = 0; i < this._events[type].length; i += 1) {
                if (fn === this._events[type][i]) {
                    this._events[type].splice(i, 1);
                    found = true;
                    break;
                }
            }

            if (!found) {
                console.warn('The function was not found');
            }
        }
        return this;
    };

    this._methods.searchMultiple = extendSearchMultiple;
    this._methods.searchSingle = extendSearchSingle;
    this._methods.init = extendInit;

    this._methods.init.call(this);
    document.querySelector(parent).appendChild(this._elements.searchbar);
}

export default Dawa;
