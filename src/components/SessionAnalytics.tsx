import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, Target, TrendingUp, Filter, ChevronDown, ChevronRight } from 'lucide-react';
import { WorkSession, Task } from '../types';
import { formatTime, getTimeAgo } from '../utils/timeUtils';

interface SessionAnalyticsProps {
  sessions: WorkSession[];
}

interface DayData {
  date: string;
  sessions: WorkSession[];
  totalTime: number;
  totalTasks: number;
  completedTasks: number;
  tasksByCategory: Record<string, number>;
}

const SessionAnalytics: React.FC<SessionAnalyticsProps> = ({ sessions }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Group sessions by date
  const sessionsByDate = sessions
    .filter(s => !s.isActive)
    .reduce((acc, session) => {
      const dateKey = session.createdAt.toDateString();
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(session);
      return acc;
    }, {} as Record<string, WorkSession[]>);

  // Calculate daily data
  const dailyData: DayData[] = Object.entries(sessionsByDate)
    .map(([date, daySessions]) => {
      const totalTime = daySessions.reduce((sum, s) => sum + s.duration, 0);
      const allTasks = daySessions.flatMap(s => s.tasks);
      const tasksByCategory = allTasks.reduce((acc, task) => {
        acc[task.category] = (acc[task.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        date,
        sessions: daySessions,
        totalTime,
        totalTasks: allTasks.length,
        completedTasks: allTasks.filter(t => t.completed).length,
        tasksByCategory
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const toggleSessionExpansion = (sessionId: string) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedSessions(newExpanded);
  };

  const getTasksByCategory = (tasks: Task[]) => {
    return tasks.reduce((acc, task) => {
      if (!acc[task.category]) {
        acc[task.category] = [];
      }
      acc[task.category].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
  };

  const filteredDailyData = dailyData.filter(day => {
    if (filterCategory === 'all') return true;
    return day.sessions.some(session => 
      session.tasks.some(task => task.category === filterCategory)
    );
  });

  const allCategories = Array.from(
    new Set(sessions.flatMap(s => s.tasks.map(t => t.category)))
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Session Analytics</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Categories</option>
                {allCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Daily Overview */}
        <div className="space-y-4">
          {filteredDailyData.map((dayData) => (
            <div key={dayData.date} className="border border-gray-200 rounded-lg overflow-hidden">
              <div 
                className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                onClick={() => setSelectedDate(selectedDate === dayData.date ? null : dayData.date)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {selectedDate === dayData.date ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-800">
                        {new Date(dayData.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </h4>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-1 text-blue-600">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">{formatTime(dayData.totalTime)}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-green-600">
                      <Target className="w-4 h-4" />
                      <span className="font-medium">{dayData.sessions.length} sessions</span>
                    </div>
                    <div className="flex items-center space-x-1 text-purple-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-medium">{dayData.completedTasks}/{dayData.totalTasks} tasks</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedDate === dayData.date && (
                <div className="p-4 space-y-4">
                  {/* Daily Task Summary by Category */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-gray-800 mb-3">Daily Task Summary</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(dayData.tasksByCategory).map(([category, count]) => (
                        <div key={category} className="bg-white p-3 rounded-lg">
                          <div className="text-sm text-gray-600">{category}</div>
                          <div className="text-lg font-bold text-gray-800">{count}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Individual Sessions */}
                  <div className="space-y-3">
                    <h5 className="font-semibold text-gray-800">Sessions</h5>
                    {dayData.sessions.map((session) => (
                      <div key={session.id} className="border border-gray-200 rounded-lg">
                        <div 
                          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                          onClick={() => toggleSessionExpansion(session.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {expandedSessions.has(session.id) ? (
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-500" />
                              )}
                              <div>
                                <div className="font-medium text-gray-800">{session.title}</div>
                                <div className="text-sm text-gray-500">
                                  {getTimeAgo(session.createdAt)} • {formatTime(session.duration)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="text-blue-600 font-medium">
                                {session.tasks.length} tasks
                              </span>
                              <span className="text-green-600 font-medium">
                                {session.tasks.filter(t => t.completed).length} completed
                              </span>
                            </div>
                          </div>
                        </div>

                        {expandedSessions.has(session.id) && (
                          <div className="px-4 pb-4">
                            <div className="pl-7 space-y-3">
                              {Object.entries(getTasksByCategory(session.tasks)).map(([category, tasks]) => (
                                <div key={category} className="space-y-2">
                                  <h6 className="font-medium text-gray-700 text-sm bg-gray-100 px-2 py-1 rounded">
                                    {category} ({tasks.length})
                                  </h6>
                                  <div className="space-y-1 pl-3">
                                    {tasks.map((task) => (
                                      <div 
                                        key={task.id} 
                                        className={`flex items-center justify-between p-2 rounded text-sm ${
                                          task.completed 
                                            ? 'bg-green-50 text-green-800' 
                                            : 'bg-gray-50 text-gray-700'
                                        }`}
                                      >
                                        <div className="flex items-center space-x-2">
                                          <CheckCircle 
                                            className={`w-4 h-4 ${
                                              task.completed ? 'text-green-600' : 'text-gray-400'
                                            }`} 
                                          />
                                          <span className={task.completed ? 'line-through' : ''}>
                                            {task.title}
                                          </span>
                                        </div>
                                        <span className="font-medium">
                                          {formatTime(task.timeSpent)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredDailyData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No session data available yet. Complete some sessions to see analytics!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionAnalytics;