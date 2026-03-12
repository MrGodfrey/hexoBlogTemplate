/**
 * r2ify-sources.js
 *
 * 用法：在 pre-commit 钩子中执行
 * 功能：
 *  - 扫描 source/_posts 下的 .md 文件
 *  - 识别 Markdown/HTML/asset_img 中的“相对路径”图片
 *  - 若该图片存在于“文章同名资源目录”中，上传到 Cloudflare R2（S3 兼容）
 *  - 将文中相对路径替换为线上 URL（R2_PUBLIC_BASE + key）
 *  - 特别：Markdown 语法会改写为 `{% img URL "title" %}`
 *  - 用 manifest 记录 hash，避免重复上传
 *
 * 依赖：@aws-sdk/client-s3 glob dotenv
 */

'use strict';

require('dotenv').config({ quiet: true });
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const glob = require('glob');
const { S3Client, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, 'source', '_posts');
const ALMANAC_DIR = path.join(ROOT, 'source', 'almanac');
const JOURNAL_DIR = path.join(ROOT, 'source', 'journal');

const {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET,
  R2_KEY_PREFIX = 'posts'
} = process.env;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
  console.error('[r2ify] 缺少环境变量：R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET');
  process.exit(1);
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

const manifestPath = path.join(ROOT, 'scripts', '.r2-manifest.json');
let manifest = {};
try {
  if (fs.existsSync(manifestPath)) manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
} catch (_) {
  manifest = {};
}

function sha1(buf) {
  return crypto.createHash('sha1').update(buf).digest('hex');
}
function isHttpUrl(p) {
  return /^https?:\/\//i.test(p);
}
function escapeReg(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.bmp': 'image/bmp',
    '.ico': 'image/x-icon',
    '.avif': 'image/avif',
    '.heic': 'image/heic',
    '.heif': 'image/heif'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}
function findImages(text) {
  const items = [];
  // Markdown: ![alt](path "title")
  const mdRe = /!\[[^\]]*?\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g;
  let m;
  while ((m = mdRe.exec(text)) !== null) {
    const p = m[1].trim().replace(/^<|>$/g, '');
    items.push({ type: 'md', full: m[0], path: p });
  }
  // HTML: <img src="...">
  const imgRe = /<img[^>]*\s+src=["']([^"']+)["'][^>]*>/gi;
  let n;
  while ((n = imgRe.exec(text)) !== null) {
    items.push({ type: 'html', full: n[0], path: n[1] });
  }
  // Hexo asset_img: {% asset_img filename "title 'alt'" %}
  const assetRe = /{%\s*asset_img\s+([^\s"']+)(?:\s+[^%]+)?%}/g;
  let a;
  while ((a = assetRe.exec(text)) !== null) {
    items.push({ type: 'asset_img', full: a[0], path: a[1] });
  }
  return items;
}

async function ensureUpload(localAbsPath, key) {
  const buf = fs.readFileSync(localAbsPath);
  const hash = sha1(buf);
  const rec = manifest[key];
  if (rec && rec.hash === hash) {
    return { uploaded: false, etag: rec.etag || null };
  }

  // 可选：检查已存在
  try {
    await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    // 存在也覆盖（以本地为准）
  } catch (_) {}

  const contentType = getMimeType(localAbsPath);
  const put = await s3.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: buf,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  }));

  manifest[key] = { hash, ts: Date.now(), etag: put.ETag || null };
  return { uploaded: true, etag: put.ETag || null };
}

/**
 * 将文中的相对路径 p 替换为 publicUrl
 * - Markdown：整段改写为 `{% img URL "title" %}`
 * - HTML：仅替换 src
 * - asset_img：改写为 `{% img URL "title" %}`
 */
