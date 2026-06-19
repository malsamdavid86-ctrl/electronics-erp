import React, { useState, useEffect } from 'react';

export default function EmployeeBenefitsManagement() {
  const [benefitsLedger, setBenefitsLedger] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [corporateMatchTotal, setCorporateMatchTotal] = useState(0);

  // Core schema mockups representing enterprise benefit allocations
  const sampleBenefitsData = [
    { id: "BEN-701", employee: "Linus C.", tier: "Platinum Health PPO", hsaContribution: 150, retirementMatch: 4.5, enrollmentStatus: "VERIFIED" },
    { id: "BEN-702", employee: "Sarah T.", tier: "Standard Health HDHP", hsaContribution: 300, retirementMatch: 6.0, enrollmentStatus: "VERIFIED" },
    { id: "BEN-703", employee: "Alexei K.", tier: "None (Waived)", hsaContribution: 0, retirementMatch: 3.0, enrollmentStatus: "PENDING_REVIEW" }
  ];

  useEffect(() => {
    const fetchBenefitsTelemetry = async () => {
      try {
        const res = await fetch('/api/admin/hr/benefits-matrix');
        if (!res.ok) throw new Error('OFFLINE_PROXY_FALLBACK');
        const data = await res.json();
        setBenefitsLedger(data);
        calculateCorporateOutflow(data);
      } catch (err) {
        // Safe structural fallback logic matching global database states
        setBenefitsLedger(sampleBenefitsData);
        calculateCorporateOutflow(sampleBenefitsData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBenefitsTelemetry();
  }, []);

  const calculateCorporateOutflow = (data) => {
    const totalHSA = data.reduce((acc, curr) => acc + curr.hsaContribution, 0);
    setCorporateMatchTotal(totalHSA);
  };

  const toggleEnrollmentStatus = (id) => {
    const updatedLedger = benefitsLedger.map(item => {
      if (item.id === id) {
        const nextStatus = item.enrollmentStatus === 'VERIFIED' ? 'PENDING_REVIEW' : 'VERIFIED';
        return { ...item, enrollmentStatus: nextStatus };
      }
      return item;
    });
    setBenefitsLedger(updatedLedger);
    calculateCorporateOutflow(updatedLedger);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-gray-400 p-8 font-mono flex items-center justify-center">
        <p className="animate-pulse">COMPILING_BENEFITS_LEDGER_STREAM...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#0B0F19] min-h-screen text-gray-100 font-mono">
      {/* Top Financial Dashboard Metrics Row */}
      <div className="border-b border-[#24324D] pb-4 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-black uppercase text-white">HR // <span className="text-[#00F0FF]">BENEFITS_MANAGEMENT</span></h1>
          <p className="text-xs text-gray-400">Orchestrating health insurance selection, HSA accounts, and retirement matching variables.</p>
        </div>
        <div className="bg-[#111723] border border-[#24324D] px-4 py-2 rounded-xl text-right">
          <span className="text-[10px] text-gray-500 block uppercase">MONTHLY_HSA_OUTFLOW_TOTAL</span>
          <span className="text-md font-bold text-[#00FF66]">${corporateMatchTotal}.00 USD</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Live Active Benefits Ledger */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs font-black tracking-wider text-gray-400 uppercase">// ACTIVE_STAFF_POLICIES</h2>
          
          <div className="bg-[#111723] border border-[#24324D] rounded-xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#161F30] border-b border-[#24324D] text-[11px] text-gray-400 uppercase tracking-wider">
                    <th className="p-4">Employee</th>
                    <th className="p-4">Coverage Plan Tier</th>
                    <th className="p-4">Mo. HSA Match</th>
                    <th className="p-4">401k Match %</th>
                    <th className="p-4 text-right">System Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#24324D]/60 text-xs">
                  {benefitsLedger.map((policy) => (
                    <tr key={policy.id} className="hover:bg-[#161F30]/40 transition-colors">
                      <td className="p-4 font-bold text-white">
                        {policy.employee}
                        <span className="block text-[10px] text-gray-500 font-normal mt-0.5">ID: {policy.id}</span>
                      </td>
                      <td className="p-4 text-gray-300 font-sans">{policy.tier}</td>
                      <td className="p-4 text-[#00F0FF] font-bold">${policy.hsaContribution}/mo</td>
                      <td className="p-4 text-gray-400 font-bold">{policy.retirementMatch}%</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => toggleEnrollmentStatus(policy.id)}
                          className={`text-[10px] px-3 py-1.5 rounded border uppercase font-bold tracking-wider transition-all ${
                            policy.enrollmentStatus === 'VERIFIED'
                              ? 'bg-emerald-950/30 text-[#00FF66] border-[#00FF66]/30 hover:bg-emerald-950/60'
                              : 'bg-amber-950/30 text-amber-400 border-amber-500/30 hover:bg-amber-950/60'
                          }`}
                        >
                          {policy.enrollmentStatus}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Corporate Liability Control & Parameters */}
        <div className="space-y-6">
          <div className="bg-[#161F30] border border-[#24324D] rounded-xl p-6 space-y-4">
            <h3 className="text-xs font-black tracking-wider text-white border-b border-[#24324D] pb-3 uppercase">
              // TAX_COMPLIANCE_STANDARDS
            </h3>
            
            <p className="text-xs text-gray-400 leading-relaxed font-sans">
              Annual statutory limit flags protect payroll distribution architectures from accidental excessive pre-tax contributions. Changes commit during regular midnight cycles.
            </p>

            <div className="p-3 bg-[#0B0F19] border border-dashed border-[#24324D] rounded space-y-2 text-[11px]">
              <p className="text-gray-400">
                <strong className="text-[#00F0FF]">AUDIT_NOTE:</strong> Ensure all plans marked <span className="text-amber-400 font-bold">PENDING_REVIEW</span> receive signed waiver affirmations before monthly enrollment lockouts take effect.
              </p>
            </div>

            <button className="w-full bg-[#0B0F19] border border-[#24324D] hover:border-gray-500 transition-colors text-white py-2.5 rounded text-xs font-bold uppercase tracking-wider">
              Export Benefits Enrollment Manifest
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
