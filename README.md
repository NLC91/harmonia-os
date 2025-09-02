```markdown
# Harmonia OS

Harmonia OS est une petite application web pour vous aider à équilibrer vos sphères de vie (santé, spiritualité, famille, social, travail, finances, ...).

Cette version inclut :
- Modularisation légère (src/services, src/components)
- Persistance via localStorage (StorageService)
- Notifications via Notification API (NotificationService)
- Habits templates (Habits component)
- Onboarding simple (Onboarding component)
- AiCoach heuristique local-first

Testez localement, puis déployez sur GitHub Pages (manuel) ou automatiquement via GitHub Actions (fichier workflow inclus).

## Tester localement

1. Cloner le dépôt (ou si déjà local, ignorer) :
   ```
   git clone https://github.com/<votre-username>/<votre-repo>.git
   cd <votre-repo>
   ```

2. Ouvrir `index.html` directement dans le navigateur (fonctionne sans serveur), ou pour un environnement plus réaliste lancer un serveur local :
   ```
   # Python 3
   python -m http.server 8080
   # puis ouvrir http://localhost:8080
   ```

3. Autoriser les notifications dans le navigateur si demandé.

## Déploiement sur GitHub Pages (manuel)

1. Commit & push vos changements :
   ```
   git add .
   git commit -m "Harmonia: ajout services, components, onboarding"
   git push origin main
   ```

2. Aller sur GitHub → Settings du repository → Pages
   - Source : Branch `main`, / (root)
   - Enregistrez. Quelques minutes plus tard, votre site sera accessible à l'URL indiquée.

## Déploiement automatique avec GitHub Actions (optionnel)

Un workflow `/.github/workflows/deploy.yml` est inclus dans ce repo (si vous ajoutez ce fichier) qui publie le contenu du repo sur la branche `gh-pages` à chaque push sur `main` en utilisant `peaceiris/actions-gh-pages`. Alternativement, vous pouvez utiliser la configuration Pages sur `gh-pages` branch.

## Conseils pour la suite

- Remplacer les window.prompt par de vrais modals (UX).
- Ajouter tests unitaires pour StorageService et Habits.activateTemplate.
- Ajouter analytics (privacy-first) pour mesurer DAU, retention des habitudes.
- Si vous souhaitez une intégration IA plus riche, ajoutez un backend (ou services tiers) avec opt-in et chiffrez les données sensibles.

```
