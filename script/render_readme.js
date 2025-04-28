const fs = require('fs');
const path = require('path');
const marked = require('marked');
const puppeteer = require('puppeteer');

(async () => {
  const md = fs.readFileSync(path.join(process.cwd(), 'README.md'), 'utf-8');
  const htmlBody = marked(md);

  const fullHtml = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <link rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.1.0/github-markdown.min.css">
      <style>
        body { background-color: white; margin: 0; padding: 20px; }
        .markdown-body a { color: #0366d6; }
      </style>
    </head>
    <body>
      <article class="markdown-body">
        ${htmlBody}
      </article>
    </body>
  </html>`;

  const tmpFile = path.join(process.cwd(), 'tmp_readme.html');
  fs.writeFileSync(tmpFile, fullHtml);

  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto(`file://${tmpFile}`, { waitUntil: 'networkidle0' });
  const article = await page.$('article.markdown-body');
  await article.screenshot({ path: 'readme.png' });

  await browser.close();
  console.log('✅ readme.png generated');
})();
