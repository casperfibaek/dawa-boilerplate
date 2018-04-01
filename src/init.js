import * as DOM from './utils';
import * as parse from './parse';
import searchSingle from './searchSingle';
import searchMultiple from './searchMultiple';

export default function init(self) {
    let currentChild = -1;

    self.elements.deleteText.addEventListener('click', () => {
        self.methods.clearResults();
    });

    self.elements.searchInput.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (!self.elements.resultList.childElementCount) { currentChild = -1; return; }

        if (e.keyCode === 38) { // up-arrow
            if (currentChild < 1) {
                currentChild = self.elements.resultList.childElementCount - 1;
            } else {
                currentChild -= 1;
            }
            self.elements.resultList.querySelectorAll('.hover').forEach(li => li.classList.remove('hover'));
            self.elements.resultList.childNodes[currentChild].classList.add('hover');
        } else if (e.keyCode === 40) { // down-arrow
            if (currentChild === -1 || currentChild >= self.elements.resultList.childElementCount - 1) {
                currentChild = 0;
            } else {
                currentChild += 1;
            }
            self.elements.resultList.querySelectorAll('.hover').forEach(li => li.classList.remove('hover'));
            self.elements.resultList.childNodes[currentChild].classList.add('hover');
        } else if (e.keyCode === 13) { // enter
            if (self.elements.resultList.querySelector('.hover')) {
                self.elements.resultList.childNodes[currentChild].click();
                self.elements.searchInput.blur();
            }
        } else if (e.keyCode === 27) { // esc
            self.methods.clearResults();
        }
    });

    self.elements.geofinder.addEventListener('click', () => {
        if (!self.events['geolocation-preliminairy'].length) { return; }

        navigator.geolocation.getCurrentPosition((position) => {
            const geometry = DOM.createGeojsonPoint({}, [
                position.coords.longitude,
                position.coords.latitude,
            ]);

            self.events['geolocation-preliminairy'].forEach((fn) => {
                fn({ information: false, geometry });
            });

            if (!self.options.reverseGeocode && !self.events['geolocation-final'].length) { return; }

            const url = parse.geocodeUrl(position.coords.latitude, position.coords.longitude);
            DOM.get(url, (requestError, response) => {
                if (requestError) { throw new Error(requestError); }
                try {
                    const information = JSON.parse(response);

                    const geometryWithAttributes = DOM.createGeojsonPoint(information, [
                        position.coords.longitude,
                        position.coords.latitude,
                    ]);

                    self.events['geolocation-final'].forEach((fn) => {
                        fn({ information, geometry: geometryWithAttributes });
                    });
                } catch (parseError) {
                    console.error(parseError);
                }
            });
        });
    });

    self.elements.searchInput.addEventListener('input', (e) => {
        e.stopPropagation();

        const requests = self.getters.requests();
        if (requests.length) {
            requests.forEach((request) => {
                if (request.readyState !== 4) {
                    request.abort();
                }
            });
            self.setters.clearRequests();
            self.setters.clearMeta();
            self.setters.clearRows();
        }

        const searchValue = e.currentTarget.value;

        if (self.methods.inputAboveMinimum()) {
            searchMultiple(self, searchValue);
        } else if (self.elements.resultList.childElementCount) {
            self.methods.clearResults();
        }
    });

    self.elements.searchbar.addEventListener('click', (e) => {
        if (!self.events['search-preliminairy'].length) { return; }
        if (e.target && e.target.nodeName === 'LI') {
            const rowID = Number(e.target.getAttribute('counterRowID'));
            const meta = self.getters.singleMeta(rowID);
            const information = self.getters.singleRow(rowID);
            const geometry = parse.geometry(meta.theme, information);

            self.events['search-preliminairy'].forEach((fn) => {
                fn({ meta, information, geometry });
            });

            searchSingle(self, meta, information);
        }
    });

    self.elements.searchInput.addEventListener('focus', (e) => {
        e.stopPropagation();
        const hidden = self.getters.resultsHidden();
        if (hidden) {
            self.methods.showResults();
        }
    });
}
