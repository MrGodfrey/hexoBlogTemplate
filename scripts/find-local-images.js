/**
 * find-local-images.js
 * 扫描 source/_posts 下的 .md，若存在“相对路径图片”，返回非零退出码
 */
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const ROOT = process.cwd();
const mdFiles = glob.sync('source/_posts/**/*.md', { nodir: true });

let bad = [];

function hasRelativeImages(text) {
  // Markdown: ![...](path)
  const md = /!\[[^\]]*?\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g;
  // HTML: <img src="...">
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
} else {
  // console.log('[check-images] OK：未发现相对路径图片。');
}
