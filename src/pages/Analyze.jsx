import Navbar from '../components/Navbar'
import Background from '../components/Background'

function Analyze() {
  return (
    <Background>
      <Navbar />

      <div className="pt-28" />

      <div className="min-h-screen w-full px-8 pt-32 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-1">
              <h1 className="text-3xl font-bold text-gray-800">
                Analysis Results
              </h1>
              <p className="text-gray-500 mt-2">
                Resume vs Job Description Compatibility
              </p>
            </div>

            <div className="lg:col-span-1 text-center">
              <h2 className="text-3xl font-semibold text-gray-800">
                <b>Detailed Analysis Report</b>
              </h2>
              <p className="text-gray-500 mt-2">
                Resume vs Job Description Compatibility
              </p>
            </div>

            <div className="lg:col-span-1 bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-500 rounded-full"></div>
                <div>
                  <h4 className="font-semibold">Welcome, User</h4>
                  <p className="text-sm text-gray-500">Resume Analyzer</p>
                </div>
              </div>
            </div>
          </div>


          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg p-8 text-center space-y-6">
              <h3 className="font-semibold text-lg">Overall Score</h3>
              <div className="flex justify-center">
                <div className="w-40 h-40 rounded-full border-[10px] border-blue-500 flex items-center justify-center text-3xl font-bold">
                  75%
                </div>
              </div>
            </div>


            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg p-6">
                  <h3 className="font-semibold mb-4">
                    Resume Keywords Found
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>Project Management</li>
                    <li>Agile Methodologies</li>
                    <li>Data Analysis</li>
                    <li>Docker</li>
                    <li>Git</li>
                  </ul>
                </div>
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg p-6">
                  <h3 className="font-semibold mb-4">
                    Missing Keywords
                  </h3>
                  <ul className="space-y-2 text-red-500">
                    <li>JavaScript</li>
                    <li>React</li>
                    <li>Node.js</li>
                    <li>Microservices</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg p-6 text-center">
                <div className="h-40 bg-gray-100 rounded-xl mb-4"></div>
                <p className="text-gray-600">
                  View Detailed Score: 70%
                </p>
              </div>
            </div>


            <div className="lg:col-span-1 space-y-8">
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg p-6">
                <h3 className="font-semibold mb-4">
                  Resume Formatting Tips
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li>✔ Clear section headings</li>
                  <li>✔ Proper bullet usage</li>
                  <li>✖ Avoid complex graphics</li>
                </ul>
              </div>
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg p-6 h-90">
                <h3 className="font-semibold mb-4">My Profile</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 border-b">
                      <th className="py-2 text-left">File</th>
                      <th className="text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">Resume_v2.pdf</td>
                      <td className="text-blue-600 font-semibold text-right">75%</td>
                    </tr>
                    <tr>
                      <td className="py-2">Software Engineer</td>
                      <td className="text-blue-600 font-semibold text-right">60%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Background>
  )
}

export default Analyze
