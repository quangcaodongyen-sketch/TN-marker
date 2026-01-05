
import React from 'react';
import { Camera, CheckSquare } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <CheckSquare className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Gemini Grader
          </h1>
        </div>
        <div className="flex items-center space-x-4">
           <span className="hidden sm:block text-sm text-gray-500 font-medium italic">
             Chấm bài trắc nghiệm thông minh
           </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
