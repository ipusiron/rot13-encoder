/* 日本語と英語のメッセージ。画面を操作するスクリプトは言語ごとの文字列を持たない。 */
const I18n = (() => {
    const ja = {
        'app.title': 'ROT13エンコーダー（ROT13 Encoder）',
        'app.heading': 'ROT13エンコーダー（ROT13 Encoder）',
        'app.description': 'ROT13（13文字ずらしのシフト暗号）を置換表で学べるツール。入力と同時に変換し、対応する文字をハイライトする',
        'app.langButton': 'English',
        'app.langAria': '言語を切り替える',
        'noscript': 'このツールの利用には JavaScript が必要です。',
        'table.upper': '大文字',
        'table.lower': '小文字',
        'table.upperAria': '大文字の置換表',
        'table.lowerAria': '小文字の置換表',
        'table.legend': '上段が入力の文字、下段がROT13で変換した文字。入力に含まれる文字は、黄色と太枠で強調される。',
        'table.mapAria': '{plain}は{cipher}になる',
        'input.label': '📝 入力テキスト:',
        'input.placeholder': 'ここに文字を入力してください',
        'output.label': '🔒 変換結果:',
        'button.clear': 'クリア',
        'button.swap': '結果を入力へ',
        'button.copy': 'コピー',
        'button.copied': 'コピー完了!',
        'stats.counts': '変換した英字 {converted}文字／そのままの文字 {unchanged}文字',
        'hint.fullwidth': '全角の英字は変換されません。ROT13の対象は半角のA〜Zとa〜zだけです。',
        'status.cleared': '入力をクリアしました。',
        'status.copied': '変換結果をコピーしました。',
        'status.copyEmpty': 'コピーする内容がありません。',
        'status.copyFailed': 'コピーできませんでした。変換結果を選択してコピーしてください。',
        'status.swapEmpty': '移す内容がありません。',
        'status.swapped': '変換結果を入力に移しました。もう一度押すと元に戻ります。',
        'note.title': '💡 ROT13について:',
        'note.body': 'アルファベットを13文字ずらす暗号です。入力した文字が置換表でハイライトされます。',
        'footer.repo': 'GitHubでソースコードを見る'
    };

    const en = {
        'app.title': 'ROT13 Encoder',
        'app.heading': 'ROT13 Encoder',
        'app.description': 
            'Learn ROT13, a shift cipher of 13 places, with substitution tables. Text is converted as you type and the letters in use are highlighted',
        'app.langButton': '日本語',
        'app.langAria': 'Switch language',
        'noscript': 'This tool requires JavaScript.',
        'table.upper': 'Uppercase',
        'table.lower': 'Lowercase',
        'table.upperAria': 'Uppercase substitution table',
        'table.lowerAria': 'Lowercase substitution table',
        'table.legend': 
            'The top row is the input letter and the bottom row is its ROT13 result. Letters found in your input are highlighted in yellow with a bold frame.',
        'table.mapAria': '{plain} maps to {cipher}',
        'input.label': '📝 Input text:',
        'input.placeholder': 'Type your text here',
        'output.label': '🔒 Result:',
        'button.clear': 'Clear',
        'button.swap': 'Result to input',
        'button.copy': 'Copy',
        'button.copied': 'Copied!',
        'stats.counts': 'Converted letters: {converted} / Unchanged characters: {unchanged}',
        'hint.fullwidth': 'Full-width letters are not converted. ROT13 applies only to the ASCII letters A-Z and a-z.',
        'status.cleared': 'Input cleared.',
        'status.copied': 'The result was copied to the clipboard.',
        'status.copyEmpty': 'There is nothing to copy.',
        'status.copyFailed': 'Could not copy. Select the result and copy it manually.',
        'status.swapEmpty': 'There is nothing to move.',
        'status.swapped': 'The result was moved to the input. Press the button again to get the original text back.',
        'note.title': '💡 About ROT13:',
        'note.body': 'ROT13 shifts every letter of the alphabet by 13 places. The letters you type are highlighted in the substitution tables.',
        'footer.repo': 'View the source code on GitHub'
    };

    let language = 'ja';
    const STORAGE_KEY = 'rot13-encoder-language';

    function t(key, values = {}) {
        const dict = language === 'en' ? en : ja;
        const message = dict[key];
        if (typeof message !== 'string') throw new Error('Unknown message: ' + key);
        return message.replace(/\{(\w+)\}/g, (hole, name) =>
            (Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : hole));
    }

    function apply(root = document) {
        document.documentElement.lang = language;
        document.title = t('app.title');
        const meta = document.querySelector('meta[name="description"]');
        if (meta) meta.setAttribute('content', t('app.description'));
        root.querySelectorAll('[data-i18n]').forEach(element => { element.textContent = t(element.dataset.i18n); });
        for (const attr of ['aria-label', 'title', 'placeholder']) {
            root.querySelectorAll(`[data-i18n-${attr}]`)
                .forEach(element => element.setAttribute(attr, t(element.getAttribute(`data-i18n-${attr}`))));
        }
    }

    function setLanguage(value) {
        if (value !== 'ja' && value !== 'en') return;
        language = value;
        try { localStorage.setItem(STORAGE_KEY, value); } catch (error) { /* ストレージが使えない環境では記憶しない */ }
        apply();
        document.dispatchEvent(new Event('languagechange'));
    }

    function init() {
        let saved = null;
        try { saved = localStorage.getItem(STORAGE_KEY); } catch (error) { /* ストレージが使えない環境では既定に従う */ }
        const query = new URLSearchParams(location.search).get('lang');
        language = [query, saved].find(value => value === 'ja' || value === 'en')
            || (/^ja\b/i.test(navigator.language || '') ? 'ja' : 'en');
        apply();
    }

    return { ja, en, t, apply, init, setLanguage, get language() { return language; } };
})();

if (typeof window !== 'undefined') window.I18n = I18n;
if (typeof module !== 'undefined' && module.exports) module.exports = I18n;
