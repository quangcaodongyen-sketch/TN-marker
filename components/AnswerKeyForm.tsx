
import React from 'react';
import { AnswerKey, Choice } from '../types';

interface AnswerKeyFormProps {
  answerKey: AnswerKey;
  onChange: (key: number, choice: Choice) => void;
}

const AnswerKeyForm: React.FC<AnswerKeyFormProps> = ({ answerKey, onChange }) => {
  const choices: Choice[] = ['A', 'B', 'C', 'D'];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Cấu hình Đáp án đúng</h2>
        <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full font-medium">
          20 Câu hỏi
        </span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {Array.from({ length: 20 }, (_, i) => i + 1).map((qNum) => (
          <div key={qNum} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-indigo-100 transition-colors">
            <span className="font-bold text-gray-400 w-8">#{qNum}</span>
            <div className="flex space-x-2">
              {choices.map((choice) => (
                <button
                  key={choice}
                  onClick={() => onChange(qNum, choice)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-sm ${
                    answerKey[qNum] === choice
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                      : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  {choice}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnswerKeyForm;
