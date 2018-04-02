import { get } from './utils';
import { singleSearchUrl } from './parse';

export default function searchSingle(meta, information) {
    if (!this._events['search-final'].length) { return; }

    const url = singleSearchUrl(meta);
    if (!url) {
        this._events['search-final'].forEach((fn) => {
            fn({ meta, information, geometry: false });
        });

        this._methods.clearResults();
    } else {
        this._methods.isLoading(true);
        get(url, (requestError, response) => {
            this._methods.isLoading(false);
            if (requestError) {
                console.warn(response);
                return;
            }
            try {
                const geometry = JSON.parse(response);

                this._events['search-final'].forEach((fn) => {
                    fn({ meta, information, geometry });
                });

                this._methods.clearResults();
            } catch (parseError) {
                console.error(parseError);
            }
        });
    }
}
