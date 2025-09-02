// Harmonia OS - JavaScript Interactif Complet

// Fonctions manquantes ajoutées pour robustesse
function animateOnLoad() {
    // Animation d'entrée (optionnel)
}
function getSphereDetails(sphereType) {
    // Détail statique ou vide
    return "";
}
function showHarmonyInsights() {
    alert("Fonctionnalité à implémenter : Insights Harmonie.");
}
function updateProgress() {
    // Optionnel : peut recalculer le score, etc.
}

// État de l'application
const appState = {
    spheres: {
        health: { name: 'Santé', progress: 60, icon: '💪' },
        spiritual: { name: 'Spiritualité', progress: 40, icon: '🧘' },
        family: { name: 'Famille', progress: 80, icon: '👨‍👩‍👧' },
        social: { name: 'Social', progress: 45, icon: '👥' },
        work: { name: 'Professionnel', progress: 90, icon: '💼' },
        finance: { name: 'Finances', progress: 70, icon: '💰' }
    },
    harmonyScore: 0,
    focusTasks: [
        { id: 1, text: 'Séance de sport 30 min', completed: false },
        { id: 2, text: 'Appeler Maman', completed: false },
        { id: 3, text: 'Finaliser présentation', completed: false }
    ],
    insights: {
        sleep: { value: 7.5, unit: 'h', trend: 'up' },
        steps: { value: 4500, unit: 'pas', trend: 'down' },
        water: { value: 5, unit: '/8 verres', trend: 'neutral' },
        mood: { value: 'Positive', unit: '', trend: 'up' }
    }
};

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    updateDateTime();
    setInterval(updateDateTime, 1000);
});

function initializeApp() {
    loadSavedData();
    calculateHarmonyScore();
    setupEventListeners();
    animateOnLoad();
    updateAllDisplays();
}

// Sauvegarde et chargement des données
function saveData() {
    try {
        localStorage.setItem('harmoniaState', JSON.stringify(appState));
    } catch (e) {
        alert("Impossible de sauvegarder les données (localStorage plein ou indisponible).");
    }
}

function loadSavedData() {
    const saved = localStorage.getItem('harmoniaState');
    if (saved) {
        try {
            const savedState = JSON.parse(saved);
            if (typeof savedState === 'object' && savedState !== null) {
                Object.assign(appState, savedState);
            }
        } catch (e) {
            localStorage.removeItem('harmoniaState');
            alert("Des données corrompues ont été trouvées. Les données ont été réinitialisées.");
        }
    }
}

// Calcul du score d'harmonie
function calculateHarmonyScore() {
    const scores = Object.values(appState.spheres).map(s => s.progress);
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    appState.harmonyScore = Math.round(average);

    updateHarmonyDisplay();
    saveData();
}

function updateHarmonyDisplay() {
    const scoreElement = document.getElementById('harmonyScore');
    const messageElement = document.getElementById('scoreMessage');
    const circleElement = document.getElementById('harmonyCircle');

    if (!scoreElement || !messageElement || !circleElement) return;

    scoreElement.textContent = appState.harmonyScore;

    // Message personnalisé selon le score
    let message = '';
    if (appState.harmonyScore >= 80) {
        message = 'Excellent équilibre de vie ! 🌟';
    } else if (appState.harmonyScore >= 60) {
        message = 'Votre équilibre de vie est bon ! 👍';
    } else if (appState.harmonyScore >= 40) {
        message = 'Quelques ajustements pourraient aider 🎯';
    } else {
        message = 'Prenons soin de votre équilibre 💪';
    }
    messageElement.textContent = message;

    // Animation du cercle
    const circumference = 2 * Math.PI * 90;
    const offset = circumference - (appState.harmonyScore / 100) * circumference;
    circleElement.style.strokeDashoffset = offset;
}

// Mise à jour de tous les affichages
function updateAllDisplays() {
    Object.entries(appState.spheres).forEach(([key, sphere]) => {
        updateSphereDisplay(key, sphere.progress);
    });
    updateFocusTasks();
}

