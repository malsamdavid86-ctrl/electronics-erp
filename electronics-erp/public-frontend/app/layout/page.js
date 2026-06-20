import React from 'react';
import '@/app/globals.css'; // Global Tailwind configuration injection

export const metadata = {
  title: 'REPAIR_HUB // Enterprise Management Console',
  description: 'Automated logistics, diagnostic scheduling, and customer core tracking systems.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-[#0B0F19]">
      <body className="min-h-screen text-gray-100 antialiased selection:bg-[#00F0FF] selection:text-black">
        {/* Global Matrix Frame Layer Header */}
        <header className="border-b border-[#24324D] bg-[#111723]/80 backdrop-blur-md sticky top-0 z-50 font-mono text-xs px-8 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-6">
              <a href="/" className="font-black tracking-widest text-white hover:text-[#00F0FF] transition-colors">
                ⚡ REPAIR_HUB // <span className="text-[#00F0FF]">CORE_OS</span>
              </a>
              <nav className="hidden md:flex items-center gap-4 text-gray-400">
                <a href="/catalog" className="hover:text-white transition-colors">// CATALOG</a>
                <a href="/loyalty" className="hover:text-white transition-colors">// REWARDS</a>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="h-2 w-2 rounded-full bg-[#00FF66] animate-pulse" />
              <span className="text-gray-500 text-[10px] uppercase tracking-wider hidden sm:inline">
                GATEWAY_NODE_ACTIVE
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Nested Page Routing Target */}
        <main>{children}</main>

        {/* Global Persistent Infrastructure Footer */}
        <footer className="border-t border-[#24324D]/40 bg-[#0B0F19] text-[10px] text-gray-600 font-mono py-6 px-8 mt-12">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
            <span>© 2026 REPAIR_HUB ENTERPRISE LOGISTICS SYSTEMS INC. ALL RIGHTS RESERVED.</span>
            <span className="tracking-widest text-gray-700">STRICT_ENCRYPTION_MODE_ON</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
