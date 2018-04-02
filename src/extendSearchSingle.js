import { get } from './utils';
import { singleSearchUrl } from './parse';

export default function searchSingle(meta, information) {
    if (!this.events['search-final'].length) { return; }

    const url = singleSearchUrl(meta);
    if (!url) {
        this.events['search-final'].forEach((fn) => {
            fn({ meta, information, geometry: false });
        });

        this.methods.clearResults();
    } else {
        this.methods.isLoading(true);
        get(url, (requestError, response) => {
            this.methods.isLoading(false);
            if (requestError) {
                console.warn(response);
                return;
            }
            try {
                const geometry = JSON.parse(response);

                this.events['search-final'].forEach((fn) => {
                    fn({ meta, information, geometry });
                });

                this.methods.clearResults();
            } catch (parseError) {
                console.error(parseError);
            }
        });
    }
}
