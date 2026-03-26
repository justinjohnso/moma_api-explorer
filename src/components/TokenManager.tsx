import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { getToken, setToken as saveToken, clearToken as removeToken } from '../lib/storage';
import { maskToken } from '../lib/token-utils';

export default function TokenManager() {
  const [token, setTokenState] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const stored = getToken();
    if (stored) {
      setTokenState(stored);
      api.setToken(stored);
    } else {
      setIsOpen(true);
    }
  }, []);

  const handleSave = () => {
    if (token.trim()) {
      saveToken(token);
      api.setToken(token);
      window.dispatchEvent(new CustomEvent('moma-token-updated'));
      setIsOpen(false);
      setTestResult(null);
      window.dispatchEvent(new CustomEvent('moma-toast', { detail: { message: 'Token saved' } }));
    }
  };

  const handleClear = () => {
    setTokenState('');
    removeToken();
    api.clearToken();
    window.dispatchEvent(new CustomEvent('moma-token-updated'));
    setTestResult(null);
    window.dispatchEvent(new CustomEvent('moma-toast', { detail: { message: 'Token cleared' } }));
  };

  const handleTest = async () => {
    if (!token.trim()) {
      setTestResult({ success: false, message: 'Please enter a token first' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      api.setToken(token);
      const response = await api.getRandomObject();
      
      if (response.ok) {
        setTestResult({ success: true, message: '✓ Connection successful!' });
      } else {
        setTestResult({ 
          success: false, 
          message: `✗ ${response.status}: ${response.statusText}` 
        });
      }
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: `✗ Network error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    } finally {
      setTesting(false);
    }
  };

  const hasToken = token.length > 0;
  const maskedToken = maskToken(token);

  return (
    <>
      {/* Status Indicator in Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${hasToken ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {hasToken ? 'Token Set' : 'No Token'}
          </span>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="px-3 py-1.5 text-sm font-medium border border-black hover:bg-black hover:text-white transition-colors"
        >
          {hasToken ? 'CHANGE TOKEN' : 'SET TOKEN'}
        </button>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-2xl w-full border-2 border-black p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-medium mb-2">API TOKEN</h2>
                <p className="text-gray-600">
                  Enter your MoMA API authentication token. Tokens are valid for 24 hours.
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-2xl hover:text-red-600 transition-colors"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="token-input" className="block text-sm font-medium mb-2">
                  TOKEN
                </label>
                <div className="relative">
                  <input
                    id="token-input"
                    type={showToken ? 'text' : 'password'}
                    value={token}
                    onChange={(e) => setTokenState(e.target.value)}
                    placeholder="Enter your API token..."
                    className="w-full px-4 py-3 border border-black focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-black"
                  >
                    {showToken ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>

              {testResult && (
                <div className={`p-3 border ${testResult.success ? 'border-green-500 bg-green-50' : 'border-red-600 bg-red-50'}`}>
                  <p className={`text-sm ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
                    {testResult.message}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleTest}
                  disabled={testing || !token.trim()}
                  className="px-6 py-3 border border-black hover:bg-[#F5F5F5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {testing ? 'TESTING...' : 'TEST CONNECTION'}
                </button>
                <button
                  onClick={handleSave}
                  disabled={!token.trim()}
                  className="flex-1 px-6 py-3 bg-black text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  SAVE TOKEN
                </button>
                {hasToken && (
                  <button
                    onClick={handleClear}
                    className="px-6 py-3 border border-[#E4002B] text-[#E4002B] hover:bg-[#FFF1F4] transition-colors"
                  >
                    CLEAR
                  </button>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Your token is kept in this tab session (sessionStorage + in-memory): it survives refresh,
                  but is cleared when the tab/window closes. It is sent only to MoMA's API.
                  {hasToken && (
                    <span className="block mt-1">
                      Current token: <code className="font-mono">{maskedToken}</code>
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
