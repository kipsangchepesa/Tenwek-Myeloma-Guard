import React, { useState, useRef } from 'react';

interface ImageUploadProps {
  title: string;
  onImageSelect: (base64: string, mimeType: string) => void;
  onClear: () => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ title, onImageSelect, onClear }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        
        // Extract base64 data and mime type
        const base64Data = result.split(',')[1];
        onImageSelect(base64Data, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClear();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
      <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {title}
      </h2>
      
      {!preview ? (
        <div 
          className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-teal-500 transition-colors cursor-pointer bg-slate-50 flex-grow flex flex-col justify-center items-center"
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*"
          />
          <div className="flex flex-col items-center justify-center">
            <svg className="w-10 h-10 text-slate-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-slate-600 font-medium text-sm">Upload {title}</p>
            <p className="text-xs text-slate-400 mt-1">JPG, PNG (Max 5MB)</p>
          </div>
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-black flex-grow flex items-center justify-center bg-slate-900">
          <img src={preview} alt={`${title} Preview`} className="max-h-64 w-full object-contain" />
          <button 
            onClick={clearImage}
            className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 shadow-md transition-colors"
            title="Remove Image"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-1 text-center backdrop-blur-sm">
            Ready for Analysis
          </div>
        </div>
      )}
    </div>
  );
};