'use client';

import React, { useState } from 'react';

export default function LayoutDiagnosticPage() {
  const [gridDensity, setGridDensity] = useState('STANDARD');

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 font-mono p-8">
      {/* Top Telemetry Header Panel */}
      <div className="max-w-4xl mx-auto border-b border-[#24324D] pb-4 mb-8">
        <h1 className="text-xl font-black uppercase text-white">SYS // <span className="text-[#00F0FF]">LAYOUT_DIAGNOSTICS</span></h1>
        <p className="text-xs text-gray-400 mt-1">Reviewing viewport density metrics and theme compliance variables.</p>
      </div>

      {/* Control Interactive Matrix */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111723] border border-[#24324D] rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-black text-white uppercase">// VIEWPORT_CONTROLS</h3>
          <div className="space-y-2">
            {['COMPACT', 'STANDARD', 'REDUNDANT'].map((tier) => (
              <button
                key={tier}
                onClick={() => setGridDensity(tier)}
                className={`w-full text-left text-xs font-bold px-3 py-2 border rounded uppercase transition-all ${
                  gridDensity === tier 
                    ? 'bg-[#161F30] text-[#00F0FF] border-[#00F0FF]' 
                    : 'bg-[#0B0F19] text-gray-500 border-[#24324D] hover:text-gray-300'
                }`}
              >
                {tier} Mode
              </button>
            ))}
          </div>
        </div>

        {/* Layout Output Monitor Sandbox */}
        <div className="md:col-span-2 bg-[#111723] border border-[#24324D] rounded-xl p-5 flex flex-col justify-between min-h-[220px]">
          <div>
            <span className="text-[9px] text-gray-500 block uppercase font-bold mb-2">LIVE_RENDER_CONTAINER</span>
            <div className={`grid gap-3 transition-all ${
              gridDensity === 'COMPACT' ? 'grid-cols-4 text-[10px]' : gridDensity === 'STANDARD' ? 'grid-cols-2 text-xs' : 'grid-cols-1 text-sm'
            }`}>
              <div className="p-3 bg-[#161F30] border border-[#24324D] rounded text-center font-bold">NODE_01</div>
              <div className="p-3 bg-[#161F30] border border-[#24324D] rounded text-center font-bold">NODE_02</div>
              <div className="p-3 bg-[#161F30] border border-[#24324D] rounded text-center font-bold">NODE_03</div>
              <div className="p-3 bg-[#161F30] border border-[#24324D] rounded text-center font-bold">NODE_04</div>
            </div>
          </div>
          <div className="border-t border-[#24324D]/60 pt-3 text-[10px] text-gray-500 text-right">
            Active Layout Density Spec Matrix: <span className="text-[#00F0FF] font-bold">{gridDensity}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
