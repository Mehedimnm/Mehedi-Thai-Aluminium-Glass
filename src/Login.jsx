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

// --- আল্ট্রা-মডার্ন ইনপুট কম্পোনেন্ট (Red Error + Green Focus) ---
const InputField = ({ 
  name, 
  type, 
  label, 
  icon: Icon, 
  value, 
  onChange, 
  focused, 
  setFocused,
  isError // নতুন প্রপ: এরর আছে কিনা চেক করার জন্য
}) => {
  const isFocused = focused === name;
  const hasValue = value.length > 0;
  const isActive = isFocused || hasValue;

  // ডায়নামিক স্টাইল ক্লাস
  let containerClass = "border-slate-200 bg-slate-50 hover:border-slate-300"; // ডিফল্ট
  let iconClass = "text-slate-400"; // ডিফল্ট আইকন কালার
  let labelColor = "#94a3b8"; // ডিফল্ট লেবেল কালার

  if (isError) {
    // 🔴 এরর থাকলে লাল গ্লো
    containerClass = "border-red-500 bg-white shadow-[0_0_25px_rgba(239,68,68,0.3)] animate-pulse-subtle";
    iconClass = "text-red-500";
    labelColor = "#ef4444"; 
  } else if (isFocused) {
    // 🟢 ফোকাস থাকলে সবুজ গ্লো
    containerClass = "border-green-500 bg-white shadow-[0_0_20px_rgba(34,197,94,0.4)]";
    iconClass = "text-green-600";
    labelColor = "#15803d";
  }

  return (
    <div className="relative mb-6 group">
      <div className={`
        relative flex items-center overflow-hidden rounded-2xl border-[2.5px] transition-all duration-300 h-[64px]
        ${containerClass}
      `}>
        
        {/* আইকন সেকশন */}
        <div className={`pl-6 pr-4 transition-colors duration-300 ${iconClass}`}>
          <Icon className="w-6 h-6" />
        </div>

        {/* ইনপুট এরিয়া */}
        <div className="relative flex-1 h-full flex flex-col justify-center">
          {/* ফ্লোটিং লেবেল */}
          <motion.label
            initial={false}
            animate={{
              y: isActive ? -10 : 0,
              scale: isActive ? 0.7 : 1,
              originX: 0,
              color: labelColor
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute font-bold uppercase tracking-wider pointer-events-none text-sm z-10"
          >
            {label}
          </motion.label>

          {/* আসল ইনপুট */}
          <input
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(name)}
            onBlur={() => setFocused(null)}
            className={`w-full bg-transparent border-none outline-none font-extrabold text-[17px] text-slate-900 placeholder-transparent relative z-20 ${isActive ? 'pt-4' : ''}`}
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
  
  // ✅ এরর স্টেট: কোন ফিল্ডে এরর আছে তা মনে রাখার জন্য
  const [errors, setErrors] = useState({ username: false, password: false });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // টাইপ করলে লাল দাগ সরিয়ে ফেলা হবে
    if (errors[name]) {
      setErrors({ ...errors, [name]: false });
    }
    if (shake) setShake(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setToast(null);

    // ১. খালি ইনপুট ভ্যালিডেশন
    const newErrors = {
      username: !formData.username.trim(),
      password: !formData.password.trim()
    };
    setErrors(newErrors);

    if (newErrors.username || newErrors.password) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setToast({ type: 'warning', text: 'Please fill in all fields!' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post('/login', formData);
      if (res.data === 'Success') {
        setToast({ type: 'success', text: 'Login Successful! Please wait...' });
        setTimeout(() => onLogin(), 1500);
      } else {
        // ২. ভুল পাসওয়ার্ড ভ্যালিডেশন (লাল দাগ দেখানো)
        setErrors({ username: true, password: true });
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setToast({ type: 'error', text: 'Incorrect Username or Password!' });
      }
    } catch {
      setToast({ type: 'error', text: 'Network Error! Try again.' });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f1f5f9] relative overflow-hidden font-sans">
      
      {/* টোস্ট নোটিফিকেশন */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 30, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-0 left-1/2 z-[10000] flex items-center gap-4 bg-white px-6 py-4 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] min-w-[360px] border border-slate-100"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
              toast.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 
              toast.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
            }`}>
              {toast.type === 'success' && <CheckCircle className="w-6 h-6" />}
              {toast.type === 'error' && <XCircle className="w-6 h-6" />}
              {toast.type === 'warning' && <AlertTriangle className="w-6 h-6" />}
            </div>
            
            <div>
              <p className="font-extrabold text-slate-900 text-sm uppercase tracking-wide">
                {toast.type === 'success' ? 'Access Granted' : toast.type === 'error' ? 'Access Denied' : 'Attention'}
              </p>
              <p className="text-xs font-semibold text-slate-500 mt-1">{toast.text}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ব্যাকগ্রাউন্ড শেপস */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-slate-200/50 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-slate-200/50 rounded-full blur-[100px]" />

      {/* মেইন কার্ড */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[420px] mx-4 relative z-10"
      >
        <motion.div 
          animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.3 }}
          className="bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-[40px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border border-white"
        >
          {/* হেডার */}
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-slate-900 rounded-[28px] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-slate-900/20 transform rotate-3 hover:rotate-0 transition-all duration-500">
              <Layers className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 uppercase leading-none tracking-tight">
              MEHEDI THAI <br />
              <span className="text-slate-400 text-lg font-extrabold tracking-widest block mt-2">ALUMINUM & GLASS</span>
            </h1>
            <div className="flex items-center justify-center gap-2 mt-4 opacity-50">
              <ShieldCheck className="w-4 h-4 text-slate-500" />
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Secure Gateway</p>
            </div>
          </div>

          {/* ফর্ম */}
          <form onSubmit={handleLogin} className="space-y-2">
            
            <InputField 
              name="username"
              type="text"
              label="Username"
              icon={User}
              value={formData.username}
              onChange={handleChange}
              focused={focused}
              setFocused={setFocused}
              isError={errors.username} // 🔴 এরর পাস করা হচ্ছে
            />

            <InputField 
              name="password"
              type="password"
              label="Password"
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
              focused={focused}
              setFocused={setFocused}
              isError={errors.password} // 🔴 এরর পাস করা হচ্ছে
            />

            {/* বাটন */}
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: '#0f172a' }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl shadow-slate-900/30 transition-all flex items-center justify-center gap-3 overflow-hidden relative group"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-sm tracking-widest uppercase">Verifying...</span>
                </div>
              ) : (
                <>
                  <span className="text-lg tracking-wider">SIGN IN</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                </>
              )}
            </motion.button>
          </form>

          {/* ফুটার */}
          <div className="mt-10 pt-6 border-t border-slate-100 text-center">
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">
              System By <span className="text-slate-900">MEHEDI HASAN</span>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
