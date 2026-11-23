import { setMessage } from './i18n.js';
import { mediaUrl } from '../media.js';
import { serviceGallery } from '../gallery.js';

async function optimize(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 20 * 1024 * 1024) {
    throw new Error('Choisissez une photo JPEG, PNG ou WebP de 20 Mo maximum.');
  }
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    for (const quality of [.85, .7, .5]) {
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', quality));
      if (blob?.type === 'image/webp' && blob.size <= 600 * 1024) return blob;
    }
    throw new Error('Cette photo reste trop volumineuse. Choisissez une image plus petite.');
  } finally {
    bitmap.close();
  }
}

export function setupPhotos({ request, currentDraft, serviceSelect, defaults, labels }) {
  const form = document.querySelector('#photo-form');
  const select = document.querySelector('#photo-slot');
  const preview = document.querySelector('#photo-preview');
  const captions = document.querySelector('#photo-captions');
  const notice = document.querySelector('#photo-status');

  function photosFor(lang, draft) {
    const id = serviceSelect.value;
    return serviceGallery(defaults[lang].find(service => service.id === id), labels[lang], lang === 'ar', draft.media[id]?.gallery);
  }

  function showSlot() {
    const draft = currentDraft();
    const id = serviceSelect.value;
    const position = Number(select.value);
    const photo = photosFor('fr', draft)[position];
    const image = position === -1
      ? draft.media[id]?.cover || defaults.fr.find(service => service.id === id).image
      : photo?.image;
    preview.hidden = !image;
    if (image) preview.src = mediaUrl(image);
    else preview.removeAttribute('src');
    captions.hidden = position === -1;
    form.elements.captionFr.required = form.elements.captionAr.required = position !== -1;
    form.elements.captionFr.value = photo?.title ?? '';
    form.elements.captionAr.value = photosFor('ar', draft)[position]?.title ?? '';
    form.elements.photo.value = '';
  }

  function render(selected = '-1') {
    const list = photosFor('fr', currentDraft());
    const cover = new Option('', '-1');
    setMessage(cover, 'Photo principale de la fiche');
    select.replaceChildren(cover,
      ...list.map((photo, index) => new Option((index + 1) + ' · ' + photo.title, index)));
    if (list.length < 20) {
      const add = new Option('', list.length);
      setMessage(add, 'Ajouter une photo à la galerie');
      select.add(add);
    }
    select.value = selected;
    showSlot();
  }

  select.addEventListener('change', showSlot);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const draft = currentDraft();
    const service = serviceSelect.value;
    const position = Number(select.value);
    const [fr, ar] = ['captionFr', 'captionAr'].map(field => form.elements[field].value.trim());
    const file = form.elements.photo.files[0];
    const existing = draft.media[service]?.gallery[position];
    const button = form.querySelector('button');
    if ((!file && !existing) || (position !== -1 && (!fr || !ar))) {
      setMessage(notice, 'Choisissez une photo et renseignez les légendes pour la galerie.');
      return;
    }
    button.disabled = true;
    setMessage(notice, 'Préparation…');
    try {
      const image = file
        ? (await request('', { method: 'POST', body: await optimize(file), contentType: 'image/webp' }, '/api/media')).id
        : existing.image;
      if (draft !== currentDraft()) return;
      const media = draft.media[service] ??= { cover: '', gallery: [] };
      if (position === -1) media.cover = image;
      else {
        while (media.gallery.length <= position) media.gallery.push(null);
        media.gallery[position] = { image, fr, ar };
      }
      if (service === serviceSelect.value) render(String(position));
      setMessage(notice, 'Photo préparée. Cliquez sur « Publier les modifications » pour la mettre en ligne.');
    } catch (error) {
      setMessage(notice, error.message);
    } finally {
      button.disabled = false;
    }
  });
  return render;
}
