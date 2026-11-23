# Atlas Énergie

Site vitrine en français et en arabe pour les huit services d’Atlas Énergie. Le site est statique et ne nécessite aucune installation de dépendances.

## Démarrage local

Depuis le répertoire du dépôt, lancez `python3 -m http.server 8000 --bind 0.0.0.0`, puis ouvrez http://localhost:8000.

Pour le déploiement, publiez le contenu du dépôt sur un hébergement statique qui sert `index.html` à la racine.

## Coordonnées

Dans `config.js`, renseignez le numéro WhatsApp international de l’entreprise en chiffres uniquement.

Le formulaire valide les champs et prépare le message. Le visiteur confirme l’envoi dans WhatsApp. Tant que le numéro n’est pas renseigné, le formulaire permet de copier le message et indique que la demande n’a pas été transmise.

Les services, les engagements et la FAQ sont modifiables dans `content.js`. La galerie présente des visuels illustratifs. Le logo avec fond transparent se trouve dans `assets/logo-atlas.webp`.

## Administration et statistiques

Le tableau de bord est disponible sur `/admin/`. Il permet de modifier les titres, résumés et descriptions des huit services en français et en arabe, ainsi que le numéro WhatsApp.

Cloudflare Pages doit conserver la sortie de build `.` et utiliser le dossier `functions/` à la racine du dépôt.

1. Dans Cloudflare, créez une base D1 et exécutez le contenu de `database/schema.sql` dans la console SQL de cette base, ou utilisez `npx wrangler d1 execute NOM_BASE --remote --file=database/schema.sql`.
2. Dans les paramètres du projet Pages, ajoutez une liaison D1 nommée `DB` vers cette base.
3. Dans les variables et secrets du projet Pages, ajoutez un **secret** `ADMIN_TOKEN`. Générez une clé aléatoire d’au moins 32 caractères, par exemple avec `openssl rand -hex 32`. Conservez-la dans un gestionnaire de mots de passe et saisissez-la sur `/admin/`.
4. Redéployez le projet Pages pour appliquer la configuration. Utilisez une base et un secret distincts pour les déploiements Preview si vous souhaitez y tester l’administration.

Les compteurs démarrent quand la liaison D1 et son schéma sont en place. Ils regroupent les événements par jour (fuseau Maroc), langue et service. Ils comptent des événements, et peuvent inclure des visites répétées ou automatisées. Les devis préparés comptent les ouvertures de WhatsApp depuis le formulaire. La base ne reçoit ni le contenu des demandes ni les coordonnées des visiteurs. Le suivi tient compte de Global Privacy Control et de Do Not Track. Aucun cookie d’analyse n’est utilisé.
