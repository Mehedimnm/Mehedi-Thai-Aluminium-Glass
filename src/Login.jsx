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
  ShieldCheck
} from 'lucide-react';

// --- ইনপুট ফিল্ড কম্পোনেন্ট (Green Glow + No Eye Icon) ---
const InputField = ({ 
  name, 
  type, 
  label, 
  icon: Icon, 
  value, 
  onChange, 
  focused, 
  setFocused
}) => {
  const isFocused = focused === name;
  const hasValue = value.length > 0;
  const isActive = isFocused || hasValue;

  return (
    <div className="relative mb-6 group">
      {/* Container */}
      <div className={`
        relative flex items-center overflow-hidden rounded-2xl border-2 transition-all duration-300
        ${isFocused 
          ? 'border-green-500 bg-white shadow-[0_0_20px_rgba(34,197,94,0.4)]' // ✅ GREEN GLOW EFFECT
          : 'border-slate-100 bg-slate-50 hover:border-slate-300'
        }
      `}>
        
        {/* Icon Section */}
        <div className={`pl-5 pr-3 transition-colors duration-300 ${isFocused ? 'text-green-600' : 'text-slate-400'}`}>
          <Icon className="w-6 h-6" />
        </div>

        {/* Floating Label & Input Area */}
        <div className="relative flex-1 h-[60px]">
          {/* Floating Label Animation */}
          <motion.label
            initial={false}
            animate={{
              y: isActive ? 8 : 18,
              scale: isActive ? 0.75 : 1,
              originX: 0,
              color: isFocused ? '#15803d' : '#94a3b8' // Focused হলে গাঢ় সবুজ টেক্সট
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute left-0 font-bold uppercase tracking-wider pointer-events-none z-10"
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
            className="w-full h-full pt-6 pb-2 pr-4 bg-transparent border-none outline-none text-slate-900 font-extrabold text-lg placeholder-transparent z-20 relative"
            autoComplete="off"
          />
        </div>
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (shake) setShake(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setToast(null);

    // ভ্যালিডেশন
    if (!formData.username.trim() || !formData.password.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setToast({ type: 'warning', text: 'Please enter username & password!' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post('/login', formData);
      if (res.data === 'Success') {
        setToast({ type: 'success', text: 'Login Successful! Please wait...' });
        setTimeout(() => onLogin(), 1500);
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setToast({ type: 'error', text: 'Incorrect Username or Password!' });
        setTimeout(() => setToast(null), 3000);
      }
    } catch {
      setToast({ type: 'error', text: 'Network Error! Try again.' });
      setTimeout(() => setToast(null), 3000);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] relative overflow-hidden font-sans">
      
      {/* --- উন্নত মানের টোস্ট মেসেজ (আপনার পছন্দের ডিজাইন) --- */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -40, x: '-50%' }}
            animate={{ opacity: 1, y: 24, x: '-50%' }}
            exit={{ opacity: 0, y: -40, x: '-50%' }}
            className="fixed top-0 left-1/2 z-[10000] flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] min-w-[340px] border border-slate-100"
          >
            {/* আইকন বক্স */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              toast.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 
              toast.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
            }`}>
              {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {toast.type === 'error' && <XCircle className="w-5 h-5" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
            </div>
            
            {/* টেক্সট */}
            <div>
              <p className="font-bold text-slate-800 text-sm">
                {toast.type === 'success' ? 'Success' : toast.type === 'error' ? 'Error' : 'Warning'}
              </p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">{toast.text}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- মেইন লগিন কার্ড --- */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[400px] mx-4 relative z-10"
      >
        <motion.div 
          animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}}
          transition={{ duration: 0.3 }}
          className="bg-white p-8 md:p-10 rounded-[30px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)]"
        >
          {/* হেডার */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-900/30">
              <Layers className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 uppercase leading-tight tracking-tight">
              MEHEDI THAI <br />
              <span className="text-slate-500 text-lg">ALUMINUM & GLASS</span>
            </h1>
            <div className="flex items-center justify-center gap-2 mt-3 opacity-60">
              <ShieldCheck className="w-4 h-4 text-slate-600" />
              <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Enterprise ERP Login</p>
            </div>
          </div>

          {/* ফর্ম */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            <InputField 
              name="username"
              type="text" // ইউজারনেম দেখা যাবে
              label="Username"
              icon={User}
              value={formData.username}
              onChange={handleChange}
              focused={focused}
              setFocused={setFocused}
            />

            <InputField 
              name="password"
              type="password" // পাসওয়ার্ড লুকানো থাকবে (Eye Icon নেই)
              label="Password"
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
              focused={focused}
              setFocused={setFocused}
            />

            {/* সাবমিট বাটন - সলিড ব্ল্যাক */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-5 rounded-2xl shadow-xl shadow-slate-900/20 transition-all flex items-center justify-center gap-3 group"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="text-lg">SECURE LOGIN</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          {/* ফুটার */}
          <div className="mt-8 text-center">
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              Developed by <span className="text-slate-900">MEHEDI HASAN</span>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
