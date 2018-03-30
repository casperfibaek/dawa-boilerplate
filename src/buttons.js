import * as DOM from './utils';
import { getOptions } from './options';

export default function attachButtons(searchbar, searchInput, resultList, deleteText, geofinder) {
    deleteText.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        searchInput.value = ''; // eslint-disable-line
        DOM.clearChildren(resultList);
        DOM.fireEvent(searchbar, 'results-cleared');
    });

    geofinder.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.geolocation.getCurrentPosition((position) => {
            const geometry = DOM.createGeojsonPoint({}, [
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

            if (getOptions().reverseGeocode) {
                const url = `https://dawa.aws.dk/adgangsadresser/reverse?x=${position.coords.latitude}&y=${position.coords.longitude}&struktur=mini`;

                DOM.get(url, (requestError, response) => {
                    if (requestError) { throw new Error(requestError); }
                    try {
                        const data = JSON.parse(response);

                        const geometryWithAttributes = DOM.createGeojsonPoint(data, [
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
}
