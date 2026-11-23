import { company } from './config.js';
import { commitments, questions, services } from './content.js';
import { icon } from './icons.js';

const dialog = document.querySelector('#detail');
const detailBody = document.querySelector('#detail-body');
const form = document.querySelector('#devis');
const select = form.elements.service;
const status = document.querySelector('#form-status');

const asset = name => 'assets/' + name + '.webp';
const list = items => '<ul>' + items.map(item => '<li>' + item + '</li>').join('') + '</ul>';
const gallery = services.map(service => ({
  category: service.id,
  image: 'project-' + service.id,
  title: service.project,
})).concat({ category: 'solar', image: 'solar', title: 'Champ photovoltaïque sur bâtiment' });

function showService(service) {
  detailBody.innerHTML = `
    <img class="dialog-image" src="${asset(service.image)}" alt="${service.alt}">
    <div class="dialog-content">
      <h2 id="detail-title">${service.title}</h2>
      <p>${service.description}</p>
      <h3>Les bénéfices</h3>${list(service.benefits)}
      <h3>Installations et solutions</h3>${list(service.solutions)}
      <a class="button primary" href="#devis">Demander un devis pour ce service ${icon('arrow')}</a>
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
      <h3>${service.title}</h3>
      <p>${service.summary}</p>
      <button class="text-link" type="button" data-service="${service.id}" aria-label="Découvrir le service ${service.title}">Découvrir le service ${icon('arrow')}</button>
    </div>
  </article>`).join('');
document.querySelector('#footer-services').innerHTML = services.map(service =>
  `<button class="text-link" type="button" data-service="${service.id}">${service.title}</button>`).join('');
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
filters.innerHTML = [{ id: 'all', title: 'Tous' }, ...services].map(({ id, title }) =>
  `<button type="button" data-filter="${id}" aria-pressed="${id === 'all'}">${title}</button>`).join('');
projectGrid.innerHTML = gallery.map((project, index) => `
  <button type="button" class="project" data-category="${project.category}" data-project="${index}">
    <img src="${asset(project.image)}" alt="" loading="lazy" width="600" height="350">
    <span>${project.title} ${icon('diagonal')}</span>
  </button>`).join('');
filters.addEventListener('click', event => {
  const filter = event.target.closest('[data-filter]');
  if (!filter) return;
  filters.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', button === filter));
  projectGrid.querySelectorAll('.project').forEach(project => {
    project.hidden = filter.dataset.filter !== 'all' && filter.dataset.filter !== project.dataset.category;
  });
});
projectGrid.addEventListener('click', event => {
  const button = event.target.closest('[data-project]');
  if (!button) return;
  const project = gallery[Number(button.dataset.project)];
  detailBody.innerHTML = `<img class="dialog-image" src="${asset(project.image)}" alt="${project.title}">
    <div class="dialog-content"><h2 id="detail-title">${project.title}</h2><p>Exemple illustratif.</p></div>`;
  dialog.scrollTop = 0;
  dialog.showModal();
});
dialog.addEventListener('click', event => {
  if (event.target === dialog) dialog.close();
});

const number = company.whatsappNumber.replace(/[\s+()-]/g, '');
const hasNumber = /^[1-9]\d{7,14}$/.test(number);
const whatsappUrl = message => 'https://wa.me/' + number + '?text=' + encodeURIComponent(message);

if (hasNumber) {
  document.querySelector('#whatsapp-number').textContent = '+' + number;
}

document.querySelectorAll('[data-whatsapp]').forEach(link => {
  if (hasNumber) {
    link.href = whatsappUrl('Bonjour Atlas Énergie, je souhaite échanger au sujet de mon projet.');
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  } else {
    link.addEventListener('click', () => {
      status.textContent = 'Le numéro WhatsApp d’Atlas Énergie est en cours de configuration. Vous pouvez préparer votre demande depuis ce formulaire.';
    });
  }
});

form.addEventListener('input', event => event.target.setCustomValidity(''));
form.addEventListener('submit', event => {
  event.preventDefault();
  const fields = Object.fromEntries([...new FormData(form)].map(([key, value]) => [key, value.trim()]));
  for (const [key, value] of Object.entries(fields)) {
    const validPhone = key !== 'phone' || value.replace(/\D/g, '').length >= 7;
    if (!value || !validPhone) {
      form.elements[key].setCustomValidity(validPhone ? 'Veuillez renseigner ce champ.' : 'Veuillez saisir un numéro de téléphone valide.');
      form.elements[key].reportValidity();
      return;
    }
  }

  const service = services.find(item => item.id === fields.service);
  const message = [
    'Bonjour Atlas Énergie,', '',
    'Je souhaite demander un devis pour le projet suivant.', '',
    'Nom complet : ' + fields.name,
    'Téléphone : ' + fields.phone,
    'Ville : ' + fields.city,
    'Service souhaité : ' + service.title, '',
    'Description du besoin :', fields.description, '', 'Merci !',
  ].join('\n');

  if (!hasNumber) {
    status.textContent = 'Aucun numéro WhatsApp n’est configuré. Votre demande n’a pas été transmise. ';
    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'text-link';
    copy.textContent = 'Copier ma demande';
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(message);
        copy.textContent = 'Demande copiée';
      } catch {
        const draft = document.createElement('textarea');
        draft.value = message;
        draft.readOnly = true;
        draft.setAttribute('aria-label', 'Votre demande à copier');
        copy.replaceWith(draft);
        draft.select();
      }
    });
    status.append(copy);
    return;
  }

  const url = whatsappUrl(message);
  window.open(url, '_blank', 'noopener,noreferrer');
  const retry = document.createElement('a');
  retry.href = url;
  retry.target = '_blank';
  retry.rel = 'noopener noreferrer';
  retry.textContent = 'Ouvrir la demande dans WhatsApp';
  status.replaceChildren('Vérifiez votre message dans WhatsApp, puis envoyez-le. ', retry);
});

for (const field of ['phone', 'email', 'address']) {
  if (company[field]) document.querySelector('#contact-' + field).textContent = company[field];
}

const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
function setMenu(open) {
  nav.classList.toggle('open', open);
  menu.setAttribute('aria-expanded', open);
  menu.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
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
