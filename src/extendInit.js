import * as DOM from './utils';
import * as parse from './parse';

export default function init() {
    let currentChild = -1;

    this.elements.deleteText.addEventListener('click', () => {
        this.methods.clearResults();
    });

    this.elements.searchInput.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (!this.elements.resultList.childElementCount) { currentChild = -1; return; }

        if (e.keyCode === 38) { // up-arrow
            if (currentChild < 1) {
                currentChild = this.elements.resultList.childElementCount - 1;
            } else {
                currentChild -= 1;
            }
            this.elements.resultList.querySelectorAll('.hover').forEach(li => li.classList.remove('hover'));
            this.elements.resultList.childNodes[currentChild].classList.add('hover');
        } else if (e.keyCode === 40) { // down-arrow
            if (currentChild === -1 || currentChild >= this.elements.resultList.childElementCount - 1) {
                currentChild = 0;
            } else {
                currentChild += 1;
            }
            this.elements.resultList.querySelectorAll('.hover').forEach(li => li.classList.remove('hover'));
            this.elements.resultList.childNodes[currentChild].classList.add('hover');
        } else if (e.keyCode === 13) { // enter
            if (this.elements.resultList.querySelector('.hover')) {
                this.elements.resultList.childNodes[currentChild].click();
                this.elements.searchInput.blur();
            }
        } else if (e.keyCode === 27) { // esc
            this.methods.clearResults();
        }
    });

    this.elements.geofinder.addEventListener('click', () => {
        if (!this.events['geolocation-preliminairy'].length) { return; }

        navigator.geolocation.getCurrentPosition((position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            const geometry = DOM.createGeojsonPoint({}, [
                longitude, latitude,
            ]);

            this.events['geolocation-preliminairy'].forEach((fn) => {
                fn({ information: false, geometry });
            });

            if (!this.options.reverseGeocode || !this.events['geolocation-final'].length) { return; }

            const url = parse.geocodeUrl(position.coords.latitude, position.coords.longitude);
            DOM.get(url, (requestError, response) => {
                if (requestError) { throw new Error(requestError); }
                try {
                    const information = JSON.parse(response);

                    const geometryWithAttributes = DOM.createGeojsonPoint(information, [
                        longitude, latitude,
                    ]);

                    this.events['geolocation-final'].forEach((fn) => {
                        fn({ information, geometry: geometryWithAttributes });
                    });
                } catch (parseError) {
                    console.error(parseError);
                }
            });
        });
    });

    this.elements.searchInput.addEventListener('input', (e) => {
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

        if (this.methods.inputAboveMinimum()) {
            this.methods.searchMultiple.call(this, searchValue);
        } else if (this.elements.resultList.childElementCount) {
            this.methods.clearResults();
        }
    });

    this.elements.searchbar.addEventListener('click', (e) => {
        if (!this.events['search-preliminairy'].length) { return; }
        if (e.target && e.target.nodeName === 'LI') {
            const rowID = Number(e.target.getAttribute('counterRowID'));
            const meta = this.getters.singleMeta(rowID);
            const information = this.getters.singleRow(rowID);
            const geometry = parse.geometry(meta.theme, information);

            this.events['search-preliminairy'].forEach((fn) => {
                fn({ meta, information, geometry });
            });

            this.methods.searchSingle.call(this, meta, information);
        }
    });

    this.elements.searchInput.addEventListener('focus', (e) => {
        e.stopPropagation();
        const hidden = this.getters.resultsHidden();
        if (hidden) {
            this.methods.showResults();
        }
    });
}
