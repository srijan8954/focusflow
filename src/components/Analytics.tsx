import React from 'react';
import { BarChart3, TrendingUp, Clock, Target, Award, Download, PieChart } from 'lucide-react';
import { PieChart as RechartsPieChart, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { WorkSession } from '../types';
import { calculateSessionStats, getTopTasks } from '../utils/analyticsUtils';
import { formatTime } from '../utils/timeUtils';

interface AnalyticsProps {
  sessions: WorkSession[];
  onExport: () => void;
}

const Analytics: React.FC<AnalyticsProps> = ({ sessions, onExport }) => {
  const stats = calculateSessionStats(sessions);
  const topTasks = getTopTasks(sessions);

  // Prepare data for pie charts
  const categoryData = Object.entries(stats.tasksByCategory)
    .filter(([_, count]) => count > 0)
    .map(([category, count]) => ({
      name: category,
      value: count,
      timeSpent: sessions
        .flatMap(s => s.tasks)
        .filter(t => t.category === category)
        .reduce((sum, t) => sum + t.timeSpent, 0)
    }));

  const timeDistributionData = topTasks.map(item => ({
    name: item.task.length > 20 ? item.task.substring(0, 20) + '...' : item.task,
    fullName: item.task,
    value: item.time
  }));

  // Prepare data for bar chart (daily productivity)
  const dailyProductivity = sessions
    .filter(s => !s.isActive)
    .reduce((acc, session) => {
      const date = session.createdAt.toDateString();
      if (!acc[date]) {
        acc[date] = { date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), time: 0, sessions: 0 };
      }
      acc[date].time += session.duration;
      acc[date].sessions += 1;
      return acc;
    }, {} as Record<string, { date: string; time: number; sessions: number }>);

  const dailyData = Object.values(dailyProductivity)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7); // Last 7 days

  const categoryColors = {
    Development: 'bg-blue-500',
    Design: 'bg-purple-500',
    Meetings: 'bg-green-500',
    Planning: 'bg-yellow-500',
    Research: 'bg-indigo-500',
    Admin: 'bg-red-500',
    Review: 'bg-pink-500',
    Other: 'bg-gray-500'
  };

  const CHART_COLORS = [
    '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', 
    '#6366F1', '#EF4444', '#EC4899', '#6B7280'
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800">{data.fullName || data.name}</p>
          <p className="text-blue-600">
            Time: <span className="font-bold">{formatTime(data.value)}</span>
          </p>
          {data.timeSpent !== undefined && (
            <p className="text-green-600">
              Tasks: <span className="font-bold">{payload[0].value}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Analytics Overview</h3>
          <button
            onClick={onExport}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalHours}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalSessions}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Avg Session</p>
                <p className="text-2xl font-bold text-gray-800">{formatTime(stats.averageSessionLength)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Award className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Productivity</p>
                <p className="text-2xl font-bold text-gray-800">{stats.productivityScore}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Time Distribution Pie Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center mb-4">
            <PieChart className="w-6 h-6 text-blue-600 mr-2" />
            <h4 className="text-lg font-bold text-gray-800">Time Distribution by Task</h4>
          </div>
          {timeDistributionData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={timeDistributionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {timeDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No task data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Category Distribution Pie Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Target className="w-6 h-6 text-purple-600 mr-2" />
            <h4 className="text-lg font-bold text-gray-800">Tasks by Category</h4>
          </div>
          {categoryData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                            <p className="font-medium text-gray-800">{data.name}</p>
                            <p className="text-blue-600">Tasks: <span className="font-bold">{data.value}</span></p>
                            <p className="text-green-600">Time: <span className="font-bold">{formatTime(data.timeSpent)}</span></p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No category data available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Daily Productivity Bar Chart */}
      {dailyData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center mb-4">
            <BarChart3 className="w-6 h-6 text-green-600 mr-2" />
            <h4 className="text-lg font-bold text-gray-800">Daily Productivity (Last 7 Days)</h4>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                          <p className="font-medium text-gray-800">{label}</p>
                          <p className="text-blue-600">Time: <span className="font-bold">{formatTime(payload[0].value as number)}</span></p>
                          <p className="text-green-600">Sessions: <span className="font-bold">{payload[0].payload.sessions}</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="time" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h4 className="text-lg font-bold text-gray-800 mb-4">Top Tasks by Time</h4>
          <div className="space-y-3">
            {topTasks.map((item, index) => (
              <div key={item.task} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-800">{item.task}</span>
                </div>
                <span className="text-blue-600 font-bold">{formatTime(item.time)}</span>
              </div>
            ))}
          </div>
          {topTasks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No task data available yet</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h4 className="text-lg font-bold text-gray-800 mb-4">Tasks by Category</h4>
          <div className="space-y-3">
            {categoryData.map(({ name, value, timeSpent }) => (
              <div key={name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${categoryColors[name as keyof typeof categoryColors]}`}></div>
                  <span className="text-gray-700">{name}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-800">{value} tasks</div>
                  <div className="text-sm text-blue-600">{formatTime(timeSpent)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {stats.mostTimeSpentTask !== 'No tasks yet' && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-amber-600 mr-3" />
            <div>
              <h4 className="text-lg font-bold text-gray-800">Most Time Spent</h4>
              <p className="text-gray-600">
                You spend the most time on <span className="font-semibold text-amber-700">"{stats.mostTimeSpentTask}"</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Consider if this task could be delegated or optimized for better efficiency.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
