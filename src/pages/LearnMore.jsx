import Navbar from '../components/Navbar'
import Background from '../components/Background'

function LearnMore() {
  return (
    <Background>
      <Navbar />
      <div className="pt-28"/>
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h1 className="text-5xl font-semibold text-gray-900 mb-6">
              About the ATS Resume Analyzer
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              The ATS Resume Analyzer is an AI-powered platform designed to
              evaluate resumes against job descriptions using Applicant Tracking
              System (ATS) principles followed in modern recruitment pipelines.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              The system provides structured, data-driven insights that help
              candidates understand resume relevance, keyword alignment, and
              overall compatibility with automated hiring systems.
            </p>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/60 transition-all duration-500 hover:shadow-3xl">
            <img
              src="/assests/backgrounds/learnmore_background.png"
              alt="ATS Resume Analyzer interface preview"
              className="w-full h-auto object-cover transition-transform duration-500 hover:scale-110"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-white/80 backdrop-blur-2xl border border-white/60 rounded-3xl p-10 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">
            What This Platform Does
          </h2>
          <p className="text-gray-700 leading-relaxed">
            The ATS Resume Analyzer compares resumes directly with job
            descriptions to evaluate keyword relevance, skill match, and content
            structure. It highlights gaps between resume content and job
            requirements to optimize resumes for ATS screening systems.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-semibold text-gray-900 mb-10 text-center">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Upload Resume', desc: 'Upload resume in PDF or DOC format.' },
            { step: '02', title: 'Add Job Description', desc: 'Provide job description for comparison.' },
            { step: '03', title: 'ATS Evaluation', desc: 'System analyzes resume compatibility.' }
          ].map((item) => (
            <div
              key={item.step}
              className="bg-white/80 backdrop-blur-2xl border border-white/60 rounded-2xl p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            >
              <div className="text-blue-600 text-xl font-semibold mb-2">
                {item.step}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-24">
        <div className="bg-white/80 backdrop-blur-2xl border border-white/60 rounded-3xl p-10 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
          <h2 className="text-3xl font-semibold text-gray-900 mb-6">
            Why This Matters
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li>• Improves resume compatibility with ATS systems</li>
            <li>• Aligns resumes with job requirements</li>
            <li>• Reduces rejection due to keyword mismatch</li>
            <li>• Provides transparent, data-driven evaluation</li>
          </ul>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-32 text-center">
        <h2 className="text-3xl font-semibold text-gray-900 mb-10">
          Project Creators
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white/80 backdrop-blur-2xl border border-white/60 rounded-2xl p-8 shadow-xl">
            <h3 className="text-xl font-semibold text-gray-900">
              Veer Vikram Saxena
            </h3>
            <p className="text-gray-600">
              Full Stack & Data Science Enthusiast
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-2xl border border-white/60 rounded-2xl p-8 shadow-xl">
            <h3 className="text-xl font-semibold text-gray-900">
              Rishabh Sinha
            </h3>
            <p className="text-gray-600">
              Developer & Backend Enthusiast
            </p>
          </div>
        </div>
      </div>
    </Background>
  )
}

export default LearnMore
