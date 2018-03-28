function singleURL(searchValues) {
    if (searchValues.theme === 'vejnavne') { return false; }
    if (searchValues.theme === 'supplerendebynavne') { return false; }

    const theme = `https://dawa.aws.dk/${encodeURIComponent(searchValues.theme)}`;
    const uid = `${encodeURIComponent(searchValues.uid)}`;
    const format = '&noformat&format=geojson';

    return `${theme}/${uid}?${format}`;
}

function parseThemes(theme, row) {
    let value;
    let uid;

    switch (theme) {
    case 'adgangsadresser':
        value = row.tekst;
        uid = row.adgangsadresse.id;
        break;
    case 'adresser':
        value = row.tekst;
        uid = row.adresse.id;
        break;
    case 'vejnavne':
        value = row.tekst;
        uid = row.vejnavn.navn;
        break;
    case 'supplerendebynavne':
        value = row.tekst;
        uid = row.supplerendebynavn.navn;
        break;
    case 'postnumre':
        value = row.tekst;
        uid = row.postnummer.nr;
        break;
    case 'sogne':
        value = `${row.sogn.navn}, ${row.sogn.kode}`;
        uid = row.sogn.kode;
        break;
    case 'stednavne':
        value = row.navn;
        uid = row.id;
        if (row.kommuner.length > 0) { value += `, ${row.kommuner[0].navn}`; }
        break;
    case 'kommuner':
        value = row.tekst;
        uid = row.kommune.kode;
        break;
    default:
        value = 'unknown';
        uid = -1;
        break;
    }

    return { value, uid };
}

export {
    parseThemes,
    singleURL,
};