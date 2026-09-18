const test = require('node:test');
const assert = require('node:assert/strict');
const { UPPER, LOWER, rot13, buildTable, usedLetters, countStats } = require('../rot13.js');

const knownAnswers = [
    ['初期入力', 'Hello World!', 'Uryyb Jbeyq!'],
    ['初期入力の復号', 'Uryyb Jbeyq!', 'Hello World!'],
    ['句読点と数字', 'Hello, World! 123', 'Uryyb, Jbeyq! 123'],
    ['サイト名', 'Security Akademeia', 'Frphevgl Nxnqrzrvn'],
    ['パングラム', 'The quick brown fox jumps over the lazy dog.', 'Gur dhvpx oebja sbk whzcf bire gur ynml qbt.'],
    ['なぞなぞ', 'Why did the chicken cross the road?', 'Jul qvq gur puvpxra pebff gur ebnq?'],
    ['なぞなぞの答え', 'To get to the other side!', 'Gb trg gb gur bgure fvqr!'],
    ['Zenの復号', 'Gur Mra bs Clguba, ol Gvz Crgref', 'The Zen of Python, by Tim Peters'],
    ['大文字全体', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'NOPQRSTUVWXYZABCDEFGHIJKLM'],
    ['小文字全体', 'abcdefghijklmnopqrstuvwxyz', 'nopqrstuvwxyzabcdefghijklm'],
    ['ROT13', 'ROT13', 'EBG13'],
    ['両端', 'AZaz', 'NMnm'],
    ['折り返し境界', 'MNmn', 'ZAza'],
    ['空文字', '', ''],
    ['数字と記号', '0123456789 !"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~', '0123456789 !"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'],
    ['日本語混在', 'こんにちは ABC xyz 123', 'こんにちは NOP klm 123'],
    ['全角のみ', 'ＡＢＣａｂｃ', 'ＡＢＣａｂｃ'],
    ['全角と半角', 'ＨＥＬＬＯ hello', 'ＨＥＬＬＯ uryyb'],
    ['NFCのアクセント', 'Caf\u00e9', 'Pns\u00e9'],
    ['NFDのアクセント', 'Cafe\u0301', 'Pnsr\u0301'],
    ['ASCII以外の似た文字', '\u212a\u017f\u0130\u0131\u00df', '\u212a\u017f\u0130\u0131\u00df'],
    ['絵文字', '\ud83d\ude00A\ud83d\ude00', '\ud83d\ude00N\ud83d\ude00'],
    ['孤立サロゲート', '\ud800A', '\ud800N'],
    ['改行とタブ', 'a\nb\tc\r\nd', 'n\no\tp\r\nq'],
    ['HTML風の入力', '<script>alert(1)</script>', '<fpevcg>nyreg(1)</fpevcg>'],
    ['null', null, ''],
    ['undefined', undefined, ''],
    ['数値', 123, '123']
];
for (const [name, input, expected] of knownAnswers) {
    test(`既知解答: ${name}`, () => assert.equal(rot13(input), expected));
}

test('全UTF-16コード単位65,536個で対合、変わる文字はASCII英字52個だけ', () => {
    let changed = 0;
    for (let code = 0; code <= 0xffff; code++) {
        const input = String.fromCharCode(code);
        const result = rot13(input);
        const ascii = (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
        assert.equal(rot13(result), input, `対合 U+${code.toString(16)}`);
        assert.equal(result !== input, ascii, `変換対象 U+${code.toString(16)}`);
        if (result !== input) changed++;
    }
    assert.equal(changed, 52);
});

for (const [name, alphabet] of [['upper', UPPER], ['lower', LOWER]]) {
    test(`文字セットと置換表: ${name}は26文字、凍結、全単射、対称、大小を維持`, () => {
        assert.ok(Object.isFrozen(alphabet));
        assert.equal(alphabet.length, 26);
        assert.equal(new Set(alphabet).size, 26);
        const table = buildTable()[name];
        assert.equal(table.length, 26);
        assert.deepEqual(table.map(pair => pair[0]), alphabet);
        assert.deepEqual(table.map(pair => pair[1]).sort(), alphabet);
        for (const [plain, cipher] of table) {
            assert.notEqual(plain, cipher, plain);
            assert.ok(table.some(pair => pair[0] === cipher && pair[1] === plain), `${plain}の逆写像`);
            assert.match(cipher, name === 'upper' ? /^[A-Z]$/ : /^[a-z]$/);
        }
    });
}

test('buildTableの先頭と末尾は指定の対応になる', () => {
    const { upper, lower } = buildTable();
    assert.deepEqual(upper.slice(0, 3), [['A', 'N'], ['B', 'O'], ['C', 'P']]);
    assert.deepEqual(upper.slice(-3), [['X', 'K'], ['Y', 'L'], ['Z', 'M']]);
    assert.deepEqual(lower.slice(0, 3), [['a', 'n'], ['b', 'o'], ['c', 'p']]);
    assert.deepEqual(lower.slice(-3), [['x', 'k'], ['y', 'l'], ['z', 'm']]);
});

const usedCases = [
    ['Hello World!', ['H', 'W'], ['d', 'e', 'l', 'o', 'r']],
    ['', [], []],
    ['123 こんにちは', [], []],
    ['ＨＥＬＬＯ hello', [], ['e', 'h', 'l', 'o']],
    ['zzZZaA', ['A', 'Z'], ['a', 'z']],
    ['The quick brown fox jumps over the lazy dog.', ['T'], [...'abcdefghijklmnopqrstuvwxyz']]
];
for (const [input, upper, lower] of usedCases) {
    test(`usedLetters: ${JSON.stringify(input)}`, () => {
        assert.deepEqual(usedLetters(input), { upper, lower });
    });
}

const statsCases = [
    ['Hello World!', 12, 10, 2, 0],
    ['Hello, World! 123', 17, 10, 7, 0],
    ['', 0, 0, 0, 0],
    ['こんにちは ABC xyz 123', 17, 6, 11, 0],
    ['ＨＥＬＬＯ hello', 11, 5, 6, 5],
    ['ＡＢＣａｂｃ', 6, 0, 6, 6],
    ['\ud83d\ude00A\ud83d\ude00', 3, 1, 2, 0],
    ['a\nb', 3, 2, 1, 0],
    ['Cafe\u0301', 5, 4, 1, 0],
    ['Security Akademeia', 18, 17, 1, 0],
    [null, 0, 0, 0, 0],
    [undefined, 0, 0, 0, 0]
];
for (const [input, total, converted, unchanged, fullwidth] of statsCases) {
    test(`countStats: ${JSON.stringify(input)}`, () => {
        assert.deepEqual(countStats(input), { total, converted, unchanged, fullwidth });
    });
}
