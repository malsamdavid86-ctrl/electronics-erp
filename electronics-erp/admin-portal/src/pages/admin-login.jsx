import React, { useState } from 'react';

export default function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [authError, setAuthError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const executeSecurityHandshake = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setAuthError(null);

    try {
      // Direct validation challenge request via the edge gateway layer
      const response = await fetch('/api/admin/auth/loginChallenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const errorLogs = await response.json();
        throw new Error(errorLogs.message || "ACCESS_DENIED_CRITERIA_MISMATCH");
      }

      const tokenPayload = await response.json();
      
      // Store the secure JSON Web Token (JWT) in local storage
      localStorage.setItem('sys_auth_token', tokenPayload.token);
      
      // Redirect authenticated personnel straight to the ticket master queue
      window.location.href = '/bench/ticket-queue';

    } catch (err) {
      // Clear security inputs and raise contextual warning layout flags
      setCredentials(prev => ({ ...prev, password: '' }));
      setAuthError(err.message === 'Failed to fetch' ? 'GATEWAY_CONNECTION_REFUSED' : err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center p-6 font-mono text-gray-100">
      <div className="w-full max-w-md bg-[#111723] border border-[#24324D] rounded-xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Subtle decorative security line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00F0FF] to-[#FF5E00]" />

        {/* Branding Terminal Indicator */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-black tracking-widest text-white uppercase">
            SYS // <span className="text-[#00F0FF]">CORE_GATEWAY</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
            Restricted Operational Console Access
          </p>
        </div>

        {/* Error Alert Display Box */}
        {authError && (
          <div className="mb-6 p-3 bg-red-950/40 border border-red-500/30 rounded text-red-400 text-xs text-center animate-pulse">
            🚨 SECURITY_ALERT // {authError}
          </div>
        )}

        {/* Authorization Submission Block */}
        <form onSubmit={executeSecurityHandshake} className="space-y-5">
          <div>
            <label className="block text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2">
              Personnel Identifier (Username)
            </label>
            <input
              type="text"
              name="username"
              required
              value={credentials.username}
              onChange={handleInputChange}
              disabled={isProcessing}
              className="w-full bg-[#0B0F19] text-white border border-[#24324D] rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#00F0FF] disabled:opacity-50 font-sans"
              placeholder="e.g., admin_vance"
            />
          </div>

          <div>
            <label className="block text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2">
              Cryptographic Key (Password)
            </label>
            <input
              type="password"
              name="password"
              required
              value={credentials.password}
              onChange={handleInputChange}
              disabled={isProcessing}
              className="w-full bg-[#0B0F19] text-white border border-[#24324D] rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#00F0FF] disabled:opacity-50 font-sans"
              placeholder="••••••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-[#161F30] hover:bg-[#00F0FF] hover:text-black border border-[#24324D] text-[#00F0FF] font-bold py-3 rounded text-xs uppercase tracking-widest transition-all disabled:opacity-50"
          >
            {isProcessing ? "INITIALIZING_HANDSHAKE..." : "REQUEST_ACCESS_TOKEN"}
          </button>
        </form>

        {/* Terminal Infrastructure Legal Footnotes */}
        <div className="mt-8 text-center border-t border-[#24324D]/60 pt-4">
          <span className="text-[9px] text-gray-600 block">
            SECURE NODE CONNECTION // IP TRACE ACTIVE
          </span>
        </div>
      </div>
    </div>
  );
}
