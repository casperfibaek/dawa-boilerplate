# DAWA search boilerplate

## Description
import dawa from './src/dawa';

```javascript
const searchbar = dawa({
    minLength: 3,           // default = 3
    maxResults: 3,          // default = 3
    multiLine: false,       // default = false
    clickClose: true,       // default = true
    reverseGeocode: true,   // default = true
    themes: [
        // 'adresser',              // default = off
        'stednavne',                // default = on
        'adgangsadresser',          // default = on
        // 'vejnavne',              // default = off
        // 'supplerendebynavne',    // default = off
        'postnumre',                // default = on
        'kommuner',                 // default = on
        'sogne',                    // default = on
    ],
});
document.body.appendChild(searchbar);

searchbar.addEventListener('final', (e) => {
    console.log(e);
});

searchbar.addEventListener('preliminairy', (e) => {
    console.log(e);
});

searchbar.addEventListener('geolocation-preliminairy', (e) => {
    console.log(e);
});

searchbar.addEventListener('geolocation-final', (e) => {
    console.log(e);
});
```