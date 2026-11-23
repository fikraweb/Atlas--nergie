# Atlas Énergie

Site vitrine en français pour les cinq services d’Atlas Énergie. Le site est statique et ne nécessite aucune installation de dépendances.

## Démarrage local

Depuis le répertoire du dépôt, lancez `python3 -m http.server 8000 --bind 0.0.0.0`, puis ouvrez http://localhost:8000.

Pour le déploiement, publiez le contenu du dépôt sur un hébergement statique qui sert `index.html` à la racine.

## Coordonnées

Dans `config.js`, renseignez le numéro WhatsApp international de l’entreprise en chiffres uniquement, ainsi que les coordonnées publiques à afficher dans le pied de page.

Le formulaire valide les champs et prépare le message. Le visiteur confirme l’envoi dans WhatsApp. Tant que le numéro n’est pas renseigné, le formulaire permet de copier le message et indique que la demande n’a pas été transmise.

Les services, les engagements et la FAQ sont modifiables dans `content.js`. La galerie présente des visuels illustratifs. Le symbole provisoire de la marque se trouve dans `assets/mark.svg`.
