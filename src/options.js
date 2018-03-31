const options = {};

const defaults = {
    minLength: 3,
    maxResults: 3,
    multiLine: false,
    clickClose: true,
    reverseGeocode: true,
    fuzzy: true,
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
};

function setOptions(_options) {
    Object.keys(_options).forEach((key) => {
        if (!options[key]) { options[key] = _options[key]; }
    });

    Object.keys(defaults).forEach((key) => {
        if (!options[key]) { options[key] = defaults[key]; }
    });
}

function getOptions() { return options; }

export {
    setOptions,
    getOptions,
};
