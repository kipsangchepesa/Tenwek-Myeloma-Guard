import React from 'react';
import { AnalysisResult } from '../types';

interface ReportViewProps {
  result: AnalysisResult;
  onReset: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({ result, onReset }) => {
  
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      <div className={`p-6 rounded-xl border ${getRiskColor(result.riskLevel)} shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}>
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span className="uppercase tracking-wider text-sm font-semibold opacity-70">Risk Assessment:</span>
            {result.riskLevel} Risk
          </h2>
          <p className="mt-1 opacity-90">for Multiple Myeloma</p>
        </div>
        <button 
          onClick={onReset}
          className="bg-white/50 hover:bg-white/80 text-inherit font-medium py-2 px-4 rounded-lg transition-colors border border-transparent hover:border-current text-sm"
        >
          New Assessment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Summary & Findings */}
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Executive Summary
            </h3>
            <p className="text-slate-700 leading-relaxed text-sm md:text-base">
              {result.summary}
            </p>
            
            <div className="mt-6">
              <h4 className="font-semibold text-slate-800 mb-2 text-sm uppercase tracking-wide">Key Clinical Findings</h4>
              <ul className="space-y-2">
                {result.findings.map((finding, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-700 text-sm">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0"></span>
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        {/* Recommendations */}
        <div>
          <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full bg-gradient-to-br from-white to-blue-50">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Recommended Actions
            </h3>
            <ul className="space-y-3">
              {result.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-3 bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                  <div className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    {idx + 1}
                  </div>
                  <span className="text-slate-800 text-sm font-medium">{rec}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 pt-6 border-t border-blue-100">
               <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Confirmatory Diagnostics</h4>
               <p className="text-xs text-slate-600 mb-2">
                 Proceed with <strong>BMA (Bone Marrow Aspiration)</strong> to confirm plasma cell percentage if indicated above.
               </p>
               <p className="text-xs text-slate-600">
                 Monitor <strong>Serum Calcium</strong> and <strong>Creatinine</strong> levels closely.
               </p>
            </div>
          </section>
        </div>

      </div>

      <div className="text-center mt-8">
        <p className="text-xs text-slate-400">Analysis generated by Myeloma Guard AI (Gemini) • {new Date().toLocaleDateString()}</p>
      </div>

    </div>
  );
};
