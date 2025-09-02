// ai_coach.js — ébauche d'un assistant local-first pour Harmonia OS
// Objectifs : check-ins, suggestions simples, génération de plan hebdo

const AiCoach = (function() {
    // Utiliser des heuristiques simples au départ (règles basées sur appState)
    function dailyCheckIn(appState) {
        // Retour : suggestion simple + action prioritaire
        const lowest = getLowestSphere(appState.spheres);
        const suggestion = suggestMicroHabitForSphere(lowest.key);
        return {
            moodPrompt: "Comment vous sentez-vous aujourd'hui ? (1-10)",
            recommendedAction: suggestion,
            reason: `Votre ${lowest.name} est à ${lowest.progress}%. Une petite action peut améliorer l'équilibre.`
        };
    }

    function getLowestSphere(spheres) {
        const entries = Object.entries(spheres).map(([k,v]) => ({ key: k, name: v.name, progress: v.progress }));
        entries.sort((a,b) => a.progress - b.progress);
        return entries[0];
    }

    function suggestMicroHabitForSphere(sphereKey) {
        const templates = {
            health: { text: "Boire 1 verre d'eau maintenant", durationMin: 1 },
            spiritual: { text: "Méditer 5 minutes", durationMin: 5 },
            family: { text: "Envoyer un message à un proche", durationMin: 2 },
            social: { text: "Ecrire à un ami", durationMin: 3 },
            work: { text: "Faire un bloc focus de 25 minutes (Pomodoro)", durationMin: 25 },
            finance: { text: "Vérifier vos dépenses 5 min", durationMin: 5 }
        };
        return templates[sphereKey] || { text: "Faire une petite pause", durationMin: 3 };
    }

    function generateWeeklyPlan(appState, preferences) {
        // Simple heuristique : prioriser sphères les plus basses, ajouter 1-2 micro-habits par jour
        const sorted = Object.entries(appState.spheres).sort((a,b) => a[1].progress - b[1].progress);
        const plan = [];
        for (let i=0;i<3;i++) {
            const key = sorted[i][0];
            plan.push({ day: "everyday", sphere: key, habit: suggestMicroHabitForSphere(key) });
        }
        return plan;
    }

    return {
        dailyCheckIn,
        generateWeeklyPlan
    };
})();

// Usage (exemple):
// const check = AiCoach.dailyCheckIn(appState);
// afficher check.recommendedAction dans UI

export default AiCoach;
