import React from "react"
import Navbar from "../components/Navbar"
import Background from "../components/Background"

function Dashboard() {
  return (
    <Background>
      <Navbar />
      <div className="pt-16" />

      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-16 items-center">

          <div className="space-y-8 text-center lg:text-left">

            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              AI Powered Resume
              <br />
              <span className="block text-center lg:text-left">
                Evaluator
              </span>
            </h1>

            <p className="text-gray-600 text-lg max-w-lg mx-auto lg:mx-0">
              Optimize your resume with a comprehensive AI review system that
              analyzes structure, content, and ATS compatibility
              <br />
              <span className="text-4xl font-semibold text-black">
                IN SECONDS.
              </span>
            </p>

            <div className="border-2 border-dashed border-blue-400 rounded-xl p-8 bg-white shadow-sm max-w-md mx-auto lg:mx-0">
              <p className="text-gray-600 mb-2 text-center">
                Drop your resume here or choose a file.
              </p>

              <p className="text-sm text-gray-400 text-center mb-6">
                PDF & DOCX only. Max 2MB file size.
              </p>

              <div className="flex justify-center">
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition">
                  Upload Your Resume
                </button>
              </div>

              <p className="text-center text-sm text-gray-500 mt-4">
                🔒 Privacy guaranteed
              </p>
            </div>

          </div>

          <div className="hidden lg:flex justify-center">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-[420px]">
              <div className="mb-6 flex justify-center">

                <lottie-player
                  src="/animations/animation2.json"
                  background="transparent"
                  speed="1"
                  style={{ width: "300px", height: "300px" }}
                  loop
                  autoplay
                ></lottie-player>

              </div>

              <div className="mt-6">
                <div className="w-full bg-gray-300 h-3 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-3 rounded-full w-[80%]" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </Background>
  )
}

export default Dashboard
