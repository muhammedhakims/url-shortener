import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Link as LinkIcon, User, Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const res = await register(name, email, password);
    setLoading(false);

    if (res.success) {
      toast.success('Registration successful! Welcome aboard.');
      navigate('/dashboard');
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background ambient radial gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60vw] h-[60vw] bg-brand-primary/5 rounded-full filter blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[50vw] h-[50vw] bg-brand-secondary/5 rounded-full filter blur-[100px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white border border-slate-200/80 p-8 rounded-2xl relative shadow-xl z-10"
      >
        {/* Header Logo */}
        <div className="flex flex-col items-center text-center space-y-3 mb-8">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center shadow-md shadow-brand-primary/10">
              <LinkIcon className="text-white w-5.5 h-5.5 group-hover:rotate-45 transition-transform duration-300" />
            </div>
            <span className="font-display font-bold text-2xl bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
              PulseLink
            </span>
          </Link>
          <h2 className="text-xl font-display font-bold text-slate-800">
            Create account
          </h2>
          <p className="text-xs text-slate-500">
            Get started for free. No credit card required.
          </p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 block">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-2.5 text-sm glass-input border-slate-200 bg-white"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 block">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm glass-input border-slate-200 bg-white"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 block">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-10 pr-4 py-2.5 text-sm glass-input border-slate-200 bg-white"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-95 text-white font-bold text-sm rounded-lg shadow-md shadow-brand-primary/10 transition-all flex items-center justify-center space-x-2 mt-6 cursor-pointer"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Create Free Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Login CTA */}
        <div className="text-center text-xs text-slate-500 mt-6 border-t border-slate-100 pt-5">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-brand-primary hover:text-brand-secondary font-semibold hover:underline"
          >
            Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
