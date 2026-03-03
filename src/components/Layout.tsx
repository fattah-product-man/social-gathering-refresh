import React from 'react';
import { BottomNav } from './BottomNav';
import { useLocation } from 'react-router-dom';

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAuthPage = location.pathname.endsWith('/join') || location.pathname.split('/').length <= 3;
  const isAdminPage = location.pathname.includes('/admin');
  const showNav = !isAuthPage && !isAdminPage;

  return (
    <div className={`min-h-screen font-sans pb-24 relative overflow-hidden transition-colors duration-500 ${
      isAuthPage ? 'bg-slate-900 text-white' : 'bg-[#F5F5F7] text-[#1D1D1F]'
    }`}>
      <main className="max-w-md mx-auto p-4 min-h-screen relative z-10">
        {children}
      </main>
      {showNav && <BottomNav />}
    </div>
  );
}
