import dawa from '../src/index';

window.onload = function init() {
    window.dawa = dawa({
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
    document.body.appendChild(window.dawa);

    window.dawa.addEventListener('final', (e) => {
        console.log(e);
    });

    window.dawa.addEventListener('preliminairy', (e) => {
        console.log(e);
    });

    window.dawa.addEventListener('geolocation-preliminairy', (e) => {
        console.log(e);
    });

    window.dawa.addEventListener('geolocation-final', (e) => {
        console.log(e);
    });
};
