// ── Lockwood Contracting — main.js ──────────────────────────
// Lightbox gallery + contact form handler + footer year.
// No dependencies.

'use strict';

// ── Footer year ──────────────────────────────────────────────
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();


// ── Lightbox ──────────────────────────────────────────────────
(() => {
  const grid    = document.querySelector('[data-lightbox]');
  const lb      = document.getElementById('lightbox');
  if (!grid || !lb) return;

  const lbImg     = document.getElementById('lb-img');
  const lbCaption = document.getElementById('lb-caption');
  const btnClose  = lb.querySelector('.lb-close');
  const btnPrev   = lb.querySelector('.lb-prev');
  const btnNext   = lb.querySelector('.lb-next');

  const items = Array.from(grid.querySelectorAll('a[data-lb]'));
  let current = -1;

  function open(i) {
    current = (i + items.length) % items.length;
    const a = items[current];
    lbImg.src = a.getAttribute('href');
    lbImg.alt = a.querySelector('img')?.alt ?? '';
    lbCaption.textContent = a.getAttribute('data-lb') ?? '';
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    btnClose.focus();
  }

  function close() {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  function prev() { open(current - 1); }
  function next() { open(current + 1); }

  // Click on grid image
  grid.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-lb]');
    if (!a) return;
    e.preventDefault();
    open(items.indexOf(a));
  });

  // Controls
  btnClose.addEventListener('click', close);
  if (btnPrev) btnPrev.addEventListener('click', prev);
  if (btnNext) btnNext.addEventListener('click', next);

  // Click backdrop to close
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
  });
})();


// ── Contact form → Google Apps Script ─────────────────────────
// 1. Create your Google Sheet + Apps Script (see FORM-SETUP.md).
// 2. Paste your deployed script URL below.
// 3. Remove the early-return guard on the next line.
(() => {
  const ENDPOINT = 'YOUR_GOOGLE_APPS_SCRIPT_URL'; // ← replace this

  const form   = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (!form || !status) return;

  // Guard: show a clear message if endpoint hasn't been configured yet.
  const isPlaceholder = ENDPOINT === 'YOUR_GOOGLE_APPS_SCRIPT_URL';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Basic client-side validation
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const btn = form.querySelector('[type=submit]');
    btn.disabled = true;
    btn.textContent = 'Sending…';
    status.textContent = '';
    status.className = 'form-status';

    // Placeholder mode: simulate success so the UI can be reviewed.
    if (isPlaceholder) {
      await delay(600);
      showSuccess();
      btn.disabled = false;
      btn.textContent = 'Send inquiry';
      return;
    }

    try {
      const payload = Object.fromEntries(new FormData(form));

      // Send as text/plain to avoid a CORS preflight that GAS can't handle.
      // The Apps Script reads e.postData.contents and parses as JSON.
      await fetch(ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        mode: 'no-cors', // GAS redirects; we treat any network success as ok.
      });

      showSuccess();
    } catch {
      status.textContent = 'Something went wrong — please try calling instead.';
      status.classList.add('form-status--err');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Send inquiry';
    }
  });

  function showSuccess() {
    status.textContent = 'Message sent — we\'ll be in touch soon.';
    status.classList.add('form-status--ok');
    form.reset();
  }

  function delay(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }
})();
