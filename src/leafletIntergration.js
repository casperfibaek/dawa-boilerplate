import { geoJSON, circleMarker, layerGroup } from 'leaflet';

export default function leafletIntegration(searchbar, mapObject, style) {
    let appliedStyle;

    if (!style) {
        appliedStyle = {
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
    } else {
        appliedStyle = style;
    }

    const searchResultLayers = layerGroup().addTo(mapObject);

    let preliminairyGeometry = false;
    searchbar.addEventListener('final', (e) => {
        if (e.detail.geometry) {
            const attributes = appliedStyle.polyStyle;
            attributes.pointToLayer = function pointToLayer(point, latlng) {
                return circleMarker(latlng, appliedStyle.pointStyle);
            };
            const geom = geoJSON(e.detail.geometry, attributes);
            if (!preliminairyGeometry) {
                mapObject.flyToBounds(geom.getBounds(), { maxZoom: 12 });
                mapObject.once('zoomend', () => {
                    searchResultLayers.clearLayers();
                    searchResultLayers.addLayer(geom.bindTooltip(e.detail.information.value));
                });
            } else {
                searchResultLayers.clearLayers();
                searchResultLayers.addLayer(geom.bindTooltip(e.detail.information.value));
            }
        }
    });

    searchbar.addEventListener('geolocation-final', (e) => {
        if (e.detail.geometry) {
            const geom = geoJSON(e.detail.geometry, {
                pointToLayer(point, latlng) {
                    return circleMarker(latlng, appliedStyle.pointStyle);
                },
            });
            searchResultLayers.clearLayers();
            searchResultLayers.addLayer(geom.bindTooltip(e.detail.information.value));
        }
    });

    function prelim(e) {
        if (e.detail.geometry) {
            preliminairyGeometry = true;
            const geom = geoJSON(e.detail.geometry);
            mapObject.flyToBounds(geom.getBounds(), { maxZoom: 12 });
        } else {
            preliminairyGeometry = false;
        }
    }

    searchbar.addEventListener('preliminairy', (e) => {
        prelim(e);
    });

    searchbar.addEventListener('geolocation-preliminairy', (e) => {
        prelim(e);
    });
}
