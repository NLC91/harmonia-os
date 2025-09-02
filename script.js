// Harmonia OS - JavaScript Version Finale (avec fonctions manquantes ajoutées)

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
    meditationSeconds: 0,
    journalEntries: [],
    habits: {}, // habitId => habit object
    preferences: {
        onboardingCompleted: false
    }
};

// Storage key
const STORAGE_KEY = 'harmonia_v1';

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

    // Initialize optional services if available
    if (window.NotificationService) NotificationService.requestPermission();
    if (window.Onboarding && !appState.preferences.onboardingCompleted) {
        // small delay so UI mounts first
        setTimeout(() => {
            window.Onboarding.startOnboarding();
        }, 400);
    }
}

/* ----------------------------
   Rendu des sphères, tâches, insights (existant)
   ---------------------------- */
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

function renderFocusTasks() {
    const container = document.getElementById('focusItems');
    
    if (appState.focusTasks.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #9ca3af;">Aucune tâche pour le moment</p>';
        return;
    }
    
    container.innerHTML = appState.focusTasks.map((task, index) => `
        <div class="focus-item" data-index="${index}">
            <input type="checkbox" id="task${index}" ${task.completed ? 'checked' : ''}>
            <label for="task${index}">${task.text}${task.sphereKey ? ' • ' + (appState.spheres[task.sphereKey]?.name || '') : ''}</label>
            <button class="delete-task" data-index="${index}">×</button>
        </div>
    `).join('');
    
    // Réattacher les event listeners
    document.querySelectorAll('.focus-item input').forEach((checkbox, idx) => {
        checkbox.addEventListener('change', function() {
            const index = parseInt(this.id.replace('task', ''), 10);
            appState.focusTasks[index].completed = this.checked;
            updateProgress();
            saveData();
            if (this.checked) {
                if (window.NotificationService) NotificationService.cancelReminderForTask(appState.focusTasks[index]);
            }
        });
    });

    // delete buttons
    document.querySelectorAll('.delete-task').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const index = parseInt(this.dataset.index, 10);
            deleteTask(index);
        });
    });
}

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

/* ----------------------------
   Calcul du score d'harmonie (existant)
   ---------------------------- */
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

/* ----------------------------
   Utilitaires (existant)
   ---------------------------- */
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

function updateDateTime() {
    const now = new Date();
    const dateElement = document.getElementById('currentDate');
    const timeElement = document.getElementById('currentTime');
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = now.toLocaleDateString('fr-FR', options);
    timeElement.textContent = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

/* ----------------------------
   Event Listeners & Handlers (complétés)
   ---------------------------- */
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
    const harmonyBtn = document.getElementById('harmonyBtn');
    if (harmonyBtn) harmonyBtn.addEventListener('click', showHarmonyInsights);
    
    // Actions rapides
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.dataset.action;
            handleQuickAction(action);
        });
    });
    
    // Ajouter une tâche
    const addBtn = document.getElementById('addTaskBtn');
    if (addBtn) addBtn.addEventListener('click', addNewTask);
    
    // Modal close handlers (already part of HTML)
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

/* ----------------------------
   Modal des sphères (existant)
   ---------------------------- */
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

/* ----------------------------
   Fonctions manquantes demandées
   ---------------------------- */

// Persistance
function saveData() {
    try {
        const copy = JSON.stringify(appState);
        localStorage.setItem(STORAGE_KEY, copy);
    } catch (e) {
        console.error('Erreur lors de la sauvegarde:', e);
    }
}

