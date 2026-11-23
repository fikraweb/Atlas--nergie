const messages = new Map([
  ['Administration | Atlas Énergie', 'الإدارة | أطلس للطاقة'],
  ['Atlas Énergie', 'أطلس للطاقة'],
  ['Voir le site', 'عرض الموقع'],
  ['Déconnexion', 'تسجيل الخروج'],
  ['Administration', 'لوحة الإدارة'],
  ['Connectez-vous pour gérer le site et consulter son activité.', 'سجّل الدخول لإدارة الموقع والاطّلاع على نشاطه.'],
  ['Clé administrateur', 'مفتاح الإدارة'],
  ['Se connecter', 'تسجيل الدخول'],
  ['Gestion du site', 'إدارة الموقع'],
  ['Menu', 'القائمة'],
  ['Sections du tableau de bord', 'أقسام لوحة التحكم'],
  ['Statistiques', 'الإحصائيات'],
  ['Demandes', 'الطلبات'],
  ['Services et photos', 'الخدمات والصور'],
  ['Période', 'الفترة'],
  ['7 derniers jours', 'آخر ٧ أيام'],
  ['30 derniers jours', 'آخر ٣٠ يوماً'],
  ['90 derniers jours', 'آخر ٩٠ يوماً'],
  ['Actualiser', 'تحديث'],
  ['Indicateurs', 'المؤشرات'],
  ['Vues par jour', 'المشاهدات اليومية'],
  ['Consulter les chiffres par jour', 'عرض الأرقام حسب اليوم'],
  ['Répartition par langue', 'التوزيع حسب اللغة'],
  ['Vues des pages françaises et arabes', 'مشاهدات صفحات الموقع بالعربية والفرنسية'],
  ['Activité par service', 'النشاط حسب الخدمة'],
  ['Les devis correspondent aux ouvertures de WhatsApp depuis le formulaire.', 'تُحتسب عروض الأسعار عند فتح واتساب من النموذج.'],
  ['Service', 'الخدمة'],
  ['Vues de pages', 'مشاهدات الصفحات'],
  ['Fiches ouvertes', 'صفحات الخدمات المفتوحة'],
  ['Devis préparés', 'عروض الأسعار المُعدّة'],
  ['Clics WhatsApp', 'نقرات واتساب'],
  ['Vues quotidiennes. Total :', 'المشاهدات اليومية. الإجمالي:'],
  ['Vues en français', 'المشاهدات بالفرنسية'],
  ['Vues en arabe', 'المشاهدات بالعربية'],
  ['Français', 'الفرنسية'],
  ['Arabe', 'العربية'],
  ['Consultez les demandes de devis et suivez les échanges.', 'اطّلع على طلبات عروض الأسعار وتابع حالة التواصل.'],
  ['Demandes de devis', 'طلبات عروض الأسعار'],
  ['Statut', 'الحالة'],
  ['Tous', 'الكل'],
  ['Nouvelles', 'جديدة'],
  ['Contactées', 'تم التواصل'],
  ['Clôturées', 'مغلقة'],
  ['Nouvelle', 'جديدة'],
  ['Contactée', 'تم التواصل'],
  ['Clôturée', 'مغلقة'],
  ['Suivi', 'المتابعة'],
  ['Afficher les demandes précédentes', 'عرض الطلبات السابقة'],
  ['Chargement des demandes…', 'جارٍ تحميل الطلبات…'],
  ['Aucune demande pour ce filtre.', 'لا توجد طلبات تطابق هذا الفلتر.'],
  ['Modifiez les fiches en français et en arabe, les photos et le numéro WhatsApp.', 'عدّل تفاصيل الخدمات بالعربية والفرنسية، والصور، ورقم واتساب.'],
  ['Contenu des fiches', 'محتوى الخدمات'],
  ['Numéro WhatsApp', 'رقم واتساب'],
  ['Langue du contenu', 'لغة المحتوى'],
  ['Titre', 'العنوان'],
  ['Résumé de la carte', 'ملخّص بطاقة الخدمة'],
  ['Description de la fiche', 'وصف الخدمة'],
  ['Avantages (une ligne par avantage)', 'المزايا (ميزة واحدة في كل سطر)'],
  ['Installations et solutions (une ligne par élément)', 'التركيبات والحلول (عنصر واحد في كل سطر)'],
  ['Publier les modifications', 'نشر التعديلات'],
  ['Dernière publication :', 'آخر نشر:'],
  ['Contenu initial du site.', 'المحتوى الأصلي للموقع.'],
  ['Publication…', 'جارٍ النشر…'],
  ['Modifications publiées.', 'تم نشر التعديلات.'],
  ['Actualisation…', 'جارٍ التحديث…'],
  ['Photos du service sélectionné', 'صور الخدمة المختارة'],
  ['Les photos sont communes aux deux langues. Publiez les modifications après avoir préparé les images.', 'تظهر الصور في اللغتين. انشر التعديلات بعد تجهيز الصور.'],
  ['Emplacement', 'موضع الصورة'],
  ['Légende française', 'وصف الصورة بالفرنسية'],
  ['Légende arabe', 'وصف الصورة بالعربية'],
  ['Choisir une image', 'اختر صورة'],
  ['Préparer la photo', 'تجهيز الصورة'],
  ['Photo principale de la fiche', 'الصورة الرئيسية للخدمة'],
  ['Ajouter une photo à la galerie', 'إضافة صورة إلى المعرض'],
  ['Choisissez une photo et renseignez les légendes pour la galerie.', 'اختر صورة وأدخل وصفها باللغتين لإضافتها إلى المعرض.'],
  ['Préparation…', 'جارٍ التجهيز…'],
  ['Photo préparée. Cliquez sur « Publier les modifications » pour la mettre en ligne.', 'الصورة جاهزة. اضغط على «نشر التعديلات» لإظهارها في الموقع.'],
  ['Choisissez une photo JPEG, PNG ou WebP de 20 Mo maximum.', 'اختر صورة بصيغة JPEG أو PNG أو WebP بحجم لا يتجاوز ٢٠ ميغابايت.'],
  ['Cette photo reste trop volumineuse. Choisissez une image plus petite.', 'حجم الصورة كبير. اختر صورة أصغر.'],
  ['La requête a échoué.', 'تعذّر تنفيذ الطلب.'],
  ['Failed to fetch', 'تعذّر الاتصال بالخادم.'],
  ['Accès refusé.', 'تعذّر تسجيل الدخول. تحقّق من مفتاح الإدارة.'],
  ['Configuration Cloudflare requise : liaison DB et secret ADMIN_TOKEN.', 'تحقّق من إعداد Cloudflare: ربط DB والمفتاح السري ADMIN_TOKEN.'],
  ['Module demandes indisponible. Vérifiez la migration D1.', 'قسم الطلبات غير متاح. تحقّق من تحديث قاعدة D1.'],
  ['Module photos indisponible. Vérifiez la migration D1.', 'قسم الصور غير متاح. تحقّق من تحديث قاعدة D1.'],
  ['Le contenu a changé. Reconnectez-vous pour obtenir la dernière version.', 'تغيّر المحتوى. سجّل الدخول مجدداً للحصول على آخر نسخة.'],
  ['Saisissez un numéro WhatsApp international valide.', 'أدخل رقم واتساب دولياً صالحاً.'],
  ['Image WebP attendue.', 'صيغة الصورة المطلوبة هي WebP.'],
  ['Photo WebP invalide.', 'صورة WebP غير صالحة.'],
  ['Photo trop volumineuse.', 'حجم الصورة كبير.'],
  ['Photo de couverture invalide.', 'الصورة الرئيسية غير صالحة.'],
  ['Galerie invalide.', 'بيانات معرض الصور غير صالحة.'],
]);

