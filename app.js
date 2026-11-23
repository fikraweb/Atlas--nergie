import { company } from './config.js';
import { icon } from './icons.js';
import { galleryFor } from './gallery.js';

const arabic = document.documentElement.lang === 'ar';
const { commitments, labels, questions, services: defaultServices } = await (
  arabic ? import('./content-ar.js') : import('./content.js')
);

const language = arabic ? 'ar' : 'fr';
const siteApi = '/api/site';
const content = await fetch(siteApi, { signal: AbortSignal.timeout(1000) })
  .then(response => response.ok ? response.json() : {})
  .catch(() => ({}));
const htmlEntities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escapeHtml = value => value.replace(/[&<>"']/g, character => htmlEntities[character]);
const services = defaultServices.map(service => ({
  ...service,
  ...content.services?.[language]?.[service.id],
}));

function track(kind, service = '') {
  if (navigator.globalPrivacyControl === true || navigator.doNotTrack === '1') return;
  fetch(siteApi, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind, language, service }),
    keepalive: true,
  }).catch(() => {});
}
track('page_view');

const languageLink = document.querySelector('.language-link');
const languageUrl = languageLink.href;
function syncLanguageLink() {
  languageLink.href = languageUrl + location.hash;
}
syncLanguageLink();
window.addEventListener('hashchange', syncLanguageLink);

const dialog = document.querySelector('#detail');
const detailBody = document.querySelector('#detail-body');
const form = document.querySelector('#devis');
const select = form.elements.service;
const status = document.querySelector('#form-status');

const asset = name => 'assets/' + name + '.webp';
const list = items => '<ul>' + items.map(item => '<li>' + item + '</li>').join('') + '</ul>';
const gallery = galleryFor(services, labels, arabic);

function showService(service) {
  track('service_open', service.id);
  detailBody.innerHTML = `
    <img class="dialog-image" data-service-image="${service.id}" src="${asset(service.image)}" alt="${service.alt}">
    <div class="dialog-content">
      <h2 id="detail-title">${escapeHtml(service.title)}</h2>
      <p>${escapeHtml(service.description)}</p>
      <h3>${labels.benefits}</h3>${list(service.benefits)}
      <h3>${labels.solutions}</h3>${list(service.solutions)}
      ${service.photos ? `<div class="service-photos">${service.photos.map(({ image, caption }) => `
        <figure><img src="${asset(image)}" loading="lazy" alt="" width="550" height="380">
          <figcaption>${caption}</figcaption></figure>`).join('')}</div>` : ''}
      <a class="button primary" href="#devis">${labels.quote} ${icon('arrow')}</a>
    </div>`;
  detailBody.querySelector('a').addEventListener('click', event => {
    event.preventDefault();
    select.value = service.id;
    dialog.close();
    location.hash = 'devis';
    form.elements.name.focus({ preventScroll: true });
    form.scrollIntoView({ block: 'start' });
  });
  dialog.scrollTop = 0;
  dialog.showModal();
}

document.querySelector('#service-grid').innerHTML = services.map(service => `
  <article class="service-card">
    <div class="card-image"><img src="${asset(service.image)}" alt="${service.alt}" loading="lazy" width="600" height="360"></div>
    <div class="card-body">
      <i class="icon-box">${icon(service.icon)}</i>
      <h3>${escapeHtml(service.title)}</h3>
      <p>${escapeHtml(service.summary)}</p>
      <button class="text-link" type="button" data-service="${service.id}" aria-label="${labels.discover} ${escapeHtml(service.title)}">${labels.discover} ${icon('arrow')}</button>
    </div>
  </article>`).join('');
document.querySelector('#footer-services').innerHTML = services.map(service =>
  `<button class="text-link" type="button" data-service="${service.id}">${escapeHtml(service.title)}</button>`).join('');
document.querySelectorAll('[data-service]').forEach(button => {
  button.addEventListener('click', () => showService(services.find(service => service.id === button.dataset.service)));
});

