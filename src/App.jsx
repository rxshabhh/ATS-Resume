import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import LearnMore from './pages/LearnMore';
import Analyze from './pages/Analyze';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/learnmore" element={<LearnMore />}/>
        <Route path="/analyze" element={<Analyze />}/>
      </Routes>
    </Router>
  );
}
export default App;
