class LetterView {
    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'l';
        this.element.textContent = '';
        this.content = null;
    }

    setLetter(l) {
        this.element.textContent = l;
        this.content = l.toLowerCase();
    }

    setStyle(s) {
        this.element.className = 'l ' + s;
    }

    clear() {
        this.setLetter('');
        this.setStyle('clear');
    }
}

class GuessView {
    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'g';
        this.letters = [];
        for (let i = 0; i < 5; i++) {
            this.letters.push(new LetterView());
            this.element.appendChild(this.letters[i].element)
        }

        this.idx = 0;
    }

    addLetter(l) {
        if (this.idx < 5) {
            this.letters[this.idx].setLetter(l);
            this.letters[this.idx].setStyle('letter');
            this.idx++;
        }
    }

    backspace() {
        if (this.idx > 0) {
            this.idx--;
            this.letters[this.idx].clear();
        }
    }

    reveal() {
        let used = [];
        let styles = [];
        let correct = [];

        for (let i = 0; i < 5; i++) {
            used[i] = this.letters[i].content;

            if (used[i] == word[i]) {
                correct.push(true);
                used[i] = null;
                styles.push('right');
            } else {
                correct.push(false);
                styles.push('wrong');
            }
        }

        for (let i = 0; i < 5; i++) {
            if (correct[i]) continue;

            let idx = used.indexOf(word[i]);
            if (idx !== -1) {
                used[idx] = null;
                styles[idx] = 'half';
            }
        }

        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                setTimeout(() => {
                    this.letters[i].setStyle(styles[i]);
                }, 200);
                this.letters[i].setStyle('flip');
            }, 300 * i);
        }
    }
}

let words;
let word = null;

async function amain() {
    words = (await fetch('words/list.txt').then(r => r.text()))
          .split('\n')
          .map(word => word.trim())
          .filter(word => word.length == 5);

    word = words[Math.floor(Math.random() * words.length)];
}

amain();

let guesses = [];
for (let i = 0; i < 6; i++) {
    guesses.push(new GuessView());
    document.body.appendChild(guesses[i].element);
}
let guess_index = 0;

document.onkeydown = function(e) {
    if (word === null) return;

    let key = e.key.toLowerCase();
    if (key == "backspace") {
        guesses[guess_index].backspace();
    } else if (key.length == 1 && /[a-z]/.test(key)) {
        guesses[guess_index].addLetter(key.toUpperCase());
    } else if (key == "enter" && guesses[guess_index].idx >= 5) {

        if (words.indexOf(guesses[guess_index].letters.map(l => l.content).join('')) === -1) {
            alert("That word isn't in the dictionary!");
            return;
        }

        guesses[guess_index].reveal();
        guess_index++;

        if (guess_index >= guesses.length) {
            alert('The word was: ' + word);
            document.onkeydown = null;
        }
    }
}
