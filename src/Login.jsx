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
  EyeOff,
  Sparkles
} from 'lucide-react';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [focused, setFocused] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);

  // ইনপুট হ্যান্ডেল করা
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (shake) setShake(false); // টাইপ শুরু করলে শেক বন্ধ হবে
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setToast(null);

    // ভ্যালিডেশন
    if (!formData.username.trim() || !formData.password.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setToast({ type: 'warning', text: 'Please fill in all fields!' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post('/login', formData);
      
      if (res.data === 'Success') {
        setToast({ type: 'success', text: 'Access Granted! Redirecting...' });
        setTimeout(() => onLogin(), 1500);
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setToast({ type: 'error', text: 'Invalid Credentials!' });
      }
    } catch {
      setToast({ type: 'error', text: 'Server Error! Please try again.' });
    }
    setIsLoading(false);
  };

  // --- 🔥 ULTRA MODERN INPUT COMPONENT ---
  const InputField = ({ 
    name, 
    type, 
    label, 
    icon: Icon, 
    value, 
    onChange, 
    isPasswordToggle = false 
  }) => {
    const isFocused = focused === name;
    const hasValue = value.length > 0;
    const isActive = isFocused || hasValue;

    return (
      <div className="relative mb-6 group">
        {/* Animated Background Glow (ফোকাস করলে জ্বলে উঠবে) */}
        <div 
          className={`absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-2xl blur opacity-0 transition duration-500 group-hover:opacity-30 ${isFocused ? 'opacity-100 group-hover:opacity-100' : ''}`}
        />
        
        {/* Main Input Container */}
        <div className="relative bg-white rounded-xl p-[2px]">
          <div className="relative bg-slate-50 rounded-[10px] flex items-center overflow-hidden">
            
            {/* Icon Section */}
            <div className="pl-4 pr-2">
              <Icon 
                className={`w-5 h-5 transition-colors duration-300 ${
                  isFocused ? 'text-blue-600' : 'text-slate-400'
                }`} 
              />
            </div>

            {/* Floating Label & Input */}
            <div className="relative flex-1 h-14">
              {/* Floating Label Animation */}
              <motion.label
                initial={false}
                animate={{
                  y: isActive ? -8 : 0,
                  x: isActive ? 0 : 0,
                  scale: isActive ? 0.85 : 1,
                  color: isFocused ? '#2563eb' : '#94a3b8'
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute left-0 top-4 text-slate-400 font-medium origin-top-left pointer-events-none"
              >
                {label}
              </motion.label>

              {/* Actual Input */}
              <input
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                onFocus={() => setFocused(name)}
                onBlur={() => setFocused(null)}
                className="w-full h-full pt-4 pb-1 bg-transparent border-none outline-none text-slate-800 font-bold placeholder-transparent z-10 relative"
                autoComplete="off"
              />
            </div>

            {/* Password Toggle Button */}
            {isPasswordToggle && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="pr-4 pl-2 text-slate-400 hover:text-slate-600 transition-colors outline-none focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f1f5f9] relative overflow-hidden font-sans selection:bg-blue-500 selection:text-white">

      {/* --- Toast Notification --- */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 20, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-0 z-50 flex items-center gap-3 bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-2xl border border-white/50"
          >
            <div className={`p-2 rounded-full ${
              toast.type === 'success' ? 'bg-green-100 text-green-600' : 
              toast.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
            }`}>
              {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {toast.type === 'error' && <AlertTriangle className="w-5 h-5" />}
              {toast.type === 'warning' && <Sparkles className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide">{toast.type}</h4>
              <p className="text-xs text-slate-500 font-medium">{toast.text}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Animated Background Elements --- */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-300/30 rounded-full blur-[120px] animate-pulse-subtle" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-300/30 rounded-full blur-[120px] animate-pulse-subtle" style={{ animationDelay: '1s' }} />

      {/* --- Main Card --- */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        className="relative w-full max-w-[420px] z-10 mx-4"
      >
        <motion.div 
          animate={shake ? { x: [-5, 5, -5, 5, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="bg-white/80 backdrop-blur-2xl p-8 sm:p-10 rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-white/60"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div 
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="w-20 h-20 bg-gradient-to-tr from-slate-900 to-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-900/20"
            >
              <Layers className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              MEHEDI <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">ERP</span>
            </h1>
            <p className="text-slate-400 font-medium text-sm mt-2">Enterprise Resource Planning</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-2">
            
            <InputField 
              name="username"
              type="text"
              label="Username"
              icon={User}
              value={formData.username}
              onChange={handleChange}
            />

            <InputField 
              name="password"
              type={showPassword ? "text" : "password"}
              label="Password"
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
              isPasswordToggle={true}
            />

            {/* Login Button with Magnetic Effect */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-lg shadow-slate-900/30 transition-all relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2 relative z-10">
                  Sign In to Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </motion.button>

          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Secure System by <span className="text-slate-800">Mehedi Hasan</span>
            </p>
          </div>

        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
