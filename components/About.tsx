import React from 'react';

export const About: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          About Tenwek Myeloma Guard
        </h2>
        
        <div className="prose prose-slate max-w-none text-slate-600">
          <p className="text-lg leading-relaxed mb-6">
            The <strong>Tenwek Myeloma Guard AI</strong> is a specialized diagnostic support tool developed to combat the high prevalence of Multiple Myeloma in Bomet County, specifically within the Bomet East constituency.
          </p>

          <h3 className="text-xl font-semibold text-slate-800 mt-8 mb-3">Our Purpose</h3>
          <p className="mb-4">
            This AI model acts as a "digital guard," assisting oncologists at Tenwek Hospital in identifying early-stage Multiple Myeloma. The disease often presents with symptoms that mimic common conditions like pneumonia (due to blood clots) or general bone pain, making early diagnosis challenging but critical.
          </p>
          <p className="mb-4">
            By analyzing a combination of specific clinical symptoms, lab results (such as M-Protein spikes from SPEP tests), and diagnostic imaging (CT Scans showing lytic lesions), this tool provides a rapid, data-driven risk assessment to expedite patient care.
          </p>

          <h3 className="text-xl font-semibold text-slate-800 mt-8 mb-3">The Tenwek Initiative</h3>
          <p className="mb-4">
            Recognizing the unique epidemiological patterns in Bomet East, Tenwek Hospital is pioneering the use of artificial intelligence to bridge the gap between symptom onset and diagnosis. This initiative aims to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Screen patients presenting with recurrent pneumonia or unexplained fractures for underlying plasma cell disorders.</li>
            <li>Provide oncologists with a "second opinion" based on comprehensive data analysis.</li>
            <li>Improve survival rates through earlier detection and intervention.</li>
          </ul>

          <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mt-8 rounded-r-lg">
            <h4 className="font-bold text-orange-800 text-sm uppercase tracking-wide mb-1">Important Disclaimer & Limitations</h4>
            <p className="text-sm text-orange-700">
              This AI tool is designed for <strong>clinical decision support only</strong>. It is not a replacement for professional medical judgment, biopsy confirmation, or official diagnosis by a qualified oncologist. 
              <br/><br/>
              The model's recommendations are based on statistical patterns and the provided data. False positives and false negatives are possible. All treatment decisions must be made by the attending physician at Tenwek Hospital.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};