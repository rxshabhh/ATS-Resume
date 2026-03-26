import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getHistory } from "../services/api";
import { FileText, Calendar, ChevronRight, TrendingUp, CheckCircle, UploadCloud } from "lucide-react";

function Dashboard() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const data = await getHistory();
        setHistory(data);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  return (
    <div className="flex flex-col gap-8 animate-fadeUp">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Overview</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">AI-Powered ATS Resume Evaluator</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Action Card */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 border border-indigo-200 dark:border-indigo-500/30 rounded-[32px] p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Optimize Your Resume</h2>
                <p className="text-gray-600 dark:text-gray-300 max-w-sm">
                  Get a comprehensive AI review that analyzes structure, content, and ATS compatibility in seconds.
                </p>
                <button 
                  onClick={() => navigate("/Upload")}
                  className="mt-4 bg-gray-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform shadow-lg shadow-gray-900/20 dark:shadow-white/10 flex items-center gap-2"
                >
                  <UploadCloud size={20} /> Upload Resume
                </button>
              </div>
              
              <div className="hidden md:flex w-40 h-40 bg-white/50 dark:bg-black/20 rounded-full items-center justify-center backdrop-blur-md border border-white/50 dark:border-white/10 shadow-inner">
                 <div className="text-indigo-500 dark:text-indigo-400">
                   <FileText size={48} />
                 </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-orange-50/50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Keyword Match</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Aligns your skills and experience with job descriptions perfectly.</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/20 px-3 py-1 rounded-full">Core Feature</span>
                <TrendingUp size={20} className="text-orange-500" />
              </div>
            </div>
            
            <div className="bg-green-50/50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Structure & Readability</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Ensures your resume is clean, organized, and fully ATS-compliant.</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-500/20 px-3 py-1 rounded-full">Core Feature</span>
                <CheckCircle size={20} className="text-green-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Evaluations Leaderboard */}
        <div className="lg:col-span-1 bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-[32px] p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent History</h3>
            {!loading && history.length > 0 && (
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                {history.length} Scans
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-black/5 dark:bg-white/5 rounded-2xl animate-pulse" />
              ))
            ) : history.length > 0 ? (
              history.slice(0, 3).map((item) => {
                const isHigh = item.ats_score > 70;
                return (
                  <div
                    key={item.id}
                    onClick={() => navigate("/analyze", { state: { result: item, filename: item.filename } })}
                    className="flex items-center gap-4 p-4 bg-white/60 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 border border-white/50 dark:border-white/5 rounded-2xl cursor-pointer transition-all hover:shadow-sm group"
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isHigh ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'}`}>
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{item.filename}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                        <Calendar size={12} /> {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`block text-lg font-bold ${isHigh ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                        {Math.round(item.ats_score)}
                      </span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                <FileText size={32} className="mb-3 opacity-50" />
                <p className="text-sm">No recent scans. Upload a resume to get started.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;