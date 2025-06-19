class ROT13Encoder {
    constructor() {
        this.init();
    }

    rot13(str) {
        return str.replace(/[a-zA-Z]/g, (char) => {
            const start = char <= 'Z' ? 65 : 97;
            return String.fromCharCode(((char.charCodeAt(0) - start + 13) % 26) + start);
        });
    }

    createTable() {
        const elements = {
            upperPlain: document.getElementById('upper-plain'),
            upperCipher: document.getElementById('upper-cipher'),
            lowerPlain: document.getElementById('lower-plain'),
            lowerCipher: document.getElementById('lower-cipher')
        };

        for (let i = 0; i < 26; i++) {
            this.createCharacterCells(i, elements);
        }
    }

    createCharacterCells(index, elements) {
        const upperChar = String.fromCharCode(65 + index);
        const lowerChar = String.fromCharCode(97 + index);
        const upperCipherChar = String.fromCharCode(65 + ((index + 13) % 26));
        const lowerCipherChar = String.fromCharCode(97 + ((index + 13) % 26));

        this.createCell(elements.upperPlain, upperChar, 'cipher-cell plain', `up-${upperChar}`);
        this.createCell(elements.upperCipher, upperCipherChar, 'cipher-cell cipher', `uc-${upperChar}`);
        this.createCell(elements.lowerPlain, lowerChar, 'cipher-cell plain', `lp-${lowerChar}`);
        this.createCell(elements.lowerCipher, lowerCipherChar, 'cipher-cell cipher', `lc-${lowerChar}`);
    }

    createCell(parent, content, className, id) {
        const cell = document.createElement('div');
        cell.className = className;
        cell.textContent = content;
        cell.id = id;
        parent.appendChild(cell);
    }

    highlightChars(text) {
        this.clearHighlights();
        
        for (const char of text) {
            if (/[A-Z]/.test(char)) {
                this.highlightCharacter(`up-${char}`, `uc-${char}`);
            } else if (/[a-z]/.test(char)) {
                this.highlightCharacter(`lp-${char}`, `lc-${char}`);
            }
        }
    }

    highlightCharacter(plainId, cipherId) {
        const plain = document.getElementById(plainId);
        const cipher = document.getElementById(cipherId);
        if (plain) plain.classList.add('highlight');
        if (cipher) cipher.classList.add('highlight');
    }

    clearHighlights() {
        document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
    }

    convert() {
        const input = document.getElementById('input').value;
        const output = this.rot13(input);
        document.getElementById('output').value = output;
        this.highlightChars(input);
    }

    clearInput() {
        document.getElementById('input').value = '';
        document.getElementById('output').value = '';
        this.clearHighlights();
    }

    async copyResult() {
        const outputText = document.getElementById('output');
        const btn = document.querySelector('.btn.copy');
        const originalText = btn.textContent;

        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(outputText.value);
            } else {
                outputText.select();
                outputText.setSelectionRange(0, 99999);
                document.execCommand('copy');
            }
            
            this.showCopySuccess(btn, originalText);
        } catch (err) {
            alert('コピーに失敗しました。手動でコピーしてください。');
        }
    }

    showCopySuccess(btn, originalText) {
        btn.textContent = 'コピー完了!';
        btn.style.background = '#4CAF50';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '#2196F3';
        }, 1000);
    }

    init() {
        window.addEventListener('load', () => {
            this.createTable();
            this.convert();
            document.getElementById('input').addEventListener('input', () => this.convert());
        });
    }
}

window.rot13Encoder = new ROT13Encoder();

function clearInput() {
    window.rot13Encoder.clearInput();
}

function copyResult() {
    window.rot13Encoder.copyResult();
}