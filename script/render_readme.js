const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const puppeteer = require('puppeteer');

(async () => {
  try {
    // 1. README.md を読み込んで Markdown → HTML に変換
    const mdPath = path.join(process.cwd(), 'README.md');
    const md = fs.readFileSync(mdPath, 'utf-8');
    const htmlBody = marked(md);

    // 2. GitHub Markdown CSS を読み込み、白背景＆リンク青文字に
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

    // 3. 一時 HTML ファイルを書き出し
    const tmpFile = path.join(process.cwd(), 'tmp_readme.html');
    fs.writeFileSync(tmpFile, fullHtml, 'utf-8');

    // 4. Puppeteer でヘッドレス Chrome を起動し、スクリーンショット取得
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto(`file://${tmpFile}`, { waitUntil: 'networkidle0' });

    // README 部分だけをキャプチャ
    const article = await page.$('article.markdown-body');
    await article.screenshot({ path: 'readme.png' });

    await browser.close();
    console.log('✅ readme.png generated');
  } catch (err) {
    console.error('❌ Error generating README image:', err);
    process.exit(1);
  }
})();
