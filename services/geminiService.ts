import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { PatientData, AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface ImageInput {
  base64: string;
  mimeType: string;
}

interface ImagingData {
  ctScan: ImageInput | null;
  xray: ImageInput | null;
  ultrasound: ImageInput | null;
}

export const analyzePatientCase = async (
  data: PatientData,
  imaging: ImagingData
): Promise<AnalysisResult> => {
  
  const prompt = `
    You are "Myeloma Guard", an expert AI oncology assistant at Tenwek Hospital in Bomet County, Kenya. 
    Multiple Myeloma is rampant in this region (specifically Bomet East).
    
    Your goal is to analyze patient symptoms, lab data, and any provided diagnostic imaging (CT, X-Ray, Ultrasound) to predict the early stages of Multiple Myeloma and support the oncologist's diagnosis.

    **Patient Context:**
    ${data.patientId ? `- Patient ID: ${data.patientId}` : ''}
    ${data.uhid ? `- UHID: ${data.uhid}` : ''}
    - Age: ${data.age}
    - Gender: ${data.gender}
    ${data.gender === 'Female' ? `- Pregnancy Status: ${data.isPregnant ? 'PREGNANT' : 'Not Pregnant'}` : ''}
    - Location: ${data.location} (High risk zone if Bomet East)

    **Past Medical History:**
    ${data.medicalHistory.priorBoneIssues !== 'None' ? `- Prior Bone Issues (Fractures/Osteoporosis): ${data.medicalHistory.priorBoneIssues}` : ''}
    ${data.medicalHistory.priorKidneyIssues !== 'None' ? `- History of Kidney Disease: ${data.medicalHistory.priorKidneyIssues}` : ''}
    ${data.medicalHistory.historyOfMGUS ? '- History of Monoclonal Gammopathy (MGUS)' : ''}
    ${data.medicalHistory.other ? `- Other History: ${data.medicalHistory.other}` : ''}
    ${data.medicalHistory.priorBoneIssues === 'None' && data.medicalHistory.priorKidneyIssues === 'None' && !data.medicalHistory.historyOfMGUS && !data.medicalHistory.other ? '- No significant history reported' : ''}

    **Reported Symptoms:**
    ${Object.entries(data.symptoms).filter(([_, v]) => v).map(([k]) => `- ${k.replace(/([A-Z])/g, ' $1').toLowerCase()}`).join('\n')}

    **Lab/Clinical Indicators:**
    ${Object.entries(data.labResults).filter(([k, v]) => k !== 'mProteinValue' && v).map(([k]) => {
      if (k === 'kidneyIssues') return '- renal insufficiency / high creatinine (kidney failure)';
      if (k === 'mProteinPresent') return `- M-Protein Present (SPEP)${data.labResults.mProteinValue > 0 ? `: Level ${data.labResults.mProteinValue} g/dL` : ''}`;
      return `- ${k.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
    }).join('\n')}

    **Bone Marrow Biopsy (BMA):**
    - Plasma Cell Percentage: ${data.boneMarrowBiopsy.plasmaCellPercentage}%
    - Abnormal/Clonal Plasma Cells Detected: ${data.boneMarrowBiopsy.abnormalPlasmaCells ? 'YES' : 'No'}

    **Additional Notes:**
    ${data.notes}

    **Specific Disease Markers to Watch For (CRAB & Local Indicators):**
    1. Respiratory issues (Pneumonia/Blood clots/Blood stains in sputum).
    2. M-protein spikes (SPEP test).
    3. Bone issues: Fractures without injury, lytic lesions, osteoporosis, weak neck vertebrae.
    4. Knee joint pain/swelling.
    5. Anemia (Low blood levels).

    **Treatment Contraindications & Warnings (CRITICAL):**
    1. **Pregnancy:** If the patient is PREGNANT, explicitly advise the oncologist **NOT** to start standard chemotherapy.
    2. **Kidney Failure:** If the patient has Renal Insufficiency / High Creatinine, explicitly advise **AGAINST** starting standard chemotherapy without first stabilizing renal function or adjusting protocols.

    **Task:**
    Analyze the provided information and provided images to assess the likelihood of Multiple Myeloma. 
    
    **Imaging Interpretation Instructions:**
    - If a **CT Scan** is provided: Look for lytic lesions (punched-out holes in bone), fractures, or plasmacytomas.
    - If an **X-Ray** is provided: Look for "punched-out" lytic lesions, diffuse osteopenia, or pathological fractures (especially in vertebrae/skull/long bones).
    - If an **Ultrasound** is provided: Assess for soft tissue plasmacytomas or renal involvement if visible. Note that US is less typical for bone but may show associated soft tissue masses.
    
    Return a valid JSON object with the following structure:
    {
      "riskLevel": "Low" | "Moderate" | "High" | "Critical",
      "summary": "A concise executive summary for the oncologist (2-3 sentences).",
      "findings": ["List of key supporting clinical findings derived from symptoms, lab data, AND image interpretation."],
      "recommendations": ["List of specific next steps. INCLUDE WARNINGS ABOUT CHEMO IF PREGNANT OR KIDNEY FAILURE IS DETECTED."]
    }
  `;

  const parts: any[] = [{ text: prompt }];

  if (imaging.ctScan) {
    parts.push({ text: "Attached Image 1: CT Scan" });
    parts.push({
      inlineData: {
        data: imaging.ctScan.base64,
        mimeType: imaging.ctScan.mimeType
      }
    });
  }

  if (imaging.xray) {
    parts.push({ text: "Attached Image 2: X-Ray" });
    parts.push({
      inlineData: {
        data: imaging.xray.base64,
        mimeType: imaging.xray.mimeType
      }
    });
  }

  if (imaging.ultrasound) {
    parts.push({ text: "Attached Image 3: Ultrasound" });
    parts.push({
      inlineData: {
        data: imaging.ultrasound.base64,
        mimeType: imaging.ultrasound.mimeType
      }
    });
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        temperature: 0.4, // Lower temperature for more analytical/medical output
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const parsed = JSON.parse(text);
    return {
      ...parsed,
      rawResponse: text
    };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze patient data. Please try again.");
  }
};