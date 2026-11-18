const fs = require('node:fs');
const path = require('node:path');
const sass = require('sass');
const root = path.resolve(__dirname, '..');
function buildStyles() {
  for (const [name, target] of [
    ['global', 'styles.css'],
    ['math', 'extensions/math.css'],
    ['table', 'extensions/table.css'],
    ['table-ui', 'extensions/table-ui.css'],
  ]) {
    const result = sass.compile(path.join(root, 'styles', name + '.scss'), {
      style: 'compressed',
      loadPaths: [path.join(root, 'node_modules')],
    });
    const output = path.join(root, 'dist', target);
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, result.css);
  }
  const fonts = path.join(fs.realpathSync(path.join(root, 'node_modules/mathlive')), 'fonts');
  fs.cpSync(fonts, path.join(root, 'dist/extensions/fonts'), {
    recursive: true,
  });
}
exports.buildStyles = buildStyles;
if (require.main === module) buildStyles();
