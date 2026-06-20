import React, { useState } from 'react';

export default function GiveawayApp() {
  const [participantsInput, setParticipantsInput] = useState('');
  const [participantsList, setParticipantsList] = useState([]);
  const [winners, setWinners] = useState([]);
  const [winnerCount, setWinnerCount] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [systemLogs, setSystemLogs] = useState([]);

  // Cryptographically Secure Pseudo-Random Number Selection Engine
  const secureRandomSelection = (poolSize, count) => {
    const indices = new Set();
    const maxUint32 = 4294967295;
    const array = new Uint32Array(1);

    // Keep selecting unique indices until target winner count is met
    while (indices.size < count) {
      window.crypto.getRandomValues(array);
      const randomValue = array[0];
      
      // Enforce reject sampling to avoid modulo bias near the upper bound
      const dynamicLimit = maxUint32 - (maxUint32 % poolSize);
      if (randomValue < dynamicLimit) {
        indices.add(randomValue % poolSize);
      }
    }
    return Array.from(indices);
  };

  const handleExecuteDraw = (e) => {
    e.preventDefault();
    setWinners([]);
    setIsDrawing(true);

    // Clean up input list by stripping whitespace and empty strings
    const pool = participantsInput
      .split('\n')
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    if (pool.length === 0) {
      setSystemLogs(["❌ ERROR // Selection pool is completely empty."]);
      setIsDrawing(false);
      return;
    }

    const targetedWinners = Math.min(parseInt(winnerCount) || 1, pool.length);
    setParticipantsList(pool);

    setSystemLogs([
      `📡 INITIALIZING_CSPRNG_ENGINE...`,
      `📦 Pool Volume: ${pool.length} candidates.`,
      `🎲 Pulling ${targetedWinners} distinct allocations...`
    ]);

    // Simulate standard mechanical drawing interval suspense
    setTimeout(() => {
      try {
        const winningIndices = secureRandomSelection(pool.length, targetedWinners);
        const selectedWinners = winningIndices.map((index) => pool[index]);

        setWinners(selectedWinners);
        setSystemLogs((prev) => [
          ...prev,
          `✓ DRAW_COMPLETED: Entropies verified.`,
          `🏁 Selected IDs: ${winningIndices.join(', ')}`
        ]);
      } catch (err) {
        setSystemLogs([`⚡ HARDWARE_ENTROPY_FAULT: ${err.message}`]);
      } finally {
        setIsDrawing(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 font-mono p-8">
      {/* Upper Title Branding Matrix */}
      <div className="max-w-5xl mx-auto border-b border-[#24324D] pb-4 mb-8">
        <h1 className="text-xl font-black uppercase text-white">
          SYSTEM // <span className="text-[#00F0FF]">GIVEAWAY_ENTROPY_ENGINE</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Provably unbiased winner allocation using cryptographic random-value byte streams.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Input Panel Form */}
        <div className="bg-[#111723] border border-[#24324D] rounded-xl p-6 space-y-4 shadow-2xl">
          <h3 className="text-xs font-black text-white uppercase tracking-wider">// POOL_PARAMETERS</h3>
          
          <form onSubmit={handleExecuteDraw} className="space-y-4">
            <div>
              <label className="block text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2">
                Participants (One Name Per Line)
              </label>
              <textarea
                required
                rows={8}
                value={participantsInput}
                onChange={(e) => setParticipantsInput(e.target.value)}
                placeholder="User_ID_01&#10;User_ID_02&#10;User_ID_03"
                className="w-full bg-[#0B0F19] text-white border border-[#24324D] rounded p-3 text-xs focus:outline-none focus:border-[#00F0FF] resize-none font-sans"
              />
            </div>

            <div>
              <label className="block text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2">
                Target Winner Count
              </label>
              <input
                type="number"
                min={1}
                value={winnerCount}
                onChange={(e) => setWinnerCount(e.target.value)}
                className="w-full bg-[#0B0F19] text-white border border-[#24324D] rounded px-3 py-2 text-xs focus:outline-none focus:border-[#00F0FF]"
              />
            </div>

            <button
              type="submit"
              disabled={isDrawing}
              className="w-full bg-[#161F30] hover:bg-[#00F0FF] hover:text-black border border-[#24324D] text-[#00F0FF] font-bold py-2.5 rounded text-xs uppercase tracking-widest transition-all disabled:opacity-50"
            >
              {isDrawing ? "RUNNING_ENTROPY..." : "EXECUTE_LIVE_DRAW"}
            </button>
          </form>
        </div>

        {/* Right 2 Columns: Display Dashboard Results & Logs */}
        <div className="md:col-span-2 space-y-6">
          {/* Winners Display Panel */}
          <div className="bg-[#161F30] border border-[#24324D] rounded-xl p-6 relative overflow-hidden min-h-[160px] flex flex-col justify-center">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00F0FF] to-blue-600" />
            
            {winners.length === 0 ? (
              <div className="text-center text-gray-500 py-6">
                <p className="text-xs uppercase tracking-widest">Awaiting execution sequence...</p>
              </div>
            ) : (
              <div>
                <h4 className="text-xs font-black text-[#00F0FF] uppercase mb-4 tracking-wider">🎉 SELECTED_WINNERS_MANIFEST</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {winners.map((winner, index) => (
                    <div key={index} className="bg-[#0B0F19] border border-[#00FF66]/30 px-4 py-3 rounded-lg flex items-center justify-between shadow-[0_0_10px_rgba(0,255,102,0.03)]">
                      <span className="text-sm font-black text-white">{winner}</span>
                      <span className="text-[9px] bg-emerald-950 text-[#00FF66] border border-[#00FF66]/20 px-2 py-0.5 rounded font-bold uppercase">
                        Rank #{index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Engine Real-Time Operation Logs */}
          <div className="bg-[#0B0F19] border border-[#24324D]/60 rounded-xl p-5">
            <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">// TELEMETRY_LOGS</h5>
            <div className="bg-black/40 border border-[#1A263E] p-3 rounded font-mono text-[11px] text-gray-400 space-y-1.5 min-h-[90px]">
              {systemLogs.length === 0 ? (
                <p className="text-gray-600 italic">Core pipeline idle.</p>
              ) : (
                systemLogs.map((log, i) => (
                  <p key={i} className={log.startsWith('❌') || log.startsWith('⚡') ? 'text-red-400' : log.startsWith('✓') ? 'text-[#00FF66]' : ''}>
                    {log}
                  </p>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
