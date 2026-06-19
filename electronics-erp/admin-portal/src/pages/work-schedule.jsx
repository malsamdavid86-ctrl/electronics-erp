import React, { useState, useEffect } from 'react';

export default function WorkSchedule() {
  const [personalShifts, setPersonalShifts] = useState([]);
  const [openShifts, setOpenShifts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fallback structural datasets matching scheduling constraints
  const mockPersonalRoster = [
    { id: "SFT-401", date: "2026-06-22", station: "Micro-Solder Bench B", hours: "08:00 - 16:00", status: "CONFIRMED", requiredCert: "WISE_L2" },
    { id: "SFT-405", date: "2026-06-24", station: "Precision Diagnostics", hours: "09:00 - 17:00", status: "CONFIRMED", requiredCert: "COMPTIA_A+" }
  ];

  const mockOpenPool = [
    { id: "SFT-991", date: "2026-06-23", station: "Triage Bay 2", hours: "12:00 - 20:00", requiredCert: null },
    { id: "SFT-995", date: "2026-06-25", station: "Micro-Solder Bench A", hours: "16:00 - 00:00", requiredCert: "WISE_L2" }
  ];

  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        const res = await fetch('/api/admin/scheduling/my-schedule');
        if (!res.ok) throw new Error('OFFLINE_PROXY_FALLBACK');
        const data = await res.json();
        setPersonalShifts(data.assigned);
        setOpenShifts(data.availablePool);
      } catch (err) {
        setPersonalShifts(mockPersonalRoster);
        setOpenShifts(mockOpenPool);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScheduleData();
  }, []);

  const claimOpenShift = async (shiftId) => {
    try {
      const res = await fetch(`/api/admin/scheduling/claim/${shiftId}`, { method: 'POST' });
      if (!res.ok) {
        const errData = await res.json();
        alert(`⚡ LOGIC_LOCKOUT: ${errData.detail || 'Claim refused.'}`);
        return;
      }
      alert("✓ SHIFT_ASSIGNED: Roster updated successfully.");
    } catch (err) {
      // Simulate frontend state swap for local environments
      const claimed = openShifts.find(s => s.id === shiftId);
      if (claimed) {
        setOpenShifts(openShifts.filter(s => s.id !== shiftId));
        setPersonalShifts([...personalShifts, { ...claimed, status: "CONFIRMED" }]);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-gray-400 p-8 font-mono flex items-center justify-center">
        <p className="animate-pulse">FETCHING_PERSONAL_ROSTER_STREAM...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#0B0F19] min-h-screen text-gray-100 font-mono">
      {/* Top Header Grid Section */}
      <div className="border-b border-[#24324D] pb-4 mb-8">
        <h1 className="text-xl font-black uppercase text-white">USER // <span className="text-[#00F0FF]">WORK_SCHEDULE</span></h1>
        <p className="text-xs text-gray-400">Review your assigned active shift configurations or claim unassigned bench open-slots.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Personal Assigned Roster */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs font-black tracking-wider text-gray-400 uppercase">// MY_ASSIGNED_SHIFTS</h2>
          
          <div className="space-y-3">
            {personalShifts.map((shift) => (
              <div key={shift.id} className="bg-[#161F30] border border-[#24324D] rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-sans font-bold">{shift.date}</span>
                    <span className="text-[10px] bg-[#0B0F19] text-[#00FF66] border border-[#00FF66]/20 px-2 py-0.5 rounded font-black">
                      {shift.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1">{shift.station}</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">ID // {shift.id}</p>
                </div>

                <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                  <span className="text-sm font-bold tracking-widest text-[#00F0FF] bg-[#0B0F19] px-3 py-1.5 rounded border border-[#24324D]">
                    {shift.hours}
                  </span>
                  {shift.requiredCert && (
                    <span className="text-[9px] text-amber-400 font-bold self-start sm:self-auto">
                      🔒 Cert Required: {shift.requiredCert}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Open Shift Marketplace Pool */}
        <div className="space-y-4">
          <h2 className="text-xs font-black tracking-wider text-gray-400 uppercase">// AVAILABLE_OPEN_POOL</h2>
          
          <div className="space-y-3">
            {openShifts.map((openShift) => (
              <div key={openShift.id} className="bg-[#111723] border border-dashed border-[#24324D] rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold">{openShift.date}</span>
                    <h5 className="text-xs font-bold text-white mt-0.5">{openShift.station}</h5>
                  </div>
                  <span className="text-[11px] font-bold text-gray-400">{openShift.hours}</span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-[#24324D]/60">
                  <span className="text-[9px] text-gray-600">ID: {openShift.id}</span>
                  <button 
                    onClick={() => claimOpenShift(openShift.id)}
                    className="bg-[#0B0F19] hover:bg-[#00F0FF] hover:text-black border border-[#24324D] text-[#00F0FF] font-bold text-[10px] px-3 py-1.5 rounded uppercase tracking-wider transition-all"
                  >
                    Claim Shift
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
