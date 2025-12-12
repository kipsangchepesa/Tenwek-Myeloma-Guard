export interface PatientData {
  age: string;
  gender: string;
  location: string;
  isPregnant?: boolean;
  medicalHistory: {
    priorBoneIssues: boolean;
    priorKidneyIssues: boolean;
    historyOfMGUS: boolean; // Monoclonal Gammopathy of Undetermined Significance
    other: string;
  };
  symptoms: {
    pneumoniaLike: boolean;
    bloodInSputum: boolean;
    bonePain: boolean;
    jointSwelling: boolean;
    unexplainedFractures: boolean;
    fatigue: boolean;
    weightLoss: boolean;
  };
  labResults: {
    mProteinPresent: boolean;
    mProteinValue: number; // g/dL
    anemia: boolean; // low blood levels
    hypercalcemia: boolean;
    kidneyIssues: boolean;
  };
  notes: string;
}

export interface AnalysisResult {
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  summary: string;
  findings: string[];
  recommendations: string[];
  rawResponse: string;
}

export enum AppStep {
  INTAKE = 'INTAKE',
  ANALYZING = 'ANALYZING',
  REPORT = 'REPORT'
}