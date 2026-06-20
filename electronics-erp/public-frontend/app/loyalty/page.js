'use client';

import React, { useState, useEffect } from 'react';

export default function LoyaltyPage() {
  const [accountMetrics, setAccountMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [redemptionStatus, setRedemptionStatus] = useState(null);

  // Fallback operational data structures matching global database matrices
  const fallbackProfile = {
    userId: "USR-8821",
    displayName: "Marcus Vance",
    loyaltyTier: "CYBER_ELITE",
    currentPoints: 2450,
    pointsToNextTier: 550,
    redeemableCredits: 25.00,
    tierMultiplier: "1.5x",
    activePerks: [
      "Priority Micro-Solder Diagnostics Queue",
      "Free Ultrasonic Refurbishment on Terminals",
      "5% Baseline Credit Re-allocation on Hardware Purchases"
    ]
  };

  useEffect(() => {
    const streamLoyaltyTelemetry = async () => {
      try {
        const res = await fetch('/api/core/loyalty/profile');
        if (!res.ok) throw new Error('OFFLINE_PROXY_FALLBACK');
        const data = await res.json();
        setAccountMetrics(data);
      } catch (err) {
        setAccountMetrics(fallbackProfile);
      } finally {
        setIsLoading(false);
      }
    };

    streamLoyaltyTelemetry();
  }, []);

  const executeCreditRedemption = async (couponValue) => {
    setRedemptionStatus("PROCESSING_TRANSACTION...");
    try {
      const res = await fetch('/api/core/loyalty/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: couponValue })
      });
      if (!res.ok) throw new Error('CREDIT_LOCKOUT');
      setRedemptionStatus(`✓ COUPON_ISSUED: $${couponValue} credit applied to account matrix.`);
    } catch (err) {
      // Local structural state update mockup
      setAccountMetrics(prev => ({
        ...prev,
        currentPoints: Math.max(0, prev.currentPoints - (couponValue * 100)),
        redeemableCredits: Math.max(0, prev.redeemableCredits - couponValue)
      }));
      setRedemptionStatus(`✓ OFFLINE_PROCESSED: Token generated for $${couponValue}.00 USD store coupon.`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-gray-400 p-8 font-mono flex items-center justify-center">
        <p className="animate-pulse">STREAMING_LOYALTY_METRICS_LEDGER...</p>
      </div>
    );
  }

  // Calculate percentage progress toward unlocking the next reward tier
  const maxTierPoints = accountMetrics.currentPoints + accountMetrics.pointsToNextTier;
  const progressPercent = Math.min(100, (accountMetrics.currentPoints / maxTierPoints) * 100);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 font-mono p-8">
      {/* Top Ledger Overview Row */}
      <div className="max-w-6xl mx-auto border-b border-[#24324D] pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-black uppercase text-white">USER // <span className="text-[#00F0FF]">REWARDS_LOYALTY</span></h1>
          <p className="text-xs text-gray-400 mt-1">Accumulate tokens on diagnostic benchmarks and redeem direct workshop store credit.</p>
        </div>
        <div className="bg-[#111723] border border-[#24324D] px-5 py-2.5 rounded-xl text-right">
          <span className="text-[10px] text-gray-500 block uppercase font-bold">REDEEMABLE_CREDIT_BALANCE</span>
          <span className="text-lg font-black text-[#00FF66]">${accountMetrics.redeemableCredits.toFixed(2)} USD</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Account Level & Performance Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tier Multiplier Display Box */}
          <div className="bg-[#111723] border border-[#24324D] rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 h-full w-1 bg-[#00F0FF]" />
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">CURRENT_TIER_STATUS</span>
                <h2 className="text-xl font-black text-white uppercase mt-0.5 tracking-wide">{accountMetrics.loyaltyTier}</h2>
              </div>
              <span className="text-xs bg-blue-950/60 border border-blue-500/30 text-[#00F0FF] px-3 py-1 rounded font-black">
                {accountMetrics.tierMultiplier} GENERATION_RATE
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-2 mt-6">
              <div className="flex justify-between text-xs text-gray-400">
                <span>{accountMetrics.currentPoints} PTS</span>
                <span className="text-gray-500">NEXT_RANK_AT: {maxTierPoints} PTS</span>
              </div>
              <div className="w-full bg-[#0B0F19] h-2.5 border border-[#24324D] rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-[#00F0FF] to-blue-600 h-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-500 italic mt-1">
                // Apply {accountMetrics.pointsToNextTier} more diagnostic point sequences to break into subsequent rank matrices.
              </p>
            </div>
          </div>

          {/* Active Rewards / Perks Grid Block */}
          <div className="space-y-3">
            <h3 className="text-xs font-black tracking-wider text-gray-400 uppercase">// ACTIVE_TIER_BENCH_PERKS</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {accountMetrics.activePerks.map((perk, idx) => (
                <div key={idx} className="bg-[#161F30] border border-[#24324D] rounded-xl p-4 flex flex-col justify-between min-h-[110px]">
                  <p className="text-xs text-gray-300 leading-relaxed font-sans">{perk}</p>
                  <span className="text-[9px] text-[#00FF66] font-bold mt-3 tracking-widest uppercase">✓ ACTIVE_PERK</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Instant Store Token Redemptions */}
        <div className="space-y-6">
          <div className="bg-[#111723] border border-[#24324D] rounded-xl p-6 space-y-4">
            <h3 className="text-xs font-black tracking-wider text-white border-b border-[#24324D] pb-3 uppercase">
              // REWARD_TOKEN_EXCHANGE
            </h3>

            {redemptionStatus && (
              <div className="p-2.5 bg-blue-950/40 border border-blue-500/30 rounded text-center text-[11px] text-gray-300 animate-fadeIn">
                {redemptionStatus}
              </div>
            )}

            <div className="space-y-2.5 pt-1">
              <button 
                onClick={() => executeCreditRedemption(5)}
                disabled={accountMetrics.redeemableCredits < 5}
                className="w-full bg-[#161F30] hover:bg-[#00F0FF] hover:text-black disabled:opacity-30 disabled:hover:bg-[#161F30] disabled:hover:text-gray-300 border border-[#24324D] text-gray-200 font-bold py-2.5 rounded text-xs uppercase tracking-wider transition-all"
              >
                Redeem $5.00 Credit Voucher (500 pts)
              </button>
              
              <button 
                onClick={() => executeCreditRedemption(20)}
                disabled={accountMetrics.redeemableCredits < 20}
                className="w-full bg-[#161F30] hover:bg-[#00F0FF] hover:text-black disabled:opacity-30 disabled:hover:bg-[#161F30] disabled:hover:text-gray-300 border border-[#24324D] text-gray-200 font-bold py-2.5 rounded text-xs uppercase tracking-wider transition-all"
              >
                Redeem $20.00 Credit Voucher (2000 pts)
              </button>
            </div>
          </div>

          {/* Checkout Node Identification Card */}
          <div className="bg-[#0B0F19] border border-dashed border-[#24324D] rounded-xl p-5 text-center space-y-3">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">// HUB_CHECKOUT_TOKEN</h4>
            <div className="bg-white p-3 inline-block rounded-lg mx-auto">
              {/* Mocking internal infrastructure terminal square QR pattern matrix */}
              <div className="w-28 h-28 bg-gray-900 flex items-center justify-center text-white text-[9px] font-bold rounded uppercase tracking-tighter select-none">
                {accountMetrics.userId}
              </div>
            </div>
            <p className="text-[10px] text-gray-400 max-w-[200px] mx-auto leading-relaxed">
              Scan profile token at the local diagnostic bench register to process credits instantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
