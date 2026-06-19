import React, { useState } from 'react';

// Recursive Node Component to map out management lines cleanly
const TreeNode = ({ member }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasSubordinates = member.subordinates && member.subordinates.length > 0;

  return (
    <div className="ml-6 border-l border-[#24324D] pl-4 my-2 font-mono">
      <div 
        className={`p-3 bg-[#161F30]/60 border rounded-lg flex items-center justify-between transition-all ${
          hasSubordinates ? 'border-[#00F0FF]/30 hover:border-[#00F0FF]' : 'border-[#24324D]'
        }`}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white">{member.name}</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#0B0F19] text-gray-400 border border-[#24324D]">
              {member.role}
            </span>
          </div>
          <p className="text-[10px] text-gray-500 mt-1">ID // {member.id}</p>
        </div>

        {hasSubordinates && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[10px] text-[#00F0FF] bg-[#0B0F19] border border-[#24324D] px-2 py-1 rounded hover:bg-[#161F30]"
          >
            {isExpanded ? 'COLLAPSE [-]' : 'EXPAND [+]'}
          </button>
        )}
      </div>

      {hasSubordinates && isExpanded && (
        <div className="mt-2 space-y-1 transition-all">
          {member.subordinates.map((sub) => (
            <TreeNode key={sub.id} member={sub} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function StaffTree() {
  // Structured recursive mockup representing the corporate hierarchy grid
  const corporateHierarchy = {
    id: "EMP-001",
    name: "Dr. Evelyn Vance",
    role: "Director of Hardware Engineering",
    subordinates: [
      {
        id: "EMP-012",
        name: "Marcus Brody",
        role: "Bench Repair Supervisor",
        subordinates: [
          { id: "EMP-104", name: "Linus C.", role: "Lead Micro-Solder Tech", subordinates: [] },
          { id: "EMP-109", name: "Sarah T.", role: "Senior Diagnostics Specialist", subordinates: [] }
        ]
      },
      {
        id: "EMP-015",
        name: "Elena Rostova",
        role: "Compliance & QA Inspector",
        subordinates: [
          { id: "EMP-211", name: "Alexei K.", role: "Safety Standards Auditor", subordinates: [] }
        ]
      }
    ]
  };

  return (
    <div className="p-8 bg-[#0B0F19] min-h-screen text-gray-100 font-mono">
      <div className="border-b border-[#24324D] pb-4 mb-8">
        <h1 className="text-xl font-black uppercase text-white">CORP // <span className="text-[#00F0FF]">STAFF_HIERARCHY</span></h1>
        <p className="text-xs text-gray-400">Recursive reporting topology index for active bench technicians and structural supervisors.</p>
      </div>

      <div className="max-w-4xl bg-[#111723] border border-[#24324D] rounded-xl p-6 shadow-2xl">
        <div className="text-xs text-gray-400 mb-4 tracking-wider uppercase">// ROOT_ORGANIZATION_NODE</div>
        <TreeNode member={corporateHierarchy} />
      </div>
    </div>
  );
}
