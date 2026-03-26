import { Link } from 'react-router-dom';
import Button from './Button';

const Hero = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 pt-20 pb-14 text-center">
      <h1 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-6">
        AI-Powered Resume Evaluation
      </h1>

      <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
        ATS-driven insights to optimize resumes and improve hiring outcomes.
      </p>

      <div className="flex justify-center gap-4">
        <Link to="/upload">
          <Button>Upload Resume</Button>
        </Link>
        <Link to="/learnmore">
          <Button variant="secondary">Learn More</Button>
        </Link>
      </div>
    </div>
  );
};

export default Hero;
