import React, { useState } from 'react';

export default function EmployeeLogin() {
  const [authData, setAuthData] = useState({ badgeId: '', pinCode: '', stationNode: 'FIELD_TRIAGE' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorStatus, setErrorStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAuthData(prev => ({ ...prev, [name]: value }));
  };

  const handlePortalAccess = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorStatus(null);

    try {
      // Connects directly to standard employee gate authorization pipelines
      const response = await fetch('/api/auth/employee/verifyBadge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authData)
      });

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.message || "BADGE_ID_OR_PIN_UNRECOGNIZED");
      }

      const sessionPayload = await response.json();
      
      // Save worker context metadata locally for internal dashboard clocks
      localStorage.setItem('emp_session_token', sessionPayload.token);
      localStorage.setItem('emp_assigned_station', authData.stationNode);
      
      // Route the field employee directly to their active scheduling/work-schedule interface
      window.location.href = '/user/work-schedule';

    } catch (err) {
      setAuthData(prev => ({ ...prev, pinCode: '' })); // Flush sensitive pin entry on exception
      setErrorStatus(err.message === 'Failed to fetch' ? 'NETWORK_GATEWAY_TIMEOUT' : err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center p-6 font-mono text-gray-100">
      <div className="w-full max-w-md bg-[#111723] border border-[#24324D] rounded-xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Visual structural accent header line matching frontend brand specs */}
        <div className="absolute top-0 left-0 w-full h-1 bg-[#00F0FF]" />

        {/* Brand/Node Identity Header */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-black tracking-widest text-white uppercase">
            STAFF // <span className="text-[#00F0FF]">PORTAL_SIGN_IN</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
            Scan Badge or Input Terminal Credentials
          </p>
        </div>

        {/* Dynamic Warning Layer */}
        {errorStatus && (
          <div className="mb-6 p-3 bg-red-950/40 border border-red-500/30 rounded text-red-400 text-xs text-center">
            ❌ SYSTEM_REJECTION // {errorStatus}
          </div>
        )}

        <form onSubmit={handlePortalAccess} className="space-y-5">
          {/* Badge ID Input Field */}
          <div>
            <label className="block text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2">
              Staff Badge String (ID)
            </label>
            <input
              type="text"
              name="badgeId"
              required
              value={authData.badgeId}
              onChange={handleInputChange}
              disabled={isProcessing}
              className="w-full bg-[#0B0F19] text-white border border-[#24324D] rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#00F0FF] disabled:opacity-50 font-sans"
              placeholder="e.g., EMP-9921"
            />
          </div>

          {/* Secure Passcode Pin Matrix entry */}
          <div>
            <label className="block text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2">
              Security Access PIN
            </label>
            <input
              type="password"
              name="pinCode"
              required
              maxLength={6}
              value={authData.pinCode}
              onChange={handleInputChange}
              disabled={isProcessing}
              className="w-full bg-[#0B0F19] text-white border border-[#24324D] rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#00F0FF] disabled:opacity-50 font-sans tracking-widest"
              placeholder="••••••"
            />
          </div>

          {/* Targeted Base Station Assignment Dropdown */}
          <div>
            <label className="block text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2">
              Target Node Station Base
            </label>
            <select
              name="stationNode"
              value={authData.stationNode}
              onChange={handleInputChange}
              disabled={isProcessing}
              className="w-full bg-[#0B0F19] text-gray-300 border border-[#24324D] rounded px-4 py-2.5 text-xs focus:outline-none focus:border-[#00F0FF] disabled:opacity-50"
            >
              <option value="FIELD_TRIAGE">FIELD_TRIAGE // BAY_03</option>
              <option value="SOLDER_BENCH_A">SOLDER_BENCH_A // LAB_LEVEL_2</option>
              <option value="DIAGNOSTICS_BAY">DIAGNOSTICS_BAY // CORE_BENCH</option>
              <option value="RETAIL_FLOOR">RETAIL_FLOOR // SHOWROOM</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-[#161F30] hover:bg-[#00F0FF] hover:text-black border border-[#24324D] text-[#00F0FF] font-bold py-3 rounded text-xs uppercase tracking-widest transition-all disabled:opacity-50"
          >
            {isProcessing ? "VALIDATING_BADGE_STREAM..." : "INITIALIZE_WORK_STATION"}
          </button>
        </form>

        {/* Device Compliance Audit Hook Footer */}
        <div className="mt-8 text-center border-t border-[#24324D]/60 pt-4">
          <span className="text-[9px] text-gray-600 block">
            TERMINAL COMPLIANCE PROTOCOL // ACCESS LOGGED NATIVELY
          </span>
        </div>
      </div>
    </div>
  );
}
