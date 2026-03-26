import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

const SkillsCard = ({ title, keywords, type = 'match' }) => {
  const isMatch = type === 'match';
  
  return (
    <div className={`bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg p-6 border ${
      isMatch ? 'border-green-100' : 'border-red-100'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold text-lg ${isMatch ? 'text-green-800' : 'text-red-800'}`}>
          {title}
        </h3>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
          isMatch ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {keywords?.length || 0} Skills
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {keywords && keywords.length > 0 ? (
          keywords.map((kw, i) => (
            <div 
              key={i} 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 ${
                isMatch 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {isMatch ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <XCircle className="w-3.5 h-3.5" />
              )}
              {kw}
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm italic">
            {isMatch ? "No matching skills identified." : "No missing skills identified!"}
          </p>
        )}
      </div>
    </div>
  );
};

export default SkillsCard;
