import React from 'react';
import { PatientData } from '../types';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: PatientData;
  imaging: {
    hasCt: boolean;
    hasXray: boolean;
    hasUltrasound: boolean;
  };
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  data,
  imaging
}) => {
  if (!isOpen) return null;

  const activeSymptoms = Object.entries(data.symptoms)
    .filter(([_, v]) => v)
    .map(([k]) => k.replace(/([A-Z])/g, ' $1').toLowerCase());

  const activeLabs = Object.entries(data.labResults)
    .filter(([k, v]) => k !== 'mProteinValue' && v)
    .map(([k]) => k.replace(/([A-Z])/g, ' $1').toLowerCase());
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 flex flex-col">
        
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Confirm Patient Data
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Please review the key indicators before generating the AI risk assessment.
          </p>
        </div>

        <div className="p-6 space-y-5 text-sm">
          
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Patient</span>
              <span className="font-semibold text-slate-700 text-base">{data.age} yrs, {data.gender}</span>
              {data.patientId && <span className="block text-xs text-slate-500">ID: {data.patientId}</span>}
              {data.uhid && <span className="block text-xs text-slate-500">UHID: {data.uhid}</span>}
              {data.isPregnant && <span className="block text-pink-600 text-xs font-bold mt-0.5">Pregnant</span>}
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Location</span>
              <span className="font-semibold text-slate-700 text-base">{data.location}</span>
            </div>
          </div>

          <div>
             <span className="block text-xs text-slate-500 font-semibold mb-2">Reported Symptoms ({activeSymptoms.length})</span>
             {activeSymptoms.length > 0 ? (
               <div className="flex flex-wrap gap-2">
                 {activeSymptoms.map((s, i) => (
                   <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100 text-xs capitalize font-medium">
                     {s}
                   </span>
                 ))}
               </div>
             ) : (
               <span className="text-slate-400 italic">No specific symptoms selected</span>
             )}
          </div>

          <div>
             <span className="block text-xs text-slate-500 font-semibold mb-2">Abnormal Findings</span>
             {activeLabs.length > 0 || data.boneMarrowBiopsy.plasmaCellPercentage > 0 || data.medicalHistory.priorBoneIssues !== 'None' || data.medicalHistory.priorKidneyIssues !== 'None' ? (
               <ul className="space-y-1.5 bg-white border border-slate-100 rounded-lg p-3">
                 {data.medicalHistory.priorBoneIssues !== 'None' && (
                    <li className="flex items-center gap-2 text-slate-700">
                     <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                     History: {data.medicalHistory.priorBoneIssues} Bone Issues
                   </li>
                 )}
                 {data.medicalHistory.priorKidneyIssues !== 'None' && (
                    <li className="flex items-center gap-2 text-slate-700">
                     <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                     History: {data.medicalHistory.priorKidneyIssues} Kidney Issues
                   </li>
                 )}
                 {activeLabs.map((l, i) => (
                   <li key={i} className="flex items-center gap-2 text-slate-700 capitalize">
                     <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                     {l}
                   </li>
                 ))}
                 {data.labResults.mProteinPresent && (
                    <li className="flex items-center gap-2 text-slate-700 font-medium">
                     <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                     M-Protein Level: {data.labResults.mProteinValue} g/dL
                   </li>
                 )}
                 {data.boneMarrowBiopsy.plasmaCellPercentage > 0 && (
                   <li className="flex items-center gap-2 text-slate-700">
                     <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                     BMA Plasma Cells: {data.boneMarrowBiopsy.plasmaCellPercentage}%
                   </li>
                 )}
               </ul>
             ) : (
               <span className="text-slate-400 italic">No major abnormal findings flagged</span>
             )}
          </div>

          <div className="pt-2">
             <span className="block text-xs text-slate-500 font-semibold mb-2">Diagnostic Imaging</span>
             <div className="flex gap-2">
               {imaging.hasCt ? (
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100 font-semibold flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> CT Scan
                  </span>
               ) : <span className="px-2 py-1 text-slate-400 text-xs border border-slate-100 rounded bg-slate-50">No CT</span>}
               
               {imaging.hasXray ? (
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100 font-semibold flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> X-Ray
                  </span>
               ) : <span className="px-2 py-1 text-slate-400 text-xs border border-slate-100 rounded bg-slate-50">No X-Ray</span>}
               
               {imaging.hasUltrasound ? (
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100 font-semibold flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Ultrasound
                  </span>
               ) : <span className="px-2 py-1 text-slate-400 text-xs border border-slate-100 rounded bg-slate-50">No US</span>}
             </div>
          </div>

        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-xl">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-600 font-medium hover:text-slate-800 transition-colors hover:bg-white rounded-lg"
          >
            Go Back & Edit
          </button>
          <button 
            onClick={onConfirm}
            className="bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-95 flex items-center gap-2"
          >
            <span>Proceed to Analysis</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
};