function loadSavedData() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw);
        // Merge saved into appState (non destructif)
        if (saved.spheres) {
            Object.keys(appState.spheres).forEach(k => {
                if (saved.spheres[k]) {
                    appState.spheres[k] = Object.assign({}, appState.spheres[k], saved.spheres[k]);
                }
            });
        }
        if (Array.isArray(saved.focusTasks)) appState.focusTasks = saved.focusTasks;
        if (saved.insights) appState.insights = Object.assign({}, appState.insights, saved.insights);
        if (typeof saved.harmonyScore === 'number') appState.harmonyScore = saved.harmonyScore;
        if (saved.meditationSeconds) appState.meditationSeconds = saved.meditationSeconds;
        if (Array.isArray(saved.journalEntries)) appState.journalEntries = saved.journalEntries;
        if (saved.habits) appState.habits = saved.habits;
        if (saved.preferences) appState.preferences = Object.assign({}, appState.preferences, saved.preferences);
    } catch (e) {
        console.warn('Impossible de charger les données sauvegardées:', e);
    }
}

// Tâches : Ajouter / Supprimer
function addNewTask() {
    // simple inline prompt flow (remplaçable par un vrai modal)
    const text = window.prompt("Nouvelle tâche - Que souhaitez-vous accomplir aujourd'hui ?");
    if (!text || !text.trim()) return;
    const sphereKey = window.prompt("Associer une sphère (ex: health, spiritual, family, social, work, finance). Laisser vide si non applicable.") || null;
    const task = {
        id: 'task_' + Date.now(),
        text: text.trim(),
        sphereKey: sphereKey && sphereKey.trim() ? sphereKey.trim() : null,
        completed: false,
        createdAt: Date.now()
    };
    appState.focusTasks.unshift(task);
    renderFocusTasks();
    saveData();
    showNotification('Tâche ajoutée ✅');
}

function deleteTask(index) {
    if (index < 0 || index >= appState.focusTasks.length) return;
    const removed = appState.focusTasks.splice(index, 1);
    renderFocusTasks();
    saveData();
    showNotification('Tâche supprimée');
}

// Ajouter une activité / micro-habit dans une sphère
function addActivity(sphereType) {
    const activity = window.prompt(`Ajouter une activité pour ${appState.spheres[sphereType].name} :`);
    if (!activity || !activity.trim()) return;
    // create as a focusTask (quick integration)
    const task = {
        id: 'task_' + Date.now(),
        text: activity.trim(),
        sphereKey: sphereType,
        completed: false,
        createdAt: Date.now()
    };
    appState.focusTasks.unshift(task);
    renderFocusTasks();
    saveData();
    showNotification(`Activité ajoutée à ${appState.spheres[sphereType].name}`);
}

// Suggestions (utilise component Habits si présent)
function showSuggestions(sphereType) {
    const modal = document.getElementById('sphereModal');
    const modalContent = document.getElementById('modalContent');
    if (window.Habits) {
        // render suggestions inside modal content
        modalContent.innerHTML = `<h2>💡 Suggestions pour ${appState.spheres[sphereType].name}</h2><div id="habitTemplatesContainer"></div>`;
        modal.style.display = 'block';
        window.Habits.renderTemplates('habitTemplatesContainer', sphereType);
    } else {
        // fallback simple suggestions
        const suggestions = {
            health: ['Boire un verre d\'eau', 'Faire 5 minutes d\'étirement'],
            spiritual: ['Méditer 5 min', 'Noter 1 gratitude'],
            family: ['Appeler un proche', 'Préparer un repas ensemble'],
            social: ['Envoyer un message à un ami', 'Inviter quelqu\'un pour un café'],
            work: ['Bloc focus de 25 min', 'Planifier session de revue'],
            finance: ['Vérifier dépenses 5 min', 'Planifier épargne mensuelle']
        };
        modalContent.innerHTML = `<h3>Suggestions</h3><ul>${(suggestions[sphereType] || []).map(s => `<li>${s} <button onclick="quickAddFromSuggestion('${sphereType}','${escapeForInline(s)}')">Ajouter</button></li>`).join('')}</ul>`;
        modal.style.display = 'block';
    }
}

