import React, { useState, useEffect } from 'react';
import { AppView, DiagnosisResponse, HistoryItem } from './types';
import UploadArea from './components/UploadArea';
import DiagnosisResult from './components/DiagnosisResult';
import ExpertChat from './components/ExpertChat';
import HistoryView from './components/HistoryView';
import { analyzePlantImage, fileToBase64 } from './services/geminiService';
import { saveDiagnosisToHistory, getHistory } from './services/historyService';
import { Leaf, User, Menu, Phone, Sprout, ArrowRight, Clock } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResponse | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    // Load history on mount
    setHistory(getHistory());
  }, []);

  const handleImageSelect = async (file: File) => {
    setIsAnalyzing(true);
    setCurrentView(AppView.DIAGNOSIS);
    setSelectedImage(URL.createObjectURL(file));
    
    try {
      const base64 = await fileToBase64(file);
      const result = await analyzePlantImage(base64, file.type);
      setDiagnosis(result);
      
      // Save to history only if it's a valid plant diagnosis
      if (result.isPlant) {
        const newItem = saveDiagnosisToHistory(result);
        setHistory(prev => [newItem, ...prev]);
      }
    } catch (error) {
      console.error("Analysis failed", error);
      alert("Something went wrong analyzing the image. Please try again.");
      setCurrentView(AppView.HOME);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setDiagnosis(item.diagnosis);
    setSelectedImage(null); // History items don't store the image blob
    setCurrentView(AppView.DIAGNOSIS);
    window.scrollTo(0, 0);
  };

  const handleConsultExpert = () => {
    setIsChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => setCurrentView(AppView.HOME)}
            >
              <div className="bg-emerald-600 p-2 rounded-lg text-white">
                <Leaf size={24} />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-emerald-500">
                CropGuard AI
              </span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => setCurrentView(AppView.HOME)}
                className={`text-sm font-medium transition-colors ${currentView === AppView.HOME ? 'text-emerald-600' : 'text-slate-600 hover:text-emerald-600'}`}
              >
                Home
              </button>
              <button 
                onClick={() => setCurrentView(AppView.HISTORY)}
                className={`flex items-center gap-1 text-sm font-medium transition-colors ${currentView === AppView.HISTORY ? 'text-emerald-600' : 'text-slate-600 hover:text-emerald-600'}`}
              >
                <Clock size={16} />
                History
              </button>
              <button 
                onClick={() => setIsChatOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold hover:bg-emerald-100 transition-colors"
              >
                <User size={16} />
                Ask Expert
              </button>
            </div>
            <div className="md:hidden flex items-center gap-3">
              <button 
                onClick={() => setIsChatOpen(true)}
                className="p-2 text-emerald-600 bg-emerald-50 rounded-full hover:bg-emerald-100 transition-colors"
                aria-label="Ask Expert"
              >
                <User size={20} />
              </button>
              <button 
                onClick={() => setCurrentView(AppView.HISTORY)}
                className="p-2 text-slate-600 hover:text-emerald-600"
              >
                <Clock size={24} />
              </button>
              <button className="p-2 text-slate-600">
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow flex flex-col">
        {currentView === AppView.HOME && (
          <div className="flex-grow flex flex-col">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-white pb-16 pt-12 lg:pt-24">
              <div className="absolute inset-0 z-0 opacity-30">
                 <div className="absolute right-0 top-0 -translate-y-12 translate-x-12 w-96 h-96 bg-emerald-200 rounded-full blur-3xl"></div>
                 <div className="absolute left-0 bottom-0 translate-y-12 -translate-x-12 w-80 h-80 bg-blue-200 rounded-full blur-3xl"></div>
              </div>
              
              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium mb-6">
                  <Sprout size={14} />
                  <span>AI-Powered Agriculture</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 max-w-4xl">
                  Heal Your Crops with <br/>
                  <span className="text-emerald-600">Precision Intelligence</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed">
                  Instantly identify plant diseases, get expert treatment plans, and connect with agricultural scientists. Your farm's health, secured.
                </p>
                
                <UploadArea 
                  onImageSelected={handleImageSelect} 
                  isAnalyzing={isAnalyzing} 
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 w-full max-w-4xl">
                  {[
                    { title: "Instant Diagnosis", desc: "Get results in seconds using advanced AI vision.", icon: "⚡" },
                    { title: "Expert Solutions", desc: "Curated treatment plans from agri-scientists.", icon: "🔬" },
                    { title: "24/7 Support", desc: "Chat with our AI consultant anytime, anywhere.", icon: "💬" }
                  ].map((feature, idx) => (
                    <div key={idx} className="bg-white/60 backdrop-blur border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-2xl mb-3">{feature.icon}</div>
                      <h3 className="font-bold text-slate-900 mb-2">{feature.title}</h3>
                      <p className="text-slate-500 text-sm">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === AppView.DIAGNOSIS && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center min-h-[50vh]">
                 <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mb-6"></div>
                 <h2 className="text-2xl font-bold text-slate-800 animate-pulse">Analyzing Crop Health...</h2>
                 <p className="text-slate-500 mt-2">Checking for 150+ known diseases</p>
              </div>
            ) : (
              diagnosis && (
                <div className="animate-fadeIn">
                  <button 
                    onClick={() => setCurrentView(AppView.HOME)}
                    className="mb-6 flex items-center text-slate-500 hover:text-emerald-600 transition-colors font-medium print:hidden"
                  >
                    <ArrowRight className="rotate-180 mr-2" size={20} />
                    Scan Another Plant
                  </button>
                  <DiagnosisResult 
                    diagnosis={diagnosis} 
                    imageUrl={selectedImage || undefined}
                    onConsultExpert={handleConsultExpert} 
                  />
                </div>
              )
            )}
          </div>
        )}

        {currentView === AppView.HISTORY && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
             <HistoryView history={history} onSelect={handleHistorySelect} />
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-12 mt-12 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-1.5 rounded-lg text-white">
              <Leaf size={16} />
            </div>
            <span className="font-bold text-slate-900">CropGuard AI</span>
          </div>
          <div className="text-slate-500 text-sm">
            © {new Date().getFullYear()} CropGuard AI. Empowering Farmers.
          </div>
          <div className="flex gap-6">
             <a href="#" className="text-slate-400 hover:text-emerald-600 transition-colors"><Phone size={20}/></a>
             <a href="#" className="text-slate-400 hover:text-emerald-600 transition-colors"><User size={20}/></a>
          </div>
        </div>
      </footer>

      {isChatOpen && (
        <ExpertChat 
          onClose={() => setIsChatOpen(false)} 
          initialContext={diagnosis ? JSON.stringify(diagnosis) : undefined}
        />
      )}
    </div>
  );
}

export default App;