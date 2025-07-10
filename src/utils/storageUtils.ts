import { WorkSession } from '../types';

const STORAGE_KEY = 'focusflow-sessions';

export const saveSessions = (sessions: WorkSession[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('Failed to save sessions:', error);
  }
};

export const loadSessions = (): WorkSession[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const sessions = JSON.parse(stored);
    return sessions.map((session: any) => ({
      ...session,
      startTime: new Date(session.startTime),
      endTime: session.endTime ? new Date(session.endTime) : null,
      createdAt: new Date(session.createdAt),
      tasks: session.tasks.map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt)
      }))
    }));
  } catch (error) {
    console.error('Failed to load sessions:', error);
    return [];
  }
};

export const exportSessions = (sessions: WorkSession[]): void => {
  const dataStr = JSON.stringify(sessions, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `focusflow-sessions-${new Date().toISOString().split('T')[0]}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};