import { applyLanguage, language, locale, prepareTranslations, setMessage, t } from './i18n.js';
import { icon } from '../icons.js';
import { setupPhotos } from './photos.js';
import { setupQuotes } from './quotes.js';
import { labels as frenchLabels, services as fr } from '../content.js';
import { labels as arabicLabels, services as ar } from '../content-ar.js';
import { company } from '../config.js';

const $ = selector => document.querySelector(selector);
const login = $('#login');
const dashboard = $('#dashboard');
const dashboardMenu = $('#dashboard-menu');
const dashboardNav = $('#dashboard-nav');
const viewLinks = [...dashboardNav.querySelectorAll('[data-view-link]')];
const views = [...dashboard.querySelectorAll('[data-view]')];
const editor = $('#editor');
const serviceSelect = $('#edit-service');
const languageSelect = $('#edit-language');
const periodSelect = $('#period');
const languageButton = $('#interface-language');
const defaults = { fr, ar };
const fields = ['title', 'summary', 'description', 'benefits', 'solutions'];
const metrics = [
  ['page_view', 'Vues de pages'],
  ['service_open', 'Fiches ouvertes'],
  ['quote_open', 'Devis préparés'],
  ['whatsapp_open', 'Clics WhatsApp'],
];
let token = '';
let draft;
let latestStats;
let lastPublished;

function append(parent, tag, text, className) {
  const element = document.createElement(tag);
  if (text != null) element.textContent = text;
  if (className) element.className = className;
  parent.append(element);
  return element;
}

async function request(path = '', { contentType = 'application/json', ...options } = {}, endpoint = '/api/admin') {
  const response = await fetch(endpoint + path, {
    ...options,
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': contentType },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && !dashboard.hidden) logout();
    throw new Error(payload.error || 'La requête a échoué.');
  }
  return payload;
}

function logout() {
  token = '';
  draft = undefined;
  editor.reset();
  quotes.clear();
  $('#photo-form').reset();
  setMessage($('#photo-status'), '');
  dashboard.hidden = true;
  setDashboardMenu(false);
  $('#logout').hidden = true;
  login.hidden = false;
  setMessage($('#login-status'), '');
  setMessage($('#publish-status'), '');
  $('#login-form').elements.token.focus();
}

function serviceFor(lang, id) {
  return { ...defaults[lang].find(service => service.id === id), ...draft?.services[lang]?.[id] };
}

const quotes = setupQuotes(request, id => serviceFor(language(), id).title || id);
const renderPhotos = setupPhotos({
  request, currentDraft: () => draft, serviceSelect, defaults,
  labels: { fr: frenchLabels, ar: arabicLabels },
});

function setDashboardMenu(open) {
  dashboardMenu.setAttribute('aria-expanded', String(open));
  dashboardNav.classList.toggle('is-open', open);
  dashboardMenu.querySelector('[data-nav-icon]').innerHTML = icon(open ? 'close' : 'menu');
}

function showDashboardView(focusHeading = false) {
  const hash = location.hash.slice(1);
  const active = views.find(view => view.dataset.view === hash) ?? views[0];
  for (const view of views) view.hidden = view !== active;
  for (const link of viewLinks) {
    if (link.dataset.viewLink === active.dataset.view) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  setDashboardMenu(false);
  if (active.dataset.view === 'requests') quotes.load();
  if (focusHeading) {
    window.scrollTo(0, 0);
    active.querySelector('h1').focus({ preventScroll: true });
  }
}

for (const element of document.querySelectorAll('[data-nav-icon]')) {
  element.innerHTML = icon(element.dataset.navIcon);
}
dashboardMenu.addEventListener('click', () => setDashboardMenu(dashboardMenu.getAttribute('aria-expanded') !== 'true'));
dashboardNav.addEventListener('click', event => {
  const link = event.target.closest('[data-view-link]');
  if (!link || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  event.preventDefault();
  if (location.hash !== link.hash) history.pushState(null, '', link.hash);
  showDashboardView(true);
});
dashboard.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || dashboardMenu.getAttribute('aria-expanded') !== 'true') return;
  setDashboardMenu(false);
  dashboardMenu.focus();
});
window.addEventListener('hashchange', () => {
  if (!dashboard.hidden) showDashboardView(true);
});

