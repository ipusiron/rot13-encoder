const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const css = fs.readFileSync(path.join(__dirname, '..', 'styles.css'), 'utf8');
const root = css.match(/:root\s*\{([^}]+)\}/)?.[1];
assert.ok(root, ':rootの変数定義が必要');
const colors = Object.fromEntries([...root.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)]
    .map(([, name, value]) => [name, value.trim()]));

function luminance(color) {
    assert.match(color ?? '', /^#[0-9a-f]{6}$/i, `不正な色: ${color}`);
    const rgb = color.slice(1).match(/../g).map(hex => {
        const value = parseInt(hex, 16) / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}

const textPairs = [
    ['text', 'surface'], ['text', 'page-bg'], ['text', 'note-bg'],
    ['text', 'cell-plain'], ['text', 'cell-cipher'], ['text', 'cell-highlight'],
    ['muted', 'surface'], ['on-accent', 'title-bg'], ['on-accent', 'btn-clear'],
    ['on-accent', 'btn-clear-hover'], ['on-accent', 'btn-copy'], ['on-accent', 'btn-copy-hover'],
    ['on-accent', 'btn-swap'], ['on-accent', 'btn-swap-hover'], ['hint-text', 'hint-bg']
];
const nonTextPairs = [
    ['border', 'surface'], ['focus', 'surface'], ['focus', 'page-bg'],
    ['highlight-frame', 'cell-plain'], ['highlight-frame', 'cell-cipher'], ['highlight-frame', 'cell-highlight']
];
assert.equal(textPairs.length, 15);
assert.equal(nonTextPairs.length, 6);
for (const [label, pairs, minimum] of [['文字', textPairs, 4.5], ['非テキスト', nonTextPairs, 3]]) {
    for (const [foreground, background] of pairs) {
        test(`コントラスト${label}: --${foreground} / --${background}`, () => {
            const values = [luminance(colors[foreground]), luminance(colors[background])].sort((a, b) => b - a);
            const ratio = (values[0] + 0.05) / (values[1] + 0.05);
            assert.ok(ratio >= minimum, `${ratio.toFixed(3)} < ${minimum}`);
        });
    }
}
