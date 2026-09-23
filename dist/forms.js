const FORM_ENDPOINT = 'https://energosfera-ufa.i-e-timakov.chatgpt.site/api/application';

document.querySelectorAll('[data-telegram-form]').forEach(form => {
  form.addEventListener('submit', async event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form));
    const status = form.querySelector('.form-status');
    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    submit.dataset.label = submit.innerHTML;
    submit.textContent = 'Отправляем…';
    status.textContent = '';
    try {
      const response = await fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ kind: form.dataset.formKind, name: data.name, phone: data.phone, message: data.message, vacancy: data.vacancy, consent: data.consent === 'on' }) });
      if (!response.ok) throw new Error('request failed');
      form.reset();
      status.textContent = 'Спасибо! Заявка отправлена, мы свяжемся с вами.';
      status.classList.add('success');
    } catch {
      status.textContent = 'Не удалось отправить заявку. Позвоните нам: +7 (993) 141-90-20.';
      status.classList.remove('success');
    } finally {
      submit.disabled = false;
      submit.innerHTML = submit.dataset.label;
    }
  });
});
