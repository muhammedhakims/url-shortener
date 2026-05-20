import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Copy,
  Check,
  Calendar,
  Eye,
  Trash2,
  Edit2,
  QrCode,
  ArrowRight,
  ExternalLink,
  Download,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const UrlCard = ({ url, onUpdate, onDelete }) => {
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newOriginalUrl, setNewOriginalUrl] = useState(url.originalUrl);
  const [newExpiresAt, setNewExpiresAt] = useState(
    url.expiresAt ? new Date(url.expiresAt).toISOString().split('T')[0] : ''
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url.shortUrl);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy!');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!newOriginalUrl) {
      toast.error('Original URL cannot be empty');
      return;
    }

    const payload = {
      originalUrl: newOriginalUrl,
      expiresAt: newExpiresAt ? new Date(newExpiresAt).toISOString() : null,
    };

    const success = await onUpdate(url._id, payload);
    if (success) {
      setIsEditing(false);
    }
  };

  const isExpired = url.status === 'expired' || (url.expiresAt && new Date(url.expiresAt) <= new Date());

  return (
    <div className="bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 rounded-xl p-5 md:p-6 relative overflow-hidden transition-all duration-300">
      {/* Background soft glow gradient */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-brand-primary/5 to-brand-secondary/5 rounded-full filter blur-xl pointer-events-none"></div>

      <div className="flex flex-col space-y-4">
        {/* URL Card Top Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                isExpired
                  ? 'bg-red-50 text-red-700 border border-red-100'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
              }`}
            >
              {isExpired ? 'Expired' : 'Active'}
            </span>
            {url.customAlias && (
              <span className="bg-indigo-50 text-brand-primary border border-indigo-100 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                Alias
              </span>
            )}
          </div>

          <div className="flex space-x-1">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Edit URL"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowQrModal(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              title="View QR Code"
            >
              <QrCode className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(url._id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title="Delete URL"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Editing View */}
        <AnimatePresence>
          {isEditing ? (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleEditSubmit}
              className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200 mt-2"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Destination URL
                </label>
                <input
                  type="url"
                  value={newOriginalUrl}
                  onChange={(e) => setNewOriginalUrl(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-brand-primary bg-white text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={newExpiresAt}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setNewExpiresAt(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-brand-primary bg-white text-slate-800"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-lg hover:opacity-95 shadow-md shadow-brand-primary/10 transition-all cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </motion.form>
          ) : (
            // Default Card Content
            <div className="space-y-2.5">
              {/* Short Link */}
              <div className="flex items-center space-x-2">
                <a
                  href={url.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-display font-bold text-lg md:text-xl text-slate-800 hover:text-brand-primary hover:underline flex items-center group/link transition-colors"
                >
                  <span>{url.shortCode}</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1.5 opacity-0 group-hover/link:opacity-100 transition-opacity text-brand-primary" />
                </a>
                <button
                  onClick={handleCopy}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Copy Short Link"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Original Link (truncated) */}
              <p className="text-sm text-slate-500 truncate max-w-full" title={url.originalUrl}>
                {url.originalUrl}
              </p>
            </div>
          )}
        </AnimatePresence>

        {/* Footer info: clicks, expiration date, analytics link */}
        <div className="border-t border-slate-100 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Eye className="w-4 h-4 mr-1.5 text-brand-primary" />
              <strong className="text-slate-700 mr-1">{url.clicks}</strong> clicks
            </span>

            {url.expiresAt && (
              <span className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-brand-secondary" />
                Expires: {new Date(url.expiresAt).toLocaleDateString()}
              </span>
            )}
          </div>

          <Link
            to={`/analytics/${url._id}`}
            className="flex items-center text-brand-primary hover:text-brand-secondary font-semibold transition-all group"
          >
            <span>View Analytics</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* QR Code Modal Overlay */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-white border border-slate-200 p-6 rounded-2xl relative shadow-xl"
            >
              <button
                onClick={() => setShowQrModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center space-y-4 pt-2">
                <h3 className="font-display font-bold text-lg text-slate-800">
                  PulseLink QR Code
                </h3>
                <p className="text-xs text-slate-500 max-w-xs">
                  Scan this QR code to navigate instantly to the target URL.
                </p>

                {/* QR Code container */}
                <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                  {url.qrCodeUrl ? (
                    <img
                      src={url.qrCodeUrl}
                      alt={`QR Code for ${url.shortUrl}`}
                      className="w-40 h-40"
                    />
                  ) : (
                    <div className="w-40 h-40 flex items-center justify-center text-slate-400 text-xs font-semibold">
                      Generating...
                    </div>
                  )}
                </div>

                <span className="font-mono text-sm text-brand-primary font-bold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 select-all">
                  {url.shortUrl}
                </span>

                <a
                  href={url.qrCodeUrl}
                  download={`pulselink-${url.shortCode}.png`}
                  className="flex items-center justify-center space-x-2 w-full py-2.5 bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-95 text-white text-sm font-semibold rounded-lg shadow-md shadow-brand-primary/10 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Image</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UrlCard;
