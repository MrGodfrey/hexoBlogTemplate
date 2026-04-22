'use strict';

/**
 * r2ify-sources.js
 *
 * 用法：在命令行中手动执行
 * 功能：
 *  - 扫描 source/_posts / source/almanac / source/journal 下的 .md 文件
 *  - 识别 Markdown/HTML/asset_img 中的相对路径图片
 *  - 若该图片存在于文章资源目录中，上传到 Cloudflare R2（S3 兼容）
 *  - 将文中相对路径替换为线上 URL（R2_PUBLIC_BASE + key）
 *  - 用 manifest 记录 hash，避免重复上传
 *
 * 注意：
 * Hexo 会自动加载 scripts/ 目录下的 JS 文件，所以这个文件必须只在
 * `node scripts/r2ify-sources.js` 这类直接调用时执行，不能在 require 时跑。
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const glob = require('glob');

const ROOT = process.cwd();
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

function joinPublicUrl(base, key) {
  return `${base.replace(/\/+$/, '')}/${key}`;
}

function findImages(text) {
  const items = [];

  const mdRe = /!\[[^\]]*?\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g;
  let m;
  while ((m = mdRe.exec(text)) !== null) {
    const p = m[1].trim().replace(/^<|>$/g, '');
    items.push({ type: 'md', full: m[0], path: p });
  }

  const imgRe = /<img[^>]*\s+src=["']([^"']+)["'][^>]*>/gi;
  let n;
  while ((n = imgRe.exec(text)) !== null) {
    items.push({ type: 'html', full: n[0], path: n[1] });
  }

  const assetRe = /{%\s*asset_img\s+([^\s"']+)(?:\s+[^%]+)?%}/g;
  let a;
  while ((a = assetRe.exec(text)) !== null) {
    items.push({ type: 'asset_img', full: a[0], path: a[1] });
  }

  return items;
}

async function ensureUpload(localAbsPath, key, ctx) {
  const buf = fs.readFileSync(localAbsPath);
  const hash = sha1(buf);
  const rec = manifest[key];
  if (rec && rec.hash === hash) {
    return { uploaded: false, etag: rec.etag || null };
  }

  try {
    await ctx.s3.send(new ctx.HeadObjectCommand({ Bucket: ctx.R2_BUCKET, Key: key }));
  } catch (_) {}

  const contentType = getMimeType(localAbsPath);
  const put = await ctx.s3.send(new ctx.PutObjectCommand({
    Bucket: ctx.R2_BUCKET,
    Key: key,
    Body: buf,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  }));

  manifest[key] = { hash, ts: Date.now(), etag: put.ETag || null };
  return { uploaded: true, etag: put.ETag || null };
}

function doReplacements(text, p, publicUrl) {
  let out = text;

  const mdRe = new RegExp(
    String.raw`!\[([^\]]*?)\]\(\s*${escapeReg(p)}(?:\s+(?:"([^"]*)"|'([^']*)'))?\s*\)`,
    'g'
  );
  out = out.replace(mdRe, (match, alt, t1, t2) => {
    const baseNoExt = path.basename(p).replace(/\.[^.]+$/, '');
    const title = (t1 || t2 || alt || baseNoExt).trim();
    return `{% img ${publicUrl} "${title}" %}`;
  });

  const htmlRe = new RegExp(`(<img[^>]*\\s+src=["'])\\s*${escapeReg(p)}(["'][^>]*>)`, 'gi');
  out = out.replace(htmlRe, `$1${publicUrl}$2`);

  const assetRe = new RegExp(`{%\\s*asset_img\\s+${escapeReg(p)}(?:\\s+([^%]+))?%}`, 'g');
  out = out.replace(assetRe, (match, rest) => {
    let titleText = '';
    if (rest) {
      const titleMatch = rest.match(/["']([^"']+)["']/);
      if (titleMatch) titleText = titleMatch[1];
    }
    if (!titleText) titleText = path.basename(p).replace(/\.[^.]+$/, '');
    return `{% img ${publicUrl} "${titleText}" %}`;
  });

  return out;
}

async function processOnePost(mdPath, ctx) {
  const sourceRelDir = path.dirname(mdPath);
  const baseNameNoExt = path.basename(mdPath, path.extname(mdPath));
  const assetDir = path.join(sourceRelDir, baseNameNoExt);

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
    if (isHttpUrl(p)) continue;
    if (/^[\\/]/.test(p)) continue;

    const cleaned = p.replace(/^\.?[\\/]/, '').replace(/\\/g, '/');
    let rel = cleaned;
    if (cleaned.startsWith(baseNameNoExt + '/')) {
      rel = cleaned.slice(baseNameNoExt.length + 1);
    }

    let localAbs = path.join(assetDir, rel);
    let key = `${ctx.R2_KEY_PREFIX}/${baseNameNoExt}/${rel}`;
    let publicUrl = joinPublicUrl(ctx.R2_PUBLIC_BASE, key);

    if (!fs.existsSync(localAbs)) {
      const altAbs = path.join(sourceRelDir, cleaned);
      if (fs.existsSync(altAbs)) {
        localAbs = altAbs;
        key = `${ctx.R2_KEY_PREFIX}/${cleaned}`;
        publicUrl = joinPublicUrl(ctx.R2_PUBLIC_BASE, key);
      } else {
        continue;
      }
    }

    try {
      await ensureUpload(localAbs, key, ctx);
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

async function main() {
  require('dotenv').config({ quiet: true });
  const { S3Client, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');

  const {
    R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY,
    R2_BUCKET,
    R2_PUBLIC_BASE = '/assets',
    R2_KEY_PREFIX = 'posts'
  } = process.env;

  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
    console.error('[r2ify] 缺少环境变量：R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET');
    process.exit(1);
  }

  const ctx = {
    HeadObjectCommand,
    PutObjectCommand,
    R2_BUCKET,
    R2_KEY_PREFIX,
    R2_PUBLIC_BASE,
    s3: new S3Client({
      region: 'auto',
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    }),
  };

  const mdFiles = [
    ...glob.sync('source/_posts/**/*.md', { nodir: true }),
    ...glob.sync('source/almanac/**/*.md', { nodir: true }),
    ...glob.sync('source/journal/**/*.md', { nodir: true })
  ];
  let totalChanged = 0;

  for (const f of mdFiles) {
    const { changed } = await processOnePost(path.join(ROOT, f), ctx);
    if (changed) totalChanged++;
  }

  try {
    fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  } catch (e) {
    console.error('[r2ify] 写入 manifest 失败：', e && e.message ? e.message : e);
  }

  void totalChanged;
}

if (require.main === module) {
  main().catch((err) => {
    console.error('[r2ify] 未处理异常：', err && err.stack ? err.stack : err);
    process.exit(1);
  });
}
