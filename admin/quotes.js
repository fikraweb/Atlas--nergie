import { locale, setMessage } from './i18n.js';
const statuses = { new: 'Nouvelle', contacted: 'Contactée', closed: 'Clôturée' };

export function setupQuotes(request, serviceTitle) {
  const list = document.querySelector('#quote-list');
  const notice = document.querySelector('#quote-status');
  const filter = document.querySelector('#quote-filter');
  const refresh = document.querySelector('#quote-refresh');
  const more = document.querySelector('#quote-more');
  let next = null;
  let requestVersion = 0;

  function formatMeta(meta) {
    const dateFormat = new Intl.DateTimeFormat(locale(), {
      dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Casablanca',
    });
    const { createdAt, service, city, language } = meta.dataset;
    meta.textContent = [
      dateFormat.format(new Date(createdAt.replace(' ', 'T') + 'Z')),
      serviceTitle(service), city, language.toUpperCase(),
    ].join(' · ');
  }

  function render(quote) {
    const article = document.createElement('article');
    article.className = 'quote-entry';
    const heading = document.createElement('h3');
    heading.textContent = quote.name;
    const meta = document.createElement('p');
    meta.className = 'sub';
    Object.assign(meta.dataset, {
      createdAt: quote.created_at, service: quote.service, city: quote.city, language: quote.language,
    });
    formatMeta(meta);
    const description = document.createElement('p');
    description.className = 'quote-description';
    description.dir = 'auto';
    description.textContent = quote.description;
    const phone = document.createElement('a');
    phone.href = 'tel:' + quote.phone.replace(/[^+0-9]/g, '');
    phone.textContent = quote.phone;
    const label = document.createElement('label');
    const labelText = document.createElement('span');
    setMessage(labelText, 'Suivi');
    label.append(labelText);
    const select = document.createElement('select');
    for (const [value, text] of Object.entries(statuses)) {
      const option = new Option('', value);
      setMessage(option, text);
      select.add(option);
    }
    select.value = quote.status;
    select.addEventListener('change', async () => {
      select.disabled = true;
      try {
        await request('', { method: 'PATCH', body: JSON.stringify({ id: quote.id, status: select.value }) }, '/api/quotes');
        quote.status = select.value;
        if (filter.value !== 'all') await load();
      } catch (error) {
        select.value = quote.status;
        setMessage(notice, error.message);
      } finally {
        select.disabled = false;
      }
    });
    label.append(select);
    const actions = document.createElement('div');
    actions.className = 'quote-actions';
    actions.append(phone, label);
    article.append(heading, meta, description, actions);
    return article;
  }

  async function load(append = false) {
    const version = ++requestVersion;
    const cursor = append ? '&before=' + next : '';
    setMessage(notice, 'Chargement des demandes…');
    more.disabled = true;
    try {
      const data = await request('?status=' + filter.value + cursor, {}, '/api/quotes');
      if (version !== requestVersion) return;
      if (!append) list.replaceChildren();
      list.append(...data.quotes.map(render));
      next = data.next;
      more.hidden = !next;
      setMessage(notice, list.children.length ? '' : 'Aucune demande pour ce filtre.');
    } catch (error) {
      if (version === requestVersion) setMessage(notice, error.message);
    } finally {
      if (version === requestVersion) more.disabled = false;
    }
  }

  refresh.addEventListener('click', () => load());
  filter.addEventListener('change', () => load());
  more.addEventListener('click', () => load(true));
  return {
    load,
    localize() { list.querySelectorAll('[data-created-at]').forEach(formatMeta); },
    clear() {
      requestVersion++;
      list.replaceChildren();
      setMessage(notice, '');
      more.hidden = true;
      next = null;
    },
  };
}
