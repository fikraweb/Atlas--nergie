const statuses = { new: 'Nouvelle', contacted: 'Contactée', closed: 'Clôturée' };
const dateFormat = new Intl.DateTimeFormat('fr-MA', {
  dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Casablanca',
});

export function setupQuotes(request, serviceTitle) {
  const list = document.querySelector('#quote-list');
  const notice = document.querySelector('#quote-status');
  const filter = document.querySelector('#quote-filter');
  const refresh = document.querySelector('#quote-refresh');
  const more = document.querySelector('#quote-more');
  let next = null;
  let requestVersion = 0;

  function render(quote) {
    const article = document.createElement('article');
    article.className = 'quote-entry';
    const heading = document.createElement('h3');
    heading.textContent = quote.name;
    const meta = document.createElement('p');
    meta.className = 'sub';
    meta.textContent = [
      dateFormat.format(new Date(quote.created_at.replace(' ', 'T') + 'Z')),
      serviceTitle(quote.language, quote.service), quote.city, quote.language.toUpperCase(),
    ].join(' · ');
    const description = document.createElement('p');
    description.className = 'quote-description';
    description.dir = 'auto';
    description.textContent = quote.description;
    const phone = document.createElement('a');
    phone.href = 'tel:' + quote.phone.replace(/[^+0-9]/g, '');
    phone.textContent = quote.phone;
    const label = document.createElement('label');
    label.textContent = 'Suivi';
    const select = document.createElement('select');
    select.replaceChildren(...Object.entries(statuses).map(([value, text]) => new Option(text, value)));
    select.value = quote.status;
    select.addEventListener('change', async () => {
      select.disabled = true;
      try {
        await request('', { method: 'PATCH', body: JSON.stringify({ id: quote.id, status: select.value }) }, '/api/quotes');
        quote.status = select.value;
        if (filter.value !== 'all') await load();
      } catch (error) {
        select.value = quote.status;
        notice.textContent = error.message;
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
    notice.textContent = 'Chargement des demandes…';
    more.disabled = true;
    try {
      const data = await request('?status=' + filter.value + cursor, {}, '/api/quotes');
      if (version !== requestVersion) return;
      if (!append) list.replaceChildren();
      list.append(...data.quotes.map(render));
      next = data.next;
      more.hidden = !next;
      notice.textContent = list.children.length ? '' : 'Aucune demande pour ce filtre.';
    } catch (error) {
      if (version === requestVersion) notice.textContent = error.message;
    } finally {
      if (version === requestVersion) more.disabled = false;
    }
  }

  refresh.addEventListener('click', () => load());
  filter.addEventListener('change', () => load());
  more.addEventListener('click', () => load(true));
  return {
    load,
    clear() {
      requestVersion++;
      list.replaceChildren();
      notice.textContent = '';
      more.hidden = true;
      next = null;
    },
  };
}
