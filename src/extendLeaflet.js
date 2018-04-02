export default function addLeaflet() {
    const leaflet = window.L;
    const map = this._map;
    if (!leaflet || map || !this.options.leaflet) { return; }

    const searchResultLayers = leaflet.layerGroup().addTo(map);
    const style = (this.options.mapStyle) ? this.options.mapStyle : {
        pointStyle: {
            radius: 6,
            color: '#f77542',
            weight: 3,
            opacity: 1,
            fill: true,
            fillColor: '#fff',
            fillOpacity: 0,
        },
        polyStyle: {
            color: '#28d3d6',
            weight: 2,
            opacity: 1,
            fill: true,
            fillColor: '#31adaf',
            fillOpacity: 0.3,
        },
    };

    let preliminairyGeometry = false;

    function prelim(e) {
        if (e.geometry) {
            preliminairyGeometry = true;
            const geom = leaflet.geoJSON(e.geometry);
            map.flyToBounds(geom.getBounds(), { maxZoom: 12 });
        } else {
            preliminairyGeometry = false;
        }
    }

    this.on('search-final', (e) => {
        if (e.geometry) {
            const attributes = style.polyStyle;
            attributes.pointToLayer = function pointToLayer(point, latlng) {
                return leaflet.circleMarker(latlng, style.pointStyle);
            };
            const geom = leaflet.geoJSON(e.geometry, attributes);

            if (!preliminairyGeometry) {
                map.flyToBounds(geom.getBounds(), { maxZoom: 12 });
                map.once('zoomend', () => {
                    searchResultLayers.clearLayers();
                    searchResultLayers.addLayer(geom.bindTooltip(e.meta.value));
                });
            } else {
                searchResultLayers.clearLayers();
                searchResultLayers.addLayer(geom.bindTooltip(e.meta.value));
            }
        }
    });

    this.on('geolocation-final', (e) => {
        if (e.geometry) {
            const geom = leaflet.geoJSON(e.geometry, {
                pointToLayer(point, latlng) {
                    return leaflet.circleMarker(latlng, style.pointStyle);
                },
            });
            searchResultLayers.clearLayers();
            searchResultLayers.addLayer(geom.bindTooltip(e.meta.value));
        }
    });

    this.on('search-preliminairy', e => prelim(e));
    this.on('search-geolocation', e => prelim(e));
}
