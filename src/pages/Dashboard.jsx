import React from "react";
import Navbar from "../components/Navbar";
import Background from "../components/Background";
import Particles from "react-tsparticles";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <Background>
      <Particles
        options={{
          particles: {
            number: { value: 35 },
            size: { value: 2 },
            opacity: { value: 0.25 },
            move: { enable: true, speed: 0.6 },
            links: { enable: true, opacity: 0.2, distance: 120 },
          },
        }}
        style={{
          position: "fixed",
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      />

      <div className="relative z-10">
        <Navbar />
        <div className="pt-45" />

        <main className="min-h-screen px-6">
          <div className="max-w-7xl w-full mx-auto flex flex-col lg:flex-row items-center justify-between gap-16">
            <div className="space-y-8 text-center lg:text-left animate-fadeUp">
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

              <div className="border-2 border-dashed border-blue-400 rounded-xl p-8 bg-white shadow-sm max-w-md mx-auto lg:mx-0 hover:shadow-lg hover:scale-105 transition duration-300">
                <p className="text-gray-600 mb-2 text-center">
                  Drop your resume here or choose a file.
                </p>

                <p className="text-sm text-gray-400 text-center mb-6">
                  PDF & DOCX only. Max 2MB file size.
                </p>

                <div className="flex justify-center">
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition transform hover:scale-105"
                    onClick={() => {
                      navigate("/Upload");
                    }}
                  >
                    Upload Your Resume
                  </button>
                </div>

                <p className="text-center text-sm text-gray-500 mt-4">
                  🔒 Privacy guaranteed
                </p>
              </div>
            </div>

            <div className="hidden lg:flex justify-center animate-slideIn">
              <div className="bg-white rounded-2xl shadow-xl p-6 w-[420px]">
                <div className="mb-6 flex justify-center">
                  <lottie-player
                    src="/animations/animation2.json"
                    background="transparent"
                    speed="1"
                    style={{ width: "500px", height: "400px" }}
                    loop
                    autoplay
                  ></lottie-player>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full text-center mt-24">
            <p className="text-gray-900 text-6xl font-semibold max-w-4xl mx-auto">
              <b>
                Enhance’s Resume Checker forms its ATS score with a two-tier
                system
              </b>
            </p>
          </div>

          <div className="max-w-7xl mx-auto mt-16 flex flex-col lg:flex-row items-center justify-center gap-16">
            <div className="hidden lg:flex justify-center animate-fadeUp">
              <div className="bg-white rounded-2xl shadow-xl p-6 w-[420px]">
                <div className="mb-6 flex justify-center">
                  <lottie-player
                    src="/animations/animation1.json"
                    background="transparent"
                    speed="1"
                    style={{ width: "300px", height: "300px" }}
                    loop
                    autoplay
                  ></lottie-player>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-1/2 animate-fadeUp">
              <p className="text-lg text-gray-700 text-center lg:text-left">
                Our advanced ATS scoring system evaluates your resume across
                structure and keyword optimization, ensuring maximum
                compatibility with applicant tracking systems.
              </p>
            </div>
          </div>

          <div className="max-w-7xl mx-auto mt-16 flex flex-col lg:flex-row items-center justify-center gap-16">
            <div className="w-full lg:w-1/2 animate-fadeUp">
              <p className="text-lg text-gray-700 text-center lg:text-left">
                Our advanced ATS scoring system evaluates your resume across
                structure and keyword optimization, ensuring maximum
                compatibility with applicant tracking systems.
              </p>
            </div>
            <div className="hidden lg:flex justify-center animate-fadeUp">
              <div className="bg-white rounded-2xl shadow-xl p-6 w-[420px]">
                <div className="mb-6 flex justify-center">
                  <lottie-player
                    src="/animations/animation3.json"
                    background="transparent"
                    speed="1"
                    style={{ width: "300px", height: "300px" }}
                    loop
                    autoplay
                  ></lottie-player>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Background>
  );
}

export default Dashboard;