function showPublished(updatedAt) {
  lastPublished = updatedAt;
  $('#published-at').textContent = updatedAt
    ? t('Dernière publication :') + ' ' + new Intl.DateTimeFormat(locale(), {
      dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Casablanca',
    }).format(new Date(updatedAt.replace(' ', 'T') + 'Z'))
    : t('Contenu initial du site.');
}

function loadService() {
  const service = serviceFor(languageSelect.value, serviceSelect.value);
  for (const field of fields) {
    const value = service[field];
    editor.elements[field].value = Array.isArray(value) ? value.join('\n') : value;
  }
}

function loadServiceMenu() {
  const selected = serviceSelect.value;
  const lang = languageSelect.value;
  serviceSelect.replaceChildren(...defaults[lang].map(service =>
    new Option(draft.services[lang]?.[service.id]?.title ?? service.title, service.id)));
  if (selected) serviceSelect.value = selected;
  loadService();
}

function updateDraft() {
  const lang = languageSelect.value;
  draft.services[lang] ??= {};
  draft.services[lang][serviceSelect.value] = Object.fromEntries(
    fields.map(field => {
      const value = editor.elements[field].value;
      return [field, ['benefits', 'solutions'].includes(field) ? value.split('\n').map(line => line.trim()).filter(Boolean) : value];
    })
  );
}

function renderStats(data) {
  latestStats = data;
  const { stats, start, end } = data;
  const formatting = new Intl.NumberFormat(locale());
  const dayFormat = new Intl.DateTimeFormat(locale(), { dateStyle: 'short', timeZone: 'UTC' });
  const totals = Object.fromEntries(metrics.map(([kind]) => [kind, 0]));
  const languages = { fr: 0, ar: 0 };
  const perService = Object.fromEntries(fr.map(({ id }) => [id, { service_open: 0, quote_open: 0 }]));
  const daily = new Map();
  const date = new Date(start + 'T00:00:00Z');
  while (date.toISOString().slice(0, 10) <= end) {
    daily.set(date.toISOString().slice(0, 10), 0);
    date.setUTCDate(date.getUTCDate() + 1);
  }
  for (const row of stats) {
    totals[row.kind] += row.total;
    if (row.kind === 'page_view') {
      daily.set(row.day, daily.get(row.day) + row.total);
      languages[row.language] += row.total;
    }
    if (row.service) perService[row.service][row.kind] += row.total;
  }

  const cards = $('#metrics');
  cards.replaceChildren();
  for (const [kind, title] of metrics) {
    const card = append(cards, 'div', null, 'metric');
    append(card, 'span', t(title));
    append(card, 'strong', formatting.format(totals[kind]));
  }
  const chart = $('#timeline');
  const dailyList = $('#daily-list');
  const humanDate = day => dayFormat.format(new Date(day + 'T00:00:00Z'));
  $('#date-range').textContent = humanDate(start) + ' – ' + humanDate(end);
  chart.setAttribute('aria-label', t('Vues quotidiennes. Total :') + ' ' + formatting.format(totals.page_view));
  chart.replaceChildren();
  dailyList.replaceChildren();
  const maximum = Math.max(1, ...daily.values());
  for (const [day, count] of daily) {
    const label = humanDate(day) + ' : ' + formatting.format(count);
    const bar = append(chart, 'span');
    bar.style.height = (count / maximum * 100) + '%';
    bar.title = label;
    append(dailyList, 'li', label);
  }

  const languageStats = $('#languages');
  languageStats.replaceChildren();
  for (const [language, title] of [['fr', 'Français'], ['ar', 'Arabe']]) {
    const row = append(languageStats, 'div', null, 'lang-stat');
    append(row, 'span', t(title));
    append(row, 'strong', formatting.format(languages[language]));
    const progress = append(row, 'progress');
    progress.max = totals.page_view || 1;
    progress.value = languages[language];
    progress.setAttribute('aria-label', t('Vues en ' + title.toLowerCase()));
  }

  const table = $('#services-stats');
  table.replaceChildren();
  for (const service of fr) {
    const row = append(table, 'tr');
    append(row, 'th', serviceFor(language(), service.id).title).scope = 'row';
    append(row, 'td', formatting.format(perService[service.id].service_open));
    append(row, 'td', formatting.format(perService[service.id].quote_open));
  }
}

