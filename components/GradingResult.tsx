
import React from 'react';
import { GradedResult, AnswerKey } from '../types';
import { CheckCircle2, XCircle, Info, Hash, User } from 'lucide-react';

interface GradingResultProps {
  result: GradedResult;
  answerKey: AnswerKey;
  onReset: () => void;
}

const GradingResult: React.FC<GradingResultProps> = ({ result, answerKey, onReset }) => {
  const getStatusColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50 border-green-100';
    if (score >= 5) return 'text-orange-600 bg-orange-50 border-orange-100';
    return 'text-red-600 bg-red-50 border-red-100';
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-300">
      <div className={`p-8 text-center border-b ${getStatusColor(result.score)}`}>
        <h3 className="text-xl font-bold mb-1">Kết Quả Bài Làm</h3>
        <div className="text-6xl font-black mb-2">{result.score.toFixed(1)}</div>
        <p className="font-medium opacity-80">Điểm số</p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-xl flex items-center space-x-3">
             <User className="w-5 h-5 text-gray-400" />
             <div>
                <p className="text-xs text-gray-500 font-medium">SBD</p>
                <p className="font-bold text-gray-800">{result.sbd || 'N/A'}</p>
             </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl flex items-center space-x-3">
             <Hash className="w-5 h-5 text-gray-400" />
             <div>
                <p className="text-xs text-gray-500 font-medium">Mã đề</p>
                <p className="font-bold text-gray-800">{result.maDe || 'N/A'}</p>
             </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 px-2">
           <div className="flex items-center space-x-4">
              <span className="flex items-center text-green-600 text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4 mr-1" /> {result.correctCount} Đúng
              </span>
              <span className="flex items-center text-red-600 text-sm font-semibold">
                <XCircle className="w-4 h-4 mr-1" /> {result.totalQuestions - result.correctCount} Sai
              </span>
           </div>
        </div>

        <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 sticky top-0">
              <tr>
                <th className="py-2 px-3 text-left font-semibold">Câu</th>
                <th className="py-2 px-3 text-center font-semibold">Học sinh</th>
                <th className="py-2 px-3 text-center font-semibold">Đáp án</th>
                <th className="py-2 px-3 text-right font-semibold">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Array.from({ length: 20 }, (_, i) => i + 1).map((qNum) => {
                const isCorrect = result.answers[qNum] === answerKey[qNum];
                return (
                  <tr key={qNum}>
                    <td className="py-3 px-3 font-bold text-gray-400">{qNum}</td>
                    <td className="py-3 px-3 text-center font-bold text-gray-700">
                      {result.answers[qNum] || '-'}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-indigo-600">
                      {answerKey[qNum]}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 ml-auto" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <button
          onClick={onReset}
          className="w-full mt-8 bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all transform active:scale-[0.98]"
        >
          Tiếp tục quét bài mới
        </button>
      </div>
    </div>
  );
};

export default GradingResult;
