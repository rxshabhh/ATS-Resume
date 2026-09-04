import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, FileDown, AlertTriangle, Calculator, Check, X } from 'lucide-react';
import SkillsCard from '../components/SkillsCard';

/* Score ring color logic */
function scoreColor(score) {
  if (score == null) return { ring: 'border-gray-400', text: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-white/5' };
  if (score >= 70) return { ring: 'border-green-500', text: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/10' };
  if (score >= 40) return { ring: 'border-yellow-500', text: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-500/10' };
  return { ring: 'border-red-500', text: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10' };
}

function barColor(score) {
  if (score == null) return 'bg-gray-400';
  if (score >= 70) return 'bg-green-500';
  if (score >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
}

function fitLabel(score) {
  if (score == null) return 'Not Scored';
  if (score >= 70) return 'Strong Fit';
  if (score >= 40) return 'Moderate Fit';
  return 'Weak Fit';
}

function ScoreRing({ score }) {
  const { ring, text } = scoreColor(score);
  return (
    <div className={`w-36 h-36 rounded-full border-[10px] ${ring} flex items-center justify-center flex-col shadow-inner backdrop-blur-sm`}>
      <span className={`text-4xl font-bold ${text}`}>{score == null ? '—' : Math.round(score)}</span>
      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase font-bold tracking-wider">Score</span>
    </div>
  );
}

/**
 * The audit trail for the deterministic score: every skill the job description
 * asked for, what it was worth, and whether the resume showed it. This is what
 * makes the number answerable rather than merely produced.
 */
function KeywordBreakdown({ keywordScore }) {
  const { score, breakdown = [], matched_weight, total_weight, total_jd_skills } = keywordScore;
  const { text } = scoreColor(score);

  return (
    <div className="bg-white/50 dark:bg-black/20 backdrop-blur-xl rounded-[32px] border border-white/60 dark:border-white/10 shadow-sm p-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-xl">
          <Calculator className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <h3 className="font-bold text-xl text-gray-900 dark:text-white">Keyword Score</h3>
        <span className={`ml-auto font-black text-3xl ${text}`}>
          {score == null ? '—' : `${Math.round(score)}%`}
        </span>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-6">
        Computed without the AI: each skill the job asks for is weighted by how specific
        it is, and the score is the share of that weight your resume covers. The same
        inputs always give the same number.
      </p>

      {score == null ? (
        <p className="text-gray-600 dark:text-gray-300 font-medium">
          No skills from the scoring vocabulary appeared in this job description, so there
          was nothing to score against. This is not a zero — it means the job description
          was not readable by this method.
        </p>
      ) : (
        <>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-4">
            Matched <span className={text}>{matched_weight}</span> of{' '}
            <span className="text-gray-900 dark:text-white">{total_weight}</span> weight
            across {total_jd_skills} required skill{total_jd_skills === 1 ? '' : 's'}.
          </p>

          <ul className="divide-y divide-gray-100 dark:divide-white/10">
            {breakdown.map((row) => (
              <li key={row.skill} className="flex items-center gap-3 py-2.5">
                {row.matched ? (
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                ) : (
                  <X className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0" />
                )}
                <span
                  className={`font-medium ${
                    row.matched
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400 line-through'
                  }`}
                >
                  {row.skill}
                </span>
                <span className="ml-auto text-xs font-bold text-gray-400 dark:text-gray-500 tabular-nums">
                  weight {row.weight.toFixed(1)}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
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

  const { ats_score, feedback, missing_keywords, keyword_score, ai_unavailable } = result;

  // When the AI is unreachable the deterministic score is the only one there
  // is, so it becomes the headline figure rather than a footnote.
  const headlineScore = ats_score ?? keyword_score?.score ?? null;
  const { text: scoreText, bg: scoreBg } = scoreColor(headlineScore);
  const scoreLabel = fitLabel(headlineScore);
  const headlineSource = ats_score != null ? 'AI analysis' : 'keyword scoring';

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

      {ai_unavailable && (
        <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 rounded-[24px] p-5">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-amber-900 dark:text-amber-200">AI analysis unavailable</h4>
            <p className="text-sm text-amber-800 dark:text-amber-300/90 font-medium mt-1">
              The model service did not answer, so the written feedback is missing. The
              keyword score below was computed locally and is unaffected.
            </p>
          </div>
        </div>
      )}

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
          <div className={`w-2 h-10 rounded-full ${barColor(headlineScore)}`} />
          <div>
            <h4 className={`font-bold text-lg leading-tight ${scoreText}`}>{scoreLabel}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">
              {headlineScore == null ? 'Not scored' : `${Math.round(headlineScore)} / 100 Match`}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Score ring */}
        <div className="lg:col-span-1 bg-white/50 dark:bg-black/20 backdrop-blur-xl rounded-[32px] border border-white/60 dark:border-white/10 shadow-sm p-8 flex flex-col items-center justify-center gap-6">
          <h3 className="font-bold text-gray-900 dark:text-white">Overall Match</h3>
          <ScoreRing score={headlineScore} />
          <div className="text-center">
            <p className={`font-bold text-lg ${scoreText}`}>{scoreLabel}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold mt-1">via {headlineSource}</p>
          </div>
        </div>

        {/* Keywords + Feedback */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Score breakdown chip */}
            <div className="bg-white/50 dark:bg-black/20 backdrop-blur-xl rounded-[32px] border border-white/60 dark:border-white/10 shadow-sm p-6 flex flex-col justify-center gap-4">
              <h3 className="font-bold text-gray-900 dark:text-white text-center">ATS Compatibility</h3>
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3 relative overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor(headlineScore)}`}
                  style={{ width: `${headlineScore ?? 0}%` }}
                />
              </div>
              <p className={`font-black text-4xl text-center ${scoreText}`}>
                {headlineScore == null ? '—' : `${Math.round(headlineScore)}%`}
              </p>
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
              <h3 className="font-bold text-xl text-gray-900 dark:text-white">AI Analysis &amp; Suggestions</h3>
            </div>
            {feedback ? (
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line text-[15px] font-medium">
                {feedback}
              </p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-[15px] font-medium">
                No written feedback for this run. The keyword score below still applies.
              </p>
            )}
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
                  <td className="py-3 text-gray-500 dark:text-gray-400">AI Score</td>
                  <td className="py-3 text-right font-bold text-gray-900 dark:text-white">
                    {ats_score == null ? '—' : `${Math.round(ats_score)}%`}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 text-gray-500 dark:text-gray-400">Keyword Score</td>
                  <td className="py-3 text-right font-bold text-gray-900 dark:text-white">
                    {keyword_score?.score == null ? '—' : `${Math.round(keyword_score.score)}%`}
                  </td>
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

      {keyword_score && <KeywordBreakdown keywordScore={keyword_score} />}
    </div>
  );
}

export default Analyze;
