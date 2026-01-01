import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Lock,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Layers,
  ShieldCheck,
  Fingerprint
} from 'lucide-react';

// Premium Input Component
const PremiumInput = ({ 
  name, 
  type, 
  label, 
  icon: Icon, 
  value, 
  onChange, 
  focused, 
  setFocused,
  isError
}) => {
  const isFocused = focused === name;

  return (
    <div className="relative">
      {/* Label */}
      <label className={`
        block text-[11px] font-bold uppercase tracking-[0.15em] mb-2 ml-1 transition-colors duration-300
        ${isError ? 'text-red-500' : isFocused ? 'text-slate-700' : 'text-slate-400'}
      `}>
        {label}
      </label>
      
      {/* Input Container - ✅ No underline */}
      <div className={`
        relative flex items-center rounded-2xl transition-all duration-300 overflow-hidden
        ${isError 
          ? 'bg-red-50 ring-2 ring-red-400/50' 
          : isFocused
            ? 'bg-white ring-2 ring-slate-900/20 shadow-lg shadow-slate-900/5'
            : 'bg-slate-100/80 hover:bg-slate-100'
        }
      `}>
        {/* Icon */}
        <div className={`
          pl-5 pr-4 py-[18px] transition-colors duration-300
          ${isError ? 'text-red-400' : isFocused ? 'text-slate-700' : 'text-slate-400'}
        `}>
          <Icon className="w-[22px] h-[22px]" strokeWidth={2.5} />
        </div>

        {/* Input */}
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(name)}
          onBlur={() => setFocused(null)}
          placeholder={`Enter your ${label.toLowerCase()}`}
          className="flex-1 py-[18px] pr-5 bg-transparent outline-none font-semibold text-[15px] text-slate-800 placeholder-slate-400/70"
          autoComplete="off"
        />

        {/* Error Icon */}
        {isError && (
          <motion.div 
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            className="pr-5"
          >
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </motion.div>
        )}
      </div>
    </div>
  );
};

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [focused, setFocused] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [shake, setShake] = useState(false);
  const [errors, setErrors] = useState({ username: false, password: false });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: false });
    if (shake) setShake(false);
  };

  const showToast = (type, text) => {
    setToast({ type, text });
    if (type !== 'success') {
      setTimeout(() => setToast(null), 3500);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setToast(null);

    const newErrors = {
      username: !formData.username.trim(),
      password: !formData.password.trim()
    };
    setErrors(newErrors);

    if (newErrors.username || newErrors.password) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      showToast('warning', 'Please fill in all fields!');
      return;
    }

    setIsLoading(true);
    
    try {
      const res = await axios.post('/login', formData);
      if (res.data === 'Success') {
        showToast('success', 'Login successful! Redirecting...');
        setTimeout(() => onLogin(), 1500);
      } else {
        setErrors({ username: true, password: true });
        setShake(true);
        setTimeout(() => setShake(false), 500);
        showToast('error', 'Invalid username or password!');
      }
    } catch {
      showToast('error', 'Connection failed! Please try again.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f1f5f9] relative overflow-hidden font-sans p-4">
      
      {/* Toast Notification - ✅ Fixed Progress Bar */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -60, x: '-50%' }}
            animate={{ opacity: 1, y: 24, x: '-50%' }}
            exit={{ opacity: 0, y: -60, x: '-50%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 left-1/2 z-[10000]"
          >
            <div className="relative flex items-center gap-4 bg-white pl-4 pr-6 py-4 rounded-2xl min-w-[320px] md:min-w-[380px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-100/80 overflow-hidden">
              
              {/* Icon */}
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center shrink-0
                ${toast.type === 'success' 
                  ? 'bg-emerald-100 text-emerald-600' 
                  : toast.type === 'error' 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-amber-100 text-amber-600'
                }
              `}>
                {toast.type === 'success' && <CheckCircle className="w-6 h-6" />}
                {toast.type === 'error' && <XCircle className="w-6 h-6" />}
                {toast.type === 'warning' && <AlertTriangle className="w-6 h-6" />}
              </div>
              
              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 text-sm">
                  {toast.type === 'success' ? 'Welcome Back!' : toast.type === 'error' ? 'Access Denied' : 'Attention Required'}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{toast.text}</p>
              </div>

              {/* ✅ Progress Bar - Now matches rounded corners */}
              {toast.type !== 'success' && (
                <motion.div 
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: 3.5, ease: 'linear' }}
                  style={{ originX: 0 }}
                  className={`
                    absolute bottom-0 left-0 right-0 h-[3px] rounded-b-2xl
                    ${toast.type === 'error' ? 'bg-red-400' : 'bg-amber-400'}
                  `}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Shapes */}
      <div className="absolute top-[-15%] left-[-8%] w-[50%] md:w-[35%] aspect-square bg-slate-200/60 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-15%] right-[-8%] w-[50%] md:w-[35%] aspect-square bg-slate-300/50 rounded-full blur-[100px]" />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[400px] relative z-10"
      >
        <motion.div 
          animate={shake ? { x: [-12, 12, -12, 12, 0] } : {}}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="bg-white/70 backdrop-blur-2xl p-8 md:p-10 rounded-[32px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] border border-white/80"
        >
          {/* Header */}
          <div className="text-center mb-10">
            {/* Logo */}
            <motion.div 
              initial={{ scale: 0.8, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="relative inline-block mb-6"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-900 rounded-[20px] md:rounded-[24px] flex items-center justify-center shadow-2xl shadow-slate-900/30 transform rotate-3 hover:rotate-0 transition-transform duration-500 cursor-pointer">
                <Layers className="w-10 h-10 md:w-12 md:h-12 text-white" />
              </div>
              {/* Status Dot */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center border-4 border-white shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              </div>
            </motion.div>
            
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-2xl md:text-[26px] font-black text-slate-900 uppercase leading-tight tracking-tight">
                Mehedi Thai
              </h1>
              <p className="text-slate-400 text-sm md:text-[15px] font-bold tracking-[0.2em] uppercase mt-1">
                Aluminum & Glass
              </p>
            </motion.div>

            {/* Secure Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-2 mt-5"
            >
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Secure Login</span>
              </div>
            </motion.div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            
            <PremiumInput 
              name="username"
              type="text"
              label="Username"
              icon={User}
              value={formData.username}
              onChange={handleChange}
              focused={focused}
              setFocused={setFocused}
              isError={errors.username}
            />

            <PremiumInput 
              name="password"
              type="password"
              label="Password"
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
              focused={focused}
              setFocused={setFocused}
              isError={errors.password}
            />

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full mt-8 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[15px] py-[18px] rounded-2xl shadow-xl shadow-slate-900/25 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              {/* Button Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="tracking-wide">Verifying...</span>
                </div>
              ) : (
                <>
                  <Fingerprint className="w-5 h-5" />
                  <span className="tracking-wide">Sign In</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-[10px] font-semibold text-slate-400 tracking-wider">
              Developed by <span className="text-slate-700 font-bold">MEHEDI HASAN</span>
            </p>
            <p className="text-[9px] text-slate-300 mt-1">
              © 2026 All Rights Reserved
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;