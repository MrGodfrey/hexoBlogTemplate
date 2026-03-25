/**
 * Hexo Helper: get_review_data(tagName)
 * Returns a JSON-serializable array of review metadata for the given tag.
 * Used by the reviews.pug template to render Douban-style review cards.
 */
const DEFAULT_POSTERS = {
  '影评': '/img/review-movie.svg',
  '探店': '/img/review-restaurant.svg',
  '书评': '/img/review-book.svg'
};

hexo.extend.helper.register('get_review_data', function (tagName) {
  const tag = this.site.tags.findOne({ name: tagName });
  if (!tag) return { items: [], categories: [], cities: [] };

  const fallbackPoster = DEFAULT_POSTERS[tagName] ? this.url_for(DEFAULT_POSTERS[tagName]) : '';
  const allTags = new Set();
  const allCities = new Set();

  const items = tag.posts.sort('date', -1).map(post => {
    const imgRegex = /<img[^>]+src=['"]([^'"]+)['"]/g;
    let match;
    let lastSrc = '';

    while ((match = imgRegex.exec(post.content)) !== null) {
      lastSrc = match[1];
    }

    if (!lastSrc) {
      lastSrc = fallbackPoster;
    }

    let excerpt = '';
    if (post.excerpt && typeof post.excerpt === 'string') {
      excerpt = post.excerpt;
    } else if (post.content) {
      const stripped = post.content.replace(/<[^>]+>/g, '').trim();
      excerpt = stripped ? stripped.substring(0, 100) + '...' : '';
    }

    const showTags = Array.isArray(post.show_tags)
      ? post.show_tags
      : (post.show_tags ? [post.show_tags] : []);
    showTags.forEach(tagNameValue => allTags.add(tagNameValue));

    const city = typeof post.city === 'string' ? post.city.trim() : '';
    if (city) allCities.add(city);

    return {
      title: post.title,
      url: post.path,
      date: post.date.unix(),
      date_str: post.date.format('YYYY-MM-DD'),
      year: post.date.format('YYYY'),
      rating: post.rating || 0,
      pub_year: post.pub_year || '',
      poster: lastSrc,
      excerpt,
      show_tags: showTags,
      city
    };
  });

  return {
    items,
    categories: Array.from(allTags).sort(),
    cities: Array.from(allCities).sort()
  };
});