/* DOMに依存しないROT13の変換と集計。Unicodeの正規化は行わない。 */
(() => {
    'use strict';

    const UPPER = Object.freeze([...'ABCDEFGHIJKLMNOPQRSTUVWXYZ']);
    const LOWER = Object.freeze([...'abcdefghijklmnopqrstuvwxyz']);

    /** ASCII英字だけを13文字ずらし、それ以外のUTF-16コード単位を保持する。 */
    function rot13(text) {
        return String(text ?? '').replace(/[A-Za-z]/g, char => {
            const start = char <= 'Z' ? 65 : 97;
            return String.fromCharCode(((char.charCodeAt(0) - start + 13) % 26) + start);
        });
    }

    /** 入力と変換後の文字を組にした置換表を返す。 */
    function buildTable() {
        return {
            upper: UPPER.map(char => [char, rot13(char)]),
            lower: LOWER.map(char => [char, rot13(char)])
        };
    }

    /** 入力に含まれるASCII英字を重複なし、アルファベット順で返す。 */
    function usedLetters(text) {
        const used = new Set(String(text ?? '').match(/[A-Za-z]/g) ?? []);
        return {
            upper: UPPER.filter(char => used.has(char)),
            lower: LOWER.filter(char => used.has(char))
        };
    }

    /** 改行や絵文字を含め、コードポイント単位で文字数を集計する。 */
    function countStats(text) {
        const value = String(text ?? '');
        const total = [...value].length;
        const converted = (value.match(/[A-Za-z]/g) ?? []).length;
        const fullwidth = (value.match(/[Ａ-Ｚａ-ｚ]/g) ?? []).length;
        return { total, converted, unchanged: total - converted, fullwidth };
    }

    globalThis.Rot13 = { UPPER, LOWER, rot13, buildTable, usedLetters, countStats };
    if (typeof module === 'object' && module.exports) {
        module.exports = Rot13;
    }
})();
