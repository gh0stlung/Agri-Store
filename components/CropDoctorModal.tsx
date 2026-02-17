import React, { useState } from 'react';
import { X, Sprout, Sparkles, Loader2, Stethoscope, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface CropDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CropDoctorModal: React.FC<CropDoctorModalProps> = ({ isOpen, onClose }) => {
  const [crop, setCrop] = useState('');
  const [issue, setIssue] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState('');

  const CROPS = ['Wheat (Gehu)', 'Paddy (Dhaan)', 'Potato (Aloo)', 'Maize (Makka)', 'Sugarcane (Ganna)', 'Mustard (Sarson)'];

  const handleDiagnose = async () => {
    if (!crop || !issue) return;
    setLoading(true);
    setSuggestion('');

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API Key missing");

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Act as an expert Indian agriculture consultant. 
        Crop: ${crop}
        Issue: ${issue}
        
        Provide a solution in a mix of simple Hindi and English (Hinglish).
        Format exactly like this:
        **Diagnosis:** [What is the problem?]
        **Solution:** [Name of medicine/fertilizer to use]
        **Dose:** [Amount per acre]
        
        Keep it very short, practical, and encouraging.`
      });

      setSuggestion(response.text || "Could not generate suggestion. Please try again.");
    } catch (e) {
      console.error(e);
      setSuggestion("Unable to connect to Kisan AI. Please check your internet.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      
      <div className="bg-[#F8FAFC] rounded-[32px] w-full max-w-sm relative z-10 shadow-2xl animate-slide-up overflow-hidden border border-emerald-100">
        {/* Header - Medical Theme */}
        <div className="bg-gradient-to-r from-[#059669] to-[#047857] p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
                <Stethoscope size={120} />
            </div>
            
            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-3 shadow-inner border border-white/20">
                        <Stethoscope size={20} />
                    </div>
                    <h2 className="text-2xl font-black font-serif tracking-tight">
                        Crop Doctor
                    </h2>
                    <p className="text-emerald-100 text-xs font-medium mt-1 flex items-center gap-1">
                        <Sparkles size={10} /> AI Diagnosis Tool
                    </p>
                </div>
                <button onClick={onClose} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors backdrop-blur-md">
                    <X size={20} />
                </button>
            </div>
        </div>

        <div className="p-6">
            {!suggestion ? (
                <div className="space-y-5">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block ml-1">Select Crop (Fasal)</label>
                        <div className="grid grid-cols-2 gap-2.5">
                            {CROPS.map(c => (
                                <button 
                                    key={c}
                                    onClick={() => setCrop(c)}
                                    className={`text-xs font-bold py-3 px-3 rounded-xl border transition-all duration-200 active:scale-95 ${
                                        crop === c 
                                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' 
                                        : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'
                                    }`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block ml-1">Problem (Samasya)</label>
                        <div className="relative">
                            <AlertTriangle className="absolute top-3.5 left-3.5 text-gray-400" size={16} />
                            <textarea 
                                value={issue}
                                onChange={(e) => setIssue(e.target.value)}
                                placeholder="E.g. Patton par peela pan, keede..."
                                className="w-full p-3.5 pl-10 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium h-28 resize-none bg-white shadow-sm"
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleDiagnose}
                        disabled={!crop || !issue || loading}
                        className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-emerald-700 disabled:opacity-50 disabled:scale-100 active:scale-98 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <FileText size={20} />}
                        {loading ? 'Consulting Specialist...' : 'Generate Report'}
                    </button>
                </div>
            ) : (
                <div className="animate-fade-in">
                    {/* Report Card Look */}
                    <div className="bg-white rounded-[20px] p-5 border border-emerald-100 shadow-lg mb-5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                        
                        <h3 className="text-sm font-black text-emerald-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                            <CheckCircle2 size={18} className="text-emerald-600" /> 
                            Rx: Diagnosis Report
                        </h3>
                        
                        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-medium font-sans">
                            {suggestion}
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center opacity-60">
                             <div className="flex items-center gap-1">
                                <span className="text-[10px] font-bold text-gray-400">Dr. Kisan AI</span>
                             </div>
                             <img src="https://cdn-icons-png.flaticon.com/512/5616/5616259.png" className="w-8 h-8 opacity-20" alt="stamp" />
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => { setSuggestion(''); setIssue(''); }}
                        className="w-full bg-white text-gray-600 border border-gray-200 py-3.5 rounded-xl font-bold hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
                    >
                        New Diagnosis
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};