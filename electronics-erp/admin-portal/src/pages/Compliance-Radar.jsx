import React, { useState, useEffect } from 'react';

export default function ComplianceRadar() {
  const [complianceTracks, setComplianceTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalStatus, setGlobalStatus] = useState("SECURE");

  // Mock operational requirements baseline matching system constraints
  const sampleMetrics = [
    { id: "TRK-01", name: "WISE Mobile Care (Level 2)", required: 2, active: 3, role: "Micro-Solder Bench" },
    { id: "TRK-02", name: "IPC-A-610 Workmanship Standards", required: 1, active: 0, role: "Precision Solder Stations" },
    { id: "TRK-03", name: "CompTIA A+ Core Infrastructure", required: 3, active: 5, role: "General Triage Bay" },
    { id: "TRK-04", name: "iFixit Master Certification", required: 2, active: 2, role: "Modular Repairs" }
  ];

  useEffect(() => {
    const fetchComplianceMatrix = async () => {
      try {
        // Simulating data synchronization across the internal gateway network
        const res = await fetch('/api/admin/training/compliance-status-probe');
        if (!res.ok) throw new Error('OFFLINE');
      } catch (err) {
        // Safe runtime database structure fallback state 
        setComplianceTracks(sampleMetrics);
        
        // Evaluate if any structural tracks fail compliance rules
        const hasFailure = sampleMetrics.some(track => track.active < track.required);
        setGlobalStatus(hasFailure ? "CRITICAL_DEFICIT" : "SECURE");
        setIsLoading(false);
      }
    };

    fetchComplianceMatrix();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-gray-400 p-8 font-mono flex items-center justify-center">
        <p className="animate-pulse">SCANNING_STORE_CERTIFICATION_MATRICES...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#0B0F19] min-h-screen text-gray-100 font-mono">
      {/* Dynamic Status Dashboard Banner */}
      <div className="border-b border-[#24324D] pb-4 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-black uppercase text-white">OPERATE // <span className="text-[#FF5E00]">COMPLIANCE_RADAR</span></h1>
          <p className="text-xs text-gray-400">Cross-referencing active staff certification pools against store workspace authorization laws.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-black px-3 py-1.5 rounded border ${
            globalStatus === "SECURE" 
              ? "bg-emerald-950/40 text-[#00FF66] border-[#00FF66]/30" 
              : "bg-red-950/40 text-red-400 border-red-500/30 animate-pulse"
          }`}>
            STATUS: {globalStatus}
          </span>
        </div>
      </div>

      {/* Main Structural Matrix Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Real-Time Active Compliance Tracks List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs font-black tracking-wider text-gray-400 uppercase">// REGULATED_STATION_CHANNELS</h2>
          
          <div className="space-y-4">
            {complianceTracks.map((track) => {
              const isCompliant = track.active >= track.required;
              const percentMet = Math.min((track.active / track.required) * 100, 100);

              return (
                <div key={track.id} className="bg-[#161F30] border border-[#24324D] rounded-xl p-5 relative overflow-hidden">
                  {/* Status Indicator Sidebar Edge */}
                  <div className={`absolute top-0 left-0 w-1 h-full ${isCompliant ? 'bg-[#00FF66]' : 'bg-red-500'}`} />
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest">TARGET_ZONE: {track.role}</span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{track.name}</h4>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs font-mono font-bold text-gray-300">
                        {track.active} / {track.required} <span className="text-gray-500 font-sans font-normal text-[11px]">STAFF ACTIVE</span>
                      </p>
                    </div>
                  </div>

                  {/* Progress Matrix bar indicator layout */}
                  <div className="w-full bg-[#0B0F19] h-1.5 rounded-full overflow-hidden border border-[#24324D]/60">
                    <div 
                      className={`h-full transition-all duration-500 ${isCompliant ? 'bg-[#00F0FF]' : 'bg-red-500'}`}
                      style={{ width: `${percentMet}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] mt-3 font-mono">
                    <span className={isCompliant ? "text-[#00FF66] font-bold" : "text-red-400 font-bold animate-pulse"}>
                      {isCompliant ? "✓ STATION_AUTHORIZED" : "⚡ LOCKOUT_REPAIR_ROOM_DEFICIT"}
                    </span>
                    <span className="text-gray-600">ID: {track.id}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Operational Safety Legal Notice & System Rules */}
        <div className="space-y-6">
          <div className="bg-[#161F30] border border-[#24324D] rounded-xl p-6 space-y-4">
            <h3 className="text-xs font-black tracking-wider text-white border-b border-[#24324D] pb-3 uppercase">
              // STATION_LOGIC_OVERVIEW
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed font-sans">
              State insurance laws mandate that specific hazardous processes (such as micro-soldering and high-capacity battery replacements) require minimum active certified technician headcounts to be present on the bench floor.
            </p>
            <div className="p-3 bg-[#0B0F19] border border-dashed border-[#24324D] rounded space-y-2 text-[11px]">
              <p className="text-gray-400">
                <strong className="text-[#00F0FF]">SYSTEM_ENFORCEMENT:</strong> If any tracking index signals a deficit alert, work orders matching that category will lock out on the master work-queue until compliance metrics are met.
              </p>
            </div>
            <div className="text-[10px] text-gray-500 pt-2 font-mono">
              Last Telemetry Scan: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
