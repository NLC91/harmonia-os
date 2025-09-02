// src/services/analytics.js
// Minimal analytics service: stores events locally in localStorage and exposes simple metrics.

(function(global) {
    const KEY = 'harmonia_events_v1';

    function _load() {
        try {
            const raw = localStorage.getItem(KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.warn('Analytics load error', e);
            return [];
        }
    }

    function _save(events) {
        try {
            localStorage.setItem(KEY, JSON.stringify(events));
        } catch (e) {
            console.warn('Analytics save error', e);
        }
    }

    function trackEvent(name, props = {}) {
        const events = _load();
        const evt = {
            id: 'evt_' + Date.now() + '_' + Math.floor(Math.random() * 9999),
            name,
            props,
            ts: Date.now()
        };
        events.push(evt);
        _save(events);
        // optional callback to UI
        if (global.Analytics && typeof global.Analytics.onEventTracked === 'function') {
            global.Analytics.onEventTracked(evt);
        }
        return evt;
    }

    function getEvents() {
        return _load();
    }

    function clearEvents() {
        _save([]);
        if (global.Analytics && typeof global.Analytics.onEventsCleared === 'function') {
            global.Analytics.onEventsCleared();
        }
    }

    function exportEvents() {
        const data = getEvents();
        const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'harmonia-events.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    function summaryMetrics() {
        const events = getEvents();
        const metrics = {
            total_events: events.length,
            tasks_added: events.filter(e => e.name === 'task_added').length,
            tasks_completed: events.filter(e => e.name === 'task_completed').length,
            habits_activated: events.filter(e => e.name === 'habit_activated').length,
            ai_requests: events.filter(e => e.name === 'ai_request').length,
            ai_applied: events.filter(e => e.name === 'ai_applied').length
        };
        return metrics;
    }

    global.AnalyticsService = {
        trackEvent,
        getEvents,
        clearEvents,
        exportEvents,
        summaryMetrics
    };
})(window);
