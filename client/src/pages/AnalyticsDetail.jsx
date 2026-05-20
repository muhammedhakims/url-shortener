import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import Loader from '../components/Loader';
import {
  ArrowLeft,
  Calendar,
  Globe,
  Share2,
  ExternalLink,
  Laptop,
  Check,
  Compass,
  PieChart as PieIcon,
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

const AnalyticsDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareCopied, setShareCopied] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/analytics/${id}`);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics details:', error);
      toast.error('Failed to load link analytics!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [id]);

  const handleCopyShareLink = async () => {
    if (!data?.url) return;
    
    const clientHost = window.location.origin;
    const publicShareUrl = `${clientHost}/public/${data.url.shortCode}`;
    
    try {
      await navigator.clipboard.writeText(publicShareUrl);
      setShareCopied(true);
      toast.success('Public share link copied!');
      setTimeout(() => setShareCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy share link!');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!data || !data.url) {
    return (
      <DashboardLayout>
        <div className="bg-white border border-slate-200 p-12 text-center rounded-xl max-w-xl mx-auto space-y-4 shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h3 className="text-slate-800 font-bold text-lg font-display">Analytics not found</h3>
          <p className="text-slate-500 text-xs">
            We couldn't retrieve link statistics for this ID. It may have been deleted or does not belong to your account.
          </p>
          <Link to="/dashboard" className="inline-block px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200">
            Back to Dashboard
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const { url, analytics } = data;

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-12 text-slate-700">
        {/* Navigation & Actions Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Link
              to="/dashboard"
              className="p-2 bg-white border border-slate-200 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-extrabold text-slate-800 tracking-tight flex items-center">
                Link Intelligence
              </h1>
              <span className="font-mono text-xs text-brand-primary font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{url.shortCode}</span>
            </div>
          </div>

          <button
            onClick={handleCopyShareLink}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-800 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
          >
            {shareCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Link Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Public Stats</span>
              </>
            )}
          </button>
        </div>

        {/* Shortlink Info Panel */}
        <section className="bg-white border border-slate-200/80 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden shadow-sm">
          <div className="space-y-1.5 flex-1 max-w-full">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Shortened Target</span>
            <h2 className="text-lg md:text-xl font-display font-bold text-slate-800 flex items-center hover:text-brand-primary truncate">
              <a href={url.shortUrl} target="_blank" rel="noopener noreferrer" className="truncate">
                {url.shortUrl}
              </a>
              <ExternalLink className="w-4 h-4 ml-2 opacity-50 shrink-0" />
            </h2>
            <p className="text-xs text-slate-500 truncate max-w-full" title={url.originalUrl}>
              Destination: <strong className="text-slate-700 font-medium">{url.originalUrl}</strong>
            </p>
          </div>

          <div className="flex flex-wrap gap-4 border-t border-slate-100 md:border-t-0 pt-3 md:pt-0 w-full md:w-auto shrink-0 justify-start md:justify-end text-xs text-slate-500">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1.5 text-brand-secondary" />
              <span>Created: {new Date(url.createdAt).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center">
              <Globe className="w-4 h-4 mr-1.5 text-brand-accent" />
              <span>Clicks: <strong className="text-slate-800 ml-0.5">{analytics.totalClicks}</strong></span>
            </div>
          </div>
        </section>

        {/* Chart 1: Daily Click Trends (Area Graph) */}
        <section className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm">
          <h2 className="text-base font-display font-bold text-slate-800 mb-4 flex items-center">
            <Activity className="w-4.5 h-4.5 mr-2 text-brand-primary" />
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
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="clicks" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorClicks)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Chart breakdowns: Browser vs Devices vs OS */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Devices Pie Chart */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
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
                    <Legend verticalAlign="bottom" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px', color: '#475569' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center text-xs text-slate-400 italic">No clicks recorded yet.</div>
            )}
          </div>

          {/* Browser Pie Chart */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
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
                    <Legend verticalAlign="bottom" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px', color: '#475569' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center text-xs text-slate-400 italic">No clicks recorded yet.</div>
            )}
          </div>

          {/* OS Distribution */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
            <h3 className="text-sm font-display font-bold text-slate-800 mb-3 flex items-center border-b border-slate-100 pb-3">
              <PieIcon className="w-4 h-4 mr-2 text-brand-accent" />
              Operating Systems
            </h3>
            {analytics.osBreakdown.length > 0 ? (
              <div className="h-56 flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analytics.osBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={60} paddingAngle={3} dataKey="value">
                      {analytics.osBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px', color: '#475569' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center text-xs text-slate-400 italic">No clicks recorded yet.</div>
            )}
          </div>
        </section>

        {/* Breakdowns Tables: Referrer & Geography */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Referrers */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
            <h3 className="text-sm font-display font-bold text-slate-800 mb-3 border-b border-slate-100 pb-3 flex justify-between">
              <span>Traffic Sources (Referrer)</span>
            </h3>
            <div className="overflow-hidden">
              <table className="w-full text-xs text-left text-slate-600">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100 pb-2">
                    <th className="py-2.5 font-semibold uppercase tracking-wider">Referrer URL</th>
                    <th className="py-2.5 text-right font-semibold uppercase tracking-wider">Clicks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analytics.referrerBreakdown.length > 0 ? (
                    analytics.referrerBreakdown.map((ref, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-3.5 font-medium text-slate-800 truncate max-w-[200px]" title={ref.name}>{ref.name}</td>
                        <td className="py-3.5 text-right font-bold text-slate-700">{ref.value}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="py-6 text-center text-slate-400 italic">No traffic sources available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Countries */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
            <h3 className="text-sm font-display font-bold text-slate-800 mb-3 border-b border-slate-100 pb-3 flex justify-between">
              <span>Geographical Locations</span>
            </h3>
            <div className="overflow-hidden">
              <table className="w-full text-xs text-left text-slate-600">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100 pb-2">
                    <th className="py-2.5 font-semibold uppercase tracking-wider">Country Name</th>
                    <th className="py-2.5 text-right font-semibold uppercase tracking-wider">Clicks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analytics.countryBreakdown.length > 0 ? (
                    analytics.countryBreakdown.map((cnt, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-3.5 font-medium text-slate-800">{cnt.name}</td>
                        <td className="py-3.5 text-right font-bold text-slate-700">{cnt.value}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="py-6 text-center text-slate-400 italic">No location records available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Recent Visit Activity Logs (Last 10 Clicks) */}
        <section className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
          <h3 className="text-sm font-display font-bold text-slate-800 mb-4 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-brand-primary" />
            Recent Click Activity Logs (Last 10 Visitors)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-600 min-w-[600px]">
              <thead>
                <tr className="text-slate-450 border-b border-slate-200 pb-2">
                  <th className="pb-2.5 font-semibold uppercase tracking-wider">Timestamp</th>
                  <th className="pb-2.5 font-semibold uppercase tracking-wider">Browser</th>
                  <th className="pb-2.5 font-semibold uppercase tracking-wider">OS</th>
                  <th className="pb-2.5 font-semibold uppercase tracking-wider">Device</th>
                  <th className="pb-2.5 font-semibold uppercase tracking-wider">IP Address</th>
                  <th className="pb-2.5 font-semibold uppercase tracking-wider">Country</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics.recentClicks.length > 0 ? (
                  analytics.recentClicks.map((click) => (
                    <tr key={click._id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 font-medium text-slate-800">{new Date(click.timestamp).toLocaleString()}</td>
                      <td className="py-3.5">{click.browser}</td>
                      <td className="py-3.5">{click.os}</td>
                      <td className="py-3.5">
                        <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-bold text-slate-600 uppercase">
                          {click.device}
                        </span>
                      </td>
                      <td className="py-3.5 font-mono text-slate-500">{click.ipAddress}</td>
                      <td className="py-3.5 text-slate-700">{click.country}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400 italic">No clicks recorded yet for this short link.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsDetail;