// Date et heure
function updateDateTime() {
    const now = new Date();
    const dateElement = document.getElementById('currentDate');
    const timeElement = document.getElementById('currentTime');

    if (!dateElement || !timeElement) return;

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = now.toLocaleDateString('fr-FR', options);
    timeElement.textContent = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// Event Listeners
function setupEventListeners() {
    document.querySelectorAll('.sphere').forEach(sphere => {
        sphere.addEventListener('click', function() {
            const sphereType = this.dataset.sphere;
            openSphereModal(sphereType);
        });
    });

    const harmonyBtn = document.getElementById('harmonyBtn');
    if (harmonyBtn) {
        harmonyBtn.addEventListener('click', function() {
            showHarmonyInsights();
        });
    }

    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.dataset.action;
            handleQuickAction(action);
        });
    });

    document.querySelectorAll('.focus-item input').forEach((checkbox, index) => {
        checkbox.addEventListener('change', function() {
            appState.focusTasks[index].completed = this.checked;
            updateProgress();
            saveData();
        });
    });

    const modal = document.getElementById('sphereModal');
    const closeBtn = document.querySelector('.close');

    if (modal && closeBtn) {
        closeBtn.addEventListener('click', () => modal.style.display = 'none');
        window.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
    }
}

// Modal des sphères INTERACTIVE
function openSphereModal(sphereType) {
    const modal = document.getElementById('sphereModal');
    const modalContent = document.getElementById('modalContent');
    const sphere = appState.spheres[sphereType];

    if (!modal || !modalContent || !sphere) return;

    modalContent.innerHTML = `
        <h2>${sphere.icon} ${sphere.name}</h2>
        <div class="modal-progress">
            <h3>Niveau actuel : ${sphere.progress}%</h3>
            <input type="range" 
                   id="sphereSlider" 
                   min="0" 
                   max="100" 
                   value="${sphere.progress}" 
                   class="sphere-slider"
                   oninput="updateSphereProgress('${sphereType}', this.value)">
            <div class="progress-large">
                <div class="progress-bar-large">
                    <div class="progress-fill-large" id="modalProgressFill" style="width: ${sphere.progress}%"></div>
                </div>
                <span class="progress-text-large" id="modalProgressText">${sphere.progress}%</span>
            </div>
        </div>
        <div class="sphere-details">
            ${getSphereDetails(sphereType)}
        </div>
        <div class="sphere-actions">
            <button class="btn-primary" onclick="addActivity('${sphereType}')">
                + Ajouter une activité
            </button>
            <button class="btn-secondary" onclick="showSuggestions('${sphereType}')">
                💡 Suggestions
            </button>
        </div>
    `;

    modal.style.display = 'block';
}

// Mise à jour du progrès d'une sphère
function updateSphereProgress(sphereType, value) {
    const progress = parseInt(value);
    if (isNaN(progress)) return;
    appState.spheres[sphereType].progress = progress;

    const modalProgressFill = document.getElementById('modalProgressFill');
    const modalProgressText = document.getElementById('modalProgressText');
    if (modalProgressFill && modalProgressText) {
        modalProgressFill.style.width = `${progress}%`;
        modalProgressText.textContent = `${progress}%`;
    }

    updateSphereDisplay(sphereType, progress);
    calculateHarmonyScore();
}

function updateSphereDisplay(sphereType, progress) {
    const sphere = document.querySelector(`[data-sphere="${sphereType}"]`);
    if (sphere) {
        const progressBar = sphere.querySelector('.progress-fill');
        const progressText = sphere.querySelector('.progress-text');

        if (progressBar) progressBar.style.width = `${progress}%`;
        if (progressText) progressText.textContent = `${progress}%`;
    }
}

// Ajouter une activité
function addActivity(sphereType) {
    const activity = prompt(`Quelle activité avez-vous réalisée pour ${appState.spheres[sphereType].name} ?`);
    if (activity) {
        const currentProgress = appState.spheres[sphereType].progress;
        const newProgress = Math.min(100, currentProgress + 10);
        updateSphereProgress(sphereType, newProgress);

        alert(`✅ Activité ajoutée ! ${appState.spheres[sphereType].name} +10%`);

        const modal = document.getElementById('sphereModal');
        if (modal) modal.style.display = 'none';
    }
}

