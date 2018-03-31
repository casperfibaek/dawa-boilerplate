export default function keyboardSelect(self) {
    let currentChild = 'off';

    self.elements.searchInput.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (!self.elements.resultList.childElementCount) { currentChild = 'off'; return; }

        if (e.keyCode === 38) { // up-arrow
            if (currentChild === 0 || currentChild === 'off') {
                currentChild = self.elements.resultList.childElementCount - 1;
            } else {
                currentChild -= 1;
            }
            self.elements.resultList.querySelectorAll('.hover').forEach(li => li.classList.remove('hover'));
            self.elements.resultList.childNodes[currentChild].classList.add('hover');
        } else if (e.keyCode === 40) { // down-arrow
            if (currentChild === 'off' || currentChild >= self.elements.resultList.childElementCount - 1) {
                currentChild = 0;
            } else {
                currentChild += 1;
            }
            self.elements.resultList.querySelectorAll('.hover').forEach(li => li.classList.remove('hover'));
            self.elements.resultList.childNodes[currentChild].classList.add('hover');
        } else if (e.keyCode === 13) { // enter
            if (self.elements.resultList.querySelector('.hover')) {
                self.elements.resultList.childNodes[currentChild].click();
            }
        } else if (e.keyCode === 27) { // esc
            self.clearResults();
        }
    });
}
