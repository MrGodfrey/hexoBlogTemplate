/**
 * Reviews page: client-side sorting and filtering.
 */
(function () {
  var container = document.getElementById('reviews-container');
  if (!container) return;

  var sortBtns = document.querySelectorAll('.sort-btn');
  var filterBtns = document.querySelectorAll('.filter-btn');
  var cityBtns = document.querySelectorAll('.city-btn');
  var currentSort = 'date';
  var currentOrder = 'desc';
  var currentFilter = 'all';
  var currentCity = 'all';

  sortBtns.forEach(function (btn) {
    btn.addEventListener('click', function (event) {
      event.preventDefault();
      var sortBy = this.getAttribute('data-sort');

      if (sortBy === currentSort) {
        currentOrder = currentOrder === 'desc' ? 'asc' : 'desc';
      } else {
        currentSort = sortBy;
        currentOrder = 'desc';
      }

      sortBtns.forEach(function (button) { button.classList.remove('active'); });
      this.classList.add('active');
      sortCards(currentSort, currentOrder);
    });
  });

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function (event) {
      event.preventDefault();
      currentFilter = this.getAttribute('data-tag');

      filterBtns.forEach(function (button) { button.classList.remove('active'); });
      this.classList.add('active');
      applyFilters();
    });
  });

  cityBtns.forEach(function (btn) {
    btn.addEventListener('click', function (event) {
      event.preventDefault();
      currentCity = this.getAttribute('data-city');

      cityBtns.forEach(function (button) { button.classList.remove('active'); });
      this.classList.add('active');
      applyFilters();
    });
  });

  function applyFilters() {
    var cards = Array.prototype.slice.call(container.querySelectorAll('.review-card'));

    cards.forEach(function (card) {
      var tagMatch = currentFilter === 'all' || (card.getAttribute('data-tags') || '').split(',').indexOf(currentFilter) !== -1;
      var cityMatch = currentCity === 'all' || card.getAttribute('data-city') === currentCity;
      card.style.display = tagMatch && cityMatch ? 'flex' : 'none';
    });

    sortCards(currentSort, currentOrder);
  }

  function sortCards(sortBy, order) {
    var cards = Array.prototype.slice.call(container.querySelectorAll('.review-card'));
    var visible = cards.filter(function (card) {
      return card.style.display !== 'none';
    });

    visible.sort(function (left, right) {
      var leftValue;
      var rightValue;

      if (sortBy === 'rating') {
        leftValue = parseFloat(left.getAttribute('data-rating')) || 0;
        rightValue = parseFloat(right.getAttribute('data-rating')) || 0;
      } else {
        leftValue = parseInt(left.getAttribute('data-date'), 10) || 0;
        rightValue = parseInt(right.getAttribute('data-date'), 10) || 0;
      }

      return order === 'desc' ? rightValue - leftValue : leftValue - rightValue;
    });

    visible.forEach(function (card) {
      container.appendChild(card);
    });
  }
})();