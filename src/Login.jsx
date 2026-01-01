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
  
  // Focus states
  const [focusedField, setFocusedField] = useState(null);
  
  // Error states
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

  const handleInputChange = (field, value) => {
    if (field === 'username') setUsername(value);
    if (field === 'password') setPassword(value);
    
    if (errors[field]) {
      setErrors({ ...errors, [field]: false });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] relative overflow-hidden font-sans">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 30, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-0 left-1/2 z-[10000] flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-xl shadow-slate-200 border border-slate-100 min-w-[320px]"
          >
            <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
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
              <p className="text-xs font-medium text-slate-500 mt-0.5">{toast.text}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Original Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200/40 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-[120px]"></div>

      {/* Login Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/70 backdrop-blur-xl border border-white/50 p-10 rounded-[40px] shadow-2xl w-full max-w-md relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-900/20">
            <Layers className="w-9 h-9 text-white" />
          </div>
          
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-wide leading-tight mb-2">
            MEHEDI THAI <br/> <span className="text-slate-500">ALUMINUM & GLASS</span>
          </h1>
          
          <p className="text-gray-400 text-sm font-medium mt-1">Enterprise ERP Login</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* Username Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
              Username
            </label>
            <div 
              className={`flex items-center bg-white rounded-2xl overflow-hidden transition-all duration-200 ${
                errors.username 
                  ? 'ring-2 ring-red-400 border border-red-200' 
                  : focusedField === 'username' 
                    ? 'ring-2 ring-slate-300 border border-slate-200' 
                    : 'border border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Icon Box */}
              <div className={`w-14 h-14 flex items-center justify-center border-r transition-colors duration-200 ${
                errors.username 
                  ? 'bg-red-50 border-red-100' 
                  : focusedField === 'username' 
                    ? 'bg-slate-100 border-slate-200' 
                    : 'bg-slate-50 border-slate-100'
              }`}>
                <User className={`w-5 h-5 transition-colors duration-200 ${
                  errors.username 
                    ? 'text-red-500' 
                    : focusedField === 'username' 
                      ? 'text-slate-700' 
                      : 'text-slate-400'
                }`} />
              </div>
              
              {/* Input */}
              <input 
                type="text" 
                placeholder="Enter your username" 
                className="flex-1 h-14 px-4 bg-transparent outline-none font-semibold text-slate-800 placeholder-slate-300"
                onChange={(e) => handleInputChange('username', e.target.value)}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                value={username}
              />
              
              {/* Error Icon */}
              {errors.username && (
                <div className="pr-4">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
              )}
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
              Password
            </label>
            <div 
              className={`flex items-center bg-white rounded-2xl overflow-hidden transition-all duration-200 ${
                errors.password 
                  ? 'ring-2 ring-red-400 border border-red-200' 
                  : focusedField === 'password' 
                    ? 'ring-2 ring-slate-300 border border-slate-200' 
                    : 'border border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Icon Box */}
              <div className={`w-14 h-14 flex items-center justify-center border-r transition-colors duration-200 ${
                errors.password 
                  ? 'bg-red-50 border-red-100' 
                  : focusedField === 'password' 
                    ? 'bg-slate-100 border-slate-200' 
                    : 'bg-slate-50 border-slate-100'
              }`}>
                <Lock className={`w-5 h-5 transition-colors duration-200 ${
                  errors.password 
                    ? 'text-red-500' 
                    : focusedField === 'password' 
                      ? 'text-slate-700' 
                      : 'text-slate-400'
                }`} />
              </div>
              
              {/* Input */}
              <input 
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password" 
                className="flex-1 h-14 px-4 bg-transparent outline-none font-semibold text-slate-800 placeholder-slate-300"
                onChange={(e) => handleInputChange('password', e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                value={password}
              />
              
              {/* Error Icon */}
              {errors.password && (
                <div className="pr-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
              )}
              
              {/* Show/Hide Password */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="pr-4 pl-2 h-14 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-xl shadow-slate-900/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group mt-8 disabled:opacity-70"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Sign In 
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 font-medium">
            System Developed by <span className="text-slate-900 font-bold">MEHEDI HASAN</span>
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