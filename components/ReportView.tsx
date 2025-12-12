import React from 'react';
import { AnalysisResult, PatientData } from '../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportViewProps {
  result: AnalysisResult;
  patientData: PatientData;
  imagingNotes?: {
    ctScan: string;
    xray: string;
    ultrasound: string;
  };
  onReset: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({ result, patientData, imagingNotes, onReset }) => {
  
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Document Header - Burgundy Color (R=128, G=0, B=32 approx for rose-900/burgundy)
    doc.setFontSize(18);
    doc.setTextColor(136, 19, 55); // Rose-900 equivalent
    doc.text("Tenwek Myeloma Guard - AI Report", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
    
    // Patient Details
    doc.text(`Patient ID: ${patientData.patientId || 'N/A'}`, 14, 34);
    doc.text(`UHID: ${patientData.uhid || 'N/A'}`, 80, 34);
    doc.text(`Age/Gender: ${patientData.age} / ${patientData.gender}`, 14, 39);
    doc.text(`Location: ${patientData.location}`, 80, 39);

    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(`Risk Assessment: ${result.riskLevel}`, 14, 48);

    let yPos = 55;

    // Helper to add wrapped text rows for notes
    const addNoteRow = (label: string, text: string) => {
      if (!text) return;
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(label, 14, yPos);
      
      doc.setFont("helvetica", "normal");
      // Wrap text to fit within page width (approx 160 units for value column)
      const splitText = doc.splitTextToSize(text, 150); 
      doc.text(splitText, 45, yPos);
      
      // Calculate height of this row based on number of lines
      const lineHeight = 4; // approximate height per line
      const height = splitText.length * lineHeight;
      yPos += height + 3; // Add spacing
    };

    // Add Notes Section if any exist
    if (patientData.notes || imagingNotes?.ctScan || imagingNotes?.xray || imagingNotes?.ultrasound) {
       yPos += 2;
       doc.setFontSize(10);
       doc.setTextColor(136, 19, 55); // Burgundy
       doc.setFont("helvetica", "bold");
       doc.text("Clinical & Imaging Notes", 14, yPos);
       doc.line(14, yPos + 1, 196, yPos + 1); // Underline
       yPos += 7;
       
       doc.setTextColor(0);
       if (patientData.notes) addNoteRow("General Notes:", patientData.notes);
       if (imagingNotes?.ctScan) addNoteRow("CT Scan Notes:", imagingNotes.ctScan);
       if (imagingNotes?.xray) addNoteRow("X-Ray Notes:", imagingNotes.xray);
       if (imagingNotes?.ultrasound) addNoteRow("Ultrasound Notes:", imagingNotes.ultrasound);
       
       yPos += 5; // Spacer before table
    }

    // Prepare data for the table
    const findingsList = result.findings.map(f => `• ${f}`).join('\n');
    const recommendationsList = result.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n');

    // Generate table with columns as requested
    autoTable(doc, {
      startY: yPos,
      head: [['Risk Level', 'Summary', 'Key Findings', 'Recommendations']],
      body: [[
        result.riskLevel,
        result.summary,
        findingsList,
        recommendationsList
      ]],
      theme: 'grid',
      headStyles: {
        fillColor: [136, 19, 55], // Rose-900 / Burgundy
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
        overflow: 'linebreak',
        valign: 'top'
      },
      columnStyles: {
        0: { cellWidth: 25, fontStyle: 'bold', halign: 'center' }, // Risk
        1: { cellWidth: 50 }, // Summary
        2: { cellWidth: 55 }, // Findings
        3: { cellWidth: 'auto' } // Recommendations (takes remaining space)
      },
      // Ensure row colors reflect risk if possible, or just standard zebra
      didParseCell: (data) => {
        // Optional: Custom styling for the Risk cell content based on level
        if (data.section === 'body' && data.column.index === 0) {
           if (result.riskLevel === 'Critical') data.cell.styles.textColor = [220, 38, 38];
           else if (result.riskLevel === 'High') data.cell.styles.textColor = [234, 88, 12];
           else if (result.riskLevel === 'Moderate') data.cell.styles.textColor = [202, 138, 4];
           else data.cell.styles.textColor = [22, 163, 74];
        }
      }
    });

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Disclaimer: This AI tool is for decision support only and does not replace professional medical diagnosis.", 14, finalY);

    doc.save(`Tenwek_Myeloma_Report_${patientData.patientId || 'Patient'}.pdf`);
  };

  const handleExportCSV = () => {
    const headers = [
      'Patient ID', 'UHID', 'Age', 'Gender', 'Location', 
      'Risk Level', 'Summary', 'Findings', 'Recommendations', 
      'General Notes', 'CT Notes', 'X-Ray Notes', 'Ultrasound Notes',
      'Date'
    ];
    
    const findingsStr = result.findings.join('; ');
    const recommendationsStr = result.recommendations.join('; ');
    
    const row = [
      patientData.patientId || 'N/A',
      patientData.uhid || 'N/A',
      patientData.age,
      patientData.gender,
      patientData.location,
      result.riskLevel,
      `"${result.summary.replace(/"/g, '""')}"`, // Escape quotes
      `"${findingsStr.replace(/"/g, '""')}"`,
      `"${recommendationsStr.replace(/"/g, '""')}"`,
      `"${(patientData.notes || '').replace(/"/g, '""')}"`,
      `"${(imagingNotes?.ctScan || '').replace(/"/g, '""')}"`,
      `"${(imagingNotes?.xray || '').replace(/"/g, '""')}"`,
      `"${(imagingNotes?.ultrasound || '').replace(/"/g, '""')}"`,
      new Date().toLocaleString()
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + row.join(",");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Tenwek_Myeloma_Report_${patientData.patientId || 'Patient'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        
        <div className="flex gap-2">
          <button 
            onClick={handleExportPDF}
            className="bg-white hover:bg-slate-50 text-slate-700 font-medium py-2 px-4 rounded-lg transition-colors border border-slate-300 text-sm flex items-center gap-2 shadow-sm"
          >
            <svg className="w-4 h-4 text-rose-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            PDF
          </button>

          <button 
            onClick={handleExportCSV}
            className="bg-white hover:bg-slate-50 text-slate-700 font-medium py-2 px-4 rounded-lg transition-colors border border-slate-300 text-sm flex items-center gap-2 shadow-sm"
          >
            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            CSV
          </button>
          
          <button 
            onClick={onReset}
            className="bg-white/50 hover:bg-white/80 text-inherit font-medium py-2 px-4 rounded-lg transition-colors border border-transparent hover:border-current text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            New Assessment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Summary & Findings */}
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-rose-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-600 flex-shrink-0"></span>
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