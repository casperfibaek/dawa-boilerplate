import * as DOM from './utils';
import init from './init';
import './css/dawa.css';

function Dawa(element, options) {
    const self = this;
    this.options = {
        minLength: 3,
        maxResults: 3,
        clickClose: true,
        reverseGeocode: true,
        fuzzy: true,
        themes: [
            'adresser',
            'adgangsadresser',
            'vejnavne',
            'vejstykker',
            'supplerendebynavne',
            'postnumre',
            'sogne',
            'kommuner',
            'regioner',
            'storkredse',
            'retskredse',
            'opstillingskredse',
            'politikredse',
            'ejerlav',
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

    function _hoverClear(e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.target && e.target.nodeName === 'LI') {
            self.elements.resultList.querySelectorAll('.hover').forEach((li) => {
                li.classList.remove('hover');
            });
        }
    }

    function _hideResultsOnClick(e) {
        const isClickInside = self.elements.wrapper.contains(e.target);
        if (!isClickInside) {
            self.methods.hideResults();
            self.setters.toggleResults(true);
        }
    }

    this.methods = {
        inputAboveMinimum() {
            return self.elements.searchInput.value.length >= self.options.minLength;
        },
        isLoading(bool) {
            if (bool) {
                self.elements.deleteText.classList.add('spinner');
            } else {
                self.elements.deleteText.classList.remove('spinner');
            }
        },
        clearResults() {
            if (self.methods.inputAboveMinimum()) { self.elements.searchInput.value = ''; }
            self.elements.resultList.removeEventListener('mouseover', _hoverClear);
            DOM.clearChildren(self.elements.resultList);
            self.setters.hasReplies(false);
            if (self.options.clickClose) {
                document.body.removeEventListener('click', _hideResultsOnClick);
            }
        },
        addNewResults() {
            if (!self.methods.inputAboveMinimum()) { self.elements.searchInput.value = ''; }
            self.elements.resultList.addEventListener('mouseover', _hoverClear);
            DOM.clearChildren(self.elements.resultList);
            self.setters.hasReplies(false);
            if (self.options.clickClose) {
                document.body.addEventListener('click', _hideResultsOnClick);
            }
        },
        showResults() {
            self.elements.resultList.style.display = 'block';
            self.setters.toggleResults(true);
        },
        hideResults() {
            self.elements.resultList.style.display = 'none';
            self.setters.toggleResults(false);
        },
    };

    this.on = function on(type, fn) {
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

    this.off = function on(type, fn) {
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

    init(this);
    element.appendChild(this.elements.searchbar);
}

export default Dawa;
