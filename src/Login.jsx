import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, ArrowRight, CheckCircle, XCircle, Layers, AlertTriangle } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  
  // ইনপুট এরর স্টেট (লাল বর্ডারের জন্য)
  const [errors, setErrors] = useState({ username: false, password: false });

  const handleLogin = async (e) => {
    e.preventDefault();
    setToast(null);

    // ১. ভ্যালিডেশন চেক (খালি আছে কিনা)
    const newErrors = {
      username: !username.trim(),
      password: !password.trim()
    };
    setErrors(newErrors);

    // যদি খালি থাকে
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

  // টাইপ করলে লাল দাগ রিমুভ হবে
  const handleInputChange = (field, value) => {
    if (field === 'username') setUsername(value);
    if (field === 'password') setPassword(value);
    
    if (errors[field]) {
      setErrors({ ...errors, [field]: false });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] relative overflow-hidden font-sans">
      
      {/* --- টোস্ট নোটিফিকেশন (একদম সিম্পল ও ক্লিন ডিজাইন) --- */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 30, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            // ✅ ফিক্স: সলিড হোয়াইট ব্যাকগ্রাউন্ড, সিম্পল শ্যাডো এবং বর্ডার
            className="fixed top-0 left-1/2 z-[10000] flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-xl shadow-slate-200 border border-slate-100 min-w-[320px]"
          >
            {/* আইকন */}
            <div className={`shrink-0 ${
              toast.type === 'success' ? 'text-emerald-500' : 
              toast.type === 'error' ? 'text-red-500' : 
              'text-amber-500'
            }`}>
              {toast.type === 'success' && <CheckCircle className="w-6 h-6 fill-current/10" />}
              {toast.type === 'error' && <XCircle className="w-6 h-6 fill-current/10" />}
              {toast.type === 'warning' && <AlertTriangle className="w-6 h-6 fill-current/10" />}
            </div>

            {/* টেক্সট */}
            <div>
              <p className="font-bold text-slate-800 text-sm leading-tight">{toast.type === 'success' ? 'Success' : toast.type === 'error' ? 'Error' : 'Warning'}</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">{toast.text}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ব্যাকগ্রাউন্ড ব্লার ইফেক্ট */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200/40 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-[120px]"></div>

      {/* --- মেইন লগিন কার্ড (গ্লাস ডিজাইন) --- */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/70 backdrop-blur-xl border border-white/50 p-10 rounded-[40px] shadow-2xl w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-900/20">
            <Layers className="w-9 h-9 text-white" />
          </div>
          
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-wide leading-tight mb-2">
            MEHEDI THAI <br/> <span className="text-slate-500">ALUMINUM & GLASS</span>
          </h1>
          
          <p className="text-gray-400 text-sm font-medium mt-1">Enterprise ERP Login</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* ইউজারনেম */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Username</label>
            {/* ✅ ফিক্স: এরর থাকলে বর্ডার লাল হবে */}
            <div className={`flex items-center bg-white border rounded-2xl px-4 py-3.5 transition-all shadow-sm ${errors.username ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200 focus-within:border-slate-900 focus-within:ring-1 focus-within:ring-slate-900'}`}>
              <User className={`w-5 h-5 mr-3 transition-colors ${errors.username ? 'text-red-400' : 'text-gray-400'}`} />
              <input 
                type="text" 
                placeholder="Enter username" 
                className="w-full bg-transparent outline-none font-bold text-slate-800 placeholder-gray-300"
                onChange={(e) => handleInputChange('username', e.target.value)}
                value={username}
              />
              {errors.username && <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse"/>}
            </div>
          </div>

          {/* পাসওয়ার্ড */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
            <div className={`flex items-center bg-white border rounded-2xl px-4 py-3.5 transition-all shadow-sm ${errors.password ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200 focus-within:border-slate-900 focus-within:ring-1 focus-within:ring-slate-900'}`}>
              <Lock className={`w-5 h-5 mr-3 transition-colors ${errors.password ? 'text-red-400' : 'text-gray-400'}`} />
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-transparent outline-none font-bold text-slate-800 placeholder-gray-300"
                onChange={(e) => handleInputChange('password', e.target.value)}
                value={password}
              />
              {errors.password && <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse"/>}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-xl shadow-slate-900/30 transition-all active:scale-95 flex items-center justify-center gap-2 group"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Sign In <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 font-medium">
            System Developed by <span className="text-slate-900 font-bold">MEHEDI HASAN</span>
          </p>
        </div>

      </motion.div>
    </div>
  );
};

export default Login;
