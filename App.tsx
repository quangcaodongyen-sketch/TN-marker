
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import AnswerKeyForm from './components/AnswerKeyForm';
import CameraScanner from './components/CameraScanner';
import GradingResult from './components/GradingResult';
import { AnswerKey, Choice, GradedResult } from './types';
import { scanAnswerSheet } from './services/geminiService';
import { Camera, ClipboardList, History, Loader2, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  // State for answer key
  const [answerKey, setAnswerKey] = useState<AnswerKey>(() => {
    const saved = localStorage.getItem('answerKey');
    if (saved) return JSON.parse(saved);
    const initial: AnswerKey = {};
    for (let i = 1; i <= 20; i++) initial[i] = 'A'; // Default A
    return initial;
  });

  // UI state
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentResult, setCurrentResult] = useState<GradedResult | null>(null);
  const [history, setHistory] = useState<GradedResult[]>(() => {
    const saved = localStorage.getItem('scanHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [error, setError] = useState<string | null>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('answerKey', JSON.stringify(answerKey));
  }, [answerKey]);

  useEffect(() => {
    localStorage.setItem('scanHistory', JSON.stringify(history));
  }, [history]);

  const handleKeyChange = (key: number, choice: Choice) => {
    setAnswerKey(prev => ({ ...prev, [key]: choice }));
  };

  const processScan = async (base64: string) => {
    setIsScanning(false);
    setIsProcessing(true);
    setError(null);
    try {
      const scanResult = await scanAnswerSheet(base64);
      
      // Calculate score
      let correctCount = 0;
      const totalQuestions = 20;
      for (let i = 1; i <= totalQuestions; i++) {
        if (scanResult.answers[i] === answerKey[i]) {
          correctCount++;
        }
      }
      
      const score = (correctCount / totalQuestions) * 10;
      
      const fullResult: GradedResult = {
        ...scanResult,
        score,
        correctCount,
        totalQuestions,
        timestamp: Date.now(),
      };
      
      setCurrentResult(fullResult);
      setHistory(prev => [fullResult, ...prev].slice(0, 50));
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi xử lý hình ảnh.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 pt-6">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Processing State */}
        {isProcessing && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
              <Loader2 className="w-16 h-16 text-indigo-600 animate-spin relative z-10" />
            </div>
            <div className="text-center">
               <h3 className="text-xl font-bold text-gray-800">Đang chấm bài...</h3>
               <p className="text-gray-500 text-sm">AI đang phân tích các ô trả lời trên phiếu</p>
            </div>
          </div>
        )}

        {/* Success View */}
        {!isProcessing && currentResult && (
          <GradingResult 
            result={currentResult} 
            answerKey={answerKey} 
            onReset={() => setCurrentResult(null)} 
          />
        )}

        {/* Default View: Input Answer Key & Call to action */}
        {!isProcessing && !currentResult && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left Column: Config */}
            <div className="lg:col-span-3 space-y-8">
              <section>
                <div className="flex items-center space-x-2 mb-4">
                   <ClipboardList className="w-5 h-5 text-indigo-600" />
                   <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wider">Cấu hình bài thi</h2>
                </div>
                <AnswerKeyForm answerKey={answerKey} onChange={handleKeyChange} />
              </section>

              {/* History Section (Desktop) */}
              <section className="hidden lg:block">
                 <div className="flex items-center space-x-2 mb-4">
                   <History className="w-5 h-5 text-gray-400" />
                   <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wider">Lịch sử chấm</h2>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {history.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 italic">Chưa có bài chấm nào</div>
                  ) : (
                    <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto custom-scrollbar">
                      {history.map((item) => (
                        <div key={item.timestamp} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-gray-800">SBD: {item.sbd || '?'}</p>
                            <p className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleString('vi-VN')}</p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                            item.score >= 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {item.score.toFixed(1)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Right Column: CTA & Instructions */}
            <div className="lg:col-span-2 space-y-6">
               <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-200 sticky top-24">
                  <h2 className="text-2xl font-bold mb-4">Sẵn sàng chấm bài?</h2>
                  <p className="text-indigo-100 text-sm mb-8 leading-relaxed">
                    Đảm bảo phiếu trả lời nằm trong khung hình, đủ ánh sáng và không bị nhăn để AI đọc chính xác nhất.
                  </p>
                  
                  <button
                    onClick={() => setIsScanning(true)}
                    className="w-full bg-white text-indigo-600 py-4 rounded-2xl font-black flex items-center justify-center space-x-3 shadow-xl transform transition-all active:scale-95 hover:shadow-indigo-500/50"
                  >
                    <Camera className="w-6 h-6" />
                    <span>MỞ CAMERA QUÉT BÀI</span>
                  </button>

                  <div className="mt-10 space-y-4">
                     <div className="flex items-start space-x-3">
                        <div className="bg-indigo-500/30 p-1 rounded-md mt-1">
                          <CheckCircle2Icon className="w-4 h-4" />
                        </div>
                        <p className="text-xs text-indigo-100">Tự động nhận diện SBD và Mã đề</p>
                     </div>
                     <div className="flex items-start space-x-3">
                        <div className="bg-indigo-500/30 p-1 rounded-md mt-1">
                          <CheckCircle2Icon className="w-4 h-4" />
                        </div>
                        <p className="text-xs text-indigo-100">Chấm điểm tức thì (20 câu)</p>
                     </div>
                     <div className="flex items-start space-x-3">
                        <div className="bg-indigo-500/30 p-1 rounded-md mt-1">
                          <CheckCircle2Icon className="w-4 h-4" />
                        </div>
                        <p className="text-xs text-indigo-100">Lưu lịch sử offline</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button (Mobile only) */}
      {!isProcessing && !currentResult && (
        <div className="fixed bottom-6 right-6 lg:hidden z-40">
           <button
             onClick={() => setIsScanning(true)}
             className="w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center ring-4 ring-white"
           >
             <Camera className="w-8 h-8" />
           </button>
        </div>
      )}

      {/* Camera Overlay */}
      {isScanning && (
        <CameraScanner 
          onCapture={processScan} 
          onClose={() => setIsScanning(false)} 
        />
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
};

// Helper tiny icons
const CheckCircle2Icon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

export default App;
