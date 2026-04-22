'use strict';

/**
 * find-local-images.js
 *
 * 用法：在命令行中手动执行
 * 扫描 source/_posts 下的 .md，若存在相对路径图片，返回非零退出码。
 *
 * 注意：
 * 这个文件位于 Hexo 的 scripts/ 目录下，所以必须避免在被 require 时自动执行。
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const ROOT = process.cwd();

function hasRelativeImages(text) {
  const md = /!\[[^\]]*?\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g;
  const html = /<img[^>]*\s+src=["']([^"']+)["'][^>]*>/gi;
  const rel = (p) => !/^https?:\/\//i.test(p) && !/^[\\/]/.test(p);

  let m;
  while ((m = md.exec(text)) !== null) {
    if (rel(m[1])) return true;
  }

  let n;
  while ((n = html.exec(text)) !== null) {
    if (rel(n[1])) return true;
  }

  return false;
}

function main() {
  const mdFiles = glob.sync('source/_posts/**/*.md', { nodir: true });
  let bad = [];

  for (const f of mdFiles) {
    const p = path.join(ROOT, f);
    const s = fs.readFileSync(p, 'utf8');
    if (hasRelativeImages(s)) bad.push(f);
  }

  if (bad.length) {
    console.error('[check-images] 发现仍有“相对路径图片”的文章（尚未上传并替换 URL）：');
    for (const f of bad) console.error(' - ' + f);
    console.error('请先运行 pre-commit（或手动执行：node scripts/r2ify-sources.js）完成上传与替换。');
    process.exit(2);
  }
}

if (require.main === module) {
  main();
}
