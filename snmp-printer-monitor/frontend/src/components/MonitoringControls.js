import React from 'react';
import { Play, Square, RefreshCw } from 'lucide-react';

const MonitoringControls = ({ isActive, onStart, onStop, onRefresh }) => {
  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Monitoring:</span>
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          <div className={`w-2 h-2 rounded-full mr-1.5 ${
            isActive ? 'bg-green-400 animate-pulse-slow' : 'bg-gray-400'
          }`} />
          {isActive ? 'Active' : 'Inactive'}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {!isActive ? (
          <button
            onClick={onStart}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Play className="h-4 w-4 mr-1" />
            Start
          </button>
        ) : (
          <button
            onClick={onStop}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <Square className="h-4 w-4 mr-1" />
            Stop
          </button>
        )}

        <button
          onClick={onRefresh}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </button>
      </div>
    </div>
  );
};

export default MonitoringControls;