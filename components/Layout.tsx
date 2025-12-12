import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: 'assessment' | 'about';
  onNavigate: (view: 'assessment' | 'about') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Burgundy Header for Myeloma Awareness */}
      <header className="bg-rose-900 text-white shadow-lg sticky top-0 z-50 border-b border-rose-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div 
              className="flex items-center gap-4 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => onNavigate('assessment')}
            >
              <div className="bg-white p-1.5 rounded-lg shadow-sm">
                {/* Tenwek Hospital Logo */}
                <img 
                  src="https://tenwekhospital.org/wp-content/uploads/2022/05/logo_new-1.png" 
                  alt="Tenwek Hospital Logo" 
                  className="h-10 w-auto object-contain"
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<svg class="w-8 h-8 text-rose-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>';
                  }}
                />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white leading-tight">
                  Tenwek Myeloma Guard
                </h1>
                <p className="text-xs text-rose-200 font-medium">AI Oncology Support • Bomet East</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-2">
              <button 
                onClick={() => onNavigate('assessment')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'assessment' 
                    ? 'bg-rose-950 text-white shadow-inner border border-rose-800' 
                    : 'text-rose-100 hover:bg-rose-800 hover:text-white'
                }`}
              >
                Assessment
              </button>
              <button 
                onClick={() => onNavigate('about')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'about' 
                    ? 'bg-rose-950 text-white shadow-inner border border-rose-800' 
                    : 'text-rose-100 hover:bg-rose-800 hover:text-white'
                }`}
              >
                About
              </button>
            </nav>
          </div>
          
          <div className="hidden md:block">
            <span className="bg-rose-950 px-3 py-1 rounded-full text-xs font-semibold border border-rose-700 text-rose-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              AI System Online
            </span>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-center gap-6 mb-4 md:hidden">
            <button onClick={() => onNavigate('assessment')} className="hover:text-rose-400">Assessment</button>
            <span className="text-slate-700">|</span>
            <button onClick={() => onNavigate('about')} className="hover:text-rose-400">About</button>
          </div>
          <div className="mb-4">
             <p className="font-semibold text-slate-300">Tenwek Hospital &middot; We Treat, Jesus Heals</p>
          </div>
          <p>&copy; {new Date().getFullYear()} Tenwek Hospital AI Initiative.</p>
          <p className="mt-2 text-xs text-slate-600 max-w-2xl mx-auto">
            Disclaimer: This AI tool is for clinical decision support only and does not replace professional medical diagnosis. 
            Confirm all findings with standard pathology (BMA/Trephine) and biochemical assays.
          </p>
        </div>
      </footer>
    </div>
  );
};