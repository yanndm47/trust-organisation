# TRUST ORGANISATION — guide complet

Ce fichier explique **tout**, étape par étape, sans supposer que vous connaissez GitHub, Node.js, Netlify ou Vercel.

Le site a été créé pour **TRUST ORGANISATION** par **ZETA ORG**.

---

## 1. Ce que fait le site

Le site contient :

- **Bibliothèque** : les étudiants voient les documents publiés par l’administrateur.
- **Qui sommes-nous ?** : présentation de TRUST ORGANISATION et images de l’organisation.
- **Actualités** : publications visibles par tous.
- **Inscription** : les étudiants créent un compte.
- **Connexion** : les étudiants ou l’administrateur se connectent.
- **Panneau privé administrateur** :
  - ajouter et supprimer des documents ;
  - ajouter et supprimer des actualités ;
  - ajouter et supprimer des filières ;
  - consulter et supprimer les comptes étudiants ;
  - voir les statistiques.

L’administrateur n’a **aucun onglet visible** dans la navigation publique.

### Identifiants administrateur

Pour ouvrir la console privée :

```text
Téléphone : 696178436
Mot de passe : @Ecoecco227@
```

Il faut cliquer sur **Se connecter**. Il ne faut pas utiliser ces identifiants dans le formulaire **S’inscrire**, car ce compte existe déjà.

---

## 2. Important avant de commencer

Le site possède deux parties :

### Partie 1 : le frontend

C’est ce que les visiteurs voient dans leur navigateur :

- les pages ;
- les boutons ;
- les formulaires ;
- les images ;
- la bibliothèque.

### Partie 2 : le backend

C’est le serveur invisible qui :

- enregistre les comptes ;
- vérifie les mots de passe ;
- enregistre les documents ;
- enregistre les actualités ;
- protège la console administrateur ;
- gère la base de données.

Le fichier du backend est [server.js](./server.js).

**Attention : Netlify et Vercel hébergent très bien le frontend, mais le serveur `server.js` et une base SQLite ne doivent pas être hébergés comme de simples fichiers statiques.**

Pour un vrai site fonctionnel, il faut :

1. publier le backend sur un hébergeur Node.js ;
2. publier le frontend sur Netlify ou Vercel ;
3. relier le frontend à l’adresse du backend.

Ce guide explique précisément cette organisation.

---

## 3. Les fichiers importants

```text
index.html         page principale
styles.css         design du site
config.js          adresse du backend
app.js             fonctionnement du frontend
server.js          serveur backend et API
package.json       commandes de démarrage
README.md          ce guide
LOGO.jpg           logo TRUST
t1.jpg à t10.jpg  images fournies
uploads/           fichiers téléversés par l’administrateur
trust.sqlite       base de données locale
```

Ne supprimez pas :

- `server.js` ;
- `package.json` ;
- `trust.sqlite` si vous utilisez la base actuelle ;
- le dossier `uploads`.

La base `trust.sqlite` et les fichiers du dossier `uploads` ne doivent pas être envoyés sur GitHub.

---

## 4. Installer les outils sur Windows

### 4.1 Installer Node.js