function doReplacements(text, p, publicUrl) {
  let out = text;

  // --- 1) Markdown：![alt](p "title") => {% img URL "title" %}
  // 捕获 alt 以及可选 title（双/单引号）
  const mdRe = new RegExp(
    String.raw`!\[([^\]]*?)\]\(\s*${escapeReg(p)}(?:\s+(?:"([^"]*)"|'([^']*)'))?\s*\)`,
    'g'
  );
  out = out.replace(mdRe, (match, alt, t1, t2) => {
    // 取 title 优先级：显式 title > alt > 文件名无扩展
    const baseNoExt = path.basename(p).replace(/\.[^.]+$/, '');
    const title = (t1 || t2 || alt || baseNoExt).trim();
    return `{% img ${publicUrl} "${title}" %}`;
  });

  // --- 2) HTML：仅替换 src，不改写标签
  const htmlRe = new RegExp(`(<img[^>]*\\s+src=["'])\\s*${escapeReg(p)}(["'][^>]*>)`, 'gi');
  out = out.replace(htmlRe, `$1${publicUrl}$2`);

  // --- 3) Hexo asset_img => {% img URL "title" %}
  const assetRe = new RegExp(`{%\\s*asset_img\\s+${escapeReg(p)}(?:\\s+([^%]+))?%}`, 'g');
  out = out.replace(assetRe, (match, rest) => {
    let titleText = '';
    if (rest) {
      const titleMatch = rest.match(/["']([^"']+)["']/);
      if (titleMatch) titleText = titleMatch[1];
    }
    if (!titleText) {
      // 没给标题就用文件名（去扩展名）
      titleText = path.basename(p).replace(/\.[^.]+$/, '');
    }
    return `{% img ${publicUrl} "${titleText}" %}`;
  });

  return out;
}

async function processOnePost(mdPath) {
  const sourceRelDir = path.dirname(mdPath); // e.g. source/_posts
  const baseNameNoExt = path.basename(mdPath, path.extname(mdPath)); // slug
  const assetDir = path.join(sourceRelDir, baseNameNoExt); // 文章同名资源目录

  if (!fs.existsSync(assetDir) || !fs.statSync(assetDir).isDirectory()) {
    return { changed: false };
  }

  const orig = fs.readFileSync(mdPath, 'utf8');
  const imgs = findImages(orig);
  if (imgs.length === 0) return { changed: false };

  let text = orig;
  let changed = false;

  for (const it of imgs) {
    const p = it.path;
    if (isHttpUrl(p)) continue; // 已是线上 URL
    // 仅处理相对路径，不处理以 / 开头的站内绝对路径
    if (/^[\\/]/.test(p)) continue;

    // 统一分隔符，去掉起始的 ./ 或 .\
    const cleaned = p.replace(/^\.?[\\/]/, '').replace(/\\/g, '/');

    // 如果路径以 <slug>/ 开头，把这段去掉，避免 assetDir 再拼一次 <slug>
    let rel = cleaned;
    if (cleaned.startsWith(baseNameNoExt + '/')) {
      rel = cleaned.slice(baseNameNoExt.length + 1);
    }

    // 首选：在同名目录里找
    let localAbs = path.join(assetDir, rel);
    let key = `${R2_KEY_PREFIX}/${baseNameNoExt}/${rel}`;
    let publicUrl = `https://blog.drwang.fun/assets/${key}`;

    if (!fs.existsSync(localAbs)) {
      // 兜底：按 source/_posts/<cleaned> 再找一次
      const altAbs = path.join(sourceRelDir, cleaned);
      if (fs.existsSync(altAbs)) {
        localAbs = altAbs;
        key = `${R2_KEY_PREFIX}/${cleaned}`;
        publicUrl = `https://blog.drwang.fun/assets/${key}`;
      } else {
        // 找不到就跳过
        continue;
      }
    }

    try {
      await ensureUpload(localAbs, key);
      const newText = doReplacements(text, p, publicUrl);
      if (newText !== text) {
        text = newText;
        changed = true;
        console.log(`[r2ify] ${path.relative(ROOT, mdPath)}: ${p} -> ${publicUrl}`);
      }
    } catch (e) {
      console.error('[r2ify] 上传失败：', e && e.message ? e.message : e);
      process.exitCode = 1;
    }
  }

  if (changed) {
    fs.writeFileSync(mdPath, text, 'utf8');
  }
  return { changed };
}

(async () => {
  const mdFiles = [
    ...glob.sync('source/_posts/**/*.md', { nodir: true }),
    ...glob.sync('source/almanac/**/*.md', { nodir: true }),
    ...glob.sync('source/journal/**/*.md', { nodir: true })
  ];
  let totalChanged = 0;

  for (const f of mdFiles) {
    const { changed } = await processOnePost(path.join(ROOT, f));
    if (changed) totalChanged++;
  }

  // 保存 manifest
  try {
    fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  } catch (e) {
    console.error('[r2ify] 写入 manifest 失败：', e && e.message ? e.message : e);
  }

  // console.log(`[r2ify] 完成。修改了 ${totalChanged} 篇文章。`);
})();
