import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthService from '@/services/AuthService';

export const AuthDebugger: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const token = AuthService.getToken();

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-sm text-xs">
      <h3 className="font-bold mb-2">Auth Debug Info</h3>
      <div className="space-y-1">
        <div>
          <strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>User:</strong> {user ? user.email : 'None'}
        </div>
        <div>
          <strong>Token:</strong> {token ? `${token.substring(0, 20)}...` : 'None'}
        </div>
        <div>
          <strong>Token Type:</strong> {token === 'dummy-token-for-testing' ? 'Test Token' : 'Real Token'}
        </div>
        <div>
          <strong>LocalStorage Token:</strong> {localStorage.getItem('auth-token') ? 'Present' : 'Missing'}
        </div>
      </div>
    </div>
  );
};