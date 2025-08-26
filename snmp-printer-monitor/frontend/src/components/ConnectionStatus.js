import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';

const ConnectionStatus = ({ connected }) => {
  return (
    <div className={`mb-6 rounded-md p-4 ${connected ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {connected ? (
            <Wifi className="h-5 w-5 text-green-400" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-400" />
          )}
        </div>
        <div className="ml-3">
          <h3 className={`text-sm font-medium ${connected ? 'text-green-800' : 'text-red-800'}`}>
            {connected ? 'Connected to Server' : 'Disconnected from Server'}
          </h3>
          <div className={`mt-2 text-sm ${connected ? 'text-green-700' : 'text-red-700'}`}>
            {connected 
              ? 'Real-time updates are active. Printer status will update automatically.'
              : 'Real-time updates are not available. Please check your connection.'
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatus;