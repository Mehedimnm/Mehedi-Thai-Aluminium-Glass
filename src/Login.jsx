import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Lock,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Layers,
  Eye,
  EyeOff,
  ShieldCheck
} from 'lucide-react';

// ✅ SOLUTION: InputField কে Login কম্পোনেন্টের বাইরে নিয়ে আসা হয়েছে
// এর ফলে টাইপ করার সময় আর ফোকাস হারাবে না (Keyboard Reset Fix)
const InputField = ({ 
  name, 
  type, 
  label, 
  icon: Icon, 
  value, 
  onChange, 
  isPasswordToggle = false,
  showPassword,
  setShowPassword,
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
          ? 'border-slate-900 bg-white shadow-lg shadow-slate-200' 
          : 'border-slate-100 bg-slate-50 hover:border-slate-300'
        }
      `}>
        
        {/* Icon Section */}
        <div className={`pl-5 pr-3 transition-colors duration-300 ${isFocused ? 'text-slate-900' : 'text-slate-400'}`}>
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
              color: isFocused ? '#0f172a' : '#94a3b8' // Slate-900 when focused
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
            className="w-full h-full pt-6 pb-2 bg-transparent border-none outline-none text-slate-900 font-extrabold text-lg placeholder-transparent z-20 relative"
            autoComplete="off"
          />
        </div>

        {/* Password Toggle Button */}
        {isPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="pr-5 pl-2 text-slate-400 hover:text-slate-900 transition-colors outline-none focus:outline-none z-30"
          >
            {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
          </button>
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
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (shake) setShake(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setToast(null);

    if (!formData.username.trim() || !formData.password.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setToast({ type: 'warning', text: 'Please enter username & password!' });
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
        setToast({ type: 'error', text: 'Wrong Username or Password!' });
      }
    } catch {
      setToast({ type: 'error', text: 'Server Error! Check connection.' });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] relative overflow-hidden font-sans">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 30 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 z-50 flex items-center gap-3 bg-white px-6 py-4 rounded-xl shadow-2xl border-l-4 border-slate-900"
          >
            <div className={`p-1 rounded-full ${
              toast.type === 'success' ? 'text-green-600' : 
              toast.type === 'error' ? 'text-red-600' : 'text-amber-600'
            }`}>
              {toast.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            <p className="font-bold text-slate-800 text-sm">{toast.text}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Card */}
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
          {/* Header - ORIGINAL NAME & COLOR */}
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

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            <InputField 
              name="username"
              type="text"
              label="Username"
              icon={User}
              value={formData.username}
              onChange={handleChange}
              focused={focused}
              setFocused={setFocused}
            />

            <InputField 
              name="password"
              type={showPassword ? "text" : "password"}
              label="Password"
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
              isPasswordToggle={true}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              focused={focused}
              setFocused={setFocused}
            />

            {/* Submit Button - SOLID BLACK */}
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

          {/* Footer */}
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