1. Aller sur [https://nodejs.org](https://nodejs.org).
2. Télécharger la version **LTS**.
3. Installer Node.js avec les options par défaut.
4. Fermer puis rouvrir PowerShell.

Vérifier l’installation :

```powershell
node --version
npm --version
```

Node.js doit être en version **22 ou plus récente**.

### 4.2 Installer Git

1. Aller sur [https://git-scm.com/download/win](https://git-scm.com/download/win).
2. Télécharger Git pour Windows.
3. Installer avec les options par défaut.
4. Fermer puis rouvrir PowerShell.

Vérifier :

```powershell
git --version
```

---

## 5. Lancer le site sur votre ordinateur

Ouvrir PowerShell dans le dossier du projet :

```powershell
cd "C:\Users\User\Videos\Trust-docs"
```

Vérifier le code :

```powershell
npm run check
```

Si vous voyez la commande `node --check server.js && node --check app.js` sans message d’erreur, le code est correct.

Démarrer le serveur :

```powershell
npm start
```

Vous devez voir :

```text
TRUST ORGANISATION disponible sur http://localhost:5500
```

Ne fermez pas cette fenêtre PowerShell pendant le test.

Ouvrir le site dans le navigateur :

```text
http://localhost:5500
```

Pour arrêter le serveur, retourner dans PowerShell et appuyer sur :

```text
CTRL + C
```

---

## 6. Tester le site localement

### 6.1 Tester l’inscription

1. Ouvrir `http://localhost:5500`.
2. Cliquer sur **S’inscrire**.
3. Renseigner :
   - un nom complet ;
   - un nouveau numéro de téléphone ;
   - un niveau entre 1 et 5 ;
   - une filière libre ;
   - `Ingénieur` ou `Science de l’ingénieur` ;
   - le sexe ;
   - un mot de passe de 8 caractères minimum.
4. Cliquer sur **Créer mon compte**.

Si le numéro existe déjà, le site affiche un message explicite. Dans ce cas, utilisez **Se connecter**.

### 6.2 Tester l’administrateur

1. Cliquer sur **Se connecter**.
2. Entrer :

```text
696178436
@Ecoecco227@
```

3. Le panneau privé s’ouvre.
4. Ajouter une filière.
5. Publier une actualité avec une image.
6. Vérifier que l’image est affichée entièrement.
7. Ajouter un document.
8. Vérifier que le document apparaît dans Bibliothèque.

### 6.3 Vérifier le premier téléchargement

1. Publier d’abord un document depuis l’administration.
2. Se déconnecter.
3. Cliquer sur le document.
4. Le site demande le nom complet et le téléphone.
5. Après validation, cette demande ne doit plus apparaître pour cet utilisateur.

---

## 7. Créer le dépôt GitHub

GitHub sert à stocker le code en ligne et à permettre à Netlify ou Vercel de le récupérer.

### 7.1 Créer le dépôt sur GitHub

1. Aller sur [https://github.com](https://github.com).
2. Se connecter ou créer un compte.
3. Cliquer sur le bouton `+` en haut à droite.
4. Cliquer sur **New repository**.
5. Dans **Repository name**, écrire :

```text
trust-organisation-platform
```

6. Choisir **Private** si vous ne voulez pas montrer le code au public.
7. Ne cochez pas **Add a README file**.
8. Cliquer sur **Create repository**.
9. Laisser cette page GitHub ouverte.

### 7.2 Vérifier le fichier `.gitignore`

Le projet contient déjà un `.gitignore`. Il empêche l’envoi de données privées.

Il doit contenir au minimum :

```gitignore
node_modules/
trust.sqlite
trust.sqlite-shm
trust.sqlite-wal
uploads/*
!.gitkeep
.env
.env.*
```

### 7.3 Envoyer le projet sur GitHub

Dans PowerShell :

```powershell
cd "C:\Users\User\Videos\Trust-docs"
git init
git add .
git commit -m "Initial TRUST ORGANISATION platform"
git branch -M main
git remote add origin https://github.com/VOTRE_NOM_GITHUB/trust-organisation-platform.git
git push -u origin main
```

Remplacez `VOTRE_NOM_GITHUB` par votre vrai nom GitHub.

Exemple :

```powershell
git remote add origin https://github.com/yanndm47/trust-organisation-platform.git
```

GitHub peut demander votre connexion.

### 7.4 Vérifier que la base n’a pas été envoyée

Exécuter :

```powershell
git ls-files trust.sqlite
git ls-files uploads
```

Ces commandes ne doivent rien afficher.

Si elles n’affichent rien, la base et les fichiers privés sont protégés.

### 7.5 Envoyer les modifications suivantes

Chaque fois que vous modifiez le projet :

```powershell
git add .
git commit -m "Update TRUST platform"
git push
```

---

## 8. Architecture recommandée pour la publication

La solution recommandée est :

```text
Frontend : Netlify OU Vercel
Backend  : Render, Railway, Fly.io ou VPS Node.js
Base     : PostgreSQL en production
Fichiers : stockage persistant ou stockage objet
```

Pourquoi ?

- Netlify et Vercel sont principalement utilisés ici pour le frontend.
- Le backend doit rester actif pour répondre aux inscriptions.
- SQLite sur un hébergement temporaire peut perdre ses données.
- Le dossier `uploads` doit être conservé sur un stockage persistant.

Pour une première mise en ligne simple, vous pouvez publier le backend sur **Render** et le frontend sur Netlify ou Vercel.

---

## 9. Publier le backend sur Render

Cette étape est obligatoire si vous voulez que les inscriptions fonctionnent en ligne.

### 9.1 Créer le service Render

1. Aller sur [https://render.com](https://render.com).
2. Créer un compte avec GitHub.
3. Cliquer sur **New**.
4. Cliquer sur **Web Service**.
5. Sélectionner le dépôt `trust-organisation-platform`.
6. Donner comme nom :

```text
trust-organisation-api
```

7. Dans **Runtime**, choisir **Node**.
8. Dans **Build Command**, écrire :

```text
npm install
```

9. Dans **Start Command**, écrire :

```text
npm start
```

10. Choisir un plan adapté.
11. Cliquer sur **Create Web Service**.

Render va installer le projet et démarrer `server.js`.

### 9.2 Récupérer l’adresse du backend

Après le déploiement, Render donne une adresse ressemblant à :

```text
https://trust-organisation-api.onrender.com
```

Copier cette adresse. Elle sera utilisée dans le frontend.

### 9.3 Attention au stockage Render

Pour conserver durablement `trust.sqlite` et les fichiers `uploads`, il faut un **Persistent Disk** Render ou une vraie base PostgreSQL et un stockage objet.

Sans stockage persistant :

- la base peut être réinitialisée ;
- les comptes peuvent disparaître ;
- les documents téléversés peuvent disparaître.

Dans Render, ajouter un disque persistant dans les réglages du service, ou migrer vers PostgreSQL et un stockage objet avant une utilisation réelle.

---

## 10. Publier le frontend sur Netlify

Cette procédure suppose que le backend Render fonctionne déjà.

### 10.1 Relier le frontend au backend

Ouvrir le fichier [config.js](./config.js).

Remplacer :

```js
window.TRUST_API_URL = "";
```

par l’adresse Render, sans slash final :

```js
window.TRUST_API_URL = "https://trust-organisation-api.onrender.com";
```

Enregistrer le fichier.

Envoyer la modification à GitHub :

```powershell
git add config.js
git commit -m "Connect frontend to production API"
git push
```

### 10.2 Créer le site Netlify

1. Aller sur [https://app.netlify.com](https://app.netlify.com).
2. Cliquer sur **Add new site**.
3. Cliquer sur **Import an existing project**.
4. Choisir **GitHub**.
5. Autoriser Netlify si GitHub demande une autorisation.
6. Sélectionner `trust-organisation-platform`.
7. Dans **Build command**, ne rien mettre.
8. Dans **Publish directory**, mettre :

```text
.
```

9. Cliquer sur **Deploy site**.
10. Attendre la fin du déploiement.
11. Ouvrir l’adresse Netlify affichée.

Tester immédiatement :

- l’ouverture de Bibliothèque ;
- l’inscription ;
- la connexion admin ;
- l’ouverture des actualités ;
- l’appel du backend.

### 10.3 Autoriser Netlify dans le backend

Le backend doit connaître l’adresse Netlify.

Dans les variables d’environnement Render, ajouter :

```text
CORS_ORIGIN=https://VOTRE-SITE.netlify.app
```

Remplacer `https://VOTRE-SITE.netlify.app` par l’adresse réelle donnée par Netlify.

Redémarrer ensuite le service Render.

Sans cette variable, le navigateur peut bloquer les appels entre le frontend Netlify et le backend Render.

### 10.4 Ajouter un nom de domaine sur Netlify

1. Dans Netlify, ouvrir le site.
2. Aller dans **Site configuration**.
3. Aller dans **Domain management**.
4. Cliquer sur **Add a domain**.
5. Écrire votre domaine.
6. Netlify affiche des informations DNS.
7. Aller chez le fournisseur du domaine.
8. Créer les enregistrements DNS demandés.
9. Attendre la propagation.
10. Vérifier que Netlify affiche le HTTPS actif.

Après avoir ajouté le domaine personnalisé, modifier aussi `CORS_ORIGIN` avec ce nouveau domaine.

---

## 11. Publier le frontend sur Vercel

Cette procédure est une deuxième possibilité. Il ne faut pas utiliser Netlify et Vercel en même temps pour le même frontend.

### 11.1 Relier le frontend au backend

Dans [config.js](./config.js), écrire :

```js
window.TRUST_API_URL = "https://trust-organisation-api.onrender.com";
```

Puis envoyer sur GitHub :

```powershell
git add config.js
git commit -m "Connect frontend to production API"
git push
```

### 11.2 Créer le projet Vercel

1. Aller sur [https://vercel.com/new](https://vercel.com/new).
2. Se connecter avec GitHub.
3. Cliquer sur **Import** à côté du dépôt.
4. Choisir `trust-organisation-platform`.
5. Dans **Framework Preset**, choisir **Other**.
6. Laisser **Build Command** vide.
7. Laisser **Output Directory** avec la valeur par défaut ou mettre :

```text
.
```

8. Cliquer sur **Deploy**.
9. Attendre la fin du déploiement.
10. Ouvrir l’adresse Vercel.

### 11.3 Autoriser Vercel dans le backend

Dans les variables d’environnement Render, mettre l’adresse Vercel :

```text
CORS_ORIGIN=https://votre-projet.vercel.app
```

Redémarrer le backend Render.

Tester ensuite :

1. inscription avec un nouveau numéro ;
2. connexion ;
3. connexion admin ;
4. publication d’une actualité ;
5. publication d’un document.

### 11.4 Ajouter un domaine sur Vercel

1. Ouvrir le projet Vercel.
2. Aller dans **Settings**.
3. Aller dans **Domains**.
4. Ajouter le domaine.
5. Copier les entrées DNS indiquées.
6. Les créer chez votre fournisseur de domaine.
7. Attendre la validation.
8. Remplacer `CORS_ORIGIN` par le nouveau domaine.

---

## 12. Si vous voulez seulement un test rapide

Pour un test local, vous n’avez pas besoin de Netlify ni de Vercel :

```powershell
cd "C:\Users\User\Videos\Trust-docs"
npm start
```

Puis ouvrir :

```text
http://localhost:5500
```

Pour une vraie publication :

```text
1. GitHub
2. Backend Render
3. Frontend Netlify OU Vercel
4. Adresse du backend dans config.js
5. CORS_ORIGIN configuré sur Render
6. Tests en ligne
```

---

## 13. Erreurs fréquentes

### « Erreur interne du serveur »

Vérifier :

1. que `npm start` est lancé ;
2. que vous utilisez `http://localhost:5500` ;
3. que le numéro n’est pas déjà inscrit ;
4. que le mot de passe comporte au moins 8 caractères ;
5. que le niveau est compris entre 1 et 5.

### « Serveur API indisponible » sur Netlify ou Vercel

Vérifier :

1. l’adresse dans [config.js](./config.js) ;
2. que l’adresse commence par `https://` ;
3. qu’il n’y a pas de slash final ;
4. que le backend Render fonctionne ;
5. que `CORS_ORIGIN` contient exactement l’adresse Netlify ou Vercel ;
6. que le backend a été redémarré après la modification de `CORS_ORIGIN`.

### Les inscriptions fonctionnent localement mais pas en ligne

Le frontend en ligne appelle probablement encore :

```text
/api
```

au lieu de l’adresse du backend. Corriger [config.js](./config.js), faire un commit et attendre le nouveau déploiement.

### Les comptes disparaissent

Le stockage du backend n’est pas persistant. Il faut configurer un disque persistant ou migrer vers PostgreSQL.

### Les documents disparaissent

Le dossier `uploads` n’est pas un stockage permanent sur un environnement serverless. Utiliser un stockage objet privé.

---

## 14. Sécurité avant une vraie utilisation

Avant de communiquer le lien publiquement :

- changer le mot de passe administrateur initial ;
- utiliser un secret différent pour chaque environnement ;
- utiliser PostgreSQL en production ;
- utiliser un stockage persistant ou objet pour les documents ;
- activer HTTPS ;
- ne jamais publier `trust.sqlite` ;
- ne jamais publier le contenu réel de `uploads` ;
- limiter la taille et le type des fichiers ;
- ajouter une sauvegarde régulière ;
- ajouter une politique de confidentialité pour les noms et téléphones collectés.

---

## 15. Résumé très court

### Pour tester maintenant

```powershell
cd "C:\Users\User\Videos\Trust-docs"
npm start
```

Ouvrir `http://localhost:5500`.

### Pour publier

```text
GitHub → envoyer le code
Render → publier le backend
config.js → mettre l’URL Render
Netlify OU Vercel → publier le frontend
Render CORS_ORIGIN → mettre l’URL Netlify/Vercel
Tester inscription et connexion
```

Contact TRUST ORGANISATION :

```text
6 41 87 03 29
```

Conception :

```text
ZETA ORG
```
