import { getShow, saveNote, notes } from './state.js';

let currentShowId = null;
let lastOpenerButton = null;
let isSaving = false;

/**
 * C4. Відкриває діалог #details для серіалу.
 *
 * @param {number} id
 */
export function openDetails(id) {
  const show = getShow(id);
  currentShowId = id;
  lastOpenerButton = document.querySelector(`li[data-id="${id}"] [data-action="details"]`);

  const dialog = document.querySelector('#details');
  const titleEl = document.querySelector('#details-title');
  const summaryEl = document.querySelector('#details-summary');
  const linkEl = document.querySelector('#details-link');
  const form = document.querySelector('#note-form');

  if (!dialog || !titleEl || !summaryEl || !linkEl || !form) return;

  titleEl.textContent = show.name;
  linkEl.href = show.url;

  // Інертний розбір через DOMParser без запуску скриптів і сторонніх тегів (C4.3)
  summaryEl.replaceChildren();
  const parsedDoc = new DOMParser().parseFromString(show.summary || '', 'text/html');
  const children = parsedDoc.body.children;

  if (children.length > 0) {
    for (const child of children) {
      const p = document.createElement('p');
      p.textContent = child.textContent;
      summaryEl.append(p);
    }
  } else if (parsedDoc.body.textContent) {
    const p = document.createElement('p');
    p.textContent = parsedDoc.body.textContent;
    summaryEl.append(p);
  }

  // Очищення помилок і налаштування валідації
  form.noValidate = true;
  const ratingInput = form.elements.rating;
  const noteInput = form.elements.note;
  const errorEl = document.querySelector('#note-rating-error');

  ratingInput.removeAttribute('aria-invalid');
  ratingInput.removeAttribute('aria-describedby');
  if (errorEl) errorEl.textContent = '';

  // Заповнення збереженими даними або очищення
  const saved = notes.get(id);
  if (saved) {
    ratingInput.value = String(saved.rating);
    noteInput.value = saved.text || '';
  } else {
    ratingInput.value = '';
    noteInput.value = '';
  }

  dialog.showModal();
}

/**
 * C4. Підключає події діалогу #details: закриття та збереження форми.
 *
 * @param {() => void} refresh перемальовує список для поточних фільтрів
 */
export function initDetails(refresh) {
  const dialog = document.querySelector('#details');
  const form = document.querySelector('#note-form');
  if (!dialog || !form) return;

  form.noValidate = true;
  const ratingInput = form.elements.rating;
  const noteInput = form.elements.note;
  const errorEl = document.querySelector('#note-rating-error');

  // Очищення помилки в момент введення правильного значення (C4.9)
  ratingInput.addEventListener('input', () => {
    const val = ratingInput.value.trim();
    const num = Number(val);
    if (val !== '' && Number.isInteger(num) && num >= 1 && num <= 10) {
      ratingInput.removeAttribute('aria-invalid');
      ratingInput.removeAttribute('aria-describedby');
      if (errorEl) errorEl.textContent = '';
    }
  });

  // Кнопка «Скасувати»
  const cancelBtn = dialog.querySelector('button[type="button"]');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => dialog.close());
  }

  // Повернення фокусу на кнопку «Детальніше» при закритті діалогу (C4.5)
  dialog.addEventListener('close', () => {
    if (!isSaving && lastOpenerButton && lastOpenerButton.isConnected) {
      lastOpenerButton.focus();
    }
  });

  // Валідація та збереження форми
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const rawVal = ratingInput.value.trim();
    const num = Number(rawVal);
    const isValid = rawVal !== '' && Number.isInteger(num) && num >= 1 && num <= 10;

    if (!isValid) {
      ratingInput.setAttribute('aria-invalid', 'true');
      ratingInput.setAttribute('aria-describedby', 'note-rating-error');
      if (errorEl) errorEl.textContent = 'Вкажіть ціле число від 1 до 10';
      ratingInput.focus();
      return;
    }

    saveNote(currentShowId, { rating: num, text: noteInput.value || '' });

    isSaving = true;
    dialog.close();
    refresh();

    const show = getShow(currentShowId);
    const statusEl = document.querySelector('#status');
    if (statusEl) {
      statusEl.textContent = `Нотатку до ${show.name} збережено`;
    }

    // Фокус на кнопку «Детальніше» перемальованої картки (C4.12)
    const newDetailsBtn = document.querySelector(`li[data-id="${currentShowId}"] [data-action="details"]`);
    if (newDetailsBtn) newDetailsBtn.focus();

    isSaving = false;
  });
}