import React from 'react';

const TonerLevelBar = ({ percentage, status, color }) => {
  const getBarColor = (status, color) => {
    // Status-based colors take priority
    switch (status) {
      case 'critical':
        return 'bg-red-500';
      case 'low':
        return 'bg-orange-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'ok':
        // Use color-specific styling for OK status
        switch (color) {
          case 'black':
            return 'bg-gray-800';
          case 'cyan':
            return 'bg-cyan-500';
          case 'magenta':
            return 'bg-pink-500';
          case 'yellow':
            return 'bg-yellow-400';
          default:
            return 'bg-green-500';
        }
      default:
        return 'bg-gray-400';
    }
  };

  const getBackgroundColor = () => {
    switch (status) {
      case 'critical':
        return 'bg-red-100';
      case 'low':
        return 'bg-orange-100';
      case 'warning':
        return 'bg-yellow-100';
      default:
        return 'bg-gray-200';
    }
  };

  return (
    <div className="relative">
      <div className={`w-full h-2 rounded-full ${getBackgroundColor()}`}>
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getBarColor(status, color)}`}
          style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
        />
      </div>
      
      {/* Gradient overlay for visual enhancement */}
      <div 
        className="absolute top-0 left-0 h-2 rounded-full opacity-30"
        style={{
          width: `${Math.max(0, Math.min(100, percentage))}%`,
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)'
        }}
      />
    </div>
  );
};

export default TonerLevelBar;