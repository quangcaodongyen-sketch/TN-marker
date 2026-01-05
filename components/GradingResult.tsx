
import React, { useEffect, useState } from 'react';
import { GradedResult, AnswerKey } from '../types.ts';
import { CheckCircle2, XCircle, User, Hash, ArrowLeft, Trophy, Star, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GradingResultProps {
  result: GradedResult;
  answerKey: AnswerKey;
  onReset: () => void;
}

const GradingResult: React.FC<GradingResultProps> = ({ result, answerKey, onReset }) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    // Score counting animation
    let start = 0;
    const end = result.score;
    const duration = 1500;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayScore(end);
        clearInterval(timer);
        if (end >= 8) {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#4f46e5', '#818cf8', '#fbbf24']
          });
        }
      } else {
        setDisplayScore(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [result.score]);

  const getScoreColor = () => {
    if (result.score >= 8) return 'text-green-500';
    if (result.score >= 5) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreGradient = () => {
    if (result.score >= 8) return 'from-green-500 to-emerald-600';
    if (result.score >= 5) return 'from-amber-400 to-orange-500';
    return 'from-red-500 to-rose-600';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <button 
        onClick={onReset}
        className="flex items-center text-gray-500 hover:text-indigo-600 font-semibold transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
        Quay lại
      </button>

      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 overflow-hidden border border-gray-100">
        <div className={`h-4 bg-gradient-to-r ${getScoreGradient()}`} />
        
        <div className="p-10">
          <div className="text-center space-y-4">
            <div className="relative inline-block">
               {result.score >= 8 && <Trophy className="absolute -top-6 -right-6 w-12 h-12 text-yellow-400 animate-float" />}
               <div className={`text-8xl font-black tracking-tighter ${getScoreColor()} transition-all tabular-nums`}>
                 {displayScore.toFixed(1)}
               </div>
            </div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Điểm số đạt được</p>
            
            <div className="flex justify-center items-center space-x-2 py-2">
               {Array.from({ length: 5 }).map((_, i) => (
                 <Star key={i} className={`w-6 h-6 ${i < Math.round(result.score/2) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
               ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-10">
             <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
                <div className="flex items-center space-x-3 mb-1 text-gray-500">
                   <User className="w-4 h-4" />
                   <span className="text-xs font-bold uppercase">Số báo danh</span>
                </div>
                <p className="text-xl font-extrabold text-gray-800">{result.sbd || '---'}</p>
             </div>
             <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
                <div className="flex items-center space-x-3 mb-1 text-gray-500">
                   <Hash className="w-4 h-4" />
                   <span className="text-xs font-bold uppercase">Mã đề</span>
                </div>
                <p className="text-xl font-extrabold text-gray-800">{result.maDe || '---'}</p>
             </div>
          </div>

          <div className="flex items-center justify-around mt-8 py-6 border-y border-gray-50">
             <div className="text-center">
                <p className="text-2xl font-black text-green-500">{result.correctCount}</p>
                <p className="text-xs font-bold text-gray-400 uppercase">Câu đúng</p>
             </div>
             <div className="w-px h-10 bg-gray-100" />
             <div className="text-center">
                <p className="text-2xl font-black text-red-500">{result.totalQuestions - result.correctCount}</p>
                <p className="text-xs font-bold text-gray-400 uppercase">Câu sai</p>
             </div>
             <div className="w-px h-10 bg-gray-100" />
             <div className="text-center">
                <p className="text-2xl font-black text-indigo-600">{(result.correctCount/result.totalQuestions * 100).toFixed(0)}%</p>
                <p className="text-xs font-bold text-gray-400 uppercase">Tỷ lệ</p>
             </div>
          </div>

          <div className="mt-8">
            <h4 className="font-bold text-gray-800 mb-4 px-2">Chi tiết đáp án</h4>
            <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
               {Array.from({ length: 20 }, (_, i) => i + 1).map((qNum) => {
                 const isCorrect = result.answers[qNum] === answerKey[qNum];
                 return (
                   <div key={qNum} className={`flex flex-col items-center p-2 rounded-2xl border ${
                     isCorrect ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
                   }`}>
                     <span className="text-[10px] font-bold text-gray-400">{qNum}</span>
                     <span className={`font-black ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                       {result.answers[qNum] || '?'}
                     </span>
                   </div>
                 );
               })}
            </div>
          </div>

          <button
            onClick={onReset}
            className="w-full mt-10 bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center space-x-3"
          >
            <span>TIẾP TỤC QUÉT BÀI MỚI</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GradingResult;
