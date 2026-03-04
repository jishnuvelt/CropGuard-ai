import React, { useState } from 'react';
import { DiagnosisResponse } from '../types';
import { AlertTriangle, CheckCircle, HelpCircle, Activity, Sprout, ShieldCheck, ThermometerSun, Share2, Copy, Check, Info, Wind, CloudRain, AlertOctagon, BookOpen, Printer } from 'lucide-react';

interface DiagnosisResultProps {
  diagnosis: DiagnosisResponse;
  onConsultExpert: () => void;
  imageUrl?: string;
}

const DiagnosisResult: React.FC<DiagnosisResultProps> = ({ diagnosis, onConsultExpert, imageUrl }) => {
  const [manualDiseaseName, setManualDiseaseName] = useState('');
  const [showShareToast, setShowShareToast] = useState(false);

  if (!diagnosis.isPlant) {
    return (
      <div className="w-full max-w-3xl mx-auto p-6 bg-red-50 border border-red-100 rounded-2xl text-center">
        <div className="inline-flex p-3 bg-red-100 text-red-600 rounded-full mb-4">
          <HelpCircle size={32} />
        </div>
        <h3 className="text-xl font-bold text-red-800 mb-2">No Plant Detected</h3>
        <p className="text-red-600 mb-6">
          We couldn't identify a plant in this image. Please ensure the image is clear and focused on the crop or leaf.
        </p>
      </div>
    );
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Healthy': return 'text-emerald-600 bg-emerald-100 border-emerald-200';
      case 'Diseased': return 'text-rose-600 bg-rose-100 border-rose-200';
      case 'Pest Infestation': return 'text-amber-600 bg-amber-100 border-amber-200';
      case 'Nutrient Deficiency': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default: return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  const getConditionIcon = (condition: string) => {
    switch (condition) {
      case 'Healthy': return <CheckCircle size={24} />;
      case 'Diseased': return <Activity size={24} />;
      case 'Pest Infestation': return <AlertTriangle size={24} />;
      default: return <HelpCircle size={24} />;
    }
  };

  const isLowConfidence = diagnosis.confidence < 0.7;
  const displayDiseaseName = manualDiseaseName.trim() || diagnosis.diseaseName;
  const hasDetailedInfo = diagnosis.scientificName || diagnosis.spreadMethod || diagnosis.favorableConditions;

  const handleShare = async () => {
    const shareText = `🌱 CropGuard AI Report\n\nPlant: ${diagnosis.plantName}\nCondition: ${diagnosis.condition}\nSpecific Issue: ${displayDiseaseName}\n\nSummary: ${diagnosis.description}\n\nTreatment: ${diagnosis.treatments[0]}\n\nGet your crops diagnosed instantly at CropGuard AI!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `CropGuard Diagnosis: ${diagnosis.plantName}`,
          text: shareText,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(shareText);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-fadeIn relative">
      {/* Toast Notification */}
      {showShareToast && (
        <div className="absolute top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fadeIn print:hidden">
          <Check size={16} className="text-emerald-400" />
          <span className="text-sm font-medium">Report copied to clipboard!</span>
        </div>
      )}

      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6 relative">
        <div className="flex flex-col md:flex-row">
          {imageUrl && (
            <div className="md:w-1/3 h-64 md:h-auto relative">
              <img src={imageUrl} alt="Analyzed Plant" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden"></div>
            </div>
          )}
          
          <div className={`p-6 md:p-8 relative ${imageUrl ? 'md:w-2/3' : 'w-full'}`}>
             {/* Actions: Print and Share */}
            <div className="absolute top-6 right-6 z-10 flex gap-2 print:hidden">
              <button 
                onClick={handlePrint}
                className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all border border-transparent hover:border-emerald-100 group"
                title="Print Report"
              >
                <Printer size={20} className="group-hover:scale-110 transition-transform" />
              </button>
              <button 
                onClick={handleShare}
                className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all border border-transparent hover:border-emerald-100 group"
                title="Share Report"
              >
                <Share2 size={20} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>

            <div className="flex flex-col gap-6">
              <div className="pr-12">
                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-1">
                  <Sprout size={16} />
                  <span>Identified Plant</span>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">{diagnosis.plantName}</h2>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-semibold ${getConditionColor(diagnosis.condition)}`}>
                  {getConditionIcon(diagnosis.condition)}
                  <span>{diagnosis.condition}</span>
                  {isLowConfidence && <span className="text-xs opacity-75">(Low Confidence)</span>}
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                {displayDiseaseName && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="text-sm text-slate-500 font-medium mb-1">Specific Issue</div>
                    <div className="text-lg font-bold text-slate-800 break-words">{displayDiseaseName}</div>
                  </div>
                )}

                {isLowConfidence && (
                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 animate-fadeIn print:hidden">
                     <p className="text-xs text-amber-800 font-medium mb-2 flex items-center gap-1">
                        <AlertTriangle size={12} />
                        Not accurate? Correct it:
                     </p>
                     <input 
                        type="text"
                        placeholder="Enter correct disease name"
                        className="w-full text-sm rounded-lg border-amber-200 focus:border-amber-400 focus:ring focus:ring-amber-200 focus:ring-opacity-50 px-3 py-2 bg-white"
                        value={manualDiseaseName}
                        onChange={(e) => setManualDiseaseName(e.target.value)}
                     />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100/50">
              {diagnosis.description}
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Symptoms & Causes */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-full">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Activity className="text-rose-500" size={20} />
              Symptoms Detected
            </h3>
            <ul className="space-y-3">
              {diagnosis.symptoms.map((symptom, idx) => (
                <li key={idx} className="flex items-start gap-3 text-slate-600">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                  <span>{symptom}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Treatment Plan */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6 h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50" />
            
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 relative z-10">
              <ThermometerSun className="text-emerald-600" size={20} />
              Recommended Treatment
            </h3>
            <ul className="space-y-3 relative z-10">
              {diagnosis.treatments.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-slate-700">
                  <div className="mt-1 p-0.5 bg-emerald-100 rounded-full text-emerald-600 shrink-0">
                    <CheckCircle size={14} />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 pt-6 border-t border-slate-100 relative z-10">
               <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                 <ShieldCheck className="text-blue-500" size={16} />
                 Prevention
               </h4>
               <ul className="space-y-2">
                 {diagnosis.preventativeMeasures.map((item, idx) => (
                   <li key={idx} className="text-sm text-slate-500 pl-6 relative">
                     <span className="absolute left-1 top-2 w-1 h-1 bg-slate-300 rounded-full"></span>
                     {item}
                   </li>
                 ))}
               </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Disease Profile / More Info Section */}
      {hasDetailedInfo && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
           <div className="p-6 border-b border-slate-100 bg-slate-50/50">
             <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="text-blue-600" size={20} />
                Disease Profile
             </h3>
           </div>
           <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {diagnosis.scientificName && (
                <div className="flex flex-col gap-2">
                   <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Info size={12} /> Scientific Name
                   </div>
                   <div className="font-serif italic text-lg text-slate-800">
                      {diagnosis.scientificName}
                   </div>
                </div>
              )}
              
              {diagnosis.severity && (
                <div className="flex flex-col gap-2">
                   <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <AlertOctagon size={12} /> Severity
                   </div>
                   <div className="flex">
                     <span className={`px-3 py-1 rounded-full text-sm font-medium
                        ${diagnosis.severity === 'High' ? 'bg-red-100 text-red-700' : 
                          diagnosis.severity === 'Moderate' ? 'bg-amber-100 text-amber-700' : 
                          'bg-blue-100 text-blue-700'}`}>
                        {diagnosis.severity} Impact
                     </span>
                   </div>
                </div>
              )}

              {diagnosis.spreadMethod && (
                <div className="flex flex-col gap-2">
                   <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Wind size={12} /> Spread By
                   </div>
                   <div className="text-slate-700 font-medium text-sm">
                      {diagnosis.spreadMethod}
                   </div>
                </div>
              )}

              {diagnosis.favorableConditions && (
                <div className="flex flex-col gap-2">
                   <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <CloudRain size={12} /> Thrives In
                   </div>
                   <div className="text-slate-700 font-medium text-sm">
                      {diagnosis.favorableConditions}
                   </div>
                </div>
              )}
           </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-8 flex justify-center print:hidden">
        <button
          onClick={onConsultExpert}
          className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 font-semibold text-white transition-all duration-200 bg-emerald-600 rounded-full hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600"
        >
          <span>Talk to an Expert about this</span>
          <div className="p-1 bg-emerald-500 rounded-full group-hover:translate-x-1 transition-transform">
             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Expert" className="w-6 h-6 rounded-full" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default DiagnosisResult;