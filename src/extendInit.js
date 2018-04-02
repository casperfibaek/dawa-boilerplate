import * as DOM from './utils';
import * as parse from './parse';

export default function init() {
    let currentChild = -1;

    this._elements.deleteText.addEventListener('click', () => {
        this._methods.clearResults();
    });

    this._elements.searchInput.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (!this._elements.resultList.childElementCount) { currentChild = -1; return; }

        if (e.keyCode === 38) { // up-arrow
            if (currentChild < 1) {
                currentChild = this._elements.resultList.childElementCount - 1;
            } else {
                currentChild -= 1;
            }
            this._elements.resultList.querySelectorAll('.hover').forEach(li => li.classList.remove('hover'));
            this._elements.resultList.childNodes[currentChild].classList.add('hover');
        } else if (e.keyCode === 40) { // down-arrow
            if (currentChild === -1 || currentChild >= this._elements.resultList.childElementCount - 1) {
                currentChild = 0;
            } else {
                currentChild += 1;
            }
            this._elements.resultList.querySelectorAll('.hover').forEach(li => li.classList.remove('hover'));
            this._elements.resultList.childNodes[currentChild].classList.add('hover');
        } else if (e.keyCode === 13) { // enter
            if (this._elements.resultList.querySelector('.hover')) {
                this._elements.resultList.childNodes[currentChild].click();
                this._elements.searchInput.blur();
            }
        } else if (e.keyCode === 27) { // esc
            this._methods.clearResults();
        }
    });

    this._elements.geofinder.addEventListener('click', () => {
        if (!this.events['geolocation-preliminairy'].length) { return; }

        navigator.geolocation.getCurrentPosition((position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            const geometry = DOM.createGeojsonPoint({}, [
                longitude, latitude,
            ]);

            this._events['geolocation-preliminairy'].forEach((fn) => {
                fn({ information: false, meta: false, geometry });
            });

            if (!this.options.reverseGeocode || !this._events['geolocation-final'].length) { return; }

            const url = parse.geocodeUrl(position.coords.latitude, position.coords.longitude);
            DOM.get(url, (requestError, response) => {
                if (requestError) { throw new Error(requestError); }
                try {
                    const information = JSON.parse(response);

                    const geometryWithAttributes = DOM.createGeojsonPoint(information, [
                        longitude, latitude,
                    ]);

                    this._events['geolocation-final'].forEach((fn) => {
                        fn({ information, meta: false, geometry: geometryWithAttributes });
                    });
                } catch (parseError) {
                    console.error(parseError);
                }
            });
        });
    });

    this._elements.searchInput.addEventListener('input', (e) => {
        e.stopPropagation();

        const requests = this.getters.requests();
        if (requests.length) {
            requests.forEach((request) => {
                if (request.readyState !== 4) {
                    request.abort();
                }
            });
            this.setters.clearRequests();
            this.setters.clearMeta();
            this.setters.clearRows();
        }

        const searchValue = e.currentTarget.value;

        if (this._methods.inputAboveMinimum()) {
            this._methods.searchMultiple.call(this, searchValue);
        } else if (this._elements.resultList.childElementCount) {
            this._methods.clearResults();
        }
    });

    this._elements.searchbar.addEventListener('click', (e) => {
        if (!this._events['search-preliminairy'].length) { return; }
        if (e.target && e.target.nodeName === 'LI') {
            const rowID = Number(e.target.getAttribute('counterRowID'));
            const meta = this.getters.singleMeta(rowID);
            const information = this.getters.singleRow(rowID);
            const geometry = parse.geometry(meta.theme, information);

            this._events['search-preliminairy'].forEach((fn) => {
                fn({ meta, information, geometry });
            });

            this._methods.searchSingle.call(this, meta, information);
        }
    });

    this._elements.searchInput.addEventListener('focus', (e) => {
        e.stopPropagation();
        const hidden = this.getters.resultsHidden();
        if (hidden) {
            this._methods.showResults();
        }
    });
}
