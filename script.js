// Harmonia OS - JavaScript

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
    ]
};

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    updateDateTime();
    setInterval(updateDateTime, 1000);
});

function initializeApp() {
    calculateHarmonyScore();
    setupEventListeners();
    animateOnLoad();
}

// Calcul du score d'harmonie
function calculateHarmonyScore() {
    const scores = Object.values(appState.spheres).map(s => s.progress);
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    appState.harmonyScore = Math.round(average);
    
    updateHarmonyDisplay();
}

function updateHarmonyDisplay() {
    const scoreElement = document.getElementById('harmonyScore');
    const messageElement = document.getElementById('scoreMessage');
    const circleElement = document.getElementById('harmonyCircle');
    
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

// Date et heure
function updateDateTime() {
    const now = new Date();
    const dateElement = document.getElementById('currentDate');
    const timeElement = document.getElementById('currentTime');
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = now.toLocaleDateString('fr-FR', options);
    timeElement.textContent = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// Event Listeners
function setupEventListeners() {
    // Sphères
    document.querySelectorAll('.sphere').forEach(sphere => {
        sphere.addEventListener('click', function() {
            const sphereType = this.dataset.sphere;
            openSphereModal(sphereType);
        });
    });
    
    // Bouton central
    document.getElementById('harmonyBtn').addEventListener('click', function() {
        showHarmonyInsights();
    });
    
    // Actions rapides
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.dataset.action;
            handleQuickAction(action);
        });
    });
    
    // Focus tasks
    document.querySelectorAll('.focus-item input').forEach((checkbox, index) => {
        checkbox.addEventListener('change', function() {
            appState.focusTasks[index].completed = this.checked;
            updateProgress();
        });
    });
    
    // Modal
    const modal = document.getElementById('sphereModal');
    const closeBtn = document.querySelector('.close');
    
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });
}

// Modal des sphères
function openSphereModal(sphereType) {
    const modal = document.getElementById('sphereModal');
    const modalContent = document.getElementById('modalContent');
    const sphere = appState.spheres[sphereType];
    
    modalContent.innerHTML = `
        <h2>${sphere.icon} ${sphere.name}</h2>
        <div class="modal-progress">
            <div class="progress-large">
                <div class="progress-bar-large">
                    <div class="progress-fill-large" style="width: ${sphere.progress}%"></div>
                </div>
                <span class="progress-text-large">${sphere.progress}%</span>
            </div>
        </div>
        <div class="sphere-details">
            ${getSphereDetails(sphereType)}
        </div>
        <div class="sphere-actions">
            <button class="btn-primary" onclick="improveSphere('${sphereType}')">
                Améliorer cette sphère
            </button>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Détails par sphère
function getSphereDetails(sphereType) {
    const details = {
        health: `
            <h3>Statistiques Santé</h3>
            <ul>
                <li>Sommeil moyen : 7h30</li>
                <li>Pas quotidiens : 4,500</li>
                <li>Hydratation : 5/8 verres</li>
                <li>Dernière séance sport : Il y a 2 jours</li>
            </ul>
            <h3>Objectifs</h3>
            <ul>
                <li>✅ 3 séances de sport/semaine</li>
                <li>⏳ 8h de sommeil/nuit</li>
                <li>❌ 10,000 pas/jour</li>
            </ul>
        `,
        spiritual: `
            <h3>Pratique Spirituelle</h3>
            <ul>
                <li>Méditations cette semaine : 3/7</li>
                <li>Journal de gratitude : 5/7</li>
                <li>Temps de réflexion : 2h</li>
            </ul>
            <h3>Prochaines pratiques</h3>
            <ul>
                <li>Méditation guidée ce soir</li>
                <li>Lecture spirituelle dimanche</li>
            </ul>
        `,
        family: `
            <h3>Moments Famille</h3>
            <ul>
                <li>Dîners en famille : 5/7 cette semaine</li>
                <li>Activité commune : Samedi dernier</li>
                <li>Appels famille éloignée : 2 ce mois</li>
            </ul>
            <h3>À planifier</h3>
            <ul>
                <li>Sortie cinéma ce weekend</li>
                <li>Anniversaire de Papa (dans 2 semaines)</li>
            </ul>
        `,
        social: `
            <h3>Vie Sociale</h3>
            <ul>
                <li>Sorties ce
