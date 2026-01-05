
import React, { useEffect, useState } from 'react';
import { GradedResult, AnswerKey } from '../types.ts';
import { User, Hash, ArrowLeft, Trophy, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GradingResultProps {
  result: GradedResult;
  answerKey: AnswerKey;
  onReset: (autoRestart?: boolean) => void;
}

const GradingResult: React.FC<GradingResultProps> = ({ result, answerKey, onReset }) => {
  const [displayScore, setDisplayScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // Score counting animation
    let start = 0;
    const end = result.score;
    const duration = 1000; // Nhanh hơn để kịp 2s chuyển cảnh
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayScore(end);
        clearInterval(timer);
        setIsFinished(true);
        
        // Hiệu ứng pháo hoa nếu điểm khá/giỏi
        if (end >= 5) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: end >= 8 ? ['#4f46e5', '#fbbf24', '#10b981'] : ['#f59e0b', '#fbbf24']
          });
        }
      } else {
        setDisplayScore(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [result.score]);

  useEffect(() => {
    if (isFinished) {
      // Tự động quay lại màn hình quét sau 2.5 giây kể từ khi hiện điểm xong
      const autoTimer = setTimeout(() => {
        onReset(true);
      }, 2500);
      return () => clearTimeout(autoTimer);
    }
  }, [isFinished, onReset]);

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
    <div className="fixed inset-0 z-[110] bg-white flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-lg space-y-8 text-center">
        
        {/* Điểm số bay lên với hiệu ứng mạnh mẽ */}
        <div className="relative inline-block group">
          <div className="absolute inset-0 bg-current opacity-10 blur-3xl rounded-full scale-150 animate-pulse"></div>
          
          <div className={`relative z-10 flex flex-col items-center animate-in slide-in-from-bottom-20 duration-1000 ease-out fill-mode-both`}>
            {result.score >= 8 && (
              <Trophy className="w-16 h-16 text-yellow-400 mb-2 animate-bounce" />
            )}
            
            <div className={`text-[12rem] leading-none font-black tracking-tighter ${getScoreColor()} drop-shadow-2xl tabular-nums`}>
              {displayScore.toFixed(1)}
            </div>
            
            <div className="mt-[-1rem] flex items-center space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-8 h-8 ${i < Math.round(result.score/2) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} animate-in zoom-in duration-500 delay-${i*100}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2 animate-in fade-in slide-in-from-top-4 delay-700 duration-700">
          <h2 className="text-3xl font-black text-gray-800 uppercase tracking-widest">KẾT QUẢ CHẤM</h2>
          <div className="flex justify-center space-x-6">
            <div className="text-center">
              <p className="text-sm font-bold text-gray-400">SBD</p>
              <p className="text-xl font-black text-gray-800">{result.sbd || '---'}</p>
            </div>
            <div className="w-px h-10 bg-gray-200" />
            <div className="text-center">
              <p className="text-sm font-bold text-gray-400">MÃ ĐỀ</p>
              <p className="text-xl font-black text-gray-800">{result.maDe || '---'}</p>
            </div>
          </div>
        </div>

        {/* Thông báo tự động chuyển */}
        <div className="pt-10 flex flex-col items-center space-y-4 animate-in fade-in delay-1000 duration-1000">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
          <p className="text-indigo-600 font-bold text-sm tracking-widest animate-pulse">
            ĐANG CHUẨN BỊ QUÉT BÀI TIẾP THEO...
          </p>
        </div>

        {/* Nút bấm thủ công nếu muốn nhanh hơn */}
        <button 
          onClick={() => onReset(true)}
          className="text-gray-400 hover:text-indigo-600 font-bold text-sm underline underline-offset-4 transition-colors"
        >
          Bỏ qua và quét ngay
        </button>
      </div>

      <style>{`
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
        .delay-700 { animation-delay: 700ms; }
        .delay-1000 { animation-delay: 1000ms; }
      `}</style>
    </div>
  );
};

export default GradingResult;
