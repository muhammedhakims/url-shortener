import React, { useState, useEffect } from 'react';
import API from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import UrlCard from '../components/UrlCard';
import Loader from '../components/Loader';
import {
  Plus,
  Search,
  Filter,
  Link2,
  MousePointerClick,
  Zap,
  Globe,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  // Search/Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, expired

  const fetchUrls = async () => {
    try {
      setLoading(true);
      const res = await API.get('/url/my-urls');
      if (res.data.success) {
        setUrls(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching URLs:', error);
      toast.error('Failed to load links!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!originalUrl) {
      toast.error('Please enter a target URL!');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        originalUrl,
        customAlias: customAlias.trim() || undefined,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      };

      const res = await API.post('/url/create', payload);
      if (res.data.success) {
        toast.success('Short link generated successfully!');
        setOriginalUrl('');
        setCustomAlias('');
        setExpiresAt('');
        fetchUrls(); // Refresh list
      }
    } catch (error) {
      const errMsg = error.response?.data?.error || 
                     error.response?.data?.errors?.[0]?.message || 
                     'Failed to shorten URL';
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (id, updatedPayload) => {
    try {
      const res = await API.put(`/url/${id}`, updatedPayload);
      if (res.data.success) {
        toast.success(res.data.message || 'Link updated successfully!');
        fetchUrls(); // Refresh
        return true;
      }
      return false;
    } catch (error) {
      const errMsg = error.response?.data?.error || 
                     error.response?.data?.errors?.[0]?.message || 
                     'Failed to update URL';
      toast.error(errMsg);
      return false;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this URL? This will permanently delete all click analytics associated with it.')) {
      return;
    }

    try {
      const res = await API.delete(`/url/${id}`);
      if (res.data.success) {
        toast.success('Link deleted successfully!');
        fetchUrls(); // Refresh list
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete URL');
    }
  };

  // Filter and search computation
  const filteredUrls = urls.filter((url) => {
    const matchesSearch =
      url.shortCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      url.originalUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (url.customAlias && url.customAlias.toLowerCase().includes(searchQuery.toLowerCase()));

    const isExpired = url.status === 'expired' || (url.expiresAt && new Date(url.expiresAt) <= new Date());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && !isExpired) ||
      (statusFilter === 'expired' && isExpired);

    return matchesSearch && matchesStatus;
  });

  // Highlight Stats
  const totalClicks = urls.reduce((sum, item) => sum + item.clicks, 0);
  const activeCount = urls.filter((url) => {
    const isExpired = url.status === 'expired' || (url.expiresAt && new Date(url.expiresAt) <= new Date());
    return !isExpired;
  }).length;
  const expiredCount = urls.length - activeCount;

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        {/* Upper Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-extrabold text-slate-800 tracking-tight">
              Dashboard
            </h1>
            <p className="text-slate-500 text-sm">
              Shorten links, configure custom aliases, and track link clicks in real-time.
            </p>
          </div>
        </div>

        {/* Shorten Link Form Panel */}
        <section className="bg-white border border-slate-200/80 p-6 rounded-2xl relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-brand-primary via-brand-secondary to-purple-500"></div>
          
          <h2 className="text-base font-display font-bold text-slate-800 mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-brand-primary" />
            Create Short Link
          </h2>

          <form onSubmit={handleCreate} className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
            <div className="lg:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Destination URL</label>
              <input
                type="url"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                placeholder="https://example.com/very-long-target-link-path..."
                className="w-full px-4 py-2.5 text-sm glass-input border-slate-200 text-slate-800 bg-white"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Custom Alias (Optional)</label>
              <input
                type="text"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
                placeholder="my-custom-code"
                className="w-full px-4 py-2.5 text-sm glass-input border-slate-200 text-slate-800 bg-white font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Link Expiry Date (Optional)</label>
              <input
                type="date"
                value={expiresAt}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-4 py-2.5 text-sm glass-input border-slate-200 text-slate-800 bg-white"
              />
            </div>

            <div className="lg:col-span-4 flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-sm rounded-lg shadow-md shadow-brand-primary/10 hover:opacity-95 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                {submitting ? (
                  <span className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Generate ShortLink</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Statistics Panels */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 p-5 rounded-xl flex items-center space-x-4 shadow-sm">
            <div className="w-11 h-11 bg-indigo-50 rounded-lg flex items-center justify-center text-brand-primary">
              <Link2 className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 block font-semibold">Total Short Links</span>
              <strong className="text-2xl text-slate-800 font-display font-bold">{urls.length}</strong>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 p-5 rounded-xl flex items-center space-x-4 shadow-sm">
            <div className="w-11 h-11 bg-violet-50 rounded-lg flex items-center justify-center text-brand-secondary">
              <MousePointerClick className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 block font-semibold">Total Clicks</span>
              <strong className="text-2xl text-slate-800 font-display font-bold">{totalClicks}</strong>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 p-5 rounded-xl flex items-center space-x-4 shadow-sm">
            <div className="w-11 h-11 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
              <Globe className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 block font-semibold">Active Links</span>
              <strong className="text-2xl text-slate-800 font-display font-bold">{activeCount}</strong>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 p-5 rounded-xl flex items-center space-x-4 shadow-sm">
            <div className="w-11 h-11 bg-red-50 rounded-lg flex items-center justify-center text-brand-danger">
              <AlertCircle className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 block font-semibold">Expired Links</span>
              <strong className="text-2xl text-slate-800 font-display font-bold">{expiredCount}</strong>
            </div>
          </div>
        </section>

        {/* Search, Filter, and Links Grid */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search codes or targets..."
                className="w-full pl-9 pr-4 py-2 text-xs glass-input border-slate-200 bg-white"
              />
            </div>

            {/* Filter Toggle Buttons */}
            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 hidden sm:inline" />
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-850 hover:bg-slate-50'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  statusFilter === 'active'
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-850 hover:bg-slate-50'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter('expired')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  statusFilter === 'expired'
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-850 hover:bg-slate-50'
                }`}
              >
                Expired
              </button>
            </div>
          </div>

          {/* Links Grid */}
          {loading ? (
            <div className="py-12">
              <Loader type="skeleton" />
            </div>
          ) : filteredUrls.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {filteredUrls.map((url) => (
                  <motion.div
                    key={url._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <UrlCard
                      url={url}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm">
              <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 border border-slate-100 shadow-inner">
                <Link2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-slate-800 font-bold text-base">No shortened links found</h3>
                <p className="text-slate-500 text-xs max-w-sm mx-auto">
                  {searchQuery || statusFilter !== 'all'
                    ? 'No links match your search query or status filter. Try clearing filters.'
                    : 'Get started by pasting your first destination URL in the generator above!'}
                </p>
              </div>
              {(searchQuery || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
