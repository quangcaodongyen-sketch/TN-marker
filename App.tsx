
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header.tsx';
import AnswerKeyForm from './components/AnswerKeyForm.tsx';
import CameraScanner from './components/CameraScanner.tsx';
import GradingResult from './components/GradingResult.tsx';
import { AnswerKey, Choice, GradedResult } from './types.ts';
import { scanAnswerSheet } from './services/geminiService.ts';
import { Camera, ClipboardList, History, Loader2, AlertCircle, Sparkles, BookOpen } from 'lucide-react';

const App: React.FC = () => {
  const [answerKey, setAnswerKey] = useState<AnswerKey>(() => {
    const saved = localStorage.getItem('answerKey');
    if (saved) return JSON.parse(saved);
    const initial: AnswerKey = {};
    for (let i = 1; i <= 20; i++) initial[i] = 'A';
    return initial;
  });

  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentResult, setCurrentResult] = useState<GradedResult | null>(null);
  const [history, setHistory] = useState<GradedResult[]>(() => {
    const saved = localStorage.getItem('scanHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [error, setError] = useState<string | null>(null);

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
      setError(err.message || "Đã xảy ra lỗi khi AI xử lý hình ảnh.");
      setIsScanning(false); // Đảm bảo không kẹt ở màn hình scanner
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = useCallback((autoRestart: boolean = false) => {
    setCurrentResult(null);
    if (autoRestart) {
      setIsScanning(true);
    }
  }, []);

  return (
    <div className="min-h-screen pb-20 selection:bg-indigo-100">
      <Header />
      
      <main className="max-w-6xl mx-auto px-6 pt-10">
        {error && (
          <div className="mb-8 bg-red-50 border border-red-100 text-red-600 p-6 rounded-[2rem] flex items-center justify-between animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center space-x-4">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <p className="font-bold">{error}</p>
            </div>
            <button 
              onClick={() => { setError(null); setIsScanning(true); }}
              className="bg-red-600 text-white px-6 py-2 rounded-full font-bold text-sm"
            >
              Thử lại ngay
            </button>
          </div>
        )}

        {isProcessing && (
          <div className="flex flex-col items-center justify-center py-32 animate-in zoom-in duration-500">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] rounded-full animate-pulse-slow"></div>
              <div className="relative bg-white p-8 rounded-[3rem] shadow-2xl border border-indigo-50">
                 <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
              </div>
            </div>
            <div className="text-center">
               <h3 className="text-3xl font-black text-gray-800 mb-2">ĐANG PHÂN TÍCH...</h3>
               <p className="text-gray-400 font-bold tracking-widest uppercase text-xs">AI Gemini đang đọc dữ liệu phiếu</p>
            </div>
          </div>
        )}

        {!isProcessing && currentResult && (
          <GradingResult 
            result={currentResult} 
            answerKey={answerKey} 
            onReset={handleReset} 
          />
        )}

        {!isProcessing && !currentResult && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Config Side */}
            <div className="lg:col-span-7 space-y-10 animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Đáp án chuẩn</h2>
                </div>
              </div>
              
              <AnswerKeyForm answerKey={answerKey} onChange={handleKeyChange} />

              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="flex items-center space-x-3 mb-6">
                   <History className="w-5 h-5 text-gray-400" />
                   <h3 className="font-bold text-gray-800">Lịch sử chấm gần đây</h3>
                </div>
                {history.length === 0 ? (
                  <div className="py-10 text-center">
                    <BookOpen className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium italic">Chưa có dữ liệu chấm điểm</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {history.map((item) => (
                      <div key={item.timestamp} className="p-5 rounded-3xl border border-gray-50 bg-gray-50/50 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                            item.score >= 8 ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                          }`}>
                            {item.score.toFixed(1)}
                          </div>
                          <div>
                            <p className="font-black text-gray-800">SBD: {item.sbd || '---'}</p>
                            <p className="text-xs text-gray-400 font-bold">{new Date(item.timestamp).toLocaleTimeString('vi-VN')} · Đề: {item.maDe || '---'}</p>
                          </div>
                        </div>
                        <Sparkles className="w-5 h-5 text-gray-200 group-hover:text-indigo-600" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Side */}
            <div className="lg:col-span-5 animate-in fade-in slide-in-from-right-8 duration-700">
               <div className="sticky top-28 space-y-6">
                 <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[3rem] p-10 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    
                    <h2 className="text-3xl font-black mb-6 leading-tight relative z-10">Máy Chấm Bài<br/>Thông Minh AI</h2>
                    <p className="text-indigo-100 font-medium mb-10 leading-relaxed relative z-10 opacity-90">
                      Hệ thống tự động nhận diện và chấm điểm liên tục. Chỉ cần đưa bài vào camera.
                    </p>
                    
                    <button
                      onClick={() => setIsScanning(true)}
                      className="w-full bg-white text-indigo-600 py-5 rounded-[2rem] font-black text-lg flex items-center justify-center space-x-4 shadow-2xl transform transition-all hover:-translate-y-1 active:scale-95 relative z-10"
                    >
                      <Camera className="w-7 h-7" />
                      <span>BẮT ĐẦU CHẤM LIÊN TỤC</span>
                    </button>
                 </div>

                 <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <h3 className="font-black text-gray-800 mb-4 flex items-center uppercase text-sm tracking-widest">
                      <Sparkles className="w-4 h-4 mr-2 text-amber-400" />
                      Hướng dẫn
                    </h3>
                    <ul className="space-y-3">
                      {[
                        "Cầm điện thoại song song với phiếu.",
                        "Kết quả sẽ tự động hiện và chuyển sau 2s.",
                        "Hỗ trợ cả bút chì tô mờ."
                      ].map((text, i) => (
                        <li key={i} className="flex items-start space-x-3 text-sm text-gray-500 font-medium leading-relaxed">
                          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                          <span>{text}</span>
                        </li>
                      ))}
                    </ul>
                 </div>
               </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile FAB */}
      {!isProcessing && !currentResult && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 lg:hidden z-40 w-full px-6">
           <button
             onClick={() => setIsScanning(true)}
             className="w-full h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center space-x-3 ring-4 ring-white active:scale-95 transition-all"
           >
             <Camera className="w-6 h-6" />
             <span className="font-black">BẮT ĐẦU QUÉT BÀI</span>
           </button>
        </div>
      )}

      {isScanning && (
        <CameraScanner 
          onCapture={processScan} 
          onClose={() => setIsScanning(false)} 
        />
      )}
    </div>
  );
};

export default App;
