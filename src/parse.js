import { createGeojsonPoint } from './utils';

function singleSearchUrl(meta) {
    if (
        meta.theme === 'vejnavne' ||
        meta.theme === 'supplerendebynavne' ||
        meta.theme === 'ejerlav') {
        return false;
    }
    return `https://dawa.aws.dk/${meta.theme}/${meta.uid}?&noformat&format=geojson`;
}

function geocodeUrl(latitude, longitude) {
    return `https://dawa.aws.dk/adgangsadresser/reverse?x=${latitude}&y=${longitude}&struktur=mini`;
}

function multiSearchUrl(theme, searchValue, options) {
    return `https://dawa.aws.dk/${theme}/autocomplete?q=${searchValue}&noformat&per_side=${options.maxResults}${(options.fuzzy) ? '&fuzzy' : ''}`;
}

function geometry(theme, row) {
    if (theme === 'stednavne') {
        return createGeojsonPoint(row, row.visueltcenter);
    }
    return false;
}

function themes(theme, row) {
    switch (theme) {
    case 'adresser': return { value: row.tekst, uid: row.adresse.id, url: row.adresse.href };
    case 'adgangsadresser': return { value: row.tekst, uid: row.adgangsadresse.id, url: row.adgangsadresse.href };
    case 'vejnavne': return { value: row.tekst, uid: row.vejnavn.navn, url: row.vejnavn.href };
    case 'vejstykker': return { value: row.tekst, uid: `${row.vejstykke.kommunekode}/${row.vejstykke.kode}`, url: row.vejstykke.href };
    case 'supplerendebynavne': return { value: row.tekst, uid: row.supplerendebynavn.navn, url: row.supplerendebynavn.href };
    case 'postnumre': return { value: row.tekst, uid: row.postnummer.nr, url: row.postnummer.href };
    case 'sogne': return { value: `${row.sogn.navn} (${row.sogn.kode})`, uid: row.sogn.kode, url: row.sogn.href };
    case 'kommuner': return { value: row.tekst, uid: row.kommune.kode, url: row.kommune.href };
    case 'regioner': return { value: row.tekst, uid: row.region.kode, url: row.regioner.href };
    case 'storkredse': return { value: row.tekst, uid: row.storkreds.kode, url: row.storkreds.href };
    case 'retskredse': return { value: row.tekst, uid: row.retskreds.kode, url: row.retskreds.href };
    case 'opstillingskredse': return { value: row.tekst, uid: row.opstillingskreds.kode, url: row.opstillingskreds.href };
    case 'politikredse': return { value: row.tekst, uid: row.politikreds.kode, url: row.politikreds.href };
    case 'ejerlav': return { value: `${row.ejerlav.navn} (${row.ejerlav.kode})`, uid: row.ejerlav.kode, url: row.ejerlav.href };
    case 'stednavne': return { value: (row.kommuner.length) ? `${row.navn}, ${row.kommuner[0].navn} (${row.undertype})` : row.navn, uid: row.id, url: row.href };
    default: return { value: 'unknown', uid: '' };
    }
}

export {
    themes,
    geometry,
    singleSearchUrl,
    multiSearchUrl,
    geocodeUrl,
};
