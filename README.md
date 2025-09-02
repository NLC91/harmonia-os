```markdown
# Harmonia OS

Harmonia OS est une application web légère pour vous aider à équilibrer vos sphères de vie (santé, spiritualité, famille, social, travail, finances, ...).

Cette mise à jour inclut :
- Remplacement de tous les window.prompt par un modal d'ajout de tâche (UX améliorée).
- Mécanisme d'analytics minimaliste stocké en local (events) + dashboard simple.
- Assistant heuristique transformé pour appeler un backend OpenAI (opt-in + URL configurable).
- Services modulaires (src/services) et composants (src/components).
- Instructions et exemple de serveur pour déployer une API IA sécurisée.

Important : L'IA nécessite un backend (fichier exemple `server/server.js`) pour appeler l'API OpenAI. Cela permet :
- Ne pas exposer la clé OpenAI dans le client.
- Appliquer des contrôles, quotas et validations côté serveur.
- Respecter le consentement explicite de l'utilisateur (opt-in).

## Tester localement (frontend)

1. Cloner le dépôt et ouvrir `index.html` dans un navigateur, ou lancer un simple serveur local (recommandé) :
   ```
   python -m http.server 8080
   # puis ouvrir http://localhost:8080
   ```

2. À la première ouverture :
   - Le modal d'onboarding s'affichera (si non complété).
   - Le panneau Analytics montre les événements collectés localement.

3. Pour activer l'IA :
   - Cliquez sur l'icône ⚙️ (Paramètres) → activez "Activer l'assistant intelligent (IA)" → entrez l'URL de l'API (ex: https://my-harmonia-server.example.com/api/ai-suggest) → Sauvegarder.
   - L'IA ne sera utilisée que si l'option est activée ET qu'une URL d'API est configurée.

## Backend IA (exemple)

Un serveur Node/Express exemple est fourni dans `server/server.js`. Il :
- Reçoit des requêtes limitées depuis le client (payload minimal : résumé des sphères).
- Vérifie que la requête est bien formée et applique une limitation basique (rate-limit).
- Interroge l'API OpenAI (clé stockée en variable d'environnement OPENAI_API_KEY).
- Renvoie une réponse structurée { recommendedAction: {text, durationMin}, reason }.

NE PAS mettre OPENAI_API_KEY dans le code source. Configurez-la comme variable d'environnement sur votre fournisseur d'hébergement (Render, Vercel, Heroku, etc.).

## Déployer le backend

Options courantes :
- Render (https://render.com) — repository Docker / Node : ajouter la variable OPENAI_API_KEY.
- Vercel Serverless Functions — adapter la route en function.
- Fly / Heroku — déployer `server/` comme app Node.

Exemple d'exécution locale :
```
cd server
npm install
export OPENAI_API_KEY=sk-...
node server.js
# server écoute sur http://localhost:3000 par défaut
```

## Confidentialité & sécurité (plan recommandé)
- Toujours demander le consentement explicite utilisateur (opt-in) avant d'envoyer des données à l'API IA.
- Envoyer uniquement un résumé non sensible (progress % par sphère, pas de journaux personnels).
- Appliquer un rate-limit côté serveur et journaliser les usages.
- Supporter un mode "local-first" (l'heuristique locale est utilisée si IA non configurée).

## Suite recommandée
- Remplacer la persistance locale par un backend chiffré pour synchronisation multiplateforme (optionnel).
- Ajouter tests unitaires pour StorageService & AnalyticsService.
- Ajouter un petit onboarding pour expliquer l'opt-in IA et la politique de confidentialité.
- Ajouter service de push notifications via Service Worker pour rappels fiables (PWA).

```
