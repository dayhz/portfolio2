import React, { useState, useEffect } from 'react';
import AuthService from '@/services/AuthService';

interface ApiRequest {
  url: string;
  method: string;
  hasToken: boolean;
  timestamp: Date;
}

export const ApiDebugger: React.FC = () => {
  const [requests, setRequests] = useState<ApiRequest[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const token = AuthService.getToken();

  // Intercepter les requêtes axios
  useEffect(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async function(input, init) {
      const url = typeof input === 'string' ? input : input.url;
      const method = init?.method || (typeof input !== 'string' && input.method) || 'GET';
      
      // Ajouter la requête à la liste
      setRequests(prev => [
        {
          url,
          method,
          hasToken: init?.headers && 
            (init.headers as any)['Authorization'] !== undefined,
          timestamp: new Date()
        },
        ...prev.slice(0, 9) // Garder seulement les 10 dernières requêtes
      ]);
      
      return originalFetch.apply(this, arguments as any);
    };
    
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  if (!isExpanded) {
    return (
      <div 
        className="fixed bottom-4 left-4 bg-gray-800 text-white p-2 rounded-lg shadow-lg cursor-pointer"
        onClick={() => setIsExpanded(true)}
      >
        🔍 API ({requests.length})
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-md text-xs z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">API Debug Info</h3>
        <button 
          className="text-gray-400 hover:text-white"
          onClick={() => setIsExpanded(false)}
        >
          ✕
        </button>
      </div>
      
      <div className="mb-2">
        <strong>Token:</strong> {token ? `${token.substring(0, 15)}...` : 'None'}
      </div>
      
      <div className="max-h-60 overflow-y-auto">
        <h4 className="font-semibold mb-1">Recent Requests:</h4>
        {requests.length === 0 ? (
          <p className="text-gray-400">No requests captured yet</p>
        ) : (
          <ul className="space-y-2">
            {requests.map((req, index) => (
              <li key={index} className="border-t border-gray-700 pt-1">
                <div className="flex justify-between">
                  <span className={req.hasToken ? "text-green-400" : "text-red-400"}>
                    {req.method}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {req.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="truncate">{req.url}</div>
                <div className="text-xs text-gray-400">
                  Token: {req.hasToken ? "✓" : "✗"}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};