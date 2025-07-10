import { WorkSession, TaskCategory, SessionStats } from '../types';

export const calculateSessionStats = (sessions: WorkSession[]): SessionStats => {
  const completedSessions = sessions.filter(s => !s.isActive);
  const totalSessions = completedSessions.length;
  const totalMinutes = completedSessions.reduce((sum, session) => sum + session.duration, 0);
  const totalHours = Math.round((totalMinutes / 60) * 100) / 100;
  
  const tasksByCategory: Record<TaskCategory, number> = {
    [TaskCategory.DEVELOPMENT]: 0,
    [TaskCategory.DESIGN]: 0,
    [TaskCategory.MEETINGS]: 0,
    [TaskCategory.PLANNING]: 0,
    [TaskCategory.RESEARCH]: 0,
    [TaskCategory.ADMIN]: 0,
    [TaskCategory.REVIEW]: 0,
    [TaskCategory.OTHER]: 0,
  };

  let taskTimeMap: Record<string, number> = {};
  
  completedSessions.forEach(session => {
    session.tasks.forEach(task => {
      tasksByCategory[task.category]++;
      taskTimeMap[task.title] = (taskTimeMap[task.title] || 0) + task.timeSpent;
    });
  });

  const taskEntries = Object.entries(taskTimeMap);
  const mostTimeSpentTask = taskEntries.length > 0 
    ? taskEntries.reduce((a, b) => taskTimeMap[a[0]] > taskTimeMap[b[0]] ? a : b)[0]
    : 'No tasks yet';

  const averageSessionLength = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;
  const productivityScore = Math.min(100, Math.round((totalSessions * 20) + (totalHours * 5)));

  return {
    totalSessions,
    totalHours,
    averageSessionLength,
    tasksByCategory,
    mostTimeSpentTask,
    productivityScore
  };
};

export const getTopTasks = (sessions: WorkSession[], limit = 5): Array<{task: string, time: number}> => {
  const taskTimeMap: Record<string, number> = {};
  
  sessions.forEach(session => {
    session.tasks.forEach(task => {
      taskTimeMap[task.title] = (taskTimeMap[task.title] || 0) + task.timeSpent;
    });
  });

  return Object.entries(taskTimeMap)
    .map(([task, time]) => ({ task, time }))
    .sort((a, b) => b.time - a.time)
    .slice(0, limit);
};