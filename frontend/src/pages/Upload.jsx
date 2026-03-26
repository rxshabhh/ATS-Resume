import { useState } from 'react';
import { Upload as UploadIcon, FileText, Briefcase, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { analyzeResume } from '../services/api';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

function Upload() {
  const navigate = useNavigate();
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const validateFile = (file) => {
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are supported.');
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be less than 2MB.');
      return false;
    }
    return true;
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file && validateFile(file)) {
      setResumeFile(file);
      setError('');
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      setResumeFile(file);
      setError('');
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!resumeFile) {
      setError('Please select a PDF resume file.');
      return;
    }
    if (!jobDescription.trim()) {
      setError('Please paste the job description.');
      return;
    }

    setLoading(true);
    try {
      const result = await analyzeResume(resumeFile, jobDescription);
      navigate('/analyze', { state: { result, filename: resumeFile.name } });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto animate-fadeUp py-6">
      
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
          Analyze Your Fit
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Upload resume and paste job description to run deep ATS evaluation.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 rounded-2xl px-6 py-4 animate-shake">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="font-medium text-sm">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Resume Upload - Left Side */}
        <div className="bg-white/50 dark:bg-black/20 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-[32px] p-6 shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Resume.pdf</h3>
            </div>
            {resumeFile && (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-bold bg-green-50 dark:bg-green-500/10 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-4 h-4" /> Ready
              </div>
            )}
          </div>

          <div
            className={`flex-1 border-2 border-dashed rounded-[24px] p-8 text-center flex flex-col justify-center transition-all min-h-[220px] cursor-pointer ${
              resumeFile 
                ? 'border-indigo-400 dark:border-indigo-500/50 bg-indigo-50/50 dark:bg-indigo-500/5' 
                : 'border-gray-300 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:bg-gray-50/50 dark:hover:bg-white/5'
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="resume-upload"
              className="hidden"
              accept=".pdf"
              onChange={handleResumeUpload}
            />
            <label htmlFor="resume-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
              <div className={`w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center transition-colors ${
                resumeFile ? 'bg-indigo-500 text-white' : 'bg-white dark:bg-white/10 text-gray-400 dark:text-gray-500 shadow-sm border border-gray-100 dark:border-white/5'
              }`}>
                <UploadIcon className="w-6 h-6" />
              </div>
              <p className="font-bold text-gray-900 dark:text-white text-base">
                {resumeFile ? resumeFile.name : 'Click or drop PDF here'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
                Max 2 MB
              </p>
            </label>
          </div>
        </div>

        {/* Job Description - Right Side */}
        <div className="bg-white/50 dark:bg-black/20 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-[32px] p-6 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Job Description</h3>
          </div>
          <textarea
            className="flex-1 w-full p-4 rounded-[24px] bg-white/70 dark:bg-black/30 border border-gray-200 dark:border-white/5 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 dark:focus:ring-indigo-500/30 transition-all resize-none outline-none text-sm font-medium placeholder:text-gray-400 dark:placeholder:text-gray-600 min-h-[220px] custom-scrollbar"
            placeholder="Paste role requirements..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>

        {/* Action Button */}
        <div className="md:col-span-2 text-center mt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-gray-900 dark:bg-white text-white dark:text-black hover:scale-105 active:scale-95 transition-transform px-12 py-3.5 rounded-full font-bold text-base shadow-lg shadow-gray-900/20 dark:shadow-white/10 flex items-center justify-center gap-2 mx-auto disabled:opacity-70 disabled:hover:scale-100"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing Fit...
              </>
            ) : (
              'Run Evaluation'
            )}
          </button>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-3 font-medium">
            Scan takes 10-20 seconds.
          </p>
        </div>
      </form>
    </div>
  );
}

export default Upload;

