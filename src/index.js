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

    this.state = {
        hasReplies: false,
        resultsHidden: false,
        requests: [],
        rows: [],
        meta: [],
    };

    this.events = {
        'search-preliminairy': [],
        'search-final': [],
        'geolocation-preliminairy': [],
        'geolocation-final': [],
    };

    this.getters = {
        singleRow(num) { return self.state.rows[num]; },
        singleMeta(num) { return self.state.meta[num]; },
        hasReplies() { return self.state.hasReplies; },
        resultsHidden() { return self.state.resultsHidden; },
        requests() { return self.state.requests; },
        rows() { return self.state.rows; },
        meta() { return self.state.meta; },
    };

    this.setters = {
        hasReplies(bool) { self.state.hasReplies = bool; },
        toggleResults(bool) { self.state.resultsHidden = bool; },
        addRequest(obj) { self.state.requests.push(obj); },
        addRow(obj) { self.state.rows.push(obj); },
        addMeta(obj) { self.state.meta.push(obj); },
        clearRequests() { self.state.requests = []; },
        clearRows() { self.state.rows = []; },
        clearMeta() { self.state.meta = []; },
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

    const _hoverClear = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.target && e.target.nodeName === 'LI') {
            this.elements.resultList.querySelectorAll('.hover').forEach((li) => {
                li.classList.remove('hover');
            });
        }
    };

    const _hideResultsOnClick = (e) => {
        const isClickInside = this.elements.wrapper.contains(e.target);
        if (!isClickInside) {
            this.methods.hideResults();
            this.setters.toggleResults(true);
        }
    };

    this.methods = {
        isLoading: (bool) => {
            if (bool) {
                this.elements.deleteText.classList.add('spinner');
            } else {
                this.elements.deleteText.classList.remove('spinner');
            }
        },
        inputAboveMinimum: () => this.elements.searchInput.value.length >= this.options.minLength,
        clearResults: () => {
            if (this.methods.inputAboveMinimum()) { this.elements.searchInput.value = ''; }
            this.elements.resultList.removeEventListener('mouseover', _hoverClear);
            DOM.clearChildren(this.elements.resultList);
            this.setters.hasReplies(false);
            if (this.options.clickClose) {
                document.body.removeEventListener('click', _hideResultsOnClick);
            }
        },
        addNewResults: () => {
            if (!this.methods.inputAboveMinimum()) { this.elements.searchInput.value = ''; }
            this.elements.resultList.addEventListener('mouseover', _hoverClear);
            DOM.clearChildren(this.elements.resultList);
            this.setters.hasReplies(false);
            if (this.options.clickClose) {
                document.body.addEventListener('click', _hideResultsOnClick);
            }
        },
        showResults: () => {
            this.elements.resultList.style.display = 'block';
            this.setters.toggleResults(true);
        },
        hideResults() {
            this.elements.resultList.style.display = 'none';
            this.setters.toggleResults(false);
        },
    };

    this.on = (type, fn) => {
        if (!this.events[type] || !fn) {
            console.warn('Event type not available on object or no function specified');
        } else {
            let alreadyExists = false;
            for (let i = 0; i < this.events[type].length; i += 1) {
                const event = this.events[type][i];
                if (fn === event) {
                    alreadyExists = true;
                    break;
                }
            }

            if (alreadyExists) {
                console.warn('Function already added to eventlistener');
            } else {
                this.events[type].push(fn);
            }
        }

        return this;
    };

    this.off = (type, fn) => {
        if (!fn && !type) {
            console.warn('No function or type specified');
        } else if (!fn && this.events[type]) {
            this.events[type] = [];
        } else if (fn && this.events[type]) {
            let found = false;
            for (let i = 0; i < this.events[type].length; i += 1) {
                if (fn === this.events[type][i]) {
                    this.events[type].splice(i, 1);
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

    this.methods.searchMultiple = extendSearchMultiple;
    this.methods.searchSingle = extendSearchSingle;
    this.methods.init = extendInit;

    this.methods.init.call(this);
    document.querySelector(parent).appendChild(this.elements.searchbar);
}

export default Dawa;
