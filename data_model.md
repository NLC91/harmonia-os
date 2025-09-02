# Modèle de données (proposition)

appState = {
  user: { id, name, tz, preferences },
  spheres: {
    health: { name, progress, icon, color, habits: [habitId], goals: [goalId] },
    ...
  },
  habits: {
    habitId1: {
      id, sphereKey, text, frequency: 'daily|weekly', schedule: {time, days}, streak, lastCompletedAt, active:Boolean
    }
  },
  goals: {
    goalId1: { id, sphereKey, title, description, dueDate, steps: [stepIds], progressPercent }
  },
  rituals: {
    ritualId1: { id, name, sequence: [habitId], schedule }
  },
  focusTasks: [{ text, completed, createdAt, sphereKey? }],
  insights: {...}
}
