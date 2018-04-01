import { get } from './utils';
import { singleSearchUrl } from './parse';

export default function searchSingle(self, meta, information) {
    if (!self.events['search-final'].length) { return; }
    console.log(meta);

    const url = singleSearchUrl(meta);
    if (!url) {
        self.events['search-final'].forEach((fn) => {
            fn({ meta, information, geometry: false });
        });

        self.methods.clearResults();
    } else {
        self.methods.isLoading(true);
        get(url, (requestError, response) => {
            self.methods.isLoading(false);
            if (requestError) {
                console.warn(response);
                return;
            }
            try {
                const geometry = JSON.parse(response);

                self.events['search-final'].forEach((fn) => {
                    fn({ meta, information, geometry });
                });

                self.methods.clearResults();
            } catch (parseError) {
                console.error(parseError);
            }
        });
    }
}
