/** @typedef {import('./state.js').Show} Show */
import { watchlist, notes, shows } from './state.js';

/**
 * C1 / C4. Показує серіали в списку #results — по картці з шаблону #show-card на кожен,
 * у тому самому порядку, — і оновлює рядок статусу #status.
 *
 * @param {readonly Show[]} list серіали, які треба показати
 */
export function renderShows(list) {
  const results = document.querySelector('#results');
  const status = document.querySelector('#status');
  const template = document.querySelector('#show-card');

  if (!results || !status || !template) return;

  // Оновлюємо статус без заміни самого DOM-елемента
  status.textContent = list.length
    ? `Знайдено: ${list.length} з ${shows.length}`
    : 'Нічого не знайдено';

  results.replaceChildren();

  for (const show of list) {
    const card = template.content.firstElementChild.cloneNode(true);
    card.dataset.id = String(show.id);

    // Безпечне встановлення назви (textContent уникає XSS та коректно обробляє апострофи)
    card.querySelectorAll('[data-field="name"]').forEach((el) => {
      el.textContent = show.name;
    });

    const yearEl = card.querySelector('[data-field="year"]');
    if (yearEl) {
      yearEl.textContent = show.year != null ? String(show.year) : '—';
    }

    const genresEl = card.querySelector('[data-field="genres"]');
    if (genresEl) {
      genresEl.textContent = show.genres && show.genres.length > 0 ? show.genres.join(', ') : '—';
    }

    const ratingEl = card.querySelector('[data-field="rating"]');
    if (ratingEl) {
      ratingEl.textContent = show.rating != null ? String(show.rating) : '—';
    }

    const toggleBtn = card.querySelector('[data-action="toggle"]');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-pressed', watchlist.has(show.id) ? 'true' : 'false');
    }

    // Відображення збереженої оцінки та нотатки
    const myRatingBlock = card.querySelector('.card__mine');
    const myRatingVal = card.querySelector('[data-field="my-rating"]');
    const noteEl = card.querySelector('[data-field="note"]');
    const savedNote = notes.get(show.id);

    if (savedNote) {
      if (myRatingBlock && myRatingVal) {
        myRatingBlock.hidden = false;
        myRatingVal.textContent = String(savedNote.rating);
      }
      if (noteEl) {
        if (savedNote.text) {
          noteEl.hidden = false;
          noteEl.textContent = savedNote.text;
        } else {
          noteEl.hidden = true;
        }
      }
    } else {
      if (myRatingBlock) myRatingBlock.hidden = true;
      if (noteEl) noteEl.hidden = true;
    }

    results.append(card);
  }
}