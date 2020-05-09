const glob = require('glob');
const fs = require('fs');
const { PurgeCSS } = require('purgecss');

// https://purgecss.com/configuration.html#options
const PATHS = {
  content: glob.sync(`_site/**/*.html`),
  css: glob.sync(`_site/assets/main-bundle.css`),
};

const printConfig = () =>
  console.log(
    'config',
    `
      content: ${PATHS.content.length.toString().padStart(3, ' ')} files
      css:     ${PATHS.css.length.toString().padStart(3, ' ')} files`
  );

const printResult = ({ file, sizeBefore, sizeAfter, diff }) =>
  console.log(
    file,
    `
      before: ${sizeBefore.toString().padStart(8, ' ')}
      after:  ${sizeAfter.toString().padStart(8, ' ')}
      diff:   ${diff.toString().padStart(8, ' ')}`
  );

// Check CSS file sizes so that I can compare before and after later.
const buildCssSizeLookup = () =>
  PATHS.css.reduce((acc, cssFile) => {
    try {
      const data = fs.readFileSync(cssFile, 'utf8');
      acc[cssFile] = data.length;
      return acc;
    } catch (err) {
      console.error(err);
    }
  }, {});

// For some reason, PurgeCSS's output option is not working so I need to update CSS file by myself.
// https://github.com/FullHuman/purgecss-docs/issues/5#issuecomment-381926354
const saveFile = (file, data) => {
  fs.writeFile(file, data, (err) => {
    console.log(err ? err : `Saved ${file}`);
  });
};

(async function execute() {
  const cssSizeLookup = buildCssSizeLookup();
  if (!cssSizeLookup) {
    console.error(`Error building CSS size lookup`);
    return;
  }

  printConfig();

  // https://purgecss.com/api.html#usage
  const results = await new PurgeCSS().purge({
    content: PATHS.content,
    css: PATHS.css,
  });

  results.forEach(({ css, file, rejected }) => {
    if (rejected) {
      console.error(`PurgeCSS rejected ${file}`);
      return;
    }
    const sizeBefore = cssSizeLookup[file];
    const sizeAfter = css.length;
    const diff = sizeAfter - sizeBefore;
    printResult({ file, sizeBefore, sizeAfter, diff });

    if (diff < 0) saveFile(file, css);
  });
})();