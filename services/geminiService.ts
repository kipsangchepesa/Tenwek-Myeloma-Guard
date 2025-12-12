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
    
    **Role & Capability:**
    You are powered by advanced computer vision capabilities. You must simulate the analytical rigor of state-of-the-art **Python medical imaging libraries** (such as MONAI, PyTorch, SimpleITK, and OpenCV) to interpret the provided scans. 
    
    Apply "radiomics-like" feature extraction logic:
    1. **Texture Analysis:** Detect heterogeneity in bone marrow.
    2. **Edge Detection:** Identify "punched-out" lytic lesions with sharp borders.
    3. **Density Segmentation:** Assess osteopenia (reduced bone density) in vertebrae and long bones.
    
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
    
    **Imaging Interpretation Instructions (Simulating Python Library Analysis):**
    - **CT Scan:** Scan for lytic lesions (focal low-density areas) and cortical destruction.
    - **X-Ray:** Detect lucent "punched-out" lesions, endosteal scalloping, and generalized osteopenia.
    - **Ultrasound:** Analyze for soft tissue masses (plasmacytomas) or renal echogenicity changes.
    
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
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        // Enable thinking for deep reasoning about medical data and image analysis
        thinkingConfig: { thinkingBudget: 16384 },
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

export const analyzeXrayImage = async (
  base64: string, 
  mimeType: string
): Promise<string> => {
  const prompt = `
    You are an expert radiologist assistant at Tenwek Hospital. 
    Analyze this X-Ray image specifically for signs of Multiple Myeloma using advanced computer vision simulation.
    
    **Methodology:**
    Simulate the output of a **Python-based lesion detection algorithm**. 
    1. Scan for **"Punched-out" lytic lesions** (radiolucent spots) in skull, long bones, or pelvis.
    2. Evaluate **Bone Density (Osteopenia)**: Look for cortical thinning.
    3. Identify **Pathological fractures**: Compression fractures in vertebrae.
    
    Provide a concise clinical summary of findings (max 3-4 sentences). 
    If no obvious signs are present, state "No specific radiological evidence of myeloma lesions detected in this view."
    If the image is not an X-Ray or is unreadable, please state that.
  `;

  const parts: any[] = [
    { text: prompt },
    {
      inlineData: {
        data: base64,
        mimeType: mimeType
      }
    }
  ];

  try {
     const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: {
        // Enable thinking for detailed image inspection
        thinkingConfig: { thinkingBudget: 8192 },
      }
    });

    return response.text || "No analysis could be generated.";
  } catch (error) {
    console.error("X-Ray Analysis Error:", error);
    throw new Error("Failed to analyze X-Ray.");
  }
};