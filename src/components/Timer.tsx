import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Clock, StopCircle } from 'lucide-react';
import { formatDuration } from '../utils/timeUtils';

interface TimerProps {
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  elapsedTime: number;
  hasActiveSession: boolean;
}

const Timer: React.FC<TimerProps> = ({ isRunning, onStart, onPause, onStop, elapsedTime, hasActiveSession }) => {
  const [displayTime, setDisplayTime] = useState(elapsedTime);

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setDisplayTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setDisplayTime(elapsedTime);
    }
  }, [isRunning, elapsedTime]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
      <div className="flex items-center justify-center mb-6">
        <Clock className="w-8 h-8 text-blue-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-800">Work Session</h2>
      </div>
      
      <div className="mb-8">
        <div className="text-6xl font-mono font-bold text-gray-800 mb-2">
          {formatDuration(displayTime)}
        </div>
        <div className="text-sm text-gray-500">
          {isRunning ? 'Session in progress' : hasActiveSession ? 'Session paused' : 'Ready to start'}
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        {!isRunning ? (
          <button
            onClick={onStart}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
          >
            <Play className="w-5 h-5" />
            <span>{hasActiveSession ? 'Resume Session' : 'Start Session'}</span>
          </button>
        ) : (
          <>
            <button
              onClick={onPause}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
            >
              <Pause className="w-5 h-5" />
              <span>Pause</span>
            </button>
          </>
        )}
        
        {hasActiveSession && (
          <button
            onClick={onStop}
            className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
          >
            <StopCircle className="w-5 h-5" />
            <span>End Session</span>
          </button>
        )}
      </div>
      
      {!hasActiveSession && displayTime > 0 && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-center text-green-700">
            <StopCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">Session completed! Ready to start a new one.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timer;