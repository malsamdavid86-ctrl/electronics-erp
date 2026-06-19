import React, { useState } from 'react';

export default function EmployeeRecovery() {
  const [recoveryType, setRecoveryType] = useState('BADGE_ID'); // 'BADGE_ID' or 'PASSWORD'
  const [formData, setFormData] = useState({ corporateEmail: '', nationalIdStub: '', badgeId: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [systemMessage, setSystemMessage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRecoveryRequest = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setSystemMessage(null);

    try {
      const response = await fetch('/api/auth/employee/recovery-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: recoveryType, ...formData })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "VERIFICATION_FAILED_IDENTITY_UNRESOLVED");
      }

      setSystemMessage({
        type: 'SUCCESS',
        text: "✓ REQUEST_LOGGED: An encrypted reset credential packet has been routed to your verified supervisor."
      });
      
      // Flush entry data upon successful request tracking submission
      setFormData({ corporateEmail: '', nationalIdStub: '', badgeId: '' });

    } catch (err) {
      setSystemMessage({
        type: 'ERROR',
        text: `❌ RECOVERY_REJECTED // ${err.message === 'Failed to fetch' ? 'NETWORK_GATEWAY_TIMEOUT' : err.message}`
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center p-6 font-mono text-gray-100">
      <div className="w-full max-w-md bg-[#111723] border border-[#24324D] rounded-xl p-8 shadow-2xl relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-1 bg-[#FF5E00]" />

        <div className="text-center mb-6">
          <h2 className="text-xl font-black tracking-widest text-white uppercase">
            SECURE // <span className="text-[#FF5E00]">ACCOUNT_RECOVERY</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
            Identity Verification Portal
          </p>
        </div>

        {/* Dynamic Warning and Success System Banner Outputs */}
        {systemMessage && (
          <div className={`mb-6 p-3 border rounded text-xs text-center ${
            systemMessage.type === 'SUCCESS' 
              ? 'bg-emerald-950/40 border-emerald-500/30 text-[#00FF66]' 
              : 'bg-red-950/40 border-red-500/30 text-red-400'
          }`}>
            {systemMessage.text}
          </div>
        )}

        {/* Operational Scope Strategy Toggler Buttons */}
        <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-[#0B0F19] border border-[#24324D] rounded">
          <button
            type="button"
            onClick={() => { setRecoveryType('BADGE_ID'); setSystemMessage(null); }}
            className={`py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all ${
              recoveryType === 'BADGE_ID' ? 'bg-[#161F30] text-[#00F0FF]' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Forgot Badge ID
          </button>
          <button
            type="button"
            onClick={() => { setRecoveryType('PASSWORD'); setSystemMessage(null); }}
            className={`py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all ${
              recoveryType === 'PASSWORD' ? 'bg-[#161F30] text-[#00F0FF]' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Forgot Access PIN
          </button>
        </div>

        <form onSubmit={handleRecoveryRequest} className="space-y-4">
          <div>
            <label className="block text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2">
              Verified Corporate Email
            </label>
            <input
              type="email"
              name="corporateEmail"
              required
              value={formData.corporateEmail}
              onChange={handleInputChange}
              disabled={isProcessing}
              className="w-full bg-[#0B0F19] text-white border border-[#24324D] rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#00F0FF] disabled:opacity-50 font-sans"
              placeholder="vance.e@enterprise.com"
            />
          </div>

          <div>
            <label className="block text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2">
              Last 4 Digits of Government Issued ID
            </label>
            <input
              type="text"
              name="nationalIdStub"
              required
              maxLength={4}
              value={formData.nationalIdStub}
              onChange={handleInputChange}
              disabled={isProcessing}
              className="w-full bg-[#0B0F19] text-white border border-[#24324D] rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#00F0FF] disabled:opacity-50 font-sans tracking-widest"
              placeholder="0000"
            />
          </div>

          {recoveryType === 'PASSWORD' && (
            <div className="animate-fadeIn">
              <label className="block text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2">
                Your Assigned Badge ID
              </label>
              <input
                type="text"
                name="badgeId"
                required={recoveryType === 'PASSWORD'}
                value={formData.badgeId}
                onChange={handleInputChange}
                disabled={isProcessing}
                className="w-full bg-[#0B0F19] text-white border border-[#24324D] rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#00F0FF] disabled:opacity-50 font-sans"
                placeholder="EMP-XXXX"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-[#161F30] hover:bg-[#FF5E00] hover:text-black border border-[#24324D] text-[#FF5E00] font-bold py-3 rounded text-xs uppercase tracking-widest transition-all disabled:opacity-50"
          >
            {isProcessing ? "DISPATCHING_IDENTITY_CHALLENGE..." : "SUBMIT_RECOVERY_TICKET"}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-[#24324D]/60 pt-4 flex justify-between text-[10px]">
          <a href="/login/employee" className="text-gray-500 hover:text-[#00F0FF] transition-colors">◄ Return to Login</a>
          <span className="text-gray-600">INCIDENT_RESPONSE_MODE</span>
        </div>
      </div>
    </div>
  );
}
