import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { PatientForm } from './components/PatientForm';
import { ImageUpload } from './components/ImageUpload';
import { ReportView } from './components/ReportView';
import { analyzePatientCase } from './services/geminiService';
import { PatientData, AnalysisResult, AppStep } from './types';

const INITIAL_DATA: PatientData = {
  age: '',
  gender: '',
  location: '',
  isPregnant: false,
  medicalHistory: {
    priorBoneIssues: false,
    priorKidneyIssues: false,
    historyOfMGUS: false,
    other: '',
  },
  symptoms: {
    pneumoniaLike: false,
    bloodInSputum: false,
    bonePain: false,
    jointSwelling: false,
    unexplainedFractures: false,
    fatigue: false,
    weightLoss: false,
  },
  labResults: {
    mProteinPresent: false,
    mProteinValue: 0,
    anemia: false,
    hypercalcemia: false,
    kidneyIssues: false,
  },
  notes: '',
};

interface ImageData {
  base64: string;
  mimeType: string;
}

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.INTAKE);
  const [patientData, setPatientData] = useState<PatientData>(INITIAL_DATA);
  
  const [ctScanData, setCtScanData] = useState<ImageData | null>(null);
  const [xrayData, setXrayData] = useState<ImageData | null>(null);
  const [ultrasoundData, setUltrasoundData] = useState<ImageData | null>(null);

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    setPatientData(INITIAL_DATA);
    setCtScanData(null);
    setXrayData(null);
    setUltrasoundData(null);
    setAnalysisResult(null);
    setStep(AppStep.INTAKE);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!patientData.age || !patientData.gender || !patientData.location) {
      setError("Please complete the basic patient demographics.");
      return;
    }

    setStep(AppStep.ANALYZING);
    setError(null);

    try {
      const result = await analyzePatientCase(
        patientData,
        {
          ctScan: ctScanData,
          xray: xrayData,
          ultrasound: ultrasoundData
        }
      );
      setAnalysisResult(result);
      setStep(AppStep.REPORT);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setStep(AppStep.INTAKE);
    }
  };

  return (
    <Layout>
      {step === AppStep.INTAKE && (
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800">New Patient Assessment</h2>
            <p className="text-slate-500">Enter patient details, symptoms, and optional imaging for screening.</p>
          </div>
          
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <PatientForm data={patientData} onChange={setPatientData} />
          
          <div className="mt-8 space-y-4">
             <h3 className="text-lg font-semibold text-slate-800">Diagnostic Imaging (Optional)</h3>
             <p className="text-sm text-slate-500 mb-4">Upload available scans to assist AI interpretation.</p>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="h-full">
                  <ImageUpload 
                    title="CT Scan"
                    onImageSelect={(base64, mimeType) => setCtScanData({ base64, mimeType })}
                    onClear={() => setCtScanData(null)}
                  />
                </div>
                <div className="h-full">
                  <ImageUpload 
                    title="X-Ray"
                    onImageSelect={(base64, mimeType) => setXrayData({ base64, mimeType })}
                    onClear={() => setXrayData(null)}
                  />
                </div>
                <div className="h-full">
                  <ImageUpload 
                    title="Ultrasound"
                    onImageSelect={(base64, mimeType) => setUltrasoundData({ base64, mimeType })}
                    onClear={() => setUltrasoundData(null)}
                  />
                </div>
             </div>
          </div>

          <div className="mt-8 flex justify-end pb-12">
            <button
              onClick={handleAnalyze}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Generate Risk Assessment
            </button>
          </div>
        </div>
      )}

      {step === AppStep.ANALYZING && (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
          <div className="relative w-20 h-20">
             <div className="absolute top-0 left-0 w-full h-full border-4 border-teal-200 rounded-full opacity-25 animate-ping"></div>
             <div className="absolute top-0 left-0 w-full h-full border-4 border-t-teal-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-slate-800">Analyzing Case Data...</h2>
          <p className="text-slate-500 max-w-md">
            Gemini AI is reviewing symptoms, lab indicators, and imaging for Myeloma markers (CRAB criteria)...
          </p>
        </div>
      )}

      {step === AppStep.REPORT && analysisResult && (
        <ReportView result={analysisResult} onReset={handleReset} />
      )}
    </Layout>
  );
};

export default App;