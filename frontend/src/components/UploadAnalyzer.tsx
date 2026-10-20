'use client';
import { useState } from 'react';

export default function UploadAnalyzer() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'complete'>('idle');
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setStatus('idle');
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setStatus('analyzing');
    
    const formData = new FormData();
    formData.append('file', image);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/analyze', {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) throw new Error('Analysis failed');
      const data = await res.json();
      setResult(data);
      setStatus('complete');
    } catch (error) {
      console.error("Analysis failed", error);
      alert("Failed to connect to backend.");
      setStatus('idle');
    }
  };

  return (
    <div className="w-[85%] sm:w-[70%] max-w-xl mx-auto bg-white rounded-xl border border-slate-300 shadow-2xl flex flex-col p-4 max-h-full">
      
      {!result ? (
        <div className="flex flex-col items-center w-full h-full justify-center">
          <div className="w-full border-2 border-dashed border-blue-400 rounded-lg p-4 bg-blue-50/50 text-center cursor-pointer relative h-36 flex flex-col justify-center items-center hover:bg-blue-100 transition-colors overflow-hidden">
            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            
            {preview ? (
              <img 
                src={preview} 
                alt="Selected X-ray" 
                className="h-full w-auto max-w-[200px] object-contain rounded shadow-sm" 
              />
            ) : (
              <div>
                <div className="text-3xl mb-1">📸</div>
                <h3 className="text-base font-bold text-slate-800">Select Medical Image</h3>
                <p className="text-slate-500 mt-1 text-xs">Click or Drag & Drop</p>
              </div>
            )}
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={!image || status === 'analyzing'}
            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 rounded-lg font-bold transition-all shadow-md disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
          >
            {status === 'analyzing' ? 'Processing...' : 'Run Analysis'}
          </button>
        </div>
      ) : (
        <div className="w-full flex flex-col h-full overflow-hidden">
          <h2 className="text-base sm:text-lg font-bold text-center border-b pb-2 mb-2 shrink-0">Analysis Complete</h2>
          
          <div className="flex justify-center bg-slate-100 rounded-lg p-2 mb-2 h-28 shrink-0 overflow-hidden w-full">
            <img 
              src={preview} 
              alt="Analyzed X-ray" 
              className="h-full w-auto max-w-[200px] object-contain rounded shadow-md" 
            />
          </div>

          <div className="grid grid-cols-2 gap-2 mb-2 shrink-0">
            {/* Dynamic Green/Red Colors based on result.prediction */}
            <div className={`p-2 rounded-lg text-center border-2 ${result.prediction === 'NORMAL' ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'}`}>
              <p className={`text-[9px] font-bold uppercase mb-0.5 ${result.prediction === 'NORMAL' ? 'text-green-700' : 'text-red-700'}`}>Prediction</p>
              <p className={`text-base font-black ${result.prediction === 'NORMAL' ? 'text-green-700' : 'text-red-700'}`}>{result.prediction}</p>
            </div>
            
            <div className="bg-blue-100 border-2 border-blue-500 rounded-lg p-2 text-center">
              <p className="text-[9px] font-bold uppercase text-blue-700 mb-0.5">Confidence</p>
              <p className="text-base font-black text-blue-700">{(result.confidence * 100).toFixed(1)}%</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-3 overflow-hidden">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 overflow-hidden">
              <h4 className="font-bold text-slate-800 text-[10px] mb-0.5">Agent Findings</h4>
              <p className="text-slate-600 text-[10px] sm:text-xs leading-tight line-clamp-2">{result.report.explanation}</p>
            </div>
            
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-2 overflow-hidden">
              <h4 className="font-bold text-rose-800 text-[10px] mb-0.5">Limitations</h4>
              <p className="text-rose-700 text-[10px] sm:text-xs leading-tight line-clamp-2">{result.report.limitations}</p>
            </div>
          </div>

          <button 
            onClick={() => { setResult(null); setImage(null); setPreview(''); setStatus('idle'); }}
            className="w-full bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black text-white py-2 rounded-lg font-bold text-xs transition-all mt-auto shrink-0 shadow-md"
          >
            Analyze Another Image
          </button>
        </div>
      )}
    </div>
  );
}