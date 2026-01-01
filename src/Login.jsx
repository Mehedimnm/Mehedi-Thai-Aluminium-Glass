import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Lock,
  ArrowRight,
  CheckCircle,
  XCircle,
  Layers,
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [errors, setErrors] = useState({ username: false, password: false });

  const handleLogin = async (e) => {
    e.preventDefault();
    setToast(null);

    const newErrors = {
      username: !username.trim(),
      password: !password.trim()
    };
    setErrors(newErrors);

    if (newErrors.username || newErrors.password) {
      setToast({ type: 'warning', text: 'Please enter username & password!' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post('/login', { username, password });
      if (res.data === 'Success') {
        setToast({ type: 'success', text: 'Login Successful! Please wait…' });
        setTimeout(() => onLogin(), 1500);
      } else {
        setToast({ type: 'error', text: 'Incorrect Username or Password!' });
        setTimeout(() => setToast(null), 3000);
      }
    } catch {
      setToast({ type: 'error', text: 'Network Error! Try again.' });
      setTimeout(() => setToast(null), 3000);
    }
    setIsLoading(false);
  };

  // 🔥 BORDERLESS ENTERPRISE INPUT STYLE
  const inputBaseClass = (error, focused) => `
    relative flex items-center rounded-2xl px-5 py-4 transition-all duration-300
    bg-slate-50/90
    ${
      error
        ? 'shadow-[inset_0_0_0_2px_rgba(248,113,113,0.35)]'
        : focused
          ? 'shadow-[inset_0_0_0_2px_rgba(15,23,42,0.25)]'
          : 'shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]'
    }
  `;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] relative overflow-hidden font-sans">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -40, x: '-50%' }}
            animate={{ opacity: 1, y: 24, x: '-50%' }}
            exit={{ opacity: 0, y: -40, x: '-50%' }}
            className="fixed top-0 left-1/2 z-[10000] flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-xl min-w-[320px]"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              toast.type === 'success'
                ? 'bg-emerald-100 text-emerald-600'
                : toast.type === 'error'
                  ? 'bg-red-100 text-red-600'
                  : 'bg-amber-100 text-amber-600'
            }`}>
              {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {toast.type === 'error' && <XCircle className="w-5 h-5" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">
                {toast.type === 'success' ? 'Success' : toast.type === 'error' ? 'Error' : 'Warning'}
              </p>
              <p className="text-xs text-slate-500">{toast.text}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200/40 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-[120px]" />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="bg-white/70 backdrop-blur-xl p-10 rounded-[40px] shadow-2xl w-full max-w-md z-10"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Layers className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-xl font-black text-slate-900 uppercase">
            MEHEDI THAI <br />
            <span className="text-slate-500">ALUMINUM & GLASS</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Enterprise ERP Login</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">

          {/* Username */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
              Username
            </label>
            <div className={inputBaseClass(errors.username, focusedField === 'username')}>
              <User className={`w-5 h-5 mr-3 ${
                errors.username ? 'text-red-400' : focusedField === 'username' ? 'text-slate-700' : 'text-slate-400'
              }`} />
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                className="flex-1 bg-transparent outline-none font-semibold text-slate-800 placeholder-slate-400"
              />
              {errors.username && <AlertTriangle className="w-5 h-5 text-red-400 ml-2" />}
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
              Password
            </label>
            <div className={inputBaseClass(errors.password, focusedField === 'password')}>
              <Lock className={`w-5 h-5 mr-3 ${
                errors.password ? 'text-red-400' : focusedField === 'password' ? 'text-slate-700' : 'text-slate-400'
              }`} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className="flex-1 bg-transparent outline-none font-semibold text-slate-800 placeholder-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="ml-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-xl transition active:scale-[0.98]"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
            ) : (
              <span className="flex items-center justify-center gap-2">
                Sign In <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </button>
        </form>

        <p className="text-xs text-center text-gray-400 mt-8">
          System Developed by <span className="font-bold text-slate-900">MEHEDI HASAN</span>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;