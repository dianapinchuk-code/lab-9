import { toggle, watchlist } from './state.js';
import { openDetails } from './details.js';

/**
 * C2 / C3. Підключає кнопки карток у списку #results: «До списку» додає серіал до мого списку
 * або прибирає з нього, «Детальніше» відкриває діалог.
 *
 * @param {() => void} refresh перемальовує список для поточних фільтрів
 */
export function initList(refresh) {
  const listEl = document.querySelector('#results');
  if (!listEl) return;

  // Рівно один обробник на список для Event Delegation (C2.1)
  listEl.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button || !listEl.contains(button)) return;

    const card = button.closest('li[data-id]');
    if (!card) return;

    const id = Number(card.dataset.id);
    const action = button.dataset.action;

    if (action === 'toggle') {
      const currentCards = [...listEl.querySelectorAll('li[data-id]')];
      const currentIndex = currentCards.indexOf(card);
      const nextCard = currentCards[currentIndex + 1];
      const prevCard = currentCards[currentIndex - 1];

      toggle(id);

      const counterEl = document.querySelector('#watchlist-count');
      if (counterEl) {
        counterEl.textContent = String(watchlist.size);
      }

      refresh();

      // Синхронне переведення фокусу (C2.7 та C3.7) без таймерів
      const sameCard = listEl.querySelector(`li[data-id="${id}"]`);
      if (sameCard) {
        sameCard.querySelector('[data-action="toggle"]')?.focus();
      } else {
        const nextId = nextCard?.dataset.id;
        const prevId = prevCard?.dataset.id;
        const nextBtn = nextId ? listEl.querySelector(`li[data-id="${nextId}"] [data-action="toggle"]`) : null;
        const prevBtn = prevId ? listEl.querySelector(`li[data-id="${prevId}"] [data-action="toggle"]`) : null;

        if (nextBtn) {
          nextBtn.focus();
        } else if (prevBtn) {
          prevBtn.focus();
        } else {
          const heading = document.querySelector('#results-heading');
          if (heading) {
            heading.tabIndex = -1;
            heading.focus();
          }
        }
      }
    } else if (action === 'details') {
      openDetails(id);
    }
  });
}