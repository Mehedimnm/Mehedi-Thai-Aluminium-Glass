import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PackagePlus, Save, CheckCircle, Tag, Layers, 
  Box, Ruler, RefreshCw, XCircle, ChevronDown, ScanBarcode, Check 
} from 'lucide-react';

// --- ১. প্রিমিয়াম ড্রপডাউন কম্পোনেন্ট (নতুন যুক্ত করা হয়েছে) ---
const PremiumDropdown = ({ label, icon: Icon, value, options, onChange, name }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // বাইরে ক্লিক করলে ড্রপডাউন বন্ধ হওয়ার লজিক
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // বর্তমান সিলেক্টেড অপশনের লেবেল খুজে বের করা
  const selectedLabel = options.find(opt => opt.value === value)?.label || "Select";

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      <label className="text-xs font-bold text-gray-500 uppercase ml-1 flex items-center gap-1">
        {label}
      </label>
      
      {/* ট্রিগার বাটন */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-gray-50 border rounded-xl px-4 h-[52px] flex items-center justify-between cursor-pointer transition-all duration-300 ${isOpen ? 'bg-white border-slate-500 ring-4 ring-slate-100' : 'border-gray-200 hover:border-gray-300 hover:bg-white'}`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-lg transition-colors duration-300 ${isOpen ? 'bg-slate-800 text-white' : 'bg-white text-gray-400 shadow-sm'}`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-800 text-sm">{selectedLabel}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* ড্রপডাউন মেনু লিস্ট (অ্যানিমেশন সহ) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden py-1 left-0"
          >
            {options.map((opt) => (
              <div 
                key={opt.value}
                onClick={() => {
                  onChange({ target: { name: name, value: opt.value } }); // ফেইক ইভেন্ট পাঠিয়ে মেইন স্টেট আপডেট
                  setIsOpen(false);
                }}
                className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors border-b border-gray-50 last:border-0 ${value === opt.value ? 'bg-slate-50 text-slate-900' : 'text-gray-600 hover:bg-gray-50 hover:text-slate-900'}`}
              >
                <span className="font-bold text-sm">{opt.label}</span>
                {value === opt.value && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <Check className="w-4 h-4 text-emerald-500" />
                  </motion.div>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- মেইন কম্পোনেন্ট ---
const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Aluminum',
    price: '',
    stock: '',
    unit: 'pcs',
    alertQty: '5'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!formData.name.trim()) {
      showMessage('error', 'Product Name is required!');
      return;
    }

    setLoading(true);

    try {
      const dataToSend = {
        ...formData,
        price: formData.price === '' ? 0 : formData.price,
        stock: formData.stock === '' ? 0 : formData.stock
      };

      const response = await axios.post('/add-product', dataToSend);
      
      if (response.data.status === 'Success') {
        showMessage('success', 'Product Added Successfully!');
        setFormData({ name: '', category: 'Aluminum', price: '', stock: '', unit: 'pcs', alertQty: '5' });
      } else {
        showMessage('error', 'Failed to add product!');
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

  // --- অপশন ডাটা ---
  const categoryOptions = [
    { value: 'Aluminum', label: 'Aluminum Profile' },
    { value: 'Glass', label: 'Glass (Nasir/PHP)' },
    { value: 'Accessories', label: 'Accessories' },
    { value: 'Rubber', label: 'Rubber & Gasket' },
    { value: 'Hardware', label: 'Tools & Hardware' }
  ];

  const unitOptions = [
    { value: 'pcs', label: 'Pieces' },
    { value: 'kg', label: 'Kilogram' },
    { value: 'sqft', label: 'Square Feet' },
    { value: 'rft', label: 'Running Feet' },
    { value: 'box', label: 'Box/Carton' }
  ];

  return (
    <div className="flex justify-center items-start min-h-[calc(100vh-100px)] pb-10 font-sans text-slate-800">
      
      {/* --- FLASH MESSAGE --- */}
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
        
        {/* --- ফর্ম --- */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8">
          
          <div className="mb-8 border-b border-gray-100 pb-4">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <PackagePlus className="w-6 h-6 text-slate-700" />
              New Product
            </h2>
            <p className="text-gray-500 mt-1 text-sm font-medium ml-9">Add items to your inventory.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1 flex items-center gap-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <Tag className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-slate-800 transition-colors" />
                <input 
                  type="text" name="name" value={formData.name} onChange={handleChange}
                  placeholder="Ex: 4 Inch Thai Section"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 font-bold text-slate-800 outline-none focus:bg-white focus:border-slate-500 focus:ring-1 focus:ring-slate-200 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 z-20 relative">
              {/* Category Dropdown (Updated) */}
              <PremiumDropdown 
                label="Category"
                icon={Layers}
                name="category"
                value={formData.category}
                options={categoryOptions}
                onChange={handleChange}
              />

              {/* Unit Dropdown (Updated) */}
              <PremiumDropdown 
                label="Unit Type"
                icon={Ruler}
                name="unit"
                value={formData.unit}
                options={unitOptions}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 z-10 relative">
              {/* Price */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Selling Price</label>
                <div className="relative group">
                  <span className="absolute left-4 top-3 text-gray-400 font-bold group-focus-within:text-slate-800 transition-colors text-lg">৳</span>
                  <input 
                    type="number" name="price" value={formData.price} onChange={handleChange}
                    placeholder="0.00"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 font-bold text-slate-800 outline-none focus:bg-white focus:border-slate-500 transition"
                  />
                </div>
              </div>

              {/* Stock */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Initial Stock</label>
                <div className="relative group">
                  <Box className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-slate-800 transition-colors" />
                  <input 
                    type="number" name="stock" value={formData.stock} onChange={handleChange}
                    placeholder="0"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 font-bold text-slate-800 outline-none focus:bg-white focus:border-slate-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-6 flex gap-4 border-t border-gray-100 mt-4">
              <button 
                type="button"
                onClick={() => setFormData({ name: '', category: 'Aluminum', price: '', stock: '', unit: 'pcs', alertQty: '5' })}
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
                  <> <Save className="w-5 h-5" /> Save Product </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* --- প্রিভিউ কার্ড --- */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <ScanBarcode className="w-4 h-4"/> Preview Card
            </h3>
            
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Box className="w-24 h-24 text-slate-900"/>
              </div>

              <div className="relative z-10">
                <span className="inline-block bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded mb-3 border border-gray-200 uppercase tracking-wide">
                  {formData.category}
                </span>
                
                <h2 className="text-xl font-black text-slate-900 mb-1 leading-tight break-words">
                  {formData.name || "Product Name"}
                </h2>
                <p className="text-xs text-gray-400 font-mono mb-6">ID: #PREVIEW</p>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-500 uppercase">Price</span>
                    <span className="text-lg font-black text-slate-800">৳ {formData.price || "0"}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-500 uppercase">Stock</span>
                    <span className="text-lg font-black text-slate-800">
                      {formData.stock || "0"} <span className="text-xs font-bold text-gray-400">{formData.unit}</span>
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                  <p className="text-[10px] text-gray-400 font-medium">
                    This is how the product will appear in the inventory list.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
              <h4 className="font-bold text-blue-700 mb-1 text-xs uppercase flex items-center gap-1">
                <CheckCircle className="w-3 h-3"/> Quick Tip
              </h4>
              <p className="text-xs text-blue-600/80 leading-relaxed font-medium">
                You can leave Price and Stock empty. They will be automatically set to 0. You can update them later from the Inventory list.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default AddProduct;
