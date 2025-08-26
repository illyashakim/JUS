import React from 'react';
import { 
  Printer, 
  Wifi, 
  WifiOff, 
  TestTube, 
  Trash2, 
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import TonerLevelBar from './TonerLevelBar';

const PrinterCard = ({ printer, onRemove, onTest }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'running':
      case 'online':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'down':
      case 'offline':
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSupplyStatusColor = (status) => {
    switch (status) {
      case 'ok':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'low':
        return 'text-orange-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatLastUpdated = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const hasLowSupplies = Object.values(printer.toner_levels || {}).some(
    toner => toner.status === 'low' || toner.status === 'critical'
  );

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      {/* Header */}
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Printer className="h-8 w-8 text-gray-400" />
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">{printer.name}</h3>
              <p className="text-sm text-gray-500">{printer.ip}:{printer.port}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {printer.online ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            {hasLowSupplies && (
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            )}
          </div>
        </div>

        {/* Status */}
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Status</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(printer.status)}`}>
              {printer.status || 'Unknown'}
            </span>
          </div>
        </div>

        {/* Model */}
        {printer.model && (
          <div className="mt-3">
            <span className="text-sm font-medium text-gray-500">Model: </span>
            <span className="text-sm text-gray-900">{printer.model}</span>
          </div>
        )}

        {/* Uptime */}
        {printer.uptime && (
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            Uptime: {printer.uptime}
          </div>
        )}

        {/* Toner Levels */}
        {Object.keys(printer.toner_levels || {}).length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Supply Levels</h4>
            <div className="space-y-3">
              {Object.entries(printer.toner_levels).map(([color, toner]) => (
                <div key={color}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700 capitalize">{color}</span>
                    <span className={`text-sm font-medium ${getSupplyStatusColor(toner.status)}`}>
                      {toner.percentage}%
                    </span>
                  </div>
                  <TonerLevelBar 
                    percentage={toner.percentage} 
                    status={toner.status}
                    color={color}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Last Updated */}
        <div className="mt-4 text-xs text-gray-500">
          Last updated: {formatLastUpdated(printer.last_updated)}
        </div>
      </div>

      {/* Actions */}
      <div className="bg-gray-50 px-4 py-4 sm:px-6">
        <div className="flex justify-between">
          <button
            onClick={() => onTest(printer.id)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <TestTube className="h-4 w-4 mr-2" />
            Test
          </button>
          
          <button
            onClick={() => onRemove(printer.id)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrinterCard;