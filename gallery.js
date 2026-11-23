// Captions for illustrative gallery images, in French and Arabic.
const captions = {
  solar: [
    ['Panneaux sur une villa', 'ألواح شمسية على سطح فيلا'],
    ['Photovoltaïque sur un site industriel', 'طاقة شمسية في منشأة صناعية'],
    ['Panneaux solaires au sol', 'ألواح شمسية مثبّتة على الأرض'],
    ['Abri de stationnement solaire', 'مظلّة سيارات مزوّدة بألواح شمسية'],
    ['Installation sur toit-terrasse', 'تركيب ألواح على سطح مستوٍ'],
    ['Fixations pour panneaux solaires', 'حوامل تثبيت الألواح الشمسية'],
    ['Contrôle d’une installation solaire', 'فحص منظومة للطاقة الشمسية'],
    ['Panneaux sur un immeuble', 'ألواح شمسية على سطح عمارة'],
  ],
  cctv: [
    ['Caméra extérieure d’entrepôt', 'كاميرا خارجية لمستودع'],
    ['Surveillance d’un portail', 'مراقبة بوابة الدخول'],
    ['Caméra dôme en plafond', 'كاميرا قبّبية في السقف'],
    ['Surveillance d’un parking', 'مراقبة موقف السيارات'],
    ['Caméra à l’entrée d’un bâtiment', 'كاميرا عند مدخل مبنى'],
    ['Vidéosurveillance d’un couloir', 'مراقبة ممر داخلي'],
    ['Poste de supervision vidéo', 'محطة متابعة كاميرات المراقبة'],
    ['Caméra dans un espace d’accueil', 'كاميرا في منطقة الاستقبال'],
    ['Caméra montée sur un mât', 'كاميرا مثبّتة على عمود'],
  ],
  industrial: [
    ['Armoire de disjoncteurs', 'خزانة قواطع كهربائية'],
    ['Alimentation d’une ligne de production', 'التغذية الكهربائية لخط إنتاج'],
    ['Chemins de câbles industriels', 'مسارات الكابلات الصناعية'],
    ['Mesures dans une armoire de commande', 'قياسات داخل خزانة تحكّم'],
    ['Local de distribution électrique', 'غرفة توزيع الكهرباء'],
    ['Armoire de variateurs', 'خزانة مغيرات السرعة'],
    ['Borniers et câblage industriel', 'أطراف التوصيل والأسلاك الصناعية'],
    ['Cellules de distribution électrique', 'وحدات توزيع الكهرباء'],
    ['Gaines électriques en entrepôt', 'قنوات كهربائية في مستودع'],
  ],
  residential: [
    ['Pose d’une prise murale', 'تركيب مقبس حائطي'],
    ['Tableau de distribution domestique', 'لوحة توزيع منزلية'],
    ['Pose d’un éclairage encastré', 'تركيب إضاءة مدمجة في السقف'],
    ['Gaines électriques en rénovation', 'تمديد قنوات كهربائية أثناء التجديد'],
    ['Prises électriques intérieures', 'مقابس كهربائية داخلية'],
    ['Vérification des protections électriques', 'فحص أجهزة الحماية الكهربائية'],
    ['Câblage dans une cuisine', 'تمديد الأسلاك في المطبخ'],
    ['Pose d’un interrupteur mural', 'تركيب مفتاح كهربائي على الحائط'],
    ['Contrôle du tableau d’un appartement', 'فحص لوحة توزيع في شقة'],
  ],
  smart: [
    ['Écran de commande mural', 'شاشة تحكّم على الحائط'],
    ['Stores automatisés dans un séjour', 'ستائر آلية في غرفة المعيشة'],
    ['Variateur d’éclairage connecté', 'متحكّم ذكي بدرجة الإضاءة'],
    ['Éclairage connecté dans une cuisine', 'إضاءة ذكية في المطبخ'],
    ['Pilotage de l’éclairage par téléphone', 'التحكّم في الإضاءة بالهاتف'],
    ['Commande de scénarios près du lit', 'لوحة تحكّم قرب السرير'],
    ['Volets roulants automatisés', 'مصاريع لفّ آلية'],
    ['Détecteur de mouvement à l’entrée', 'حسّاس حركة عند المدخل'],
    ['Rideaux motorisés dans une chambre', 'ستائر آلية في غرفة النوم'],
  ],
  motors: [
    ['Moteur sur un établi', 'محرك كهربائي على منضدة عمل'],
    ['Moteur couplé à une pompe', 'محرك متصل بمضخة'],
    ['Entraînement d’un convoyeur', 'محرك ناقل صناعي'],
    ['Détail d’un moteur électrique', 'لقطة مقرّبة لمحرك كهربائي'],
    ['Contrôle d’un entraînement électrique', 'فحص منظومة تشغيل كهربائية'],
    ['Moteur de ventilateur industriel', 'محرك مروحة صناعية'],
    ['Motorisation d’un système de ventilation', 'محرك نظام تهوية'],
    ['Accouplement d’un moteur électrique', 'وصلة اقتران محرك كهربائي'],
    ['Moteurs en atelier', 'محركات كهربائية في ورشة'],
  ],
  doors: [
    ['Portail coulissant moderne', 'بوابة منزلقة عصرية'],
    ['Porte de garage sectionnelle', 'باب مرآب مقطعي'],
    ['Entrée vitrée automatique', 'مدخل زجاجي آلي'],
    ['Portail battant électrique', 'بوابة كهربائية مفصلية'],
    ['Porte sectionnelle de quai', 'باب مقطعي لمنصة التحميل'],
    ['Motorisation d’un portail coulissant', 'محرك بوابة منزلقة'],
    ['Porte métallique à enroulement', 'باب معدني قابل للّف'],
    ['Portail d’une résidence moderne', 'بوابة منزل عصري'],
    ['Rail d’une porte de garage', 'سكة باب مرآب'],
  ],
  pools: [
    ['Piscine de villa', 'مسبح فيلا'],
    ['Piscine de toit-terrasse', 'مسبح على سطح مبنى'],
    ['Local technique de piscine', 'غرفة تجهيزات المسبح'],
    ['Escalier d’accès au bassin', 'درج النزول إلى المسبح'],
    ['Éclairage subaquatique', 'إضاءة تحت الماء'],
    ['Piscine carrelée dans une cour', 'مسبح مبلّط في فناء'],
    ['Piscine à débordement', 'مسبح بحافة فائضة'],
    ['Écumeur de surface', 'كاشط سطح مياه المسبح'],
    ['Piscine dans un jardin contemporain', 'مسبح في حديقة عصرية'],
  ],
};

export function serviceGallery(service, labels, arabic, edits = []) {
  const category = service.id;
  const photos = [{ category, image: 'project-' + category, title: service.project }];
  if (category === 'solar') {
    photos.push({ category, image: 'solar', title: labels.solarExample });
  }
  photos.push(...captions[category].map((caption, index) => ({
    category,
    image: 'gallery/' + category + '-' + (index + 1),
    title: caption[arabic ? 1 : 0],
  })));
  edits.forEach((photo, index) => {
    if (photo) photos[index] = { category, image: photo.image, title: arabic ? photo.ar : photo.fr };
  });
  return photos;
}

export function galleryFor(services, labels, arabic, media) {
  const categories = services.map(service => serviceGallery(service, labels, arabic, media?.[service.id]?.gallery));
  // Interleave categories so the overview shows examples of every service.
  const size = Math.max(...categories.map(category => category.length));
  return Array.from({ length: size }, (_, index) => categories.flatMap(category =>
    category[index] ? [category[index]] : [])).flat();
}
