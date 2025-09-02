// src/services/ai_coach.js
// Client-side AI coach bridge: calls a trusted backend endpoint you configure when user opts-in.
// Falls back to local heuristics if the remote API isn't configured or opt-in is false.

(function(global) {
    // local heuristic fallback (kept for offline / privacy-first)
    function suggestLocal(appState) {
        const entries = Object.entries(appState.spheres).map(([k,v]) => ({ key: k, name: v.name, progress: v.progress }));
        entries.sort((a,b) => a.progress - b.progress);
        const lowest = entries[0];
        const templates = {
            health: { text: "Boire 1 verre d'eau", durationMin: 1 },
            spiritual: { text: "Méditer 5 minutes", durationMin: 5 },
            family: { text: "Envoyer un message à un proche", durationMin: 2 },
            social: { text: "Écrire à un ami", durationMin: 3 },
            work: { text: "Bloc focus de 25 minutes (Pomodoro)", durationMin: 25 },
            finance: { text: "Vérifier brièvement vos dépenses", durationMin: 5 }
        };
        return {
            recommendedAction: templates[lowest.key] || { text: "Faire une petite pause", durationMin: 3 },
            reason: `Aucune IA configurée. Sphère prioritaire détectée: ${lowest.name} (${lowest.progress}%).`
        };
    }

    async function requestSuggestion(appState, options = {}) {
        // options: { aiEnabled: boolean, apiUrl: string }
        try {
            if (!options.aiEnabled || !options.apiUrl) {
                return suggestLocal(appState);
            }

            // minimal payload: do not send full journal or sensitive data
            const payload = {
                summary: {
                    spheres: Object.entries(appState.spheres).map(([k, v]) => ({ key: k, name: v.name, progress: v.progress })),
                    harmonyScore: appState.harmonyScore
                },
                timestamp: Date.now()
            };

            // track outgoing request for analytics (the server will NOT get raw personal fields)
            if (global.AnalyticsService) AnalyticsService.trackEvent('ai_request', { url: options.apiUrl });

            const res = await fetch(options.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                console.warn('AI API error', res.status);
                return suggestLocal(appState);
            }
            const json = await res.json();
            // expect { recommendedAction: {text, durationMin}, reason }
            if (json && json.recommendedAction) {
                if (global.AnalyticsService) AnalyticsService.trackEvent('ai_response', { applied: !!json.recommendedAction });
                return json;
            } else {
                return suggestLocal(appState);
            }
        } catch (err) {
            console.warn('AI coach request failed, falling back to local suggestion', err);
            return suggestLocal(appState);
        }
    }

    global.AiCoach = {
        requestSuggestion,
        suggestLocal
    };
})(window);
