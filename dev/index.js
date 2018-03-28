import dawa from '../src/index';

window.onload = function init() {
    const searchbar = dawa({
        minLength: 3,
        maxResults: 3,
        themes: [
            // 'adresser',
            'stednavne',
            'adgangsadresser',
            // 'vejnavne',
            // 'supplerendebynavne',
            'postnumre',
            'kommuner',
            'sogne',
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
};
