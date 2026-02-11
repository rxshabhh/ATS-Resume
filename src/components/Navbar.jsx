import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import Button from './Button';

const Navbar = () => {
  return (
    <div className="fixed top-0 z-50 flex justify-center">
      <nav className="mt-4 bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl shadow-md w-full max-w-6xl">
        <div className="px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg shadow">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xl font-semibold text-gray-900">
              ATS Resume Analyzer
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600">
              Home
            </Link>
            <Link to="/upload">
              <Button variant="cta" className="px-6 py-2 text-base">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;

