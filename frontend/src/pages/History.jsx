import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getHistory } from "../services/api";
import { FileText, Calendar, Search } from "lucide-react";

function History() {
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
    <div className="flex flex-col gap-8 animate-fadeUp py-6 w-full max-w-5xl mx-auto flex-1">
      
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Analysis History</h1>
        <p className="text-gray-500 dark:text-gray-400">View your previous ATS evaluation reports.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-white/50 dark:bg-white/5 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : history.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {history.map((item) => {
            const isHigh = item.ats_score > 70;
            return (
              <div
                key={item.id}
                onClick={() => navigate("/analyze", { state: { result: item, filename: item.filename } })}
                className="flex items-center gap-4 p-6 bg-white/50 dark:bg-black/20 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-[32px] cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md group"
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${isHigh ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'}`}>
                  <FileText size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 dark:text-white text-base truncate">{item.filename}</h4>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                    <Calendar size={14} /> {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`block text-2xl font-black ${isHigh ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                    {Math.round(item.ats_score)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-white/50 dark:bg-black/20 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-[32px]">
          <Search size={48} className="text-gray-400 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No history found</h3>
          <p className="text-gray-500 dark:text-gray-400">You haven't analyzed any resumes yet.</p>
          <button 
            onClick={() => navigate("/upload")}
            className="mt-6 bg-gray-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform"
          >
            Go to Upload
          </button>
        </div>
      )}
    </div>
  );
}

export default History;
