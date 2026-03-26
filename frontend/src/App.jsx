import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import LearnMore from './pages/LearnMore';
import Analyze from './pages/Analyze';
import History from './pages/History';
import Layout from './components/Layout';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/learnmore" element={<LearnMore />}/>
            <Route path="/analyze" element={<Analyze />}/>
            <Route path="/history" element={<History />}/>
          </Routes>
        </Layout>

      </Router>
    </ThemeProvider>
  );
}
export default App;
