import React from 'react';
import { Clock, Calendar, CheckCircle, Trash2 } from 'lucide-react';
import { WorkSession } from '../types';
import { formatTime, getTimeAgo } from '../utils/timeUtils';

interface SessionHistoryProps {
  sessions: WorkSession[];
  onDeleteSession: (sessionId: string) => void;
}

const SessionHistory: React.FC<SessionHistoryProps> = ({ sessions, onDeleteSession }) => {
  const completedSessions = sessions.filter(s => !s.isActive);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Session History</h3>
        <span className="text-sm text-gray-500">
          {completedSessions.length} session{completedSessions.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {completedSessions.map(session => (
          <div
            key={session.id}
            className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{getTimeAgo(session.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 text-blue-600">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">{formatTime(session.duration)}</span>
                </div>
                <button
                  onClick={() => onDeleteSession(session.id)}
                  className="text-red-500 hover:text-red-700 transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mb-3">
              <h4 className="font-medium text-gray-800 mb-1">{session.title}</h4>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{session.tasks.length} task{session.tasks.length !== 1 ? 's' : ''}</span>
                <span>•</span>
                <span>{session.tasks.filter(t => t.completed).length} completed</span>
              </div>
            </div>

            {session.tasks.length > 0 && (
              <div className="space-y-2">
                {session.tasks.slice(0, 3).map(task => (
                  <div
                    key={task.id}
                    className={`text-sm p-2 rounded ${
                      task.completed ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={task.completed ? 'line-through' : ''}>{task.title}</span>
                      <span className="text-xs">{formatTime(task.timeSpent)}</span>
                    </div>
                  </div>
                ))}
                {session.tasks.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{session.tasks.length - 3} more task{session.tasks.length - 3 !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {completedSessions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No completed sessions yet. Start your first session to see history!</p>
        </div>
      )}
    </div>
  );
};

export default SessionHistory;