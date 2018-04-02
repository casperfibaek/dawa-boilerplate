# DAWA search

## Description
```javascript
import Dawa from '../src/index';

window.dawa = new Dawa('body', {
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
});

window.dawa.on('search-preliminairy', (e) => {
    console.log(e);
});

window.dawa.on('search-final', (e) => {
    console.log(e);
});

window.dawa.on('geolocation-preliminairy', (e) => {
    console.log(e);
});

window.dawa.on('geolocation-final', (e) => {
    console.log(e);
});

```