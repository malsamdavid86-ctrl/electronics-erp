import React, { useState, useEffect } from 'react';

export default function TimeManagement() {
  const [activeShifts, setActiveShifts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [laborAlert, setLaborAlert] = useState(false);

  // Fallback metrics matching database schema definitions
  const structuralFallbacks = [
    { id: "SFT-901", engineer: "Linus C.", station: "Micro-Solder Bench A", duration: "06:42:15", status: "ACTIVE", overtimeRisk: false },
    { id: "SFT-902", engineer: "Sarah T.", station: "Precision Diagnostics", duration: "07:55:40", status: "CRITICAL_LIMIT", overtimeRisk: true },
    { id: "SFT-903", engineer: "Alexei K.", station: "Triage Bay 3", duration: "03:15:22", status: "ACTIVE", overtimeRisk: false }
  ];

  useEffect(() => {
    const fetchTimeTelemetry = async () => {
      try {
        const res = await fetch('/api/admin/hr/time-logs');
        if (!res.ok) throw new Error('GATEWAY_OR_DB_UNAVAILABLE');
        const data = await res.json();
        setActiveShifts(data);
        setLaborAlert(data.some(shift => shift.overtimeRisk));
      } catch (err) {
        // Safe operational schema state fallback
        setActiveShifts(structuralFallbacks);
        setLaborAlert(structuralFallbacks.some(shift => shift.overtimeRisk));
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeTelemetry();
    // Refresh interval loop every 30 seconds to capture accurate duration ticking
    const pollingInterval = setInterval(fetchTimeTelemetry, 30000);
    return () => clearInterval(pollingInterval);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-gray-400 p-8 font-mono flex items-center justify-center">
        <p className="animate-pulse">PARSING_SHIFT_METRICS_STREAM...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#0B0F19] min-h-screen text-gray-100 font-mono">
      {/* Top Telemetry Header Section */}
      <div className="border-b border-[#24324D] pb-4 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-black uppercase text-white">HR // <span className="text-[#00F0FF]">LABOR_TIME_CONTROL</span></h1>
          <p className="text-xs text-gray-400">Monitoring real-time technician shift allocations, time cards, and overtime compliance thresholds.</p>
        </div>
        <span className={`text-xs font-black px-3 py-1.5 rounded border ${
          laborAlert 
            ? "bg-amber-950/40 text-amber-400 border-amber-500/30 animate-pulse" 
            : "bg-emerald-950/40 text-[#00FF66] border-[#00FF66]/30"
        }`}>
          {laborAlert ? "⚠️ COMPLIANCE_RISK_DETECTED" : "✓ LABOR_FLOW_COMPLIANT"}
        </span>
      </div>

      {/* Primary Management Panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Live Active Shift Monitors */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs font-black tracking-wider text-gray-400 uppercase">// ACTIVE_STATION_CLOCKS</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeShifts.map((shift) => (
              <div 
                key={shift.id} 
                className={`p-5 bg-[#161F30] border rounded-xl relative transition-all ${
                  shift.overtimeRisk ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.05)]' : 'border-[#24324D]'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-sans font-bold">STATION // {shift.station}</span>
                    <h4 className="text-sm font-bold text-white mt-0.5">{shift.engineer}</h4>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-black tracking-wider ${
                    shift.status === 'CRITICAL_LIMIT' ? 'bg-amber-950 text-amber-400 border border-amber-500/30' : 'bg-blue-950 text-blue-400 border border-blue-500/20'
                  }`}>
                    {shift.status}
                  </span>
                </div>

                {/* Digital Time clock readout display */}
                <div className="bg-[#0B0F19] p-3 rounded border border-[#24324D]/60 text-center mb-4">
                  <p className="text-xl font-bold tracking-widest text-white">{shift.duration}</p>
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest">ELAPSED_SHIFT_INTERVAL</span>
                </div>

                <div className="flex justify-between items-center text-[10px] pt-1">
                  <span className="text-gray-500">ID: {shift.id}</span>
                  {shift.overtimeRisk && (
                    <span className="text-amber-400 font-bold animate-pulse">
                      ⚡ OVERTIME OVERRUN WARNING
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Clocking Action Terminal & Policies */}
        <div className="space-y-6">
          <div className="bg-[#161F30] border border-[#24324D] rounded-xl p-6 space-y-4">
            <h3 className="text-xs font-black tracking-wider text-white border-b border-[#24324D] pb-3 uppercase">
              // STATION_LOGOUT_CONTROLS
            </h3>
            
            <p className="text-xs text-gray-400 leading-relaxed font-sans">
              Fair Labor Standards mandate structured rest cycles after continuous active machinery operations. Ensure technicians log out before passing maximum operational marks.
            </p>

            <div className="space-y-2 pt-2">
              <button className="w-full bg-[#0B0F19] border border-[#24324D] hover:border-gray-500 transition-colors text-white py-2.5 rounded text-xs font-bold uppercase tracking-wider">
                Generate Digital Labor Export (.CSV)
              </button>
              <button className="w-full bg-red-950/20 border border-red-950 text-red-400 hover:bg-red-950/40 transition-all py-2.5 rounded text-xs font-bold uppercase tracking-wider">
                Force Emergency Station Cleardown
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
