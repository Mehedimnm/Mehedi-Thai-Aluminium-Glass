import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, Save, CheckCircle, User, Phone, 
  MapPin, ScanBarcode, RefreshCw, XCircle, Contact 
} from 'lucide-react';

const AddCustomer = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if(!formData.name.trim()) {
       showMessage('error', 'Customer Name is required!');
       return;
    }

    setLoading(true);

    try {
      // ✅ FIX: Added /api prefix
      const checkRes = await axios.get('/api/customers');
      const existingCustomers = checkRes.data;

      const isNameDuplicate = existingCustomers.some(c => c.name.toLowerCase() === formData.name.trim().toLowerCase());
      const isMobileDuplicate = formData.mobile.trim() && existingCustomers.some(c => c.mobile === formData.mobile.trim());

      if (isNameDuplicate) {
        showMessage('error', 'Customer Name already exists!');
        setLoading(false);
        return;
      }

      if (isMobileDuplicate) {
        showMessage('error', 'Mobile Number already exists!');
        setLoading(false);
        return;
      }

      // ✅ FIX: Added /api prefix
      const response = await axios.post('/api/add-customer', formData);
      if (response.data.status === 'Success') {
        showMessage('success', 'Customer Added Successfully!');
        setFormData({ name: '', mobile: '', address: '' }); 
      } else {
        showMessage('error', 'Failed to add customer!');
      }
    } catch (err) {
      showMessage('error', 'Server Connection Error!');
    }
    setLoading(false);
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const getAvatar = (name) => {
      const safeName = name ? name.trim() : 'User';
      const seed = encodeURIComponent(safeName);
      return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&backgroundColor=f1f5f9`;
  };

  return (
    <div className="flex justify-center items-start min-h-[calc(100vh-100px)] pb-10 font-sans text-slate-800">
      
      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-0 left-1/2 z-[10000] flex items-center gap-3 bg-slate-800 text-white px-6 py-3 rounded-lg shadow-xl"
          >
            {message.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
            <p className="text-sm font-medium">{message.text}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8">
          <div className="mb-8 border-b border-gray-100 pb-4">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <UserPlus className="w-6 h-6 text-slate-700" />
              New Customer
            </h2>
            <p className="text-gray-500 mt-1 text-sm font-medium ml-9">Create a new client profile.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1 flex items-center gap-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-slate-800 transition-colors" />
                <input 
                  type="text" name="name" value={formData.name} onChange={handleChange}
                  placeholder="Ex: Rahim Uddin"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 font-bold text-slate-800 outline-none focus:bg-white focus:border-slate-500 focus:ring-1 focus:ring-slate-200 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Mobile Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-slate-800 transition-colors" />
                  <input 
                    type="text" name="mobile" value={formData.mobile} onChange={handleChange}
                    placeholder="017xxxxxxxx"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 font-bold text-slate-800 outline-none focus:bg-white focus:border-slate-500 transition"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Address</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-slate-800 transition-colors" />
                  <input 
                    type="text" name="address" value={formData.address} onChange={handleChange}
                    placeholder="City / Area"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 font-bold text-slate-800 outline-none focus:bg-white focus:border-slate-500 transition"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 flex gap-4 border-t border-gray-100 mt-4">
              <button 
                type="button"
                onClick={() => setFormData({ name: '', mobile: '', address: '' })}
                className="px-6 py-3.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition border border-gray-200 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Reset
              </button>
              
              <button 
                type="submit"
                disabled={loading}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-slate-900/20 transition flex justify-center items-center gap-2 active:scale-95"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <> <Save className="w-5 h-5" /> Save Customer </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <ScanBarcode className="w-4 h-4"/> Live Preview
            </h3>
            
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Contact className="w-24 h-24 text-slate-900"/>
              </div>

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-50 mb-4">
                    <img 
                        src={getAvatar(formData.name)} 
                        alt="Avatar" 
                        className="w-full h-full object-cover grayscale opacity-80"
                    />
                </div>

                <span className="inline-block bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-full mb-2 border border-emerald-100 uppercase tracking-wide">
                  Active Client
                </span>
                
                <h2 className="text-xl font-black text-slate-900 mb-1 leading-tight break-words max-w-full">
                  {formData.name || "Customer Name"}
                </h2>
                <p className="text-xs text-gray-400 font-mono mb-6">ID: #NEW-CLIENT</p>

                <div className="w-full space-y-3 text-left">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                        <Phone className="w-3 h-3"/> Mobile
                    </span>
                    <span className="text-sm font-bold text-slate-800">{formData.mobile || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                        <MapPin className="w-3 h-3"/> Address
                    </span>
                    <span className="text-sm font-bold text-slate-800 truncate max-w-[120px]">
                      {formData.address || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 text-center w-full">
                  <p className="text-[10px] text-gray-400 font-medium">
                    This is how the profile will appear in the directory.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-slate-50 border border-slate-100 rounded-xl p-4">
              <h4 className="font-bold text-slate-600 mb-1 text-xs uppercase flex items-center gap-1">
                <CheckCircle className="w-3 h-3"/> Quick Tip
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Make sure the mobile number is unique. Duplicate numbers are not allowed.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default AddCustomer;
