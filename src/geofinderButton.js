import * as DOM from './utils';
import { getOptions } from './options';

export default function geofinderButton(searchbar, searchInput, resultList, geofinder) {
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

            if (!getOptions().reverseGeocode) { return; }
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
        });
    });
}
