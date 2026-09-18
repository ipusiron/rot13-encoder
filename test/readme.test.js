const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { rot13, buildTable } = require('../rot13.js');
const root = path.join(__dirname, '..');
const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');

test('READMEの変換例は6行あり、すべて実装と一致する', () => {
    const section = readme.split('### 変換例')[1]?.split('\n##')[0];
    assert.ok(section, '変換例の節が必要');
    const rows = [...section.matchAll(/^\| `([^`]*)` \| `([^`]*)` \| .+ \|$/gm)];
    assert.equal(rows.length, 6);
    for (const [, input, expected] of rows) assert.equal(rot13(input), expected, input);
});

test('READMEの置換表は2行あり、全文字がbuildTableと一致する', () => {
    const rows = [...readme.matchAll(/^\| (大文字|小文字) \| `([^`]+)` \| `([^`]+)` \|$/gm)];
    assert.equal(rows.length, 2);
    for (const [, name, plain, cipher] of rows) {
        const table = buildTable()[name === '大文字' ? 'upper' : 'lower'];
        assert.equal(plain, table.map(pair => pair[0]).join(''));
        assert.equal(cipher, table.map(pair => pair[1]).join(''));
    }
});

test('READMEの相対画像参照は7件以上あり、すべて実在する', () => {
    const images = [...readme.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)]
        .map(match => match[1]).filter(url => !/^https?:\/\//.test(url));
    assert.ok(images.length >= 7, `相対画像の数: ${images.length}`);
    for (const name of images) assert.ok(fs.existsSync(path.join(root, name)), name);
    for (const name of ['screenshot.png', 'screenshot2.png', 'screenshot3.png']) {
        assert.ok(images.includes(`assets/${name}`), name);
    }
});

test('READMEのYAMLは先頭37行のHTMLコメント、ブロック形式、指定識別値を保持', () => {
    const lines = readme.split(/\r?\n/);
    assert.equal(lines[0], '<!--');
    assert.equal(lines[36], '-->');
    const yaml = lines.slice(0, 37).join('\n');
    for (const key of ['category_ja', 'category_en', 'tags']) {
        assert.match(yaml, new RegExp(`^${key}:\n  - `, 'm'));
    }
    const expected = {
        id: 'day005', slug: 'rot13-encoder', repo_url: 'https://github.com/ipusiron/rot13-encoder',
        demo_url: 'https://ipusiron.github.io/rot13-encoder/', hub: 'true'
    };
    for (const [key, value] of Object.entries(expected)) {
        const actual = yaml.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1].replace(/^"|"$/g, '');
        assert.equal(actual, value, key);
    }
});

test('READMEはツール100の名称とURLを使い、旧名称と誤った変換を含まない', () => {
    assert.ok(readme.includes('生成AIで作るセキュリティツール100'));
    assert.ok(readme.includes('page_id=42163'));
    for (const old of ['セキュリティツールをAIで作ってみよう', 'ツール200', 'page_id=44607', 'Nxnqrzvn']) {
        assert.ok(!readme.includes(old), old);
    }
});

test('サイト名Security Akademeiaの綴りと双方向の変換を維持する', () => {
    assert.ok(readme.includes('Security Akademeia'));
    assert.ok(readme.includes('Frphevgl Nxnqrzrvn'));
    assert.equal(rot13('Security Akademeia'), 'Frphevgl Nxnqrzrvn');
    assert.equal(rot13('Frphevgl Nxnqrzrvn'), 'Security Akademeia');
    assert.doesNotMatch(readme, /akademia/i);
});

test('MIT LICENSEが実在し、READMEからリンクされている', () => {
    const license = fs.readFileSync(path.join(root, 'LICENSE'), 'utf8');
    assert.equal(license.split(/\r?\n/)[0], 'MIT License');
    assert.ok(license.includes('Copyright (c) 2025 ipusiron'));
    assert.match(readme, /\[MITライセンス\]\(\.\/LICENSE\)/);
});
