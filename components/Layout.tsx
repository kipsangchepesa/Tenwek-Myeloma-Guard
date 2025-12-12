import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-teal-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-teal-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Tenwek Myeloma Guard</h1>
              <p className="text-xs text-teal-100 opacity-90">AI Oncology Support • Bomet County</p>
            </div>
          </div>
          <div className="hidden md:block">
            <span className="bg-teal-800 px-3 py-1 rounded-full text-xs font-medium border border-teal-600">
              Gemini 2.5 Flash Enabled
            </span>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-6 text-center text-sm border-t border-slate-800">
        <p>&copy; {new Date().getFullYear()} Tenwek Hospital AI Initiative.</p>
        <p className="mt-1 text-xs text-slate-500">
          Disclaimer: This AI tool is for decision support only and does not replace professional medical diagnosis.
        </p>
      </footer>
    </div>
  );
};
