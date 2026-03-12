/* scripts/almanac-anchor.js
 * 为 layout=almanac-day 的页面，把 <h2>YYYY</h2> → <h2 id="yYYYY">YYYY</h2>
 * 注意：仅匹配“纯数字 4 位”的 H2；不会影响其它标题
 */
hexo.extend.filter.register('after_post_render', function(data) {
  if (!data || data.layout !== 'almanac-day' || !data.content) return data;

  // 1) 给没有 id 的 <h2>YYYY</h2> 加 id
  data.content = data.content.replace(
    /<h2(\s+[^>]*)?>(\s*)(\d{4})(\s*)<\/h2>/gi,
    function(_, attrs='', pre='', year, post=''){
      if (/id\s*=/.test(attrs)) return `<h2${attrs}>${pre}${year}${post}</h2>`;
      return `<h2${attrs} id="y${year}">${pre}${year}${post}</h2>`;
    }
  );

  // 2) 目录（可选）：若你想自动在页顶加一个按年份倒序的 TOC，可在这里解析生成
  return data;
});
