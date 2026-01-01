import { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, UserPlus, Phone, 
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

    // ১. নাম ফাঁকা কি না চেক
    if(!formData.name.trim()) {
       showMessage('error', 'Customer Name is required!');
       return;
    }

    setLoading(true);

    try {
      // ২. ডুপ্লিকেট চেক
      const checkRes = await axios.get('/customers');
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

      // ৩. সেভ করা - ✅ সংশোধিত: Relative URL ব্যবহার করা হয়েছে
      const response = await axios.post('/add-customer', formData);
      
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

  // Avatar Generator Helper
  const getAvatar = (name) => {
      const safeName = name ? name.trim() : 'User';
      const seed = encodeURIComponent(safeName);
      return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&backgroundColor=f1f5f9`;
  };

  return (
    <div className="flex justify-center items-start min-h-[calc(100vh-100px)] pb-10 font-sans text-slate-800">
      
      {/* --- FLASH MESSAGE (Toast) --- */}
      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-0 left-1/2 z-[10000] flex items-center gap-3 bg-slate-800 text-white px-6 py-3 rounded-lg shadow-xl"
          >
            {message.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
            <span className="font-semibold">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MAIN CARD --- */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 to-indigo-600 p-6 text-center">
          <div className="flex justify-center mb-3">
            <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white">Add New Client</h2>
          <p className="text-sky-100 text-sm mt-1">Enter the customer details below</p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
          
          {/* Live Avatar Preview */}
          <div className="flex justify-center -mt-14 mb-4">
             <img 
                src={getAvatar(formData.name)} 
                alt="Avatar" 
                className="w-20 h-20 rounded-full border-4 border-white shadow-lg bg-slate-100"
             />
          </div>

          {/* Name Input */}
          <div>
            <label className="text-sm font-bold text-slate-600 mb-1 block">Customer Name *</label>
            <div className="relative">
              <Contact className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all bg-slate-50/50"
              />
            </div>
          </div>

          {/* Mobile Input */}
          <div>
            <label className="text-sm font-bold text-slate-600 mb-1 block">Mobile Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="01XXXXXXXXX"
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all bg-slate-50/50"
              />
            </div>
          </div>

          {/* Address Input */}
          <div>
            <label className="text-sm font-bold text-slate-600 mb-1 block">Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter full address"
                rows="3"
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all resize-none bg-slate-50/50"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setFormData({ name: '', mobile: '', address: '' })}
              className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-gray-200 text-slate-600 font-bold rounded-xl hover:bg-gray-100 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" /> Save Customer
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddCustomer;