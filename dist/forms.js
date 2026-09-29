const FORM_ENDPOINT = 'https://energosfera-ufa.i-e-timakov.chatgpt.site/api/application';

document.querySelectorAll('.contact-form').forEach(form => {
  const phone = form.querySelector('input[name="phone"]');
  const message = form.querySelector('textarea[name="message"]');
  if (phone && !form.querySelector('input[name="email"]')) {
    const email = document.createElement('label');
    email.innerHTML = 'Электронная почта (по желанию)<input name="email" type="email" autocomplete="email" placeholder="name@example.com">';
    phone.closest('label').after(email);
  }
  if (message) message.placeholder = 'Тип оборудования, напряжение необходимые работы, проектная документация, техническое задание.';
  if (message && !form.querySelector('input[name="attachments"]')) {
    const files = document.createElement('label');
    files.className = 'file-field';
    files.innerHTML = 'Прикрепить файлы (по желанию)<span>Проектная документация, ТЗ, КП или договоры</span><input name="attachments" type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt" aria-describedby="file-help"><small id="file-help">До 5 файлов, каждый не более 20 МБ.</small>';
    message.closest('label').after(files);
  }
});

document.querySelectorAll('[data-telegram-form]').forEach(form => {
  form.addEventListener('submit', async event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!form.reportValidity()) return;
    const payload = new FormData(form);
    const status = form.querySelector('.form-status');
    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    submit.dataset.label = submit.innerHTML;
    submit.textContent = 'Отправляем…';
    status.textContent = '';
    try {
      const response = await fetch(FORM_ENDPOINT, { method: 'POST', body: payload });
      if (!response.ok) throw new Error('request failed');
      form.reset();
      status.textContent = 'Спасибо! Заявка отправлена. Мы свяжемся с вами.';
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
