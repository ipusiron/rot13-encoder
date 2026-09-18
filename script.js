const COPY_LABEL = 'コピー';

class ROT13Encoder {
    constructor() {
        this.copyTimer = null;
        this.statusTimer = null;
        this.init();
    }

    createTable() {
        const elements = {
            upper: document.getElementById('upper-grid'),
            lower: document.getElementById('lower-grid')
        };
        const table = Rot13.buildTable();

        for (let i = 0; i < 26; i++) {
            this.createCharacterCells(i, elements, table);
        }
    }

    createCharacterCells(index, elements, table) {
        for (const [kind, prefix] of [['upper', 'u'], ['lower', 'l']]) {
            const [plain, cipher] = table[kind][index];
            const column = document.createElement('div');
            column.className = 'cipher-col';
            column.setAttribute('role', 'listitem');
            column.setAttribute('aria-label', `${plain}は${cipher}になる`);
            this.createCell(column, plain, 'cipher-cell plain', `${prefix}p-${plain}`);
            this.createCell(column, cipher, 'cipher-cell cipher', `${prefix}c-${plain}`);
            elements[kind].appendChild(column);
        }
    }

    createCell(parent, content, className, id) {
        const cell = document.createElement('div');
        cell.className = className;
        cell.textContent = content;
        cell.id = id;
        cell.setAttribute('aria-hidden', 'true');
        parent.appendChild(cell);
    }

    highlightChars(text) {
        this.clearHighlights();
        
        const used = Rot13.usedLetters(text);
        for (const char of used.upper) {
            this.highlightCharacter(`up-${char}`, `uc-${char}`);
        }
        for (const char of used.lower) {
            this.highlightCharacter(`lp-${char}`, `lc-${char}`);
        }
    }

    highlightCharacter(plainId, cipherId) {
        const plain = document.getElementById(plainId);
        const cipher = document.getElementById(cipherId);
        if (plain) {
            plain.classList.add('highlight');
            plain.parentElement.setAttribute('aria-current', 'true');
        }
        if (cipher) cipher.classList.add('highlight');
    }

    clearHighlights() {
        document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
        document.querySelectorAll('.cipher-col[aria-current]').forEach(el => el.removeAttribute('aria-current'));
    }

    convert() {
        const input = document.getElementById('input').value;
        const output = Rot13.rot13(input);
        document.getElementById('output').value = output;
        this.highlightChars(input);
        const { converted, unchanged, fullwidth } = Rot13.countStats(input);
        document.getElementById('stats').textContent = `変換した英字 ${converted}文字／そのままの文字 ${unchanged}文字`;
        document.getElementById('hint').hidden = fullwidth === 0;
    }

    clearInput() {
        document.getElementById('input').value = '';
        this.convert();
        this.showStatus('入力をクリアしました。');
        document.getElementById('input').focus();
    }

    async copyResult() {
        const outputText = document.getElementById('output');
        const btn = document.getElementById('copyBtn');
        if (!outputText.value) {
            this.showStatus('コピーする内容がありません。');
            return;
        }

        try {
            await navigator.clipboard.writeText(outputText.value);
            
            this.showCopySuccess(btn);
            this.showStatus('変換結果をコピーしました。');
        } catch (err) {
            this.showStatus('コピーできませんでした。変換結果を選択してコピーしてください。');
            outputText.focus();
            outputText.select();
        }
    }

    showCopySuccess(btn) {
        clearTimeout(this.copyTimer);
        btn.textContent = 'コピー完了!';
        btn.classList.add('is-copied');
        this.copyTimer = setTimeout(() => {
            btn.textContent = COPY_LABEL;
            btn.classList.remove('is-copied');
        }, 1000);
    }

    swapResult() {
        const output = document.getElementById('output').value;
        if (!output) {
            this.showStatus('移す内容がありません。');
            return;
        }
        const input = document.getElementById('input');
        input.value = output;
        this.convert();
        input.focus();
        this.showStatus('変換結果を入力に移しました。もう一度押すと元に戻ります。');
    }

    showStatus(message) {
        const status = document.getElementById('statusMessage');
        clearTimeout(this.statusTimer);
        status.textContent = message;
        this.statusTimer = setTimeout(() => {
            status.textContent = '';
        }, 4000);
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.createTable();
            this.convert();
            document.getElementById('input').addEventListener('input', () => this.convert());
            document.getElementById('clearBtn').addEventListener('click', () => this.clearInput());
            document.getElementById('swapBtn').addEventListener('click', () => this.swapResult());
            document.getElementById('copyBtn').addEventListener('click', () => this.copyResult());
        });
    }
}

window.rot13Encoder = new ROT13Encoder();
