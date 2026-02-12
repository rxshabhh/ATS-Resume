import React from 'react';
import { FileText, Award, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import Background from '../components/Background';
function Dashboard() {
  return (
    <Background>
      <Navbar />
      <div className="pt-28"/>
      <Hero />
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard icon={FileText} title="Total Resumes" value="0" iconBg="bg-pink-400" />
          <StatCard icon={Award} title="Avg. Match Score" value="0%" iconBg="bg-cyan-400" />
          <StatCard icon={Clock} title="Avg. Processing Time" value="0 days" iconBg="bg-orange-400" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 h-80">
          <ChartCard data={[]} />
          {/*<SkillsCard keywords={[]} />*/}
          <ChartCard data={[]} />
        </div>
      </div>
    </Background>
  );
}
export default Dashboard;