function escapeForInline(str) {
    return str.replace(/'/g, "\\'");
}

function quickAddFromSuggestion(sphereType, text) {
    const task = {
        id: 'task_' + Date.now(),
        text,
        sphereKey: sphereType,
        completed: false,
        createdAt: Date.now()
    };
    appState.focusTasks.unshift(task);
    renderFocusTasks();
    saveData();
    showNotification('Suggestion ajoutée ✅');
}

// Quick actions
function handleQuickAction(action) {
    switch(action) {
        case 'meditate':
            startMeditation(5 * 60); // 5 min default
            break;
        case 'journal':
            document.getElementById('journalModal').style.display = 'block';
            break;
        case 'focus':
            addNewTask();
            break;
        case 'review':
            showHarmonyInsights();
            break;
        default:
            console.warn('Action rapide inconnue:', action);
    }
}

// Afficher insights d'harmonie / bilan court
function showHarmonyInsights() {
    const modal = document.getElementById('sphereModal');
    const modalContent = document.getElementById('modalContent');

    // Build a short weekly summary + one priority action using AiCoach if available
    let summaryHtml = `<h2>📊 Bilan rapide</h2>
        <p>Score d'harmonie : <strong>${appState.harmonyScore}%</strong></p>
        <ul>
            ${Object.entries(appState.spheres).map(([k,s]) => `<li>${s.icon} ${s.name} : ${s.progress}%</li>`).join('')}
        </ul>
    `;

    if (window.AiCoach) {
        const check = AiCoach.dailyCheckIn(appState);
        summaryHtml += `<h3>Suggestion intelligente</h3>
            <p>${check.reason}</p>
            <p><strong>Action recommandée :</strong> ${check.recommendedAction.text}</p>
            <button onclick="applyAiSuggestion()">Activer</button>
        `;
    } else {
        summaryHtml += `<p>Action prioritaire suggérée : choisissez une petite action pour la sphère la plus basse.</p>`;
    }

    modalContent.innerHTML = summaryHtml;
    modal.style.display = 'block';
}

function applyAiSuggestion() {
    if (!window.AiCoach) return;
    const check = AiCoach.dailyCheckIn(appState);
    // add as a task/habit
    const habit = {
        id: 'habit_' + Date.now(),
        sphereKey: getLowestSphereKey(),
        text: check.recommendedAction.text,
        frequency: 'once',
        active: true,
        createdAt: Date.now()
    };
    appState.habits[habit.id] = habit;
    // also add to tasks for today
    appState.focusTasks.unshift({
        id: 'task_' + Date.now(),
        text: habit.text,
        sphereKey: habit.sphereKey,
        completed: false,
        createdAt: Date.now()
    });
    renderFocusTasks();
    saveData();
    showNotification('Suggestion AI ajoutée aux tâches');
}

function getLowestSphereKey() {
    return Object.entries(appState.spheres).sort((a,b) => a[1].progress - b[1].progress)[0][0];
}

/* ----------------------------
   Méditation : start/stop & timer (complété)
   ---------------------------- */
function startMeditation(seconds = 300) {
    // seconds default 5min
    clearInterval(appState.meditationTimer);
    appState.meditationSeconds = seconds;
    const timerEl = document.getElementById('meditationTimer');
    const display = document.getElementById('timerDisplay');
    if (!timerEl || !display) return;

    timerEl.style.display = 'block';
    function updateDisplay() {
        const mm = String(Math.floor(appState.meditationSeconds / 60)).padStart(2, '0');
        const ss = String(appState.meditationSeconds % 60).padStart(2, '0');
        display.textContent = `${mm}:${ss}`;
    }

    updateDisplay();
    appState.meditationTimer = setInterval(() => {
        appState.meditationSeconds--;
        updateDisplay();
        if (appState.meditationSeconds <= 0) {
            stopMeditation(true);
        }
    }, 1000);

    showNotification('Méditation démarrée 🧘');
}

function stopMeditation(completed = false) {
    clearInterval(appState.meditationTimer);
    appState.meditationTimer = null;
    appState.meditationSeconds = 0;
    const timerEl = document.getElementById('meditationTimer');
    if (timerEl) timerEl.style.display = 'none';
    if (completed) {
        // register a small insight: increment meditation count (simple)
        if (!appState.insights.meditationCount) appState.insights.meditationCount = 0;
        appState.insights.meditationCount++;
        renderInsights();
        saveData();
        showNotification('Session de méditation terminée — bien joué ✨');
    } else {
        showNotification('Méditation arrêtée');
    }
}

/* ----------------------------
   Journal (save/close)
   ---------------------------- */
function saveJournal() {
    const mood = document.getElementById('moodRange') ? parseInt(document.getElementById('moodRange').value, 10) : null;
    const gratitude = document.getElementById('gratitudeText') ? document.getElementById('gratitudeText').value.trim() : '';
    const reflection = document.getElementById('reflectionText') ? document.getElementById('reflectionText').value.trim() : '';

    const entry = {
        id: 'journal_' + Date.now(),
        createdAt: Date.now(),
        mood,
        gratitude,
        reflection
    };
    appState.journalEntries.unshift(entry);

    // update mood insight quickly (simple rolling average)
    if (mood) {
        if (!appState.insights.moodRecent) appState.insights.moodRecent = [];
        appState.insights.moodRecent.unshift(mood);
        appState.insights.moodRecent = appState.insights.moodRecent.slice(0, 20);
        const avg = Math.round(appState.insights.moodRecent.reduce((a,b) => a+b,0)/appState.insights.moodRecent.length);
        appState.insights.mood = { icon: '😊', label: 'Humeur', value: avg + '/10', unit: '', trend: 'neutral' };
    }

    saveData();
    document.getElementById('journalModal').style.display = 'none';
    showNotification('Journal sauvegardé ✍️');
    renderInsights();
}

function closeJournal() {
    document.getElementById('journalModal').style.display = 'none';
}

/* ----------------------------
   Notifications & util (simple)
   ---------------------------- */
function showNotification(message) {
    // preference to NotificationService if present
    if (window.NotificationService && NotificationService.isSupported()) {
        NotificationService.show(message);
        return;
    }
    // fallback toast-like small in-page message
    try {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.position = 'fixed';
        toast.style.right = '20px';
        toast.style.bottom = '20px';
        toast.style.background = 'rgba(17,24,39,0.95)';
        toast.style.color = '#fff';
        toast.style.padding = '12px 16px';
        toast.style.borderRadius = '10px';
        toast.style.boxShadow = '0 6px 18px rgba(0,0,0,0.2)';
        toast.style.zIndex = 9999;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    } catch (e) {
        // ultimate fallback
        console.log('Notification:', message);
    }
}

/* ----------------------------
   Progress update (simple)
   ---------------------------- */
function updateProgress() {
    // Basic behavior: recalc harmony and save
    calculateHarmonyScore();
    saveData();
}

/* ----------------------------
   Small animation on load (existant)
   ---------------------------- */
function animateOnLoad() {
    // subtle animation: stagger sphere appearance
    const spheres = document.querySelectorAll('.sphere');
    spheres.forEach((s, i) => {
        s.style.opacity = 0;
        s.style.transform += ' scale(0.9)';
        setTimeout(() => {
            s.style.opacity = 1;
            s.style.transform = s.style.transform.replace(' scale(0.9)', '');
        }, i * 80);
    });
}

/* ----------------------------
   Expose some helpers globally for components to call
   ---------------------------- */
window.Harmonia = window.Harmonia || {};
window.Harmonia.appState = appState;
window.Harmonia.saveData = saveData;
window.Harmonia.addTask = addNewTask;
window.Harmonia.addActivity = addActivity;
window.Harmonia.quickAddFromSuggestion = quickAddFromSuggestion;
window.Harmonia.showNotification = showNotification;
