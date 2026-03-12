/**
 * Wrap <img> with <figure> + <figcaption> (caption=title||alt)
 * 在最终 HTML 阶段处理，避免被后续插件覆盖
 */

function buildFigure(imgTag) {
  const titleMatch = imgTag.match(/\btitle="([^"]*)"/i);
  const altMatch = imgTag.match(/\balt="([^"]*)"/i);
  const caption = (titleMatch && titleMatch[1]) || (altMatch && altMatch[1]) || '';

  // 已经在 figure 中就不处理
  if (/\<figure[\s>][\s\S]*\<img/i.test(imgTag)) return imgTag;

  // 为图片添加 loading="lazy" 属性(如果还没有)
  let processedImg = imgTag;
  if (!/\bloading\s*=/i.test(processedImg)) {
    processedImg = processedImg.replace(/(<img\b[^>]*?)(\/?>)/i, '$1 loading="lazy"$2');
  }

  if (caption) {
    return `<figure>${processedImg}<figcaption>${caption}</figcaption></figure>`;
  } else {
    return `<figure>${processedImg}</figure>`;
  }
}

hexo.extend.filter.register('after_render:html', function (html, data) {
  // 记录一下命中数量，便于调试
  let count = 0;

  // 1) 先把 <p> 包裹单张图的情况替换为 <figure>
  html = html.replace(
    /<p>\s*(<img\b[^>]*\/?>)\s*(?:<br\s*\/?>)?\s*<\/p>/gi,
    function (_m, img) {
      count++;
      return buildFigure(img);
    }
  );

  // 2) 兜底:把裸露的 <img>(不在 figure 内)也包上
  html = html.replace(
    /(<img\b[^>]*\/?>)/gi,
    function (match, img, offset) {
      // 使用 offset 参数获取准确位置,避免 indexOf 找错位置
      const before = html.slice(Math.max(0, offset - 200), offset);
      const after = html.slice(offset + match.length, offset + match.length + 200);
      
      // 如果前面有 <figure 且后面有 </figure>,说明已被包裹
      if (before.includes('<figure') && after.includes('</figure>')) {
        return img;
      }

      count++;
      return buildFigure(img);
    }
  );

//   hexo.log.info(`[wrap_img_with_figure] wrapped images: ${count} in ${data?.path || data?.source || 'page'}`);
  return html;
});
