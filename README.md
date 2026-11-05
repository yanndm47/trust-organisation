# TRUST ORGANISATION

Plateforme académique de TRUST ORGANISATION : bibliothèque de documents, actualités, inscription, connexion et espace administrateur.

## Architecture

```text
Frontend statique : Vercel
Backend Node.js   : Render
Base et fichiers  : SQLite + uploads (stockage persistant obligatoire en production)
```

Le frontend appelle l’API indiquée dans [`config.js`](./config.js). Le backend expose les routes `/api/*` et la vérification `/health`.

## Développement local

Pré-requis : Node.js 22 ou plus récent.

```powershell
cd "C:\Users\User\Videos\Trust-docs"
npm run check
npm start
```

Ouvrir ensuite <http://localhost:5500>. Vérifier le serveur avec :

```powershell
curl http://localhost:5500/health
```

Réponse attendue :

```json
{"ok":true}
```

## Déploiement Render

Créer un **Web Service** Render relié au dépôt GitHub :

| Réglage | Valeur |
|---|---|
| Build command | `npm install` |
| Start command | `npm start` |
| Node | `22` ou plus récent |

Le serveur écoute automatiquement le port fourni par Render sur `0.0.0.0`. Ne pas remplacer le Start command par `node server.js --port ...`.

Dans les variables d’environnement Render, définir :

```text
CORS_ORIGIN=https://trust-organisation.vercel.app
```

Si plusieurs domaines frontend sont utilisés, les séparer par des virgules :

```text
CORS_ORIGIN=https://trust-organisation.vercel.app,https://www.exemple.com
```

Après chaque modification, redéployer puis tester :

```text
https://ADRESSE-RENDER/health
https://ADRESSE-RENDER/api/bootstrap
```

L’URL Render doit répondre en HTTPS. Si elle renvoie une erreur DNS ou TLS, le frontend ne peut pas inscrire ni connecter les utilisateurs : vérifier le nom exact du service Render, son statut et son domaine public.

## Déploiement Vercel

1. Importer le dépôt GitHub dans Vercel.
2. Choisir le preset **Other**.
3. Laisser la commande de build vide.
4. Utiliser `.` comme répertoire de sortie.
5. Redéployer après toute modification de [`config.js`](./config.js).

L’adresse actuelle configurée est :

```js
window.TRUST_API_URL = "https://trust-organisation-api.onrender.com";
```

Remplacer cette valeur par l’URL publique réelle affichée dans Render, sans slash final. Le domaine Render doit être actif avant de tester Vercel.

## Tests de recette

Depuis le site en ligne :

1. La page publique doit s’afficher immédiatement, même si Render démarre lentement.
2. Sur mobile, le bouton **Se connecter** doit rester visible.
3. **S’inscrire** avec un nouveau numéro.
4. Se déconnecter puis se reconnecter.
5. Se connecter avec le compte administrateur fourni séparément.
6. Vérifier la publication d’une actualité, d’une filière et d’un document.
7. Tester le téléchargement d’un document.

Les erreurs réseau sont présentées sous forme de message utilisateur court avec un bouton **Réessayer**. Les détails techniques restent dans les journaux Render, pas dans l’interface publique.

## Données et stockage

`trust.sqlite` et `uploads/` sont ignorés par Git. Sur Render, le disque local est éphémère sans **Persistent Disk** : les comptes et documents peuvent donc disparaître lors d’un redéploiement.

Pour une utilisation réelle :

- monter un Persistent Disk Render pour la base et `uploads` ;
- ou migrer vers PostgreSQL et un stockage objet ;
- sauvegarder régulièrement les données ;
- ne jamais publier `trust.sqlite`, les fichiers téléversés ou un fichier `.env`.

## Fichiers principaux

```text
index.html   structure HTML
styles.css   interface responsive
app.js       navigation, formulaires et appels API
config.js    URL publique du backend
server.js    serveur Node.js, API et base SQLite
package.json commandes et version Node
```

## Compte administrateur

Le compte administrateur initial est créé par le backend uniquement s’il n’existe pas déjà. Utiliser les identifiants transmis au responsable du site, puis changer le mot de passe avant toute communication publique.

## Dépannage rapide

### « Serveur indisponible » ou « failed to fetch »

1. Ouvrir `https://ADRESSE-RENDER/health`.
2. Si l’URL ne répond pas, corriger le service ou le domaine Render.
3. Vérifier que [`config.js`](./config.js) contient exactement cette URL.
4. Vérifier `CORS_ORIGIN` dans Render.
5. Redéployer le backend puis le frontend.

### La connexion fonctionne mais la session disparaît

Le backend doit être en HTTPS et le domaine Vercel doit être présent dans `CORS_ORIGIN`. Les cookies inter-domaines nécessitent `SameSite=None; Secure`.

### Le site reste blanc

Le frontend rend maintenant la page avant l’appel API. Si Render est lent ou indisponible, la bibliothèque reste visible et affiche un message discret avec **Réessayer**.

## Commandes Git

```powershell
git add .
git commit -m "Fix production frontend and API connectivity"
git push
```

Ne jamais committer de secrets, de base SQLite ou de documents utilisateurs.
