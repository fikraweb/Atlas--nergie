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
};

export function galleryFor(services, labels, arabic) {
  const categories = services.map(service => {
    const category = service.id;
    const projects = [{ category, image: 'project-' + category, title: service.project }];
    if (category === 'solar') {
      projects.push({ category, image: 'solar', title: labels.solarExample });
    }
    return projects.concat(captions[category].map((caption, index) => ({
      category,
      image: 'gallery/' + category + '-' + (index + 1),
      title: caption[arabic ? 1 : 0],
    })));
  });

  // Interleave categories so the overview shows examples of every service.
  return categories[0].flatMap((_, index) => categories.map(category => category[index]));
}