// Afficher les suggestions
function showSuggestions(sphereType) {
    const suggestions = {
        health: [
            "🏃 Faire 30 minutes de marche rapide",
            "🥗 Préparer un repas équilibré",
            "💧 Boire 2 litres d'eau aujourd'hui",
            "😴 Se coucher 30 minutes plus tôt"
        ],
        spiritual: [
            "🧘 Méditer 15 minutes",
            "📖 Lire un chapitre inspirant",
            "🙏 Pratiquer la gratitude (3 choses)",
            "🌳 Marche contemplative dans la nature"
        ],
        family: [
            "📞 Appeler un membre de la famille",
            "🎲 Organiser une soirée jeux",
            "🍽️ Dîner en famille sans téléphones",
            "📸 Créer un album photo familial"
        ],
        social: [
            "☕ Prendre un café avec un ami",
            "💬 Envoyer un message à 3 amis",
            "🎉 Organiser une sortie de groupe",
            "🤝 Participer à un événement local"
        ],
        work: [
            "📝 Définir 3 priorités du jour",
            "⏰ Utiliser la technique Pomodoro",
            "📚 Suivre une formation en ligne",
            "🎯 Mettre à jour vos objectifs"
        ],
        finance: [
            "💰 Vérifier votre budget mensuel",
            "📊 Analyser vos dépenses",
            "🏦 Augmenter votre épargne de 5%",
            "📱 Annuler un abonnement inutile"
        ]
    };

    const sphereSuggestions = suggestions[sphereType] || [];
    const suggestionsList = sphereSuggestions.map((s, i) => `${i + 1}. ${s}`).join('\n');

    alert(`💡 Suggestions pour ${appState.spheres[sphereType].name} :\n\n${suggestionsList}`);
}

// Actions rapides INTERACTIVES
function handleQuickAction(action) {
    switch(action) {
        case 'meditate':
            startMeditation();
            break;
        case 'journal':
            openJournal();
            break;
        case 'focus':
            startFocusMode();
            break;
        case 'review':
            showInteractiveReview();
            break;
    }
}

// Méditation interactive
function startMeditation() {
    const duration = prompt('⏱️ Durée de méditation (en minutes) :', '10');
    if (duration && !isNaN(duration)) {
        alert(`🧘 Méditation de ${duration} minutes lancée...\n\nFermez les yeux et concentrez-vous sur votre respiration.`);

        const newProgress = Math.min(100, appState.spheres.spiritual.progress + 5);
        updateSphereProgress('spiritual', newProgress);

        setTimeout(() => {
            alert('🔔 Méditation terminée ! Bien joué !');
        }, 3000);
    }
}

// Journal interactif
function openJournal() {
    const mood = prompt('Comment vous sentez-vous ? (1-10) :', '7');
    const gratitude = prompt('Citez une chose pour laquelle vous êtes reconnaissant :');
    const reflection = prompt('Une réflexion du jour :');

    if (mood && gratitude) {
        appState.insights.mood.value = parseInt(mood) >= 7 ? 'Positive' : 'Neutre';
        alert('📝 Journal sauvegardé avec succès !');

        const newProgress = Math.min(100, appState.spheres.spiritual.progress + 3);
        updateSphereProgress('spiritual', newProgress);
    }
}

// Mode Focus
function startFocusMode() {
    const task = prompt('Sur quoi voulez-vous vous concentrer ?');
    if (task) {
        alert(`🎯 Mode Focus activé pour : ${task}\n\nConcentrez-vous pendant 25 minutes !`);

        appState.focusTasks.push({
            id: appState.focusTasks.length + 1,
            text: task,
            completed: false
        });

        updateFocusTasks();
        saveData();
    }
}

// Mise à jour des tâches focus
function updateFocusTasks() {
    const container = document.querySelector('.focus-items');
    if (!container) return;

    container.innerHTML = appState.focusTasks.map((task, index) => `
        <div class="focus-item">
            <input type="checkbox" id="focus${index + 1}" ${task.completed ? 'checked' : ''}>
            <label for="focus${index + 1}">${task.text}</label>
        </div>
    `).join('');

    document.querySelectorAll('.focus-item input').forEach((checkbox, index) => {
        checkbox.addEventListener('change', function() {
            appState.focusTasks[index].completed = this.checked;
            updateProgress();
            saveData();
        });
    });
}

// Revue interactive
function showInteractiveReview() {
    const completedTasks = appState.focusTasks.filter(t => t.completed).length;
    const totalTasks = appState.focusTasks.length;

    const review = `
📊 BILAN INTERACTIF DU JOUR
Tâches réalisées : ${completedTasks} / ${totalTasks}
Score d'harmonie actuel : ${appState.harmonyScore}
Humeur du jour : ${appState.insights.mood.value}

Bravo pour vos progrès ! Gardez le cap 🌱
`;

    alert(review);
}
