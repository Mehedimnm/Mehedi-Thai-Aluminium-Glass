import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, ArrowRight, CheckCircle, XCircle, Layers, AlertTriangle, Eye, EyeOff } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Focus states for premium input effect
  const [focusedField, setFocusedField] = useState(null);
  
  // Input error states
  const [errors, setErrors] = useState({ username: false, password: false });

  const handleLogin = async (e) => {
    e.preventDefault();
    setToast(null);

    // Validation check
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
      const result = await axios.post('/login', { username, password });
      
      if (result.data === "Success") {
        setToast({ type: 'success', text: 'Login Successful! Please wait...' });
        
        setTimeout(() => {
          onLogin(); 
        }, 1500);
      } else {
        setToast({ type: 'error', text: 'Incorrect Username or Password!' });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      setToast({ type: 'error', text: 'Network Error! Try again.' });
      setTimeout(() => setToast(null), 3000);
    }
    
    setIsLoading(false);
  };

  // Handle input change and remove error
  const handleInputChange = (field, value) => {
    if (field === 'username') setUsername(value);
    if (field === 'password') setPassword(value);
    
    if (errors[field]) {
      setErrors({ ...errors, [field]: false });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden font-sans">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 30, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-0 left-1/2 z-[10000] flex items-center gap-3 bg-white px-5 py-4 rounded-2xl shadow-xl border border-slate-100"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              toast.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 
              toast.type === 'error' ? 'bg-red-100 text-red-600' : 
              'bg-amber-100 text-amber-600'
            }`}>
              {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {toast.type === 'error' && <XCircle className="w-5 h-5" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">
                {toast.type === 'success' ? 'Success' : toast.type === 'error' ? 'Error' : 'Warning'}
              </p>
              <p className="text-xs font-medium text-slate-500">{toast.text}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-slate-200/50 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-slate-300/40 rounded-full blur-[100px]" />
      </div>

      {/* Login Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white border border-slate-200/60 p-10 rounded-3xl shadow-xl shadow-slate-200/50 w-full max-w-md relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-slate-900/25"
          >
            <Layers className="w-8 h-8 text-white" />
          </motion.div>
          
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-wide leading-tight mb-2">
            MEHEDI THAI <br/> 
            <span className="text-slate-400 font-bold">ALUMINUM & GLASS</span>
          </h1>
          
          <p className="text-slate-400 text-sm font-medium mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* Username Input - Premium Design */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
              Username
            </label>
            <div 
              className={`relative group transition-all duration-300 ${
                errors.username 
                  ? 'ring-2 ring-red-500/20' 
                  : focusedField === 'username' 
                    ? 'ring-2 ring-slate-900/10' 
                    : ''
              }`}
            >
              {/* Icon Container */}
              <div className={`absolute left-0 top-0 bottom-0 w-14 flex items-center justify-center rounded-l-2xl transition-all duration-300 ${
                errors.username 
                  ? 'bg-red-50' 
                  : focusedField === 'username' 
                    ? 'bg-slate-100' 
                    : 'bg-slate-50'
              }`}>
                <User className={`w-5 h-5 transition-colors duration-300 ${
                  errors.username 
                    ? 'text-red-500' 
                    : focusedField === 'username' 
                      ? 'text-slate-700' 
                      : 'text-slate-400'
                }`} />
              </div>
              
              {/* Input Field */}
              <input 
                type="text" 
                placeholder="Enter your username" 
                className={`w-full pl-16 pr-12 py-4 bg-slate-50 rounded-2xl font-semibold text-slate-800 placeholder-slate-300 outline-none transition-all duration-300 ${
                  errors.username 
                    ? 'bg-red-50/50 border-2 border-red-200' 
                    : focusedField === 'username'
                      ? 'bg-white border-2 border-slate-200'
                      : 'border-2 border-transparent hover:bg-slate-100/70'
                }`}
                onChange={(e) => handleInputChange('username', e.target.value)}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                value={username}
              />
              
              {/* Error Icon */}
              {errors.username && (
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </motion.div>
              )}
            </div>
          </div>

          {/* Password Input - Premium Design */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
              Password
            </label>
            <div 
              className={`relative group transition-all duration-300 ${
                errors.password 
                  ? 'ring-2 ring-red-500/20' 
                  : focusedField === 'password' 
                    ? 'ring-2 ring-slate-900/10' 
                    : ''
              }`}
            >
              {/* Icon Container */}
              <div className={`absolute left-0 top-0 bottom-0 w-14 flex items-center justify-center rounded-l-2xl transition-all duration-300 ${
                errors.password 
                  ? 'bg-red-50' 
                  : focusedField === 'password' 
                    ? 'bg-slate-100' 
                    : 'bg-slate-50'
              }`}>
                <Lock className={`w-5 h-5 transition-colors duration-300 ${
                  errors.password 
                    ? 'text-red-500' 
                    : focusedField === 'password' 
                      ? 'text-slate-700' 
                      : 'text-slate-400'
                }`} />
              </div>
              
              {/* Input Field */}
              <input 
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password" 
                className={`w-full pl-16 pr-12 py-4 bg-slate-50 rounded-2xl font-semibold text-slate-800 placeholder-slate-300 outline-none transition-all duration-300 ${
                  errors.password 
                    ? 'bg-red-50/50 border-2 border-red-200' 
                    : focusedField === 'password'
                      ? 'bg-white border-2 border-slate-200'
                      : 'border-2 border-transparent hover:bg-slate-100/70'
                }`}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                value={password}
              />
              
              {/* Show/Hide Password Toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
              
              {/* Error Icon - Shows when error and password is hidden */}
              {errors.password && (
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute right-12 top-1/2 -translate-y-1/2"
                >
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </motion.div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <motion.button 
            type="submit" 
            disabled={isLoading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-lg shadow-slate-900/25 transition-all flex items-center justify-center gap-2 group mt-8 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Sign In 
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 font-medium">
            Developed by <span className="text-slate-700 font-bold">MEHEDI HASAN</span>
          </p>
          <p className="text-[10px] text-slate-300 font-medium mt-1">
            © 2026 All Rights Reserved
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;