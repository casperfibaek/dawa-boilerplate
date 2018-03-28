import { clearChildren, clearClass, fireEvent } from './utils';

export default function keyboardSelect(searchbar) {
    const resultList = searchbar.querySelector('.result-list');
    const searchInput = searchbar.querySelector('.search-input');
    let currentChild = false;

    searchInput.addEventListener('keydown', (e) => {
        if (resultList.childElementCount > 0) {
            // up-arrow
            if (e.keyCode === 38) {
                if (currentChild === 0 || currentChild === false) {
                    currentChild = resultList.childElementCount - 1;
                } else {
                    currentChild -= 1;
                }
                clearClass(resultList, 'hover');
                resultList.childNodes[currentChild].classList.add('hover');

                // down-arrow
            } else if (e.keyCode === 40) {
                if (currentChild === false || currentChild >= resultList.childElementCount - 1) {
                    currentChild = 0;
                } else {
                    currentChild += 1;
                }
                clearClass(resultList, 'hover');
                resultList.childNodes[currentChild].classList.add('hover');

                // enter
            } else if (e.keyCode === 13) {
                if (resultList.childElementCount === 0) { return; }
                if (resultList.querySelector('.hover')) {
                    resultList.childNodes[currentChild].click();
                }

                // esc
            } else if (e.keyCode === 27) {
                searchInput.value = '';
                clearChildren(resultList);
                fireEvent(searchbar, 'results-cleared');
            }
        } else {
            currentChild = false;
        }
    });

    resultList.addEventListener('mouseover', () => {
        clearClass(resultList, 'hover');
    });
}
