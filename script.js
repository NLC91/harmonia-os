// Harmonia OS - JavaScript Version Finale

// État de l'application
const appState = {
    spheres: {
        health: { name: 'Santé', progress: 60, icon: '💪', color: '#10b981' },
        spiritual: { name: 'Spiritualité', progress: 40, icon: '🧘', color: '#8b5cf6' },
        family: { name: 'Famille', progress: 80, icon: '👨‍👩‍👧', color: '#ec4899' },
        social: { name: 'Social', progress: 45, icon: '👥', color: '#3b82f6' },
        work: { name: 'Professionnel', progress: 90, icon: '💼', color: '#f59e0b' },
        finance: { name: 'Finances', progress: 70, icon: '💰', color: '#22c55e' }
    },
    harmonyScore: 0,
    focusTasks: [],
    insights: {
        sleep: { icon: '😴', label: 'Sommeil', value: 7.5, unit: 'h', trend: 'up' },
        steps: { icon: '🏃', label: 'Activité', value: 4500, unit: ' pas', trend: 'down' },
        water: { icon: '💧', label: 'Hydratation', value: 5, unit: '/8 verres', trend: 'neutral' },
        mood: { icon: '😊', label: 'Humeur', value: 'Positive', unit: '', trend: 'up' }
    },
    meditationTimer: null,
    meditationSeconds: 0
};

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    loadSavedData();
    renderSpheres();
    renderFocusTasks();
    renderInsights();
    calculateHarmonyScore();
    setupEventListeners();
    updateDateTime();
    setInterval(updateDateTime, 1000);
    animateOnLoad();
}

// Rendu des sphères
function renderSpheres() {
    const container = document.getElementById('spheresContainer');
    container.innerHTML = '';
    
    Object.entries(appState.spheres).forEach(([key, sphere], index) => {
        const angle = (index * 60); // 360° / 6 sphères
        const sphereElement = document.createElement('div');
        sphereElement.className = 'sphere';
        sphereElement.dataset.sphere = key;
        sphereElement.style.setProperty('--angle', `${angle}deg`);
        sphereElement.style.transform = `translate(-50%, -50%) rotate(${angle}deg) translateX(180px) rotate(-${angle}deg)`;
        
        sphereElement.innerHTML = `
            <div class="sphere-content">
                <div class="sphere-icon">${sphere.icon}</div>
                <h3>${sphere.name}</h3>
                <div class="sphere-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${sphere.progress}%"></div>
                    </div>
                    <span class="progress-text">${sphere.progress}%</span>
                </div>
            </div>
        `;
        
        container.appendChild(sphereElement);
    });
}

// Rendu des tâches
function renderFocusTasks() {
    const container = document.getElementById('focusItems');
    
    if (appState.focusTasks.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #9ca3af;">Aucune tâche pour le moment</p>';
        return;
    }
    
    container.innerHTML = appState.focusTasks.map((task, index) => `
        <div class="focus-item">
            <input type="checkbox" id="task${index}" ${task.completed ? 'checked' : ''}>
            <label for="task${index}">${task.text}</label>
            <button class="delete-task" onclick="deleteTask(${index})">×</button>
        </div>
    `).join('');
    
    // Réattacher les event listeners
    document.querySelectorAll('.focus-item input').forEach((checkbox, index) => {
        checkbox.addEventListener('change', function() {
            appState.focusTasks[index].completed = this.checked;
            updateProgress();
            saveData();
        });
    });
}

// Rendu des insights
function renderInsights() {
    const container = document.getElementById('insightCards');
    
    container.innerHTML = Object.entries(appState.insights).map(([key, insight]) => `
        <div class="insight-card">
            <div class="insight-icon">${insight.icon}</div>
            <h4>${insight.label}</h4>
            <p>${insight.value}${insight.unit}</p>
            <span class="trend ${insight.trend}">${getTrendText(insight.trend)}</span>
        </div>
    `).join('');
}

function getTrendText(trend) {
    switch(trend) {
        case 'up': return '↑ En hausse';
        case 'down': return '↓ En baisse';
        default: return '→ Stable';
    }
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
    
    // Animation du nombre
    animateNumber(scoreElement, appState.harmonyScore);
    
    // Message personnalisé
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

// Animation des nombres
function animateNumber(element, target) {
    const current = parseInt(element.textContent) || 0;
    const increment = target > current ? 1 : -1;
    const steps = Math.abs(target - current);
    
    if (steps === 0) return;
    
    let step = 0;
    const timer = setInterval(() => {
        step++;
        element.textContent = current + (increment * step);
        if (step >= steps) {
            clearInterval(timer);
        }
    }, 20);
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
    document.addEventListener('click', function(e) {
        const sphere = e.target.closest('.sphere');
        if (sphere) {
            const sphereType = sphere.dataset.sphere;
            openSphereModal(sphereType);
        }
    });
    
    // Bouton central
    document.getElementById('harmonyBtn').addEventListener('click', showHarmonyInsights);
    
    // Actions rapides
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.dataset.action;
            handleQuickAction(action);
        });
    });
    
    // Ajouter une tâche
    document.getElementById('addTaskBtn').addEventListener('click', addNewTask);
    
    // Modal
    document.querySelectorAll('.modal .close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Journal mood slider
    const moodRange = document.getElementById('moodRange');
    if (moodRange) {
        moodRange.addEventListener('input', function() {
            document.getElementById('moodValue').textContent = this.value;
        });
    }
}

