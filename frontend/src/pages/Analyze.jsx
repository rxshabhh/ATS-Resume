import { useLocation, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, RefreshCw, FileDown } from 'lucide-react';
import SkillsCard from '../components/SkillsCard';

/* Score ring color logic */
function scoreColor(score) {
  if (score >= 70) return { ring: 'border-green-500', text: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/10' };
  if (score >= 40) return { ring: 'border-yellow-500', text: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-500/10' };
  return { ring: 'border-red-500', text: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10' };
}

function ScoreRing({ score }) {
  const { ring, text } = scoreColor(score);
  return (
    <div className={`w-36 h-36 rounded-full border-[10px] ${ring} flex items-center justify-center flex-col shadow-inner backdrop-blur-sm`}>
      <span className={`text-4xl font-bold ${text}`}>{Math.round(score)}</span>
      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase font-bold tracking-wider">Score</span>
    </div>
  );
}

function Analyze() {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, filename } = location.state || {};

  const handlePrint = () => {
    window.print();
  };

  /* Guard: if accessed directly with no state, redirect to upload */
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-fadeUp">
        <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">No analysis data found.</p>
        <button
          onClick={() => navigate('/upload')}
          className="bg-gray-900 dark:bg-white text-white dark:text-black px-8 py-3 rounded-full font-bold transition hover:scale-105"
        >
          Go to Upload
        </button>
      </div>
    );
  }

  const { ats_score, feedback, missing_keywords } = result;
  const { text: scoreText, bg: scoreBg } = scoreColor(ats_score);
  const scoreLabel = ats_score >= 70 ? 'Strong Fit' : ats_score >= 40 ? 'Moderate Fit' : 'Weak Fit';

  return (
    <div className="w-full flex-1 animate-fadeUp flex flex-col gap-6 py-6">
      <style>
        {`
          @media print {
            .no-print { display: none !important; }
            body { background: white !important; }
          }
        `}
      </style>

      {/* Header row */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-white/50 dark:bg-black/20 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-[32px] p-6 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Analysis Results</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Resume vs Job Description Compatibility</p>
        </div>

        <div className="flex-1 flex justify-center text-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Detailed Report</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium truncate max-w-[200px]" title={filename}>{filename || 'Resume'}</p>
          </div>
        </div>

        <div className={`${scoreBg} rounded-[24px] shadow-inner p-4 flex items-center gap-4 flex-shrink-0 border border-white/40 dark:border-white/5`}>
          <div className={`w-2 h-10 rounded-full ${ats_score >= 70 ? 'bg-green-400' : ats_score >= 40 ? 'bg-yellow-400' : 'bg-red-400'}`} />
          <div>
            <h4 className={`font-bold text-lg leading-tight ${scoreText}`}>{scoreLabel}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">{Math.round(ats_score)} / 100 Match</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Score ring */}
        <div className="lg:col-span-1 bg-white/50 dark:bg-black/20 backdrop-blur-xl rounded-[32px] border border-white/60 dark:border-white/10 shadow-sm p-8 flex flex-col items-center justify-center gap-6">
          <h3 className="font-bold text-gray-900 dark:text-white">Overall Match</h3>
          <ScoreRing score={ats_score} />
          <p className={`font-bold text-lg ${scoreText}`}>{scoreLabel}</p>
        </div>

        {/* Keywords + Feedback */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Score breakdown chip */}
            <div className="bg-white/50 dark:bg-black/20 backdrop-blur-xl rounded-[32px] border border-white/60 dark:border-white/10 shadow-sm p-6 flex flex-col justify-center gap-4">
              <h3 className="font-bold text-gray-900 dark:text-white text-center">ATS Compatibility</h3>
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3 relative overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${
                    ats_score >= 70 ? 'bg-green-500' : ats_score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${ats_score}%` }}
                />
              </div>
              <p className={`font-black text-4xl text-center ${scoreText}`}>{Math.round(ats_score)}%</p>
            </div>

            {/* Missing Keywords */}
            <div className="bg-white/50 dark:bg-black/20 backdrop-blur-xl rounded-[32px] border border-white/60 dark:border-white/10 shadow-sm h-full max-h-48 overflow-y-auto custom-scrollbar">
               <SkillsCard 
                  title="Missing Keywords" 
                  keywords={missing_keywords} 
                  type="missing" 
                />
            </div>
          </div>

          {/* Feedback */}
          <div className="flex-1 bg-white/50 dark:bg-black/20 backdrop-blur-xl rounded-[32px] border border-white/60 dark:border-white/10 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-xl">
                <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-bold text-xl text-gray-900 dark:text-white">AI Analysis & Suggestions</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line text-[15px] font-medium">
              {feedback}
            </p>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-1 flex flex-col gap-6 no-print">

          {/* Quick actions */}
          <div className="bg-white/50 dark:bg-black/20 backdrop-blur-xl rounded-[32px] border border-white/60 dark:border-white/10 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handlePrint}
                className="w-full bg-gray-900 dark:bg-white text-white dark:text-black py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-transform shadow-md"
              >
                <FileDown size={18} /> Download
              </button>
              <button
                onClick={() => navigate('/upload')}
                className="w-full bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <RefreshCw size={18} /> Re-Analyze
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white py-2 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-sm mt-2"
              >
                <ArrowLeft size={16} /> Dashboard
              </button>
            </div>
          </div>

          {/* Summary card */}
          <div className="bg-white/50 dark:bg-black/20 backdrop-blur-xl rounded-[32px] border border-white/60 dark:border-white/10 shadow-sm p-6 flex-1">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Summary</h3>
            <table className="w-full text-sm font-medium">
              <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                <tr>
                  <td className="py-3 text-gray-500 dark:text-gray-400">File</td>
                  <td className="py-3 text-right text-gray-900 dark:text-white truncate max-w-[100px]" title={filename}>{filename || '—'}</td>
                </tr>
                <tr>
                  <td className="py-3 text-gray-500 dark:text-gray-400">ATS Score</td>
                  <td className={`py-3 text-right font-bold ${scoreText}`}>{Math.round(ats_score)}%</td>
                </tr>
                <tr>
                  <td className="py-3 text-gray-500 dark:text-gray-400">Missing KW</td>
                  <td className="py-3 text-right text-red-500 dark:text-red-400 font-bold">{missing_keywords?.length ?? 0}</td>
                </tr>
                <tr>
                  <td className="py-3 text-gray-500 dark:text-gray-400">Match Level</td>
                  <td className={`py-3 text-right font-bold ${scoreText}`}>{scoreLabel}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Analyze;

