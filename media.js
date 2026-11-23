export function mediaUrl(image) {
  return /^[a-f0-9-]{36}$/.test(image) ? '/api/media?id=' + image : '/assets/' + image + '.webp';
}