// Modal des sphères
function openSphereModal(sphereType) {
    const modal = document.getElementById('sphereModal');
    const modalContent = document.getElementById('modalContent');
    const sphere = appState.spheres[sphereType];
    
    modalContent.innerHTML = `
        <h2>${sphere.icon} ${sphere.name}</h2>
        <div class="modal-progress">
            <h3>Niveau actuel : <span id="currentProgress">${sphere.progress}%</span></h3>
            <input type="range" 
                   id="sphereSlider" 
                   min="0" 
                   max="100" 
                   value="${sphere.progress}" 
                   class="sphere-slider">
            <div class="progress-large">
                <div class="progress-bar-large">
                    <div class="progress-fill-large" id="modalProgressFill" style="width: ${sphere.progress}%"></div>
                </div>
            </div>
        </div>
        <div class="sphere-details">
            ${getSphereDetails(sphereType)}
        </div>
        <div class="sphere-actions">
            <button class="btn-primary" onclick="saveSphereProgress('${sphereType}')">
                💾 Sauvegarder
            </button>
            <button class="btn-secondary" onclick="addActivity('${sphereType}')">
                + Ajouter une activité
            </button>
            <button class="btn-secondary" onclick="showSuggestions('${sphereType}')">
                💡 Suggestions
            </button>
        </div>
    `;
    
    // Event listener pour le slider
    const slider = document.getElementById('sphereSlider');
    slider.addEventListener('input', function() {
        document.getElementById('currentProgress').textContent = this.value + '%';
        document.getElementById('modalProgressFill').style.width = this.value + '%';
    });
    
    modal.style.display = 'block';
}

// Sauvegarder le progrès
function saveSphereProgress(sphereType) {
    const slider = document.getElementById('sphereSlider');
    const newProgress = parseInt(slider.value);
    
    appState.spheres[sphereType].progress = newProgress;
    updateSphereDisplay(sphereType, newProgress);
    calculateHarmonyScore();
    saveData();
    
    document.getElementById('sphereModal').style.display = 'none';
    showNotification(`✅ ${appState.spheres[sphereType].name} mis à jour !`);
}

// Mise à jour de l'affichage d'une sphère
function updateSphereDisplay(sphereType, progress) {
    const sphere = document.querySelector(`[data-sphere="${sphereType}"]`);
    if (sphere) {
        const progressBar = sphere.querySelector('.progress-fill');
        const progressText = sphere.querySelector('.progress-text');
        
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${progress}%`;
    }
}

// Détails des sphères
function getSphereDetails(sphereType) {
    const details = {
        health: `
            <h3>📊 Statistiques Santé</h3>
            <ul>
                <li>🛌 Sommeil moyen : 7h30</li>
                <li>👟 Pas quotidiens : 4,500</li>
                <li>💧 Hydratation : 5/8 verres</li>
                <li>🏃 Dernière séance sport : Il y a 2 jours</li>
            </ul>
            <h3>🎯 Objectifs</h3>
            <ul>
                <li>✅ 3 séances de sport/semaine</li>
                <li>⏳ 8h de sommeil/nuit</li>
                <li>❌ 10,000 pas/jour</li>
            </ul>
        `,
        spiritual: `
            <h3>🧘 Pratique Spirituelle</h3>
            <ul>
                <li>🧘 Méditations cette semaine : 3/7</li>
                <li>📝 Journal de gratitude : 5/7</li>
                <li>🤔 Temps de réflexion : 2h</li>
            </ul>
            <h3>📅 Prochaines pratiques</h3>
            <ul>
                <li>🌙 Méditation guidée ce soir</li>
                <li>📖 Lecture spirituelle dimanche</li>
            </ul>
        `,
        family: `
            <h3>👨‍👩‍👧 Moments Famille</h3>
            <ul>
                <li>🍽️ Dîners en famille : 5/7 cette semaine</li>
                <li>🎮 Activité commune : Samedi dernier</li>
                <li>📞 Appels famille éloignée : 2 ce mois</li>
            </ul>
            <h3>📅 À planifier</h3>
            <ul>
                <li>🎬 Sortie cinéma ce weekend</li>
                <li>🎂 Anniversaire de Papa (dans 2 semaines)</li>
            </ul>
        `,
        social: `
            <h3>👥 Vie Sociale</h3>
            <ul>
                <li>🎉 Sorties ce mois : 3</li>
                <li>🤝 Nouveaux contacts : 2</li>
                <li>📅 Événements à venir : 1</li>
            </ul>
            <h3>💫 Cercle social</h3>
            <ul>
                <li>👫 Amis proches contactés : 4/6</li>
                <li>🎊 Dernière grande sortie : Il y a 10 jours</li>
            </ul>
        `,
        work: `
            <h3>💼 Performance Professionnelle</h3>
            <ul>
                <li>✅ Projets complétés : 8/10</li>
                <li>⏱️ Heures focus : 