async function refresh() {
  const status = $('#stats-status');
  const refreshButton = $('#refresh');
  refreshButton.disabled = periodSelect.disabled = true;
  setMessage(status, 'Actualisation…');
  try {
    const data = await request('?days=' + periodSelect.value);
    if (!dashboard.hidden) {
      renderStats(data);
      setMessage(status, '');
    }
  } catch (error) {
    setMessage(status, error.message);
  } finally {
    refreshButton.disabled = periodSelect.disabled = false;
  }
}

$('#login-form').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('button');
  const status = $('#login-status');
  button.disabled = true;
  token = form.elements.token.value.trim();
  form.reset();
  try {
    const data = await request('?days=' + periodSelect.value);
    draft = {
      whatsappNumber: data.content.whatsappNumber ?? company.whatsappNumber,
      services: data.content.services ?? {},
      media: data.content.media ?? {},
      revision: data.revision,
    };
    editor.elements.whatsappNumber.value = draft.whatsappNumber;
    loadServiceMenu();
    renderPhotos();
    showPublished(data.updatedAt);
    renderStats(data);
    login.hidden = true;
    dashboard.hidden = false;
    $('#logout').hidden = false;
    showDashboardView(true);
    setMessage(status, '');
  } catch (error) {
    token = '';
    setMessage(status, error.message);
  } finally {
    button.disabled = false;
  }
});

$('#logout').addEventListener('click', logout);
$('#refresh').addEventListener('click', refresh);
periodSelect.addEventListener('change', refresh);
languageSelect.addEventListener('change', loadServiceMenu);
serviceSelect.addEventListener('change', () => {
  loadService();
  renderPhotos();
});
for (const field of fields) editor.elements[field].addEventListener('input', updateDraft);
editor.addEventListener('submit', async event => {
  event.preventDefault();
  const status = $('#publish-status');
  const button = editor.querySelector('button');
  button.disabled = true;
  setMessage(status, 'Publication…');
  draft.whatsappNumber = editor.elements.whatsappNumber.value.trim();
  try {
    const data = await request('', { method: 'PUT', body: JSON.stringify(draft) });
    if (draft) {
      draft.revision = data.revision;
      showPublished(data.updatedAt);
      setMessage($('#photo-status'), '');
      setMessage(status, 'Modifications publiées.');
      refresh();
    }
  } catch (error) {
    setMessage(status, error.message);
  } finally {
    button.disabled = false;
  }
});

prepareTranslations();
function switchLanguage(code) {
  applyLanguage(code);
  const target = code === 'ar' ? 'fr' : 'ar';
  languageButton.lang = target;
  languageButton.dir = target === 'ar' ? 'rtl' : 'ltr';
  languageButton.textContent = target === 'ar' ? 'العربية' : 'Français';
  if (!dashboard.hidden) {
    if (latestStats) renderStats(latestStats);
    showPublished(lastPublished);
    quotes.localize();
  }
}

const preference = 'atlas-admin-language';
try {
  switchLanguage(localStorage.getItem(preference) === 'ar' ? 'ar' : 'fr');
} catch {
  switchLanguage('fr');
}
languageButton.addEventListener('click', () => {
  const code = language() === 'ar' ? 'fr' : 'ar';
  switchLanguage(code);
  try {
    localStorage.setItem(preference, code);
  } catch {
    // Language switching still works when browser storage is unavailable.
  }
});
