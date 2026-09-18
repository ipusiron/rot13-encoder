const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const tests = fs.readdirSync(__dirname).filter(name => name.endsWith('.js')).map(name => `test/${name}`);
const files = ['rot13.js', 'script.js', 'styles.css', 'index.html', ...tests];

for (const filename of files) {
    test(`整形: ${filename}の行長と行数`, () => {
        const lines = fs.readFileSync(path.join(root, filename), 'utf8').trimEnd().split(/\r?\n/);
        const max = filename === 'index.html' ? 250 : 160;
        for (const [index, line] of lines.entries()) {
            assert.ok(line.length <= max, `${index + 1}行目 ${line.length}文字 > ${max}`);
        }
        const minimum = { 'script.js': 60, 'styles.css': 120, 'index.html': 40 }[filename] ?? 1;
        assert.ok(lines.length >= minimum, `${lines.length}行 < ${minimum}`);
    });
}
