import React, { useState } from 'react';
import { PatientData } from '../types';

interface PatientFormProps {
  data: PatientData;
  onChange: (data: PatientData) => void;
}

export const PatientForm: React.FC<PatientFormProps> = ({ data, onChange }) => {
  const [hoveredGraph, setHoveredGraph] = useState(false);

  const updateField = (field: keyof PatientData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const updateSymptom = (key: keyof PatientData['symptoms']) => {
    onChange({
      ...data,
      symptoms: {
        ...data.symptoms,
        [key]: !data.symptoms[key]
      }
    });
  };

  const updateLab = (key: keyof PatientData['labResults']) => {
    onChange({
      ...data,
      labResults: {
        ...data.labResults,
        [key]: !data.labResults[key]
      }
    });
  };

  const updateMProteinValue = (val: number) => {
    onChange({
      ...data,
      labResults: {
        ...data.labResults,
        mProteinValue: val
      }
    });
  };

  const updateHistory = (key: keyof PatientData['medicalHistory'], value?: any) => {
    if (key === 'other') {
      onChange({
        ...data,
        medicalHistory: {
          ...data.medicalHistory,
          other: value
        }
      });
    } else {
      onChange({
        ...data,
        medicalHistory: {
          ...data.medicalHistory,
          [key]: !data.medicalHistory[key as keyof Omit<PatientData['medicalHistory'], 'other'>]
        }
      });
    }
  };

  // Helper function to calculate severity color
  const getSpikeSeverity = (val: number) => {
    if (val < 1.5) return { label: 'Low/MGUS', color: '#10b981' }; // green
    if (val < 3.0) return { label: 'Intermediate', color: '#f59e0b' }; // orange
    return { label: 'High/Active', color: '#ef4444' }; // red
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Demographics */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Patient Demographics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Age</label>
            <input
              type="number"
              className="w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 p-2 border"
              placeholder="e.g. 55"
              value={data.age}
              onChange={(e) => updateField('age', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Gender</label>
            <select
              className="w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 p-2 border"
              value={data.gender}
              onChange={(e) => updateField('gender', e.target.value)}
            >
              <option value="">Select...</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            {data.gender === 'Female' && (
              <div className="mt-2 flex items-center">
                 <input 
                   type="checkbox" 
                   id="pregnancy"
                   checked={data.isPregnant || false} 
                   onChange={(e) => updateField('isPregnant', e.target.checked)} 
                   className="h-4 w-4 text-pink-500 focus:ring-pink-500 border-gray-300 rounded" 
                 />
                 <label htmlFor="pregnancy" className="ml-2 block text-sm text-slate-700">Patient is Pregnant</label>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Constituency/Location</label>
            <input
              type="text"
              className="w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 p-2 border"
              placeholder="e.g. Bomet East"
              value={data.location}
              onChange={(e) => updateField('location', e.target.value)}
            />
            {data.location.toLowerCase().includes('bomet') && (
              <span className="text-xs text-orange-600 font-medium">⚠️ High Prevalence Area</span>
            )}
          </div>
        </div>
      </section>

      {/* Symptoms Checklist */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Clinical Symptoms
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
          <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors cursor-pointer">
            <input type="checkbox" checked={data.symptoms.pneumoniaLike} onChange={() => updateSymptom('pneumoniaLike')} className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded" />
            <span className="text-slate-700">Recurrent Pneumonia / Resp. Issues</span>
          </label>
          <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors cursor-pointer">
            <input type="checkbox" checked={data.symptoms.bloodInSputum} onChange={() => updateSymptom('bloodInSputum')} className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded" />
            <span className="text-slate-700">Blood stains in Sputum (Clots)</span>
          </label>
          <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors cursor-pointer">
            <input type="checkbox" checked={data.symptoms.bonePain} onChange={() => updateSymptom('bonePain')} className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded" />
            <span className="text-slate-700">Bone Pain (Back/Ribs)</span>
          </label>
          <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors cursor-pointer">
            <input type="checkbox" checked={data.symptoms.jointSwelling} onChange={() => updateSymptom('jointSwelling')} className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded" />
            <span className="text-slate-700">Knee Joint Pain/Swelling</span>
          </label>
          <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors cursor-pointer">
            <input type="checkbox" checked={data.symptoms.unexplainedFractures} onChange={() => updateSymptom('unexplainedFractures')} className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded" />
            <span className="text-slate-700">Unexplained Fractures / Weak Bones</span>
          </label>
          <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors cursor-pointer">
            <input type="checkbox" checked={data.symptoms.fatigue} onChange={() => updateSymptom('fatigue')} className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded" />
            <span className="text-slate-700">Chronic Fatigue / Weakness</span>
          </label>
        </div>
      </section>

      {/* Lab Results (Redesigned with Cards) */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          Lab & Test Indicators
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* M-Protein Card with Graph */}
          <div className={`col-span-1 md:col-span-2 rounded-xl border-2 transition-all duration-300 p-4 ${data.labResults.mProteinPresent ? 'border-teal-500 bg-teal-50/50' : 'border-slate-100 bg-slate-50'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${data.labResults.mProteinPresent ? 'bg-teal-100 text-teal-700' : 'bg-slate-200 text-slate-500'}`}>
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                   </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">M-Protein (SPEP)</h3>
                  <p className="text-xs text-slate-500">Serum Protein Electrophoresis M-Spike</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={data.labResults.mProteinPresent} onChange={() => updateLab('mProteinPresent')} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
            </div>

            {data.labResults.mProteinPresent && (
              <div className="mt-4 flex flex-col md:flex-row gap-8 items-center animate-in fade-in slide-in-from-top-2">
                <div className="w-full md:w-1/3 space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">
                       M-Spike Level: <span className="text-teal-700 font-bold text-lg">{data.labResults.mProteinValue.toFixed(1)}</span> g/dL
                     </label>
                     <input 
                       type="range" 
                       min="0" 
                       max="6" 
                       step="0.1" 
                       value={data.labResults.mProteinValue}
                       onChange={(e) => updateMProteinValue(parseFloat(e.target.value))}
                       className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                     />
                     <div className="flex justify-between text-xs text-slate-400 mt-1">
                       <span>0 g/dL</span>
                       <span>6 g/dL</span>
                     </div>
                  </div>
                  <div className="text-xs text-slate-500 p-2 bg-white rounded border border-slate-200">
                    <p>Adjust slider to match lab report.</p>
                  </div>
                </div>

                {/* SVG Graph Visualization */}
                <div className="w-full md:w-2/3 flex justify-center relative">
                  <svg viewBox="0 0 300 120" className="w-full h-32 overflow-visible">
                    {/* Baseline */}
                    <line x1="0" y1="110" x2="300" y2="110" stroke="#cbd5e1" strokeWidth="2" />
                    
                    {/* Albumin Peak (Reference) */}
                    <path d="M 20 110 Q 50 10 80 110" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
                    <text x="50" y="125" textAnchor="middle" className="text-[10px] fill-slate-400">Albumin</text>

                    {/* M-Spike (Dynamic) */}
                    {/* Curve calculation: Start at 200, Peak at 230, End at 260. Height depends on value (0-6) mapped to (110 - 10) */}
                    <g 
                      onMouseEnter={() => setHoveredGraph(true)} 
                      onMouseLeave={() => setHoveredGraph(false)}
                      className="cursor-pointer transition-all duration-300 hover:opacity-90"
                    >
                       <path 
                         d={`M 200 110 Q 230 ${110 - (data.labResults.mProteinValue * 15)} 260 110`} 
                         fill={getSpikeSeverity(data.labResults.mProteinValue).color} 
                         fillOpacity="0.8"
                         stroke={getSpikeSeverity(data.labResults.mProteinValue).color}
                         strokeWidth="2"
                         className="transition-all duration-300 ease-out"
                       />
                       
                       {/* Hover Tooltip */}
                       <g className={`transition-opacity duration-200 ${hoveredGraph || data.labResults.mProteinValue > 0 ? 'opacity-100' : 'opacity-0'}`}>
                         <rect x="180" y="-10" width="100" height="40" rx="4" fill="#1e293b" />
                         <text x="230" y="10" textAnchor="middle" fill="white" className="text-[10px] font-bold">
                           {data.labResults.mProteinValue.toFixed(1)} g/dL
                         </text>
                         <text x="230" y="24" textAnchor="middle" fill="#cbd5e1" className="text-[9px]">
                           {getSpikeSeverity(data.labResults.mProteinValue).label}
                         </text>
                         {/* Arrow */}
                         <path d="M 230 30 L 225 35 L 235 35 Z" fill="#1e293b" />
                       </g>
                    </g>
                    <text x="230" y="125" textAnchor="middle" className="text-[10px] fill-slate-500 font-medium">Gamma (M-Spike)</text>

                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Anemia Card */}
          <div 
            className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${data.labResults.anemia ? 'border-red-400 bg-red-50' : 'border-slate-100 hover:border-slate-300'}`}
            onClick={() => updateLab('anemia')}
          >
             <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-lg ${data.labResults.anemia ? 'bg-red-200 text-red-700' : 'bg-slate-100 text-slate-400'}`}>
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                   </div>
                   <div>
                      <h3 className="font-semibold text-slate-800">Anemia</h3>
                      <p className="text-xs text-slate-500">Hemoglobin &lt; 10 g/dL</p>
                   </div>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${data.labResults.anemia ? 'bg-red-500 border-red-500' : 'border-slate-300'}`}>
                   {data.labResults.anemia && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
             </div>
          </div>

          {/* Hypercalcemia Card */}
          <div 
            className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${data.labResults.hypercalcemia ? 'border-orange-400 bg-orange-50' : 'border-slate-100 hover:border-slate-300'}`}
            onClick={() => updateLab('hypercalcemia')}
          >
             <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-lg ${data.labResults.hypercalcemia ? 'bg-orange-200 text-orange-700' : 'bg-slate-100 text-slate-400'}`}>
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                   </div>
                   <div>
                      <h3 className="font-semibold text-slate-800">Hypercalcemia</h3>
                      <p className="text-xs text-slate-500">Serum Calcium &gt; 11 mg/dL</p>
                   </div>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${data.labResults.hypercalcemia ? 'bg-orange-500 border-orange-500' : 'border-slate-300'}`}>
                   {data.labResults.hypercalcemia && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
             </div>
          </div>

          {/* Kidney Issues Card */}
          <div 
            className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${data.labResults.kidneyIssues ? 'border-purple-400 bg-purple-50' : 'border-slate-100 hover:border-slate-300'}`}
            onClick={() => updateLab('kidneyIssues')}
          >
             <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-lg ${data.labResults.kidneyIssues ? 'bg-purple-200 text-purple-700' : 'bg-slate-100 text-slate-400'}`}>
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                   </div>
                   <div>
                      <h3 className="font-semibold text-slate-800">Renal Failure</h3>
                      <p className="text-xs text-slate-500">Creatinine &gt; 2 mg/dL</p>
                   </div>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${data.labResults.kidneyIssues ? 'bg-purple-500 border-purple-500' : 'border-slate-300'}`}>
                   {data.labResults.kidneyIssues && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
             </div>
          </div>

        </div>
      </section>

      {/* Past Medical History */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Past Medical History
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 mb-4">
          <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors cursor-pointer">
            <input type="checkbox" checked={data.medicalHistory.priorBoneIssues} onChange={() => updateHistory('priorBoneIssues')} className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded" />
            <span className="text-slate-700">Prior Bone Issues (Fractures/Osteoporosis)</span>
          </label>
          <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors cursor-pointer">
            <input type="checkbox" checked={data.medicalHistory.priorKidneyIssues} onChange={() => updateHistory('priorKidneyIssues')} className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded" />
            <span className="text-slate-700">History of Kidney Disease</span>
          </label>
          <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors cursor-pointer md:col-span-2">
            <input type="checkbox" checked={data.medicalHistory.historyOfMGUS} onChange={() => updateHistory('historyOfMGUS')} className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded" />
            <span className="text-slate-700">History of Monoclonal Gammopathy (MGUS)</span>
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Other Relevant Medical History</label>
          <textarea
            className="w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 p-3 border"
            rows={2}
            placeholder="E.g., Hypertension, Diabetes, Family history of cancer..."
            value={data.medicalHistory.other}
            onChange={(e) => updateHistory('other', e.target.value)}
          />
        </div>
      </section>

      <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <label className="block text-sm font-medium text-slate-600 mb-2">Additional Clinical Notes</label>
        <textarea
          className="w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 p-3 border"
          rows={3}
          placeholder="Enter any other relevant observations or recent events..."
          value={data.notes}
          onChange={(e) => updateField('notes', e.target.value)}
        />
      </section>

    </div>
  );
};