services.forEach(service => select.add(new Option(service.title, service.id)));
document.querySelector('#why-grid').innerHTML = commitments.map(([symbol, title, description]) =>
  `<article class="why-card"><i class="icon-box">${icon(symbol)}</i><h3>${title}</h3><p>${description}</p></article>`).join('');
document.querySelector('#faq-list').innerHTML = questions.map(([question, answer]) =>
  `<details><summary>${question}</summary><p>${answer}</p></details>`).join('');

const filters = document.querySelector('#filters');
const projectGrid = document.querySelector('#project-grid');
const moreProjects = document.querySelector('#more-projects');
moreProjects.textContent = labels.moreProjects;
const projectPageSize = 10;
let activeCategory = 'all';
let projectLimit = projectPageSize;
filters.innerHTML = [{ id: 'all', title: labels.all }, ...services].map(({ id, title }) =>
  `<button type="button" data-filter="${id}" aria-pressed="${id === 'all'}">${escapeHtml(title)}</button>`).join('');
projectGrid.innerHTML = gallery.map((project, index) => `
  <button type="button" class="project" data-category="${project.category}" data-project="${index}">
    <img src="${asset(project.image)}" alt="" loading="lazy" width="600" height="350">
    <span>${project.title} ${icon('diagonal')}</span>
  </button>`).join('');
function updateProjectVisibility() {
  projectGrid.querySelectorAll('.project').forEach((project, index) => {
    project.hidden = activeCategory === 'all'
      ? index >= projectLimit
      : project.dataset.category !== activeCategory;
  });
  moreProjects.hidden = activeCategory !== 'all' || projectLimit >= gallery.length;
}
updateProjectVisibility();

filters.addEventListener('click', event => {
  const filter = event.target.closest('[data-filter]');
  if (!filter) return;
  activeCategory = filter.dataset.filter;
  projectLimit = projectPageSize;
  filters.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', button === filter));
  updateProjectVisibility();
});
moreProjects.addEventListener('click', () => {
  const firstNewProject = projectGrid.children[projectLimit];
  projectLimit += projectPageSize;
  updateProjectVisibility();
  firstNewProject?.focus({ preventScroll: true });
});
projectGrid.addEventListener('click', event => {
  const button = event.target.closest('[data-project]');
  if (!button) return;
  const visibleProjects = [...projectGrid.querySelectorAll('.project:not([hidden])')];
  let position = visibleProjects.indexOf(button);
  detailBody.innerHTML = `
    <img class="gallery-lightbox-image" alt="">
    <div class="dialog-content">
      <h2 id="detail-title"></h2><p>${labels.example}</p>
      <div class="gallery-controls">
        <button type="button" class="gallery-prev" aria-label="${labels.previousPhoto}">${icon('arrow')}</button>
        <span class="gallery-position" aria-live="polite"></span>
        <button type="button" class="gallery-next" aria-label="${labels.nextPhoto}">${icon('arrow')}</button>
      </div>
    </div>`;

  const image = detailBody.querySelector('img');
  const title = detailBody.querySelector('h2');
  const counter = detailBody.querySelector('.gallery-position');
  const previous = detailBody.querySelector('.gallery-prev');
  const next = detailBody.querySelector('.gallery-next');
  const formatNumber = new Intl.NumberFormat(arabic ? 'ar' : 'fr');
  function displayPhoto() {
    const project = gallery[Number(visibleProjects[position].dataset.project)];
    image.src = asset(project.image);
    image.alt = project.title;
    title.textContent = project.title;
    counter.textContent = formatNumber.format(position + 1) + ' / ' + formatNumber.format(visibleProjects.length);
  }
  function movePhoto(direction) {
    position = (position + direction + visibleProjects.length) % visibleProjects.length;
    displayPhoto();
  }
  previous.addEventListener('click', () => movePhoto(-1));
  next.addEventListener('click', () => movePhoto(1));
  detailBody.querySelector('.gallery-controls').addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    movePhoto((event.key === 'ArrowRight' ? 1 : -1) * (arabic ? -1 : 1));
  });
  displayPhoto();
  dialog.scrollTop = 0;
  dialog.showModal();
});
dialog.addEventListener('click', event => {
  if (event.target === dialog) dialog.close();
});

