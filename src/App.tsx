import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Navigation from './components/Navigation';
import Timer from './components/Timer';
import TaskManager from './components/TaskManager';
import SessionHistory from './components/SessionHistory';
import Analytics from './components/Analytics';
import SessionAnalytics from './components/SessionAnalytics';
import { WorkSession, Task } from './types';
import { saveSessions, loadSessions, exportSessions } from './utils/storageUtils';

function App() {
  const [activeTab, setActiveTab] = useState('timer');
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [currentSession, setCurrentSession] = useState<WorkSession | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const loadedSessions = loadSessions();
    setSessions(loadedSessions);

    // Check if there's an active session
    const activeSession = loadedSessions.find(s => s.isActive);
    if (activeSession) {
      setCurrentSession(activeSession);
      const elapsed = Math.floor((Date.now() - activeSession.startTime.getTime()) / 1000);
      setElapsedTime(elapsed);
    }
  }, []);

  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  const handleStartSession = () => {
    if (currentSession) {
      setIsRunning(true);
      return;
    }

    const newSession: WorkSession = {
      id: uuidv4(),
      title: `Session ${new Date().toLocaleString()}`,
      startTime: new Date(),
      endTime: null,
      duration: 0,
      tasks: [],
      isActive: true,
      createdAt: new Date()
    };

    setCurrentSession(newSession);
    setSessions(prev => [...prev, newSession]);
    setElapsedTime(0);
    setIsRunning(true);
  };

  const handlePauseSession = () => {
    setIsRunning(false);
  };

  const handleStopSession = () => {
    if (!currentSession) return;

    const duration = Math.floor(elapsedTime / 60);
    const endTime = new Date();

    const updatedSession: WorkSession = {
      ...currentSession,
      endTime,
      duration,
      isActive: false
    };

    setSessions(prev => prev.map(s => s.id === currentSession.id ? updatedSession : s));
    setCurrentSession(null);
    setElapsedTime(0);
    setIsRunning(false);
  };

  const handleAddTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (!currentSession) return;

    const newTask: Task = {
      ...taskData,
      id: uuidv4(),
      createdAt: new Date()
    };

    const updatedSession = {
      ...currentSession,
      tasks: [...currentSession.tasks, newTask]
    };

    setCurrentSession(updatedSession);
    setSessions(prev => prev.map(s => s.id === currentSession.id ? updatedSession : s));
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    if (!currentSession) return;

    const updatedSession = {
      ...currentSession,
      tasks: currentSession.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
    };

    setCurrentSession(updatedSession);
    setSessions(prev => prev.map(s => s.id === currentSession.id ? updatedSession : s));
  };

  const handleDeleteTask = (taskId: string) => {
    if (!currentSession) return;

    const updatedSession = {
      ...currentSession,
      tasks: currentSession.tasks.filter(t => t.id !== taskId)
    };

    setCurrentSession(updatedSession);
    setSessions(prev => prev.map(s => s.id === currentSession.id ? updatedSession : s));
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const handleExportData = () => {
    exportSessions(sessions);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="space-y-6">
          {activeTab === 'timer' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Timer
                isRunning={isRunning}
                onStart={handleStartSession}
                onPause={handlePauseSession}
                onStop={handleStopSession}
                elapsedTime={elapsedTime}
                hasActiveSession={!!currentSession}
              />
              <TaskManager
                tasks={currentSession?.tasks || []}
                onAddTask={handleAddTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                sessionActive={!!currentSession}
              />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="max-w-4xl mx-auto">
              <SessionHistory
                sessions={sessions}
                onDeleteSession={handleDeleteSession}
              />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="max-w-6xl mx-auto">
              <Analytics
                sessions={sessions}
                onExport={handleExportData}
              />
            </div>
          )}

          {activeTab === 'session-analytics' && (
            <div className="max-w-6xl mx-auto">
              <SessionAnalytics sessions={sessions} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;