import React from 'react';
import { HistoryItem } from '../types';
import { Calendar, ChevronRight, AlertTriangle, CheckCircle, Activity, HelpCircle } from 'lucide-react';

interface HistoryViewProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onSelect }) => {
  const getConditionIcon = (condition: string) => {
    switch (condition) {
      case 'Healthy': return <CheckCircle size={18} className="text-emerald-500" />;
      case 'Diseased': return <Activity size={18} className="text-rose-500" />;
      case 'Pest Infestation': return <AlertTriangle size={18} className="text-amber-500" />;
      default: return <HelpCircle size={18} className="text-slate-400" />;
    }
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 animate-fadeIn">
        <div className="bg-slate-100 p-6 rounded-full mb-4">
          <Calendar size={48} className="text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">No History Yet</h3>
        <p className="text-slate-500 max-w-sm">
          Your diagnosis history will appear here automatically once you scan your first plant.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn pb-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="text-emerald-600" />
          Diagnosis History
        </h2>
        <span className="text-sm text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full">
          {history.length} Records
        </span>
      </div>

      <div className="grid gap-4">
        {history.map((item) => (
          <div 
            key={item.id}
            onClick={() => onSelect(item)}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${
               item.diagnosis.condition === 'Healthy' ? 'bg-emerald-500' : 
               item.diagnosis.condition === 'Diseased' ? 'bg-rose-500' : 'bg-amber-500'
            }`}></div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pl-3">
              <div className="flex-1">
                 <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">
                   <span>{new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                   <span>•</span>
                   <span>{new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                 </div>
                 <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center gap-2">
                    {item.diagnosis.plantName}
                 </h3>
                 <div className="flex items-center gap-2 mt-1">
                    {getConditionIcon(item.diagnosis.condition)}
                    <span className="text-sm text-slate-600 font-medium">
                        {item.diagnosis.diseaseName || item.diagnosis.condition}
                    </span>
                 </div>
              </div>
              
              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0 mt-1 sm:mt-0">
                 <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                    {(item.diagnosis.confidence * 100).toFixed(0)}% Match
                 </span>
                <ChevronRight className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryView;