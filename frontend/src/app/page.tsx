import UploadAnalyzer from '../components/UploadAnalyzer';

export default function Home() {
  return (
    /* ADDED: A soft blue-to-teal gradient background that fills the entire screen */
    <main className="h-screen w-screen overflow-hidden bg-gradient-to-br from-blue-50 via-slate-100 to-teal-50 font-sans text-slate-900 flex flex-col">
      
      {/* Ultra-thin Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-600 py-3 shadow-md text-white flex-shrink-0 z-10">
        <div className="max-w-6xl mx-auto flex flex-col items-center justify-center text-center gap-1">
          <h1 className="text-2xl font-extrabold tracking-tight">
            Agentic <span className="text-teal-300">MedVision</span>
          </h1>
          <span className="px-3 py-0.5 bg-red-600 rounded-full text-[10px] font-bold text-white shadow-sm border border-red-400 uppercase tracking-wider">
            Educational Demo
          </span>
        </div>
      </div>

      {/* Centered Main Area that fills remaining space */}
      <div className="flex-grow flex items-center justify-center p-2 overflow-hidden">
        <UploadAnalyzer />
      </div>
      
    </main>
  );
}