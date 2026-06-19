import React, { useState } from 'react';

export default function TicketQueue() {
  // Live structural data mimicking incoming client equipment repair pipelines
  const [tickets, setTickets] = useState([
    { id: "TCK-802", hardware: "QuantumTech Core Rig Bundle", fault: "Socket Intermittent Failure", priority: "CRITICAL", tech: "Linus C.", status: "DIAGNOSING" },
    { id: "TCK-719", hardware: "AeroVolt Matrix-RTX 500", fault: "VRAM Thermals Exceeding 105C", priority: "HIGH", tech: "UNASSIGNED", status: "STAGED" },
    { id: "TCK-644", hardware: "NeonMatrix Mechanical Deck", fault: "Corrupted Firmware Flash Loop", priority: "LOW", tech: "Sarah T.", status: "IN_REPAIR" }
  ]);

  const updateTicketStatus = (id, nextStatus) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, status: nextStatus } : t));
  };

  return (
    <div className="p-8 bg-[#0B0F19] min-h-screen text-gray-100 font-mono">
      <div className="border-b border-[#24324D] pb-4 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black uppercase text-white">BENCH // <span className="text-[#FF5E00]">TICKET_QUEUE</span></h1>
          <p className="text-xs text-gray-400">Active hardware repair jobs staged across work clusters.</p>
        </div>
        <span className="text-xs bg-[#161F30] text-gray-300 border border-[#24324D] px-3 py-1 rounded">
          TOTAL_JOBS: {tickets.length}
        </span>
      </div>

      <div className="bg-[#111723] border border-[#24324D] rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#161F30] border-b border-[#24324D] text-[11px] text-gray-400 uppercase tracking-wider">
                <th className="p-4">Ticket ID</th>
                <th className="p-4">Hardware Item</th>
                <th className="p-4">Reported Fault Matrix</th>
                <th className="p-4">Severity</th>
                <th className="p-4">Assigned Bench</th>
                <th className="p-4 text-right">Operational Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#24324D]/60 text-xs">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-[#161F30]/40 transition-colors">
                  <td className="p-4 font-bold text-[#00F0FF]">{ticket.id}</td>
                  <td className="p-4 text-white font-bold">{ticket.hardware}</td>
                  <td className="p-4 text-gray-300 font-sans">{ticket.fault}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] border ${
                      ticket.priority === 'CRITICAL' ? 'bg-red-950/40 text-red-400 border-red-500/30 animate-pulse' :
                      ticket.priority === 'HIGH' ? 'bg-amber-950/40 text-amber-400 border-amber-500/30' :
                      'bg-slate-900 text-slate-400 border-slate-700'
                    }`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400">
                    <span className={ticket.tech === 'UNASSIGNED' ? 'text-rose-400 italic' : 'text-gray-300'}>
                      {ticket.tech}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <select 
                      value={ticket.status} 
                      onChange={(e) => updateTicketStatus(ticket.id, e.target.value)}
                      className="bg-[#0B0F19] text-gray-300 border border-[#24324D] text-[11px] px-2 py-1 rounded focus:outline-none focus:border-[#00F0FF]"
                    >
                      <option value="STAGED">STAGED</option>
                      <option value="DIAGNOSING">DIAGNOSING</option>
                      <option value="IN_REPAIR">IN_REPAIR</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