const normalize = value => value.trim().replace(/\s+/g, ' ');
const originalNodes = [];
const originalAttributes = [];

export function language() {
  return document.documentElement.lang;
}

export function locale() {
  return language() === 'ar' ? 'ar-MA-u-nu-arab' : 'fr-MA';
}

export function t(value) {
  if (language() !== 'ar') return value;
  if (value.startsWith('Vérifiez les champs du service ')) return 'تحقّق من حقول الخدمة المحددة.';
  if (value.startsWith('Vérifiez la liste : ')) return 'راجع قوائم المزايا والحلول.';
  return messages.get(value) ?? value;
}

export function setMessage(element, value) {
  element.dataset.message = value;
  element.textContent = t(value);
}

export function prepareTranslations() {
  const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const key = normalize(node.textContent);
    if (messages.has(key) && node.parentElement?.closest('[lang]') === document.documentElement) {
      originalNodes.push({ node, key, original: node.textContent });
    }
  }
  for (const element of document.querySelectorAll('[aria-label],img[alt]')) {
    for (const name of ['aria-label', 'alt']) {
      const key = element.getAttribute(name);
      if (messages.has(key)) originalAttributes.push({ element, name, key });
    }
  }
}

export function applyLanguage(code) {
  document.documentElement.lang = code;
  document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
  for (const { node, key, original } of originalNodes) {
    node.textContent = original.replace(/\S[\s\S]*\S|\S/, t(key));
  }
  for (const { element, name, key } of originalAttributes) element.setAttribute(name, t(key));
  for (const element of document.querySelectorAll('[data-message]')) {
    element.textContent = t(element.dataset.message);
  }
}
