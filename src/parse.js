import { createGeojsonPoint } from './utils';

function singleSearchUrl(searchValues) {
    if (searchValues.theme === 'vejnavne') { return false; }
    if (searchValues.theme === 'supplerendebynavne') { return false; }

    const theme = `https://dawa.aws.dk/${encodeURIComponent(searchValues.theme)}`;
    const uid = `${encodeURIComponent(searchValues.uid)}`;
    const format = '&noformat&format=geojson';

    return `${theme}/${uid}?${format}`;
}

function geometry(theme, row) {
    switch (theme) {
    case 'adgangsadresser': return false;
    case 'adresser': return false;
    case 'vejnavne': return false;
    case 'supplerendebynavne': return false;
    case 'postnumre': return false;
    case 'sogne': return false;
    case 'stednavne': return createGeojsonPoint(row, row.visueltcenter);
    case 'kommuner': return false;
    default: return false;
    }
}

function themes(theme, row) {
    switch (theme) {
    case 'adgangsadresser': return { value: row.tekst, uid: row.adgangsadresse.id };
    case 'adresser': return { value: row.tekst, uid: row.adresse.id };
    case 'vejnavne': return { value: row.tekst, uid: row.vejnavn.navn };
    case 'supplerendebynavne': return { value: row.tekst, uid: row.supplerendebynavn.navn };
    case 'postnumre': return { value: row.tekst, uid: row.postnummer.nr };
    case 'sogne': return { value: `${row.sogn.navn}, ${row.sogn.kode}`, uid: row.sogn.kode };
    case 'stednavne': return { value: (row.kommuner.length) ? `${row.navn}, ${row.kommuner[0].navn}` : row.navn, uid: row.id };
    case 'kommuner': return { value: row.tekst, uid: row.kommune.kode };
    default: return { value: 'unknown', uid: '' };
    }
}

export {
    themes,
    geometry,
    singleSearchUrl,
};
