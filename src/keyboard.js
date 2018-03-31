export default function keyboardSelect(searchbar, searchInput, resultList, clearResults) {
    let currentChild = 'off';

    searchInput.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (!resultList.childElementCount) { currentChild = 'off'; return; }

        if (e.keyCode === 38) { // up-arrow
            if (currentChild === 0 || currentChild === 'off') {
                currentChild = resultList.childElementCount - 1;
            } else {
                currentChild -= 1;
            }
            resultList.querySelectorAll('.hover').forEach(li => li.classList.remove('hover'));
            resultList.childNodes[currentChild].classList.add('hover');
        } else if (e.keyCode === 40) { // down-arrow
            if (currentChild === 'off' || currentChild >= resultList.childElementCount - 1) {
                currentChild = 0;
            } else {
                currentChild += 1;
            }
            resultList.querySelectorAll('.hover').forEach(li => li.classList.remove('hover'));
            resultList.childNodes[currentChild].classList.add('hover');
        } else if (e.keyCode === 13) { // enter
            if (resultList.querySelector('.hover')) {
                resultList.childNodes[currentChild].click();
            }
        } else if (e.keyCode === 27) { // esc
            clearResults();
        }
    });
}
