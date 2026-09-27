const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const I18n = require(path.join(root, 'i18n.js'));
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');

test('日本語と英語で、キーの集合が同じ', () => {
    assert.deepEqual(Object.keys(I18n.ja).filter(key => !(key in I18n.en)), [], '英語に無いキーがある');
    assert.deepEqual(Object.keys(I18n.en).filter(key => !(key in I18n.ja)), [], '日本語に無いキーがある');
    assert.ok(Object.keys(I18n.ja).length >= 25, `キーが少なすぎる: ${Object.keys(I18n.ja).length}`);
});

test('差し込みの名前が、日本語と英語で一致する', () => {
    const holes = value => [...String(value).matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort().join(',');
    assert.deepEqual(Object.keys(I18n.ja).filter(key => holes(I18n.ja[key]) !== holes(I18n.en[key])), []);
});

test('index.html が指すキーは、すべて辞書にある', () => {
    const keys = new Set();
    for (const match of html.matchAll(/data-i18n(?:-[a-z-]+)?="([^"]+)"/g)) keys.add(match[1]);
    assert.ok(keys.size >= 18, `data-i18n が少なすぎる: ${keys.size}`);
    assert.deepEqual([...keys].filter(key => !(key in I18n.ja)), []);
});

test('script.js が呼ぶキーは、すべて辞書にある', () => {
    const keys = new Set();
    for (const match of script.matchAll(/I18n\.t\(\s*['"]([\w.]+)['"]/g)) keys.add(match[1]);
    for (const match of script.matchAll(/this\.showStatus\(\s*['"]([\w.]+)['"]/g)) keys.add(match[1]);
    assert.ok(keys.size >= 10, `I18n.t の呼び出しが少なすぎる: ${keys.size}`);
    assert.deepEqual([...keys].filter(key => !(key in I18n.ja)), []);
});

test('英語の辞書に、訳し忘れの日本語が残っていない', () => {
    const japanese = /[぀-ヿ一-鿿Ａ-Ｚａ-ｚ]/;
    // 言語の切り替えボタンだけは、相手の言語を出すのが正しい
    const expected = new Set(['app.langButton']);
    assert.deepEqual(Object.keys(I18n.en).filter(key => !expected.has(key) && japanese.test(I18n.en[key])), []);
});

test('t() は差し込みを埋める。知らないキーは黙って通さない', () => {
    assert.equal(I18n.t('table.mapAria', { plain: 'A', cipher: 'N' }), 'AはNになる');
    assert.match(I18n.t('stats.counts', { converted: 5, unchanged: 7 }), /5/);
    assert.match(I18n.t('stats.counts', { converted: 5, unchanged: 7 }), /7/);
    assert.throws(() => I18n.t('no.such.key'), /Unknown message/);
});

test('画面の状態を、表示中の文言との一致では判定していない', () => {
    // 言語を変えると文字列が変わるため、datasetの印で見分ける
    assert.doesNotMatch(script, /COPY_LABEL/);
    assert.doesNotMatch(script, /textContent\s*===/);
    assert.match(script, /dataset\.copied/);
    assert.match(script, /this\.statusKey/);
    // 置換表の読み上げ文は、セルのtextContentではなくdatasetから組み立てる
    assert.match(script, /column\.dataset\.plain/);
    assert.match(script, /I18n\.t\('table\.mapAria'/);
});

test('切り替えでも内容が消えないよう、languagechange で描き直す', () => {
    assert.match(script, /I18n\.init\(\)/);
    assert.match(script, /langToggle'\)\.addEventListener/);
    assert.match(script, /addEventListener\('languagechange'/);
    assert.match(script, /redraw\(\)/);
});

test('i18n.js を他のスクリプトより先に読み込む', () => {
    assert.ok(html.indexOf('src="i18n.js"') < html.indexOf('src="rot13.js"'));
    assert.ok(html.indexOf('src="rot13.js"') < html.indexOf('src="script.js"'));
});

test('noscript は日本語と英語を併記する', () => {
    const noscript = html.match(/<noscript>([\s\S]*?)<\/noscript>/)?.[1];
    assert.ok(noscript, 'noscript が必要');
    assert.ok(noscript.includes('JavaScript が必要です'), '日本語の案内が必要');
    assert.ok(noscript.includes('This tool requires JavaScript.'), '英語の案内が必要');
});

test('子要素を持つ要素に data-i18n を付けていない', () => {
    for (const match of html.matchAll(/<(\w+)[^>]*\sdata-i18n="[^"]+"[^>]*>([\s\S]*?)<\/\1>/g)) {
        assert.doesNotMatch(match[2], /</, `${match[1]} の中に子要素がある: ${match[2].slice(0, 40)}`);
    }
});

test('README.en.md があり、日本語READMEと相互にリンクする', () => {
    const english = fs.readFileSync(path.join(root, 'README.en.md'), 'utf8');
    const japanese = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
    assert.ok(english.includes('English · [日本語](README.md)'));
    assert.ok(japanese.includes('[English](README.en.md) · 日本語'));
    assert.doesNotMatch(english, /[぀-ヿ]/, 'README.en.md に仮名が残っている');
});
