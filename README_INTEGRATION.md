```markdown
# Intégration des nouveaux modules (Harmonia OS)

J'ai ajouté des fonctions manquantes directement dans `script.js` (fichier ci-dessus) et créé plusieurs composants/services séparés (exemples ci-dessous).
Pour intégrer proprement ces fichiers, ajoutez les balises <script> dans votre `index.html` (juste avant le `<script src="script.js"></script>` actuel) :

```html
<!-- Services et composants (charger avant script.js) -->
<script src="src/services/notifications.js"></script>
<script src="src/services/storage.js"></script>
<script src="src/components/habits.js"></script>
<script src="src/components/onboarding.js"></script>
<script src="src/services/ai_coach.js"></script>

<!-- script principal -->
<script src="script.js"></script>
```

Notes :
- Les modules ci-dessous sont "plain JS" (non-modules) et exposent leurs API sur l'objet global (ex: `window.NotificationService`, `window.Habits`, `window.Onboarding`, `window.AiCoach`).
- `script.js` utilise ces services si présents (grâce à des vérifications).
- Vous pouvez remplacer les prompts simples (window.prompt) par vos propres modals/UX plus riches (recommandé).
```
