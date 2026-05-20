import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import Loader from '../components/Loader';
import {
  Link as LinkIcon,
  Globe,
  Calendar,
  ExternalLink,
  Laptop,
  Compass,
  ArrowRight,
  Activity,
  AlertCircle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const COLORS = ['#4f46e5', '#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const PublicAnalytics = () => {
  const { shortCode } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPublicAnalytics = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/analytics/public/${shortCode}`);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching public analytics details:', error);
      toast.error('Failed to load public link statistics!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicAnalytics();
  }, [shortCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 p-8 text-center rounded-2xl max-w-md w-full space-y-5 shadow-xl">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h3 className="text-slate-800 font-bold text-lg font-display">Statistics not found</h3>
          <p className="text-slate-500 text-xs leading-relaxed">
            We couldn't retrieve public statistics for this shortened link. It may have been deleted or the code is incorrect.
          </p>
          <Link to="/" className="inline-block w-full py-2.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-lg text-sm font-semibold hover:opacity-95 shadow-md shadow-brand-primary/10">
            Go to PulseLink
          </Link>
        </div>
      </div>
    );
  }

  const { originalUrl, shortCode: code, createdAt, analytics } = data;

  return (
    <div className="bg-[#f8fafc] min-h-screen relative overflow-hidden pb-12 text-slate-700">
      {/* Ambient backgrounds details */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-brand-primary/5 rounded-full filter blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[-10%] w-[40vw] h-[40vw] bg-brand-secondary/5 rounded-full filter blur-[100px] pointer-events-none"></div>

      {/* Top Header navbar */}
      <nav className="bg-white sticky top-0 left-0 right-0 border-b border-slate-200/80 py-4 px-6 md:px-12 flex items-center justify-between z-40 shadow-sm">
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center shadow-md shadow-brand-primary/10">
            <LinkIcon className="text-white w-4.5 h-4.5 group-hover:rotate-45 transition-transform duration-300" />
          </div>
          <span className="font-display font-bold text-lg bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
            PulseLink
          </span>
        </Link>

        <Link
          to="/register"
          className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-lg hover:opacity-95 shadow-md shadow-brand-primary/10 transition-all flex items-center cursor-pointer"
        >
          <span>Shorten Your Own Links</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
        </Link>
      </nav>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-6 pt-10 space-y-8 relative z-10">
        {/* Upper Heading */}
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-indigo-50 text-brand-primary border border-indigo-100 uppercase">
            Public Dashboard
          </span>
          <h1 className="text-2xl md:text-4xl font-display font-extrabold text-slate-800 tracking-tight">
            Public Link Insights
          </h1>
          <p className="text-slate-500 text-xs">
            Aggregated viewer stats and click breakdowns for shortened code <strong className="text-slate-800 font-mono bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">{code}</strong>.
          </p>
        </div>

        {/* Shortlink Info Glass Panel */}
        <section className="bg-white border border-slate-200/80 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
          <div className="space-y-1.5 flex-1 max-w-full">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Target Link</span>
            <h2 className="text-lg md:text-xl font-display font-bold text-slate-800 flex items-center hover:text-brand-primary truncate">
              <a href={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}/${code}`} target="_blank" rel="noopener noreferrer" className="truncate">
                {code}
              </a>
              <ExternalLink className="w-4 h-4 ml-2 opacity-50 shrink-0" />
            </h2>
            <p className="text-xs text-slate-500 truncate max-w-full" title={originalUrl}>
              Destination: <strong className="text-slate-700 font-medium">{originalUrl}</strong>
            </p>
          </div>

          <div className="flex flex-wrap gap-4 border-t border-slate-100 md:border-t-0 pt-3 md:pt-0 w-full md:w-auto shrink-0 justify-start md:justify-end text-xs text-slate-500">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1.5 text-brand-secondary" />
              <span>Created: {new Date(createdAt).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center">
              <Globe className="w-4 h-4 mr-1.5 text-brand-accent" />
              <span>Clicks: <strong className="text-slate-800 ml-0.5">{analytics.totalClicks}</strong></span>
            </div>
          </div>
        </section>

        {/* Chart 1: Daily Click Trends (Area Graph) */}
        <section className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm">
          <h2 className="text-sm font-display font-bold text-slate-800 mb-4 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-brand-primary" />
            Click Activity Timeline (Last 7 Days)
          </h2>
          <div className="h-64 md:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.dailyTrends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="clicks" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorClicks)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Device & Browser breakdowns side by side */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Devices Pie Chart */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
            <h3 className="text-sm font-display font-bold text-slate-800 mb-3 flex items-center border-b border-slate-100 pb-3">
              <Laptop className="w-4 h-4 mr-2 text-brand-secondary" />
              Device Breakdown
            </h3>
            {analytics.deviceBreakdown.length > 0 ? (
              <div className="h-56 flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analytics.deviceBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={60} paddingAngle={3} dataKey="value">
                      {analytics.deviceBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '9px', color: '#475569' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center text-xs text-slate-400 italic">No clicks recorded yet.</div>
            )}
          </div>

          {/* Browser Pie Chart */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
            <h3 className="text-sm font-display font-bold text-slate-800 mb-3 flex items-center border-b border-slate-100 pb-3">
              <Compass className="w-4 h-4 mr-2 text-brand-primary" />
              Browser Distribution
            </h3>
            {analytics.browserBreakdown.length > 0 ? (
              <div className="h-56 flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analytics.browserBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={60} paddingAngle={3} dataKey="value">
                      {analytics.browserBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '9px', color: '#475569' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center text-xs text-slate-400 italic">No clicks recorded yet.</div>
            )}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 text-center text-slate-500 text-xs mt-16 bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 space-y-3">
          <p>© {new Date().getFullYear()} PulseLink. Built with clean modular Node/Express + React architecture.</p>
          <p className="text-slate-400 font-medium">This project is a part of a hackathon run by <a href="https://katomaran.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-brand-primary">https://katomaran.com</a></p>
        </div>
      </footer>
    </div>
  );
};

export default PublicAnalytics;
