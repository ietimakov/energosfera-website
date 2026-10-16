const menu = document.querySelector('.menu');
const navigation = document.querySelector('#navigation');
function closeMenu() { navigation.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Открыть меню'); }
menu.addEventListener('click', () => { const open = navigation.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню'); });
navigation.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && navigation.classList.contains('open')) { closeMenu(); menu.focus(); } });
function revealService() { const target = document.getElementById(location.hash.slice(1)); if (target?.matches('details')) target.open = true; }
window.addEventListener('hashchange', revealService);
revealService();
const hero = document.querySelector('.hero');
if (hero && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  requestAnimationFrame(() => hero.classList.add('hero-play'));
}

document.querySelectorAll('[data-copy-email]').forEach(button => {
  const status = button.parentElement.querySelector('.copy-email-status');
  let resetTimer;
  button.addEventListener('click', async () => {
    clearTimeout(resetTimer);
    try {
      await navigator.clipboard.writeText(button.dataset.copyEmail);
      button.classList.add('is-copied');
      button.setAttribute('aria-label', 'Адрес электронной почты скопирован');
      status.textContent = 'Скопировано';
    } catch {
      button.classList.remove('is-copied');
      button.setAttribute('aria-label', 'Скопировать адрес электронной почты');
      status.textContent = 'Не удалось скопировать. Выделите адрес вручную.';
    }
    resetTimer = setTimeout(() => {
      button.classList.remove('is-copied');
      button.setAttribute('aria-label', 'Скопировать адрес электронной почты');
      status.textContent = '';
    }, 2500);
  });
});
