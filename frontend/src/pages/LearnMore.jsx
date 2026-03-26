function LearnMore() {
  return (
    <div className="w-full animate-fadeUp py-6 px-4 md:px-8">
      
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-16 grid lg:grid-cols-2 gap-12 items-center bg-white/50 dark:bg-black/20 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-[32px] p-8 md:p-12 shadow-sm">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
            About the ATS Resume Analyzer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6 font-medium">
            The ATS Resume Analyzer is an AI-powered platform designed to
            evaluate resumes against job descriptions using Applicant Tracking
            System (ATS) principles followed in modern recruitment pipelines.
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
            The system provides structured, data-driven insights that help
            candidates understand resume relevance, keyword alignment, and
            overall compatibility with automated hiring systems.
          </p>
        </div>
        <div className="rounded-[24px] overflow-hidden shadow-2xl border border-white/40 dark:border-white/10 transition-all duration-500 hover:scale-[1.02]">
          <img
            src="/assests/backgrounds/learnmore_background.png"
            alt="ATS Resume Analyzer interface preview"
            className="w-full h-auto object-cover"
          />
        </div>
      </div>

      {/* What This Platform Does */}
      <div className="max-w-4xl mx-auto mb-16">
        <div className="bg-indigo-50/50 dark:bg-indigo-500/10 backdrop-blur-xl border border-indigo-100 dark:border-indigo-500/20 rounded-[32px] p-10 shadow-sm text-center">
          <h2 className="text-3xl font-bold text-indigo-900 dark:text-indigo-400 mb-4">
            What This Platform Does
          </h2>
          <p className="text-lg text-indigo-800 dark:text-indigo-200 leading-relaxed font-medium">
            The ATS Resume Analyzer compares resumes directly with job
            descriptions to evaluate keyword relevance, skill match, and content
            structure. It highlights gaps between resume content and job
            requirements to optimize resumes for ATS screening systems.
          </p>
        </div>
      </div>

      {/* How It Works Grid */}
      <div className="max-w-7xl mx-auto mb-20">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-10 text-center">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Upload Resume', desc: 'Upload your resume in PDF format.', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-100 dark:border-blue-500/20' },
            { step: '02', title: 'Add Job Description', desc: 'Provide the job description for comparison.', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10', border: 'border-purple-100 dark:border-purple-500/20' },
            { step: '03', title: 'ATS Evaluation', desc: 'Our AI analyzes compatibility instantly.', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-100 dark:border-emerald-500/20' }
          ].map((item) => (
            <div
              key={item.step}
              className={`${item.bg} backdrop-blur-xl border ${item.border} rounded-[32px] p-8 shadow-sm transition-all duration-300 hover:scale-105`}
            >
              <div className={`${item.color} text-2xl font-black mb-4 opacity-80`}>
                {item.step}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 font-medium">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-10 max-w-7xl mx-auto mb-20">
        {/* Why This Matters */}
        <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-[32px] p-10 shadow-sm">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Why This Matters
          </h2>
          <ul className="space-y-4 text-lg text-gray-700 dark:text-gray-300 font-medium">
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              Improves resume compatibility with ATS systems
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              Aligns resumes with job requirements
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              Reduces rejection due to keyword mismatch
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              Provides transparent, data-driven evaluation
            </li>
          </ul>
        </div>

        {/* Project Creators */}
        <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-[32px] p-10 shadow-sm flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Project Creators
          </h2>
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1 bg-white/60 dark:bg-black/20 rounded-2xl p-6 border border-white/40 dark:border-white/5">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                Veer Vikram Saxena
              </h3>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                Full Stack & Data Science Enthusiast
              </p>
            </div>
            <div className="flex-1 bg-white/60 dark:bg-black/20 rounded-2xl p-6 border border-white/40 dark:border-white/5">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                Rishabh Sinha
              </h3>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                Developer & Backend Enthusiast
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default LearnMore
