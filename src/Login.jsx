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
  
  // ✅ নতুন স্টেট: পাসওয়ার্ড দেখানো/লুকানো এবং ফোকাস ইফেক্টের জন্য
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  
  const [errors, setErrors] = useState({ username: false, password: false });

  const handleLogin = async (e) => {
    e.preventDefault();
    setToast(null);

    // ভ্যালিডেশন
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
      const res = await axios.post('/login', { username, password }); // ✅ Render এর জন্য লিংক ফিক্স করা
      
      if (res.data === 'Success') {
        setToast({ type: 'success', text: 'Login Successful! Please wait...' });
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

  // 🔥 সুপার মডার্ন ইনপুট স্টাইল জেনারেটর (বর্ডারের বদলে শ্যাডো)
  const getInputClass = (fieldName) => {
    const isError = errors[fieldName];
    const isFocused = focusedField === fieldName;
    
    return `
      relative flex items-center w-full rounded-2xl px-5 py-4 transition-all duration-300
      ${isError 
        ? 'bg-red-50/50 shadow-[inset_0_0_0_2px_rgba(248,113,113,0.3)]' 
        : isFocused 
          ? 'bg-white shadow-[inset_0_0_0_2px_rgba(15,23,42,0.15)] scale-[1.02]' 
          : 'bg-slate-50/80 hover:bg-slate-100 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]'
      }
    `;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] relative overflow-hidden font-sans">

      {/* --- টোস্ট নোটিফিকেশন --- */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -40, x: '-50%' }}
            animate={{ opacity: 1, y: 24, x: '-50%' }}
            exit={{ opacity: 0, y: -40, x: '-50%' }}
            className="fixed top-0 left-1/2 z-[10000] flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] min-w-[340px]"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              toast.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 
              toast.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
            }`}>
              {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {toast.type === 'error' && <XCircle className="w-5 h-5" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">{toast.type === 'success' ? 'Success' : toast.type === 'error' ? 'Error' : 'Warning'}</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">{toast.text}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ব্যাকগ্রাউন্ড ব্লার ইফেক্ট */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200/40 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-[120px]" />

      {/* --- মেইন লগিন কার্ড --- */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="bg-white/80 backdrop-blur-2xl p-10 rounded-[40px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] w-full max-w-md z-10 border border-white/60"
      >
        {/* হেডার */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-900/20 transform hover:scale-110 transition-transform duration-300">
            <Layers className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">
            MEHEDI THAI <br />
            <span className="text-slate-400 text-lg font-bold tracking-widest">ALUMINUM & GLASS</span>
          </h1>
          <p className="text-slate-400 text-xs font-bold mt-2 uppercase tracking-widest bg-slate-100 inline-block px-3 py-1 rounded-full">Enterprise ERP</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">

          {/* ইউজারনেম ইনপুট */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-2 tracking-wider">Username</label>
            <div className={getInputClass('username')}>
              <User className={`w-5 h-5 mr-3 transition-colors ${
                errors.username ? 'text-red-400' : focusedField === 'username' ? 'text-slate-900' : 'text-slate-400'
              }`} />
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                className="flex-1 bg-transparent outline-none font-bold text-slate-800 placeholder-slate-400 text-sm h-full"
              />
              {errors.username && <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse ml-2" />}
            </div>
          </div>

          {/* পাসওয়ার্ড ইনপুট (Eye Icon সহ) */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-2 tracking-wider">Password</label>
            <div className={getInputClass('password')}>
              <Lock className={`w-5 h-5 mr-3 transition-colors ${
                errors.password ? 'text-red-400' : focusedField === 'password' ? 'text-slate-900' : 'text-slate-400'
              }`} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className="flex-1 bg-transparent outline-none font-bold text-slate-800 placeholder-slate-400 text-sm h-full"
              />
              {/* পাসওয়ার্ড টগল বাটন */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="ml-2 p-1 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* লগিন বাটন */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-xl shadow-slate-900/20 transition-all active:scale-[0.98] mt-4"
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

        <p className="text-[10px] text-center text-slate-400 font-bold mt-8 uppercase tracking-wider">
          System Developed by <span className="text-slate-900">MEHEDI HASAN</span>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
