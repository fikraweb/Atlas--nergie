import { services as fr } from '../content.js';
import { services as ar } from '../content-ar.js';
import { company } from '../config.js';

const $ = selector => document.querySelector(selector);
const login = $('#login');
const dashboard = $('#dashboard');
const editor = $('#editor');
const serviceSelect = $('#edit-service');
const languageSelect = $('#edit-language');
const periodSelect = $('#period');
const formatting = new Intl.NumberFormat('fr-MA');
const defaults = { fr, ar };
const fields = ['title', 'summary', 'description'];
const metrics = [
  ['page_view', 'Vues de pages'],
  ['service_open', 'Fiches ouvertes'],
  ['quote_open', 'Devis préparés'],
  ['whatsapp_open', 'Clics WhatsApp'],
];
let token = '';
let draft;

function append(parent, tag, text, className) {
  const element = document.createElement(tag);
  if (text != null) element.textContent = text;
  if (className) element.className = className;
  parent.append(element);
  return element;
}

async function request(path = '', options = {}) {
  const response = await fetch('/api/admin' + path, {
    ...options,
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
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
  dashboard.hidden = true;
  $('#logout').hidden = true;
  login.hidden = false;
  $('#login-status').textContent = '';
  $('#publish-status').textContent = '';
  $('#login-form').elements.token.focus();
}

function currentService() {
  const lang = languageSelect.value;
  const id = serviceSelect.value;
  return draft.services[lang]?.[id] ?? defaults[lang].find(service => service.id === id);
}

function showPublished(updatedAt) {
  $('#published-at').textContent = updatedAt
    ? 'Dernière publication : ' + new Intl.DateTimeFormat('fr-MA', {
      dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Casablanca',
    }).format(new Date(updatedAt.replace(' ', 'T') + 'Z'))
    : 'Contenu initial du site.';
}

function loadService() {
  const service = currentService();
  for (const field of fields) editor.elements[field].value = service[field];
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
    fields.map(field => [field, editor.elements[field].value])
  );
}

function renderStats({ stats, start, end }) {
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
    append(card, 'span', title);
    append(card, 'strong', formatting.format(totals[kind]));
  }
  const chart = $('#timeline');
  const dailyList = $('#daily-list');
  const humanDate = day => day.split('-').reverse().join('/');
  $('#date-range').textContent = humanDate(start) + ' – ' + humanDate(end);
  chart.setAttribute('aria-label', 'Vues quotidiennes. Total : ' + formatting.format(totals.page_view));
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
    append(row, 'span', title);
    append(row, 'strong', formatting.format(languages[language]));
    const progress = append(row, 'progress');
    progress.max = totals.page_view || 1;
    progress.value = languages[language];
    progress.setAttribute('aria-label', 'Vues en ' + title.toLowerCase());
  }

  const table = $('#services-stats');
  table.replaceChildren();
  for (const service of fr) {
    const row = append(table, 'tr');
    append(row, 'th', draft.services.fr?.[service.id]?.title ?? service.title).scope = 'row';
    append(row, 'td', formatting.format(perService[service.id].service_open));
    append(row, 'td', formatting.format(perService[service.id].quote_open));
  }
}

async function refresh() {
  const status = $('#stats-status');
  const refreshButton = $('#refresh');
  refreshButton.disabled = periodSelect.disabled = true;
  status.textContent = 'Actualisation…';
  try {
    const data = await request('?days=' + periodSelect.value);
    if (!dashboard.hidden) {
      renderStats(data);
      status.textContent = '';
    }
  } catch (error) {
    status.textContent = error.message;
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
      revision: data.revision,
    };
    editor.elements.whatsappNumber.value = draft.whatsappNumber;
    loadServiceMenu();
    showPublished(data.updatedAt);
    renderStats(data);
    login.hidden = true;
    dashboard.hidden = false;
    $('#logout').hidden = false;
    status.textContent = '';
  } catch (error) {
    token = '';
    status.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});

$('#logout').addEventListener('click', logout);
$('#refresh').addEventListener('click', refresh);
periodSelect.addEventListener('change', refresh);
languageSelect.addEventListener('change', loadServiceMenu);
serviceSelect.addEventListener('change', loadService);
for (const field of fields) editor.elements[field].addEventListener('input', updateDraft);
editor.addEventListener('submit', async event => {
  event.preventDefault();
  const status = $('#publish-status');
  const button = editor.querySelector('button');
  button.disabled = true;
  status.textContent = 'Publication…';
  draft.whatsappNumber = editor.elements.whatsappNumber.value.trim();
  try {
    const data = await request('', { method: 'PUT', body: JSON.stringify(draft) });
    if (draft) {
      draft.revision = data.revision;
      showPublished(data.updatedAt);
      status.textContent = 'Modifications publiées.';
      refresh();
    }
  } catch (error) {
    status.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});
