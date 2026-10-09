/** @typedef {import('./state.js').Filters} Filters */

/**
 * C3. Повертає поточні значення форми фільтрів #filters.
 *
 * @returns {Filters}
 */
export function readFilters() {
  const form = document.querySelector('#filters');
  if (!form) return {};

  return {
    query: form.elements.query ? form.elements.query.value : '',
    genre: form.elements.genre ? form.elements.genre.value : '',
    mine: form.elements.mine ? Boolean(form.elements.mine.checked) : false,
  };
}

/**
 * C3. Підключає форму фільтрів: після кожної зміни — refresh().
 *
 * @param {() => void} refresh перемальовує список для поточних фільтрів
 */
export function initFilters(refresh) {
  const form = document.querySelector('#filters');
  if (!form) return;

  const queryInput = form.elements.query;
  const genreSelect = form.elements.genre;
  const mineCheckbox = form.elements.mine;

  if (queryInput) queryInput.addEventListener('input', () => refresh());
  if (genreSelect) genreSelect.addEventListener('change', () => refresh());
  if (mineCheckbox) mineCheckbox.addEventListener('change', () => refresh());

  // Enter у пошуку не перезавантажує сторінку (C3.3)
  form.addEventListener('submit', (event) => {
    event.preventDefault();
  });

  // Синхронне скидання фільтрів без затримок і таймерів (C3.5)
  form.addEventListener('reset', (event) => {
    event.preventDefault();
    if (queryInput) queryInput.value = '';
    if (genreSelect) genreSelect.value = '';
    if (mineCheckbox) mineCheckbox.checked = false;
    refresh();
  });
}