class ROT13Encoder {
    constructor() {
        this.copyTimer = null;
        this.statusTimer = null;
        this.statusKey = null;
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
        this.updateTableLabels();
    }

    createCharacterCells(index, elements, table) {
        for (const [kind, prefix] of [['upper', 'u'], ['lower', 'l']]) {
            const [plain, cipher] = table[kind][index];
            const column = document.createElement('div');
            column.className = 'cipher-col';
            column.setAttribute('role', 'listitem');
            column.dataset.plain = plain;
            column.dataset.cipher = cipher;
            this.createCell(column, plain, 'cipher-cell plain', `${prefix}p-${plain}`);
            this.createCell(column, cipher, 'cipher-cell cipher', `${prefix}c-${plain}`);
            elements[kind].appendChild(column);
        }
    }

    /** 読み上げ文は、セルの表示文字ではなくdatasetの値から組み立てる。 */
    updateTableLabels() {
        document.querySelectorAll('.cipher-col').forEach(column => {
            const { plain, cipher } = column.dataset;
            column.setAttribute('aria-label', I18n.t('table.mapAria', { plain, cipher }));
        });
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
        document.getElementById('stats').textContent = I18n.t('stats.counts', { converted, unchanged });
        document.getElementById('hint').hidden = fullwidth === 0;
    }

    clearInput() {
        document.getElementById('input').value = '';
        this.convert();
        this.showStatus('status.cleared');
        document.getElementById('input').focus();
    }

    async copyResult() {
        const outputText = document.getElementById('output');
        const btn = document.getElementById('copyBtn');
        if (!outputText.value) {
            this.showStatus('status.copyEmpty');
            return;
        }

        try {
            await navigator.clipboard.writeText(outputText.value);

            this.showCopySuccess(btn);
            this.showStatus('status.copied');
        } catch (err) {
            this.showStatus('status.copyFailed');
            outputText.focus();
            outputText.select();
        }
    }

    showCopySuccess(btn) {
        clearTimeout(this.copyTimer);
        btn.dataset.copied = 'true';
        btn.textContent = I18n.t('button.copied');
        btn.classList.add('is-copied');
        this.copyTimer = setTimeout(() => {
            delete btn.dataset.copied;
            btn.textContent = I18n.t('button.copy');
            btn.classList.remove('is-copied');
        }, 1000);
    }

    swapResult() {
        const output = document.getElementById('output').value;
        if (!output) {
            this.showStatus('status.swapEmpty');
            return;
        }
        const input = document.getElementById('input');
        input.value = output;
        this.convert();
        input.focus();
        this.showStatus('status.swapped');
    }

    /** 表示中の文言ではなく、メッセージのキーを覚えておく。 */
    showStatus(key) {
        const status = document.getElementById('statusMessage');
        clearTimeout(this.statusTimer);
        this.statusKey = key;
        status.textContent = I18n.t(key);
        this.statusTimer = setTimeout(() => {
            this.statusKey = null;
            status.textContent = '';
        }, 4000);
    }

    /** apply()が上書きしたボタンの状態と、表示中の通知を、新しい言語で組み直す。 */
    redraw() {
        this.updateTableLabels();
        this.convert();
        const btn = document.getElementById('copyBtn');
        if (btn.dataset.copied === 'true') btn.textContent = I18n.t('button.copied');
        if (this.statusKey) document.getElementById('statusMessage').textContent = I18n.t(this.statusKey);
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            I18n.init();
            this.createTable();
            this.convert();
            document.getElementById('input').addEventListener('input', () => this.convert());
            document.getElementById('clearBtn').addEventListener('click', () => this.clearInput());
            document.getElementById('swapBtn').addEventListener('click', () => this.swapResult());
            document.getElementById('copyBtn').addEventListener('click', () => this.copyResult());
            document.getElementById('langToggle').addEventListener('click',
                () => I18n.setLanguage(I18n.language === 'ja' ? 'en' : 'ja'));
            document.addEventListener('languagechange', () => this.redraw());
        });
    }
}

window.rot13Encoder = new ROT13Encoder();
