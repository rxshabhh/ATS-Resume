import { useState } from 'react';
import { Upload as UploadIcon, FileText, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import Background from '../components/Background';

function Upload() {
  const navigate = useNavigate();
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) setResumeFile(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/analyze');
  };

  return (
    <Background>
      <Navbar />
      <div className="pt-28"/>
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h1 className="text-5xl font-semibold text-gray-900 mb-4">
            Upload Your Documents
          </h1>
          <p className="text-lg text-gray-600">
            Upload your resume and job description for ATS evaluation
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="
            bg-white/80 backdrop-blur-2xl
            border border-white/60
            rounded-2xl p-8
            shadow-xl transition-all
            hover:shadow-2xl
          ">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900">
                Upload Resume
              </h3>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
              <input
                type="file"
                id="resume-upload"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
              />
              <label htmlFor="resume-upload" className="cursor-pointer">
                <UploadIcon className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <p className="font-medium text-gray-800">
                  {resumeFile ? resumeFile.name : 'Click to upload resume'}
                </p>
                <p className="text-sm text-gray-500">
                  PDF, DOC, DOCX (Max 5MB)
                </p>
              </label>
            </div>
          </div>
          <div className="
            bg-white/80 backdrop-blur-2xl
            border border-white/60
            rounded-2xl p-8
            shadow-xl transition-all
            hover:shadow-2xl
          ">
            <div className="flex items-center gap-3 mb-4">
              <Briefcase className="w-6 h-6 text-indigo-600" />
              <h3 className="text-xl font-semibold text-gray-900">
                Job Description
              </h3>
            </div>
            <textarea
              className="w-full h-64 px-4 py-3 rounded-xl
              bg-white border border-gray-300
              text-gray-800
              focus:ring-2 focus:ring-blue-400/50
              resize-none"
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>
          <div className="text-center">
            <Button type="submit" className="px-14">
              Analyze Resume
            </Button>
          </div>

        </form>
      </div>
    </Background>
  );
}

export default Upload;