const number = (content.whatsappNumber ?? company.whatsappNumber).replace(/[\s+()-]/g, '');
const hasNumber = /^[1-9]\d{7,14}$/.test(number);
const whatsappUrl = message => 'https://wa.me/' + number + '?text=' + encodeURIComponent(message);

document.querySelectorAll('[data-whatsapp]').forEach(link => {
  if (hasNumber) {
    link.href = whatsappUrl(labels.greeting);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.addEventListener('click', () => track('whatsapp_open'));
  } else {
    link.addEventListener('click', () => {
      status.textContent = labels.setup;
    });
  }
});

form.addEventListener('input', event => event.target.setCustomValidity(''));
form.addEventListener('submit', event => {
  event.preventDefault();
  const fields = Object.fromEntries([...new FormData(form)].map(([key, value]) => [key, value.trim()]));
  fields.phone = fields.phone
    .replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 0x660))
    .replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 0x6f0));
  for (const [key, value] of Object.entries(fields)) {
    const validPhone = key !== 'phone' || value.replace(/\D/g, '').length >= 7;
    if (!value || !validPhone) {
      form.elements[key].setCustomValidity(validPhone ? labels.required : labels.invalidPhone);
      form.elements[key].reportValidity();
      return;
    }
  }

  const service = services.find(item => item.id === fields.service);
  const message = [
    labels.quoteGreeting, '',
    labels.quoteIntro, '',
    labels.name + ' ' + fields.name,
    labels.phone + ' ' + fields.phone,
    labels.city + ' ' + fields.city,
    labels.service + ' ' + service.title, '',
    labels.description, fields.description, '', labels.thanks,
  ].join('\n');

  if (!hasNumber) {
    status.textContent = labels.unsent;
    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'text-link';
    copy.textContent = labels.copy;
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(message);
        copy.textContent = labels.copied;
      } catch {
        const draft = document.createElement('textarea');
        draft.value = message;
        draft.readOnly = true;
        draft.setAttribute('aria-label', labels.copyDraft);
        copy.replaceWith(draft);
        draft.select();
      }
    });
    status.append(copy);
    return;
  }

  const url = whatsappUrl(message);
  track('quote_open', service.id);
  window.open(url, '_blank', 'noopener,noreferrer');
  const retry = document.createElement('a');
  retry.href = url;
  retry.target = '_blank';
  retry.rel = 'noopener noreferrer';
  retry.textContent = labels.openWhatsApp;
  status.replaceChildren(labels.review, retry);
});

const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
function setMenu(open) {
  nav.classList.toggle('open', open);
  menu.setAttribute('aria-expanded', open);
  menu.setAttribute('aria-label', open ? labels.closeMenu : labels.openMenu);
  menu.innerHTML = icon(open ? 'close' : 'menu');
}

menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') === 'false'));
nav.addEventListener('click', event => {
  const link = event.target.closest('a');
  if (!link) return;
  setMenu(false);
  if (!link.classList.contains('button')) {
    nav.querySelector('.active')?.classList.remove('active');
    link.classList.add('active');
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menu.focus();
  }
});

document.querySelectorAll('[data-icon]').forEach(element => element.innerHTML = icon(element.dataset.icon));
document.querySelector('#year').textContent = new Date().getFullYear();

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.filter(entry => entry.isIntersecting).forEach(({ target }) => {
      target.classList.add('reveal');
      observer.unobserve(target);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.section-heading, .about-image').forEach(element => observer.observe(element));
}
