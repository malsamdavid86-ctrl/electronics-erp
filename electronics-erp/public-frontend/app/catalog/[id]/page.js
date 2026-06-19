import React from 'react';
import { notFound } from 'next/navigation';

// Enforces dynamic real-time data fetching for catalog tracking inventories
export const revalidate = 60; 

async function fetchComponentSpecifications(id) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://gateway:80'}/api/core/parts/${id}`, {
      next: { revalidate: 60 }
    });
    
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('INTERNAL_GATEWAY_TIMEOUT');
    }
    return await res.json();
  } catch (err) {
    // Structural schema fallback layout if database services are compiling locally
    const fallbackCatalog = {
      "CPU-AM5": { id: "CPU-AM5", name: "AeroVolt Nexus-4X CPU", category: "Processor", cost: 249.99, specs: { socket: "AM5", cores: "8", TDP: "65W" }, description: "High-efficiency processing matrix engineered for intense micro-solder logic builds and modular workstations." },
      "GPU-PCIE5": { id: "GPU-PCIE5", name: "Overclocked Matrix GPU", category: "Graphics", cost: 899.00, specs: { interface: "PCIe 5.0", vram: "16GB", length: "320mm" }, description: "Next-gen computing engine optimizing matrix calculation pipelines and extreme rendering parameters." }
    };
    return fallbackCatalog[id] || null;
  }
}

export default async function ProductDetailPage({ params }) {
  // Await the dynamic routing parameter segment explicitly
  const { id } = await params;
  const product = await fetchComponentSpecifications(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 font-mono p-8">
      {/* Structural Path Navigation Mapping */}
      <div className="max-w-5xl mx-auto mb-6 text-xs text-gray-500 uppercase tracking-widest">
        <a href="/catalog" className="hover:text-[#00F0FF] transition-colors">📦 CATALOG</a> 
        <span className="mx-2">//</span> 
        <span className="text-gray-300">{product.category}</span>
        <span className="mx-2">//</span> 
        <span className="text-[#00F0FF]">{product.id}</span>
      </div>

      {/* Main Specifications Visual Interface */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 bg-[#111723] border border-[#24324D] rounded-xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00F0FF] to-blue-600" />
        
        {/* Left 2 Columns: Product Overview Descriptions */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <span className="text-xs font-bold text-[#00F0FF] bg-blue-950/40 border border-blue-500/20 px-2 py-1 rounded">
              {product.category.toUpperCase()}
            </span>
            <h1 className="text-2xl font-black text-white mt-3 uppercase tracking-tight">
              {product.name}
            </h1>
            <p className="text-xs text-gray-500 mt-1">UUID // {product.id}</p>
          </div>

          <div className="border-t border-[#24324D]/60 pt-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">// COMPONENT_OVERVIEW</h3>
            <p className="text-sm text-gray-300 font-sans leading-relaxed">{product.description}</p>
          </div>
        </div>

        {/* Right Column: Hardware Interface Metrics & Pricing */}
        <div className="bg-[#161F30] border border-[#24324D] rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-white border-b border-[#24324D] pb-3 uppercase tracking-wider">
              // TECH_SPECS_MATRIX
            </h3>
            
            {/* Dynamic Hardware Object Spec Reader mapping */}
            <div className="mt-4 space-y-2.5">
              {Object.entries(product.specs || {}).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center text-xs border-b border-[#24324D]/40 pb-1.5">
                  <span className="text-gray-500 uppercase">{key}</span>
                  <span className="text-gray-200 font-bold tracking-wide">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[#24324D]">
            <div className="flex justify-between items-baseline mb-4">
              <span className="text-xs text-gray-500 uppercase font-sans">VAL_DENOMINATION</span>
              <span className="text-2xl font-black text-[#00FF66]">${product.cost?.toFixed(2)}</span>
            </div>

            <button className="w-full bg-[#0B0F19] hover:bg-[#00F0FF] hover:text-black border border-[#24324D] text-[#00F0FF] py-3 rounded text-xs font-bold uppercase tracking-widest transition-all">
              Stage Into Workbench
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
