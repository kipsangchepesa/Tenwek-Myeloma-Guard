import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Layout } from './components/Layout';
import { PatientForm } from './components/PatientForm';
import { ImageUpload } from './components/ImageUpload';
import { ReportView } from './components/ReportView';
import { About } from './components/About';
import { ConfirmationDialog } from './components/ConfirmationDialog';
import { analyzePatientCase } from './services/geminiService';
import { PatientData, AnalysisResult, AppStep } from './types';

const INITIAL_DATA: PatientData = {
  patientId: '',
  uhid: '',
  age: '',
  gender: '',
  location: '',
  isPregnant: false,
  medicalHistory: {
    priorBoneIssues: 'None',
    priorKidneyIssues: 'None',
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
  boneMarrowBiopsy: {
    plasmaCellPercentage: 0,
    abnormalPlasmaCells: false,
  },
  notes: '',
};

interface ImageData {
  base64: string;
  mimeType: string;
}

const App: React.FC = () => {
  const [view, setView] = useState<'assessment' | 'about'>('assessment');
  const [step, setStep] = useState<AppStep>(AppStep.INTAKE);
  const [patientData, setPatientData] = useState<PatientData>(INITIAL_DATA);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const [ctScanData, setCtScanData] = useState<ImageData | null>(null);
  const [xrayData, setXrayData] = useState<ImageData | null>(null);
  const [ultrasoundData, setUltrasoundData] = useState<ImageData | null>(null);

  // Notes specific to each imaging type
  const [ctScanNote, setCtScanNote] = useState<string>("");
  const [xrayNote, setXrayNote] = useState<string>("");
  const [ultrasoundNote, setUltrasoundNote] = useState<string>("");

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleReset = () => {
    setPatientData(INITIAL_DATA);
    setFormErrors({});
    setCtScanData(null);
    setXrayData(null);
    setUltrasoundData(null);
    setCtScanNote("");
    setXrayNote("");
    setUltrasoundNote("");
    setAnalysisResult(null);
    setStep(AppStep.INTAKE);
    setError(null);
    setView('assessment');
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    if (!patientData.age) {
      errors.age = "Age is required.";
      isValid = false;
    } else {
      const ageNum = parseInt(patientData.age);
      if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
        errors.age = "Please enter a valid age.";
        isValid = false;
      }
    }

    if (!patientData.gender) {
      errors.gender = "Gender is required.";
      isValid = false;
    }

    if (!patientData.location) {
      errors.location = "Location is required.";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handlePatientDataChange = (newData: PatientData) => {
    setPatientData(newData);
    // Clear errors as user types
    const newErrors = { ...formErrors };
    if (newData.age && newErrors.age) delete newErrors.age;
    if (newData.gender && newErrors.gender) delete newErrors.gender;
    if (newData.location && newErrors.location) delete newErrors.location;
    if (Object.keys(newErrors).length !== Object.keys(formErrors).length) {
      setFormErrors(newErrors);
    }
  };

  const handleExportForm = () => {
    const doc = new jsPDF();

    // Export Header in Burgundy
    doc.setFontSize(18);
    doc.setTextColor(136, 19, 55); // Burgundy
    doc.text("Tenwek Myeloma Guard - Patient Intake Data", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Recorded: ${new Date().toLocaleString()}`, 14, 28);
    
    // Demographics Table
    autoTable(doc, {
      startY: 35,
      head: [['Category', 'Details']],
      body: [
        ['Patient ID', patientData.patientId || 'N/A'],
        ['UHID', patientData.uhid || 'N/A'],
        ['Demographics', `${patientData.age} yrs, ${patientData.gender} ${patientData.isPregnant ? '(Pregnant)' : ''}`],
        ['Location', patientData.location],
      ],
      theme: 'striped',
      headStyles: { fillColor: [136, 19, 55] }
    });

    // Clinical Data
    const activeSymptoms = Object.entries(patientData.symptoms)
      .filter(([_, v]) => v)
      .map(([k]) => k.replace(/([A-Z])/g, ' $1').toLowerCase())
      .join(', ');

    const activeLabs = Object.entries(patientData.labResults)
      .filter(([k, v]) => k !== 'mProteinValue' && v)
      .map(([k]) => k.replace(/([A-Z])/g, ' $1').toLowerCase())
      .join(', ');

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['Clinical Indicators', 'Status']],
      body: [
        ['Symptoms', activeSymptoms || 'None reported'],
        ['Lab Findings', activeLabs || 'None flagged'],
        ['M-Protein Level', `${patientData.labResults.mProteinValue} g/dL`],
        ['BMA Plasma Cells', `${patientData.boneMarrowBiopsy.plasmaCellPercentage}% (${patientData.boneMarrowBiopsy.abnormalPlasmaCells ? 'Abnormal' : 'Normal'})`],
        ['History', `Bone: ${patientData.medicalHistory.priorBoneIssues}, Kidney: ${patientData.medicalHistory.priorKidneyIssues}, MGUS: ${patientData.medicalHistory.historyOfMGUS ? 'Yes' : 'No'}`]
      ],
      theme: 'striped',
      headStyles: { fillColor: [136, 19, 55] }
    });

    // Notes
    let combinedNotes = patientData.notes || 'None';
    if (ctScanNote) combinedNotes += `\nCT Note: ${ctScanNote}`;
    if (xrayNote) combinedNotes += `\nX-Ray Note: ${xrayNote}`;
    if (ultrasoundNote) combinedNotes += `\nUltrasound Note: ${ultrasoundNote}`;

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['Notes & Observations']],
      body: [[combinedNotes]],
      theme: 'striped',
      headStyles: { fillColor: [136, 19, 55] }
    });

    doc.save(`Intake_Form_${patientData.patientId || 'Patient'}.pdf`);
  };

  const handleAnalyzeClick = () => {
    if (!validateForm()) {
      setError("Please fill in all required fields marked in red.");
      return;
    }
    setError(null);
    setShowConfirmation(true);
  };

  const handleConfirmAnalysis = async () => {
    setShowConfirmation(false);
    setStep(AppStep.ANALYZING);
    setError(null);

    // Combine main notes with specific image notes for the analysis payload
    let combinedNotes = patientData.notes;
    if (ctScanNote.trim()) combinedNotes += `\n\n[CT Scan Note]: ${ctScanNote.trim()}`;
    if (xrayNote.trim()) combinedNotes += `\n\n[X-Ray Note]: ${xrayNote.trim()}`;
    if (ultrasoundNote.trim()) combinedNotes += `\n\n[Ultrasound Note]: ${ultrasoundNote.trim()}`;

    const dataForAnalysis = {
      ...patientData,
      notes: combinedNotes
    };

    try {
      const result = await analyzePatientCase(
        dataForAnalysis,
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
    <Layout currentView={view} onNavigate={setView}>
      <ConfirmationDialog 
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmAnalysis}
        data={patientData}
        imaging={{
          hasCt: !!ctScanData,
          hasXray: !!xrayData,
          hasUltrasound: !!ultrasoundData
        }}
      />

      {view === 'about' ? (
        <About />
      ) : (
        <>
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

              <PatientForm 
                data={patientData} 
                onChange={handlePatientDataChange} 
                errors={formErrors}
              />
              
              <div className="mt-8 space-y-4">
                <h3 className="text-lg font-semibold text-slate-800">Diagnostic Imaging (Optional)</h3>
                <p className="text-sm text-slate-500 mb-4">Upload available scans to assist AI interpretation.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col h-full gap-2">
                      <div className="flex-grow">
                        <ImageUpload 
                          title="CT Scan"
                          onImageSelect={(base64, mimeType) => setCtScanData({ base64, mimeType })}
                          onClear={() => setCtScanData(null)}
                        />
                      </div>
                      <textarea
                        className="w-full rounded-md border-slate-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 p-2 text-sm border"
                        rows={2}
                        placeholder="Specific notes for CT Scan..."
                        value={ctScanNote}
                        onChange={(e) => setCtScanNote(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col h-full gap-2">
                      <div className="flex-grow">
                        <ImageUpload 
                          title="X-Ray"
                          onImageSelect={(base64, mimeType) => setXrayData({ base64, mimeType })}
                          onClear={() => setXrayData(null)}
                        />
                      </div>
                      <textarea
                        className="w-full rounded-md border-slate-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 p-2 text-sm border"
                        rows={2}
                        placeholder="Specific notes for X-Ray..."
                        value={xrayNote}
                        onChange={(e) => setXrayNote(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col h-full gap-2">
                      <div className="flex-grow">
                        <ImageUpload 
                          title="Ultrasound"
                          onImageSelect={(base64, mimeType) => setUltrasoundData({ base64, mimeType })}
                          onClear={() => setUltrasoundData(null)}
                        />
                      </div>
                      <textarea
                        className="w-full rounded-md border-slate-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 p-2 text-sm border"
                        rows={2}
                        placeholder="Specific notes for Ultrasound..."
                        value={ultrasoundNote}
                        onChange={(e) => setUltrasoundNote(e.target.value)}
                      />
                    </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end pb-12 gap-4">
                <button
                  onClick={handleExportForm}
                  className="bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3 px-6 rounded-lg border border-slate-300 shadow-sm transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export Data
                </button>
                <button
                  onClick={handleAnalyzeClick}
                  className="bg-rose-800 hover:bg-rose-900 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
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
                <div className="absolute top-0 left-0 w-full h-full border-4 border-rose-200 rounded-full opacity-25 animate-ping"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-t-rose-800 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              </div>
              <h2 className="text-xl font-semibold text-slate-800">Analyzing Case Data...</h2>
              <p className="text-slate-500 max-w-md">
                Gemini AI is reviewing symptoms, lab indicators, and imaging for Myeloma markers (CRAB criteria)...
              </p>
            </div>
          )}

          {step === AppStep.REPORT && analysisResult && (
            <ReportView 
              result={analysisResult} 
              patientData={patientData}
              imagingNotes={{
                ctScan: ctScanNote,
                xray: xrayNote,
                ultrasound: ultrasoundNote
              }}
              onReset={handleReset} 
            />
          )}
        </>
      )}
    </Layout>
  );
};

export default App;