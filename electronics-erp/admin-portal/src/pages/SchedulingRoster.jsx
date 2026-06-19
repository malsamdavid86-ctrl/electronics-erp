import React, { useState, useEffect } from 'react';

export default function SchedulingRoster() {
  const [shifts, setShifts] = useState([]);
  const [selectedStation, setSelectedStation] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Structural mockup reflecting the PostgreSQL shift schema layout
  const sampleRoster = [
    { id: "SFT-101", staffName: "Linus C.", station: "SOLDER_BENCH_A", start: "08:00", end: "16:00", certRequired: "WISE_L2", status: "SCHEDULED" },
    { id: "SFT-102", staffName: "Sarah T.", station: "DIAGNOSTICS_BAY", start: "09:00", end: "17:00", certRequired: "COMPTIA_A+", status: "ACTIVE" },
    { id: "SFT-103", staffName: "Alexei K.", station: "RETAIL_FLOOR", start: "10:00", end: "18:00", certRequired: null, status: "SCHEDULED" },
    { id: "SFT-104", staffName: "Marcus Brody", station: "SOLDER_BENCH_A", start: "16:00", end: "00:00", certRequired: "WISE_L2", status: "SCHEDULED" }
  ];

  useEffect(() => {
    // Mimic API sync delay across the internal reverse proxy mesh
    const timer = setTimeout(() => {
      setShifts(sampleRoster);
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const filteredShifts = selectedStation === 'ALL' 
    ? shifts 
    : shifts.filter(s => s.station === selectedStation);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-gray-400 p-8 font-mono flex items-center justify-center">
        <p className="animate-pulse">PARSING_ROSTER_TIMELINES...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#0B0F19] min-h-screen text-gray-100 font-mono">
      {/* Upper Operational Control Panel Header */}
      <div className="border-b border-[#24324D] pb-4 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-black uppercase text-white">ROSTER // <span className="text-[#00F0FF]">SHIFT_MATRIX</span></h1>
          <p className="text-xs text-gray-400">Deploying personnel configurations across active tech benches and warehouse floor tracks.</p>
        </div>
        
        {/* Dynamic Station Filter Control Block */}
        <select 
          value={selectedStation} 
          onChange={(e) => setSelectedStation(e.target.value)}
          className="bg-[#161F30] text-gray-300 border border-[#24324D] text-xs px-3 py-2 rounded focus:outline-none focus:border-[#00F0FF]"
        >
          <option value="ALL">ALL_STATIONS</option>
          <option value="SOLDER_BENCH_A">SOLDER_BENCH_A</option>
          <option value="DIAGNOSTICS_BAY">DIAGNOSTICS_BAY</option>
          <option value="RETAIL_FLOOR">RETAIL_FLOOR</option>
        </select>
      </div>

      {/* Grid Timeline Output Canvas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredShifts.map((shift) => (
          <div key={shift.id} className="bg-[#161F30] border border-[#24324D] rounded-xl p-5 hover:border-gray-500 transition-all">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] text-gray-500 uppercase font-sans font-bold">STATION // {shift.station}</span>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${
                shift.status === 'ACTIVE' ? 'bg-emerald-950 text-[#00FF66] border border-[#00FF66]/20' : 'bg-[#0B0F19] text-gray-400'
              }`}>
                {shift.status}
              </span>
            </div>

            <h3 className="text-sm font-bold text-white mb-1">{shift.staffName}</h3>
            
            {/* Visual Temporal Clock Banner */}
            <div className="bg-[#0B0F19] px-3 py-2 rounded border border-[#24324D]/40 text-center my-3">
              <p className="text-sm tracking-widest text-[#00F0FF] font-bold">{shift.start} - {shift.end}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#24324D]/60 flex justify-between items-center text-[10px]">
              <span className="text-gray-600">ID: {shift.id}</span>
              {shift.certRequired ? (
                <span className="text-amber-400 bg-amber-950/30 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
                  ⚠️ REQ: {shift.certRequired}
                </span>
              ) : (
                <span className="text-gray-500 italic">OPEN_SKILL</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
