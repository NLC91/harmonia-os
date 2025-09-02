// src/components/analytics.js
// Renders a minimal analytics dashboard into a container.
// Depends on AnalyticsService.

(function(global) {
    function render(containerId) {
        const container = document.getElementById(containerId);
        if (!container || !global.AnalyticsService) return;
        const metrics = AnalyticsService.summaryMetrics();
        container.innerHTML = `
            <div class="analytics-row">
                <div class="analytics-card">
                    <h3>${metrics.tasks_added}</h3>
                    <div>Tasks ajoutées</div>
                </div>
                <div class="analytics-card">
                    <h3>${metrics.tasks_completed}</h3>
                    <div>Tasks complétées</div>
                </div>
                <div class="analytics-card">
                    <h3>${metrics.habits_activated}</h3>
                    <div>Habitudes activées</div>
                </div>
            </div>
            <div class="analytics-timeline">
                <strong>Derniers événements :</strong>
                <div id="analyticsEventsList">${renderEventsList(AnalyticsService.getEvents().slice(-20).reverse())}</div>
            </div>
        `;
    }

    function renderEventsList(events) {
        if (!events || events.length === 0) return '<div style="margin-top:8px;">Aucun événement enregistré.</div>';
        return events.map(e => {
            const d = new Date(e.ts).toLocaleString();
            const summary = e.props && e.props.sphereKey ? ` • ${e.props.sphereKey}` : '';
            return `<div style="padding:6px 0; border-bottom: 1px dashed #eee;">${d} — <strong>${e.name}</strong>${summary}</div>`;
        }).join('');
    }

    // wire callbacks so dashboard updates reactively
    function mount(containerId) {
        render(containerId);
        // subscribe to events
        global.Analytics = global.Analytics || {};
        global.Analytics.onEventTracked = function() {
            render(containerId);
        };
        global.Analytics.onEventsCleared = function() {
            render(containerId);
        };
    }

    global.Analytics = global.Analytics || {};
    global.Analytics.render = render;
    global.Analytics.mount = mount;
})(window);
