const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');
const tag = id => html.match(new RegExp(`<[^>]+\\bid="${id}"[^>]*>`))?.[0];

test('HTMLのviewport、CSP、referrer、descriptionが指定されている', () => {
    assert.match(html, /<meta\s+name="viewport"\s+content="width=device-width, initial-scale=1.0">/);
    const csp = html.match(/<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)">/)?.[1];
    assert.ok(csp, 'meta CSPが必要');
    assert.ok(csp.includes("default-src 'self'"));
    assert.doesNotMatch(csp, /frame-ancestors|'unsafe-inline'/);
    assert.match(html, /<meta\s+name="referrer"\s+content="no-referrer">/);
    assert.match(html, /<meta\s+name="description"\s+content="[^"]+">/);
});

test('HTMLは古典スクリプト2本をdefer付きで正しい順に読み込む', () => {
    const scripts = html.match(/<script\b[^>]*>/g) ?? [];
    assert.equal(scripts.length, 2);
    assert.match(scripts[0], /src="rot13.js"/);
    assert.match(scripts[1], /src="script.js"/);
    for (const element of scripts) {
        assert.match(element, /\sdefer(?:\s|>)/);
        assert.doesNotMatch(element, /type="module"/);
    }
    assert.doesNotMatch(html, /<[^>]+\s(?:on\w+|style)\s*=/i);
});

test('HTMLの必須ID、labelの参照先、ボタン属性が揃う', () => {
    for (const id of ['input', 'output', 'clearBtn', 'swapBtn', 'copyBtn',
        'stats', 'hint', 'statusMessage', 'upper-grid', 'lower-grid']) {
        assert.ok(tag(id), id);
    }
    for (const [, id] of html.matchAll(/<label\b[^>]*for="([^"]+)"/g)) assert.ok(tag(id), id);
    const buttons = html.match(/<button\b[^>]*>/g) ?? [];
    assert.equal(buttons.length, 3);
    for (const button of buttons) assert.match(button, /\btype="button"/);
    assert.match(tag('output'), /\breadonly(?:\s|>)/);
    assert.match(tag('output'), /aria-describedby="stats"/);
});

test('HTMLの見出し、main、noscript、通知領域が仕様に一致する', () => {
    assert.match(html, /<main\b/);
    assert.match(html, /<noscript\b/);
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
    assert.ok((html.match(/<h2\b/g) ?? []).length >= 2);
    assert.match(tag('hint'), /\bhidden(?:\s|>)/);
    assert.match(tag('hint'), /role="status"/);
    assert.match(tag('statusMessage'), /role="status"/);
    assert.match(tag('statusMessage'), /aria-live="polite"/);
    assert.doesNotMatch(tag('statusMessage'), /\bhidden(?:\s|>)/);
    assert.doesNotMatch(tag('stats') + tag('output'), /aria-live|role="status"/);
});

test('mainの外にGitHubリポジトリーへ戻るフッターリンクがある', () => {
    const footer = html.match(/<footer\b[^>]*class="site-footer"[^>]*>([\s\S]*?)<\/footer>/)?.[1];
    assert.ok(footer, 'フッターが必要');
    assert.ok(html.indexOf('</main>') < html.indexOf('<footer'));
    assert.match(footer, /<a href="https:\/\/github\.com\/ipusiron\/rot13-encoder">GitHubでソースコードを見る<\/a>/);
    assert.doesNotMatch(footer, /target="_blank"/);
});

for (const token of ['innerHTML', 'execCommand', 'alert(', 'console.log', '.style.', 'onclick']) {
    test(`DOM処理に${token}を含まない`, () => assert.ok(!script.includes(token)));
}
