import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Search, Plus, Trash2, ShoppingCart, 
  CheckCircle, XCircle, Box, 
  Save, ChevronDown, Check,
  CheckSquare, Square, Pencil, RefreshCw, Printer, 
  FileText, AlertTriangle, List 
} from 'lucide-react';

// --- ১. প্রিমিয়াম ড্রপডাউন (FIXED HEIGHT: 52px) ---
const PremiumDropdown = ({ options = [], value, onChange, placeholder, icon: Icon, type }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => { if (isOpen && searchInputRef.current) searchInputRef.current.focus(); }, [isOpen]);

  const safeOptions = Array.isArray(options) ? options : [];
  const selectedItem = safeOptions.find(opt => opt._id === value || opt.value === value);
  const filteredOptions = safeOptions.filter(opt => 
    (opt.name && opt.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (opt.mobile && opt.mobile.includes(searchTerm)) ||
    (opt.stock && opt.stock.toString().includes(searchTerm))
  );

  return (
    <div className="relative w-full group" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        // ✅ ফিক্সড হাইট: h-[52px] এবং py-0 flex items-center
        className={`flex items-center justify-between bg-white border-2 rounded-xl px-4 h-[52px] cursor-pointer transition-all duration-300 ${isOpen ? 'border-orange-500 ring-4 ring-orange-500/10' : 'border-gray-100 hover:border-gray-200'}`}
      >
        <div className="flex items-center gap-3 overflow-hidden w-full">
          <div className={`p-1.5 rounded-lg transition-colors ${isOpen ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-400'}`}>
            {Icon && <Icon className="w-4 h-4" />}
          </div>
          <div className="flex flex-col overflow-hidden w-full leading-tight">
             <span className={`font-bold text-sm truncate ${selectedItem ? 'text-slate-800' : 'text-gray-400'}`}>{selectedItem ? selectedItem.name : placeholder}</span>
             {selectedItem && <span className="text-[10px] text-gray-500 font-medium truncate">{type === 'product' ? `Stock: ${selectedItem.stock} ${selectedItem.unit}` : type === 'customer' ? `Mobile: ${selectedItem.mobile}` : selectedItem.value}</span>}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}/>
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.98 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: 10, scale: 0.98 }} 
            className="absolute z-[100] w-full min-w-[300px] bg-white border border-gray-200 rounded-xl shadow-2xl mt-2 overflow-hidden ring-1 ring-black/5"
          >
            <div className="p-3 border-b border-gray-100 bg-gray-50/50">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"/>
                <input ref={searchInputRef} type="text" placeholder="Type to search..." className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
              </div>
            </div>
            <div className="max-h-[250px] overflow-y-auto custom-scrollbar p-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => {
                  const isSelected = value === (opt._id || opt.value);
                  return (
                    <div key={opt._id || opt.value} onClick={() => { onChange(opt._id || opt.value); setIsOpen(false); setSearchTerm(''); }} className={`px-3 py-2.5 rounded-lg cursor-pointer flex justify-between items-center transition-colors ${isSelected ? 'bg-orange-50 text-orange-700' : 'hover:bg-gray-50 text-slate-700'}`}>
                      <div>
                        <p className="text-sm font-bold">{opt.name}</p>
                        {type === 'product' && <p className="text-[10px] text-gray-500 font-medium mt-0.5">Stock: {opt.stock} {opt.unit}</p>}
                        {type === 'customer' && <p className="text-[10px] text-gray-500 font-medium mt-0.5">{opt.mobile}</p>}
                      </div>
                      {isSelected && <Check className="w-4 h-4"/>}
                    </div>
                  );
                })
              ) : ( <div className="p-8 text-center text-xs font-medium text-gray-400">No results found</div> )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- মেইন কম্পোনেন্ট ---
const CreateQuotation = ({ editData }) => {
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [cart, setCart] = useState([]);
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(0);
  const [feet, setFeet] = useState('');
  const [showManualTotal, setShowManualTotal] = useState(false);
  const [manualTotal, setManualTotal] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [calcBy, setCalcBy] = useState('qty'); 
  const [description, setDescription] = useState(''); 
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
  // Description Modal State
  const [showDescModal, setShowDescModal] = useState(false);
  const [selectedDescItems, setSelectedDescItems] = useState([]);
  const [modalSearch, setModalSearch] = useState(''); 

  const [deleteIndex, setDeleteIndex] = useState(null);
  const [editingQuotationId, setEditingQuotationId] = useState(null);
  const [currentQuotationNo, setCurrentQuotationNo] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, custRes] = await axios.all([
          axios.get('/products'), 
          axios.get('/customers')
        ]);
        setProducts(Array.isArray(prodRes.data) ? prodRes.data : []); 
        setCustomers(Array.isArray(custRes.data) ? custRes.data : []);
      } catch (err) { showMessage('error', 'Failed to load data!'); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (editData && customers.length > 0) {
      setEditingQuotationId(editData._id); 
      setCurrentQuotationNo(editData.quotationNo);
      setCart(editData.items || []);
      const foundCustomer = customers.find(c => c.name === (editData.customer?.name || editData.customerName));
      if(foundCustomer) setSelectedCustomer(foundCustomer._id);
      const pmt = editData.payment || {};
      setDiscount(pmt.discount || editData.discount || 0);
      showMessage('success', 'Ready to Update Quotation!');
    }
  }, [editData, customers]);

  // বিবরণ সিলেকশন হ্যান্ডলার
  const handleDescSelection = (itemName) => {
    if (selectedDescItems.includes(itemName)) {
        setSelectedDescItems(selectedDescItems.filter(i => i !== itemName));
    } else {
        setSelectedDescItems([...selectedDescItems, itemName]);
    }
  };

  // বিবরণ ইনসার্ট করা (* মার্ক দিয়ে)
  const insertDescription = () => {
    if (selectedDescItems.length === 0) {
        setShowDescModal(false);
        return;
    }
    
    // ✅ ফিক্স: সিরিয়াল নাম্বারের বদলে * মার্ক ব্যবহার করা হয়েছে
    const formattedText = selectedDescItems.map(item => `* ${item}`).join('\n');
    
    setDescription(prev => prev ? prev + '\n' + formattedText : formattedText);
    
    setSelectedDescItems([]); 
    setShowDescModal(false);
    setModalSearch('');
  };

  // পপআপের ফিল্টার করা প্রোডাক্ট লিস্ট
  const filteredModalProducts = products.filter(p => 
    p.name.toLowerCase().includes(modalSearch.toLowerCase())
  );

  const handleDescriptionChange = (e) => { let val = e.target.value; if (description === '' && val.length === 1 && val !== '*') val = '* ' + val; setDescription(val); };
  const handleDescriptionKeyDown = (e) => { if (e.key === 'Enter') { e.preventDefault(); setDescription(prev => prev + '\n* '); } };

  const handleAddOrUpdate = () => {
    if (!selectedProduct) { showMessage('error', 'Select a product!'); return; }
    if (!price || Number(price) === 0) {
        if (!showManualTotal) { setShowManualTotal(true); showMessage('error', 'Enter Amount'); return; }
        if (!manualTotal || Number(manualTotal) <= 0) { showMessage('error', 'Invalid Amount'); return; }
    }
    const product = products.find(p => p._id === selectedProduct);
    let finalDesc = description.trim(); if (finalDesc === '*') finalDesc = '';
    let calculatedTotal = (Number(price) > 0) ? (calcBy === 'qty' ? Number(qty) * Number(price) : (Number(feet) || 0) * Number(price)) : Number(manualTotal);
    const newItem = { _id: product._id, name: product.name, unit: product.unit, price: Number(price) || 0, qty: Number(qty), feet: feet, calcBy: calcBy, description: finalDesc, total: calculatedTotal };
    if (editingIndex !== null) { const updatedCart = [...cart]; updatedCart[editingIndex] = newItem; setCart(updatedCart); setEditingIndex(null); } 
    else { setCart([...cart, newItem]); }
    setQty(1); setFeet(''); setSelectedProduct(''); setPrice(0); setDescription(''); setShowManualTotal(false); setManualTotal('');
  };

  const confirmDelete = (index) => { setDeleteIndex(index); };
  const executeDelete = () => { 
      setCart(cart.filter((_, i) => i !== deleteIndex)); 
      setDeleteIndex(null); 
      if(editingIndex === deleteIndex) setEditingIndex(null); 
      showMessage('success', 'Item Removed Successfully!');
  };
  const handleEdit = (index) => {
    const item = cart[index]; setSelectedProduct(item._id); setQty(item.qty); setFeet(item.feet); setPrice(item.price); setDescription(item.description); setCalcBy(item.calcBy);
    if(item.price === 0) { setShowManualTotal(true); setManualTotal(item.total); } else { setShowManualTotal(false); setManualTotal(''); }
    setEditingIndex(index); window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const cancelEdit = () => { setEditingIndex(null); setQty(1); setFeet(''); setSelectedProduct(''); setPrice(0); setDescription(''); setShowManualTotal(false); setManualTotal(''); };

  const subTotal = cart.reduce((acc, item) => acc + item.total, 0);
  const grandTotal = subTotal - Number(discount);
  
  const handleCreateQuotation = async (shouldPrint) => {
    if (cart.length === 0) { showMessage('error', 'Cart is empty!'); return; }
    if (!selectedCustomer) { showMessage('error', 'Select Customer!'); return; }
    setLoading(true);
    try {
      const customer = customers.find(c => c._id === selectedCustomer);
      const quotationData = { 
          customer: { name: customer.name, mobile: customer.mobile, address: customer.address }, 
          items: cart, 
          payment: { subTotal, discount, grandTotal, paid: 0, due: grandTotal } 
      };
      
      const res = await axios.post('/create-quotation', quotationData);
      
      if (res.data.status === 'Success') {
        const newData = res.data.data;
        if(shouldPrint) { 
            const savedData = { ...quotationData, quotationNo: newData.quotationNo, date: new Date() };
            navigate('/print-invoice', { state: { invoiceData: savedData, type: 'quotation' } });
        } else { 
            setEditingQuotationId(newData._id);
            setCurrentQuotationNo(newData.quotationNo);
            showMessage('success', 'Quotation Saved! You can print now.'); 
        }
      }
    } catch (err) { showMessage('error', 'Error Saving Quotation!'); }
    setLoading(false);
  };

  const handleUpdateQuotation = async () => {
    if (!editingQuotationId) { showMessage('error', 'No ID Found!'); return; }
    setLoading(true);
    try {
      const customer = customers.find(c => c._id === selectedCustomer);
      const quotationData = { 
          customer: { name: customer.name, mobile: customer.mobile, address: customer.address }, 
          items: cart, 
          payment: { subTotal, discount, grandTotal, paid: 0, due: grandTotal } 
      };
      
      const res = await axios.put(`/update-quotation/${editingQuotationId}`, quotationData);
      if(res.data.status === "Success") { showMessage('success', 'Updated Successfully!'); } 
      else { showMessage('error', 'Update Failed!'); }
    } catch (err) { showMessage('error', 'Server Error!'); }
    setLoading(false);
  };

  const handleDirectPrint = () => {
      const customer = customers.find(c => c._id === selectedCustomer);
      const dataToPrint = {
          _id: editingQuotationId,
          quotationNo: currentQuotationNo || 'DRAFT',
          date: new Date(),
          customer: { name: customer.name, mobile: customer.mobile, address: customer.address },
          items: cart,
          payment: { subTotal, discount, grandTotal, paid: 0, due: grandTotal }
      };
      navigate('/print-invoice', { state: { invoiceData: dataToPrint, type: 'quotation' } });
  };

  const resetForm = () => { 
      setCart([]); 
      setDiscount(0); 
      setSelectedCustomer(''); 
      setEditingQuotationId(null); 
      setCurrentQuotationNo(null);
  };
  
  const showMessage = (type, text) => { setMessage({ type, text }); setTimeout(() => setMessage(null), 3000); };

  return (
    <div className="flex flex-col h-full md:h-[calc(100vh-120px)] relative overflow-y-auto md:overflow-hidden pb-24 md:pb-0 bg-[#f8fafc]">
      
      {/* --- TOAST --- */}
      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-0 left-1/2 z-[10000] flex items-center gap-3 bg-slate-800 text-white px-6 py-3 rounded-lg shadow-xl border border-slate-700/50"
          >
            {message.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
            <p className="text-sm font-medium">{message.text}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- DESCRIPTION MODAL (Popup with Products) --- */}
      <AnimatePresence>
        {showDescModal && (
          <div className="fixed inset-0 z-[20000] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowDescModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                exit={{ scale: 0.95, opacity: 0, y: 20 }} 
                className="bg-white rounded-[25px] p-6 w-full max-w-md shadow-2xl relative z-10 border border-gray-100 flex flex-col max-h-[80vh]"
            >
              <div className="flex flex-col gap-3 mb-4 pb-4 border-b border-gray-100">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <List className="w-5 h-5 text-orange-600"/> Select Items
                    </h3>
                    <button onClick={() => setShowDescModal(false)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition"><XCircle className="w-5 h-5 text-gray-500"/></button>
                </div>
                {/* Search in Modal */}
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"/>
                    <input 
                        type="text" 
                        placeholder="Search product to add..." 
                        value={modalSearch}
                        onChange={(e) => setModalSearch(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm font-medium outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-200"
                    />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                {filteredModalProducts.length > 0 ? (
                    filteredModalProducts.map((prod) => {
                        const isSelected = selectedDescItems.includes(prod.name);
                        return (
                            <div 
                                key={prod._id} 
                                onClick={() => handleDescSelection(prod.name)}
                                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${isSelected ? 'bg-orange-50 border-orange-200 shadow-sm' : 'bg-white border-gray-100 hover:bg-gray-50'}`}
                            >
                                <div>
                                    <p className={`text-sm font-bold ${isSelected ? 'text-orange-700' : 'text-slate-700'}`}>{prod.name}</p>
                                    <p className="text-[10px] text-gray-400">{prod.stock} {prod.unit} available</p>
                                </div>
                                {isSelected ? <CheckSquare className="w-5 h-5 text-orange-600"/> : <Square className="w-5 h-5 text-gray-300"/>}
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-8 text-gray-400 text-xs font-bold">No products found</div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 mt-4">
                <button onClick={insertDescription} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-slate-200 active:scale-[0.98] transition-all flex justify-center items-center gap-2">
                    <CheckCircle className="w-5 h-5"/> Insert Selected ({selectedDescItems.length})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- DELETE MODAL --- */}
      <AnimatePresence>
        {deleteIndex !== null && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setDeleteIndex(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl relative z-10 text-center border border-gray-200"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-2">Remove Item?</h3>
              <p className="text-gray-500 text-sm mb-6 font-medium">Are you sure you want to remove this from the list?</p>
              <div className="flex gap-3">
                <button 
                    onClick={() => setDeleteIndex(null)} 
                    className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-bold text-sm hover:bg-gray-50 transition"
                >
                    Cancel
                </button>
                <button 
                    onClick={executeDelete} 
                    className="flex-1 py-2.5 rounded-lg bg-slate-800 text-white font-bold text-sm hover:bg-slate-900 transition"
                >
                    Remove
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MAIN INPUT CARD (Fixed Heights) --- */}
      <div className={`bg-white p-5 md:p-6 rounded-[25px] shadow-sm border mb-5 shrink-0 z-20 relative mt-5 transition-all duration-300 ${editingIndex !== null ? 'border-orange-200 ring-2 ring-orange-100 shadow-orange-100' : 'border-gray-200'}`}>
        
        {editingIndex !== null && <div className="absolute -top-3 left-6 bg-orange-600 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-orange-200 z-30 tracking-wide uppercase"><Pencil className="w-3 h-3"/> Editing Item #{editingIndex + 1}</div>}
        
        {editingQuotationId && (
            <div className="absolute top-6 right-6">
                <button onClick={resetForm} className="text-xs bg-orange-50 px-3 py-1.5 rounded-lg font-bold text-orange-600 hover:bg-orange-100 border border-orange-100 transition-all flex items-center gap-1">
                    <Plus className="w-3 h-3"/> New Quote
                </button>
            </div>
        )}

        <div className="flex flex-col gap-5 mt-1">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5"><label className="h-5 flex items-center text-[10px] font-bold text-gray-400 uppercase ml-1 gap-1">Customer <span className="text-red-400">*</span></label><PremiumDropdown options={customers} value={selectedCustomer} onChange={setSelectedCustomer} placeholder="Select Customer" icon={User} type="customer"/></div>
                <div className="space-y-1.5"><label className="h-5 flex items-center text-[10px] font-bold text-gray-400 uppercase ml-1 gap-1">Product <span className="text-red-400">*</span></label><PremiumDropdown options={products} value={selectedProduct} onChange={(val) => { setSelectedProduct(val); const p = products.find(i=>i._id===val); if(p) setPrice(p.price); }} placeholder="Select Product" icon={Box} type="product"/></div>
            </div>

            <div className="grid grid-cols-3 gap-4 w-full">
                <div className="space-y-1.5">
                    <div onClick={() => setCalcBy('qty')} className={`h-5 text-[10px] font-bold uppercase cursor-pointer flex items-center gap-1.5 transition-colors ${calcBy === 'qty' ? 'text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}>
                        {calcBy === 'qty' ? <CheckSquare className="w-3 h-3"/> : <Square className="w-3 h-3"/>} Quantity
                    </div>
                    <input type="number" value={qty} onChange={e => setQty(e.target.value)} className={`w-full h-[52px] border-2 rounded-xl px-2 text-center font-bold text-slate-800 outline-none focus:border-orange-500 transition-all duration-300 ${calcBy === 'qty' ? 'bg-orange-50/30 border-orange-200 text-orange-900' : 'bg-gray-50/50 border-gray-100'}`}/>
                </div>
                <div className="space-y-1.5">
                    <div onClick={() => setCalcBy('feet')} className={`h-5 text-[10px] font-bold uppercase cursor-pointer flex items-center gap-1.5 transition-colors ${calcBy === 'feet' ? 'text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}>
                        {calcBy === 'feet' ? <CheckSquare className="w-3 h-3"/> : <Square className="w-3 h-3"/>} Measurement
                    </div>
                    <input type="number" value={feet} onChange={e => setFeet(e.target.value)} placeholder="0" className={`w-full h-[52px] border-2 rounded-xl px-2 text-center font-bold text-slate-800 outline-none focus:border-orange-500 transition-all duration-300 ${calcBy === 'feet' ? 'bg-orange-50/30 border-orange-200 text-orange-900' : 'bg-gray-50/50 border-gray-100'}`}/>
                </div>
                <div className="space-y-1.5">
                    <label className="h-5 flex items-center text-[10px] font-bold text-gray-400 uppercase gap-1">Rate (Price)</label>
                    <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full h-[52px] border-2 border-gray-100 bg-gray-50/50 rounded-xl px-2 text-center font-bold text-slate-800 outline-none focus:border-orange-500 focus:bg-orange-50/30 transition-all duration-300"/>
                </div>
            </div>

            {showManualTotal && <div className="space-y-1.5"><label className="h-5 flex items-center text-[10px] font-bold text-red-400 uppercase ml-1 gap-1"><AlertTriangle className="w-3 h-3"/> Manual Amount</label><input type="number" value={manualTotal} onChange={e => setManualTotal(e.target.value)} placeholder="Enter Final Amount" className="w-full p-3 border-2 border-red-200 bg-red-50/30 rounded-xl text-red-600 font-bold outline-none focus:border-red-400 transition-all"/></div>}
            
            <AnimatePresence>
                {selectedProduct && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden relative">
                    <div className="flex justify-between items-end mb-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Description / Details</label>
                        <button onClick={() => setShowDescModal(true)} className="text-[10px] font-bold bg-orange-50 text-orange-600 px-2 py-1 rounded-md border border-orange-100 hover:bg-orange-100 transition flex items-center gap-1">
                            <List className="w-3 h-3"/> Select from List
                        </button>
                    </div>
                    <textarea value={description} onChange={handleDescriptionChange} onKeyDown={handleDescriptionKeyDown} placeholder="Add description (optional)..." className="w-full p-4 bg-gray-50/50 border-2 border-gray-100 rounded-xl h-24 resize-none outline-none focus:bg-white focus:border-slate-800 transition-all duration-300 text-sm font-medium text-slate-600"/>
                </motion.div>}
            </AnimatePresence>

            <div className="flex gap-4 pt-2">
                {editingIndex !== null && <button onClick={cancelEdit} className="px-8 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-gray-500 transition-colors">Cancel</button>}
                <button onClick={handleAddOrUpdate} className={`flex-1 h-[54px] rounded-xl font-bold text-white flex justify-center items-center gap-2 shadow-lg shadow-slate-200 active:scale-[0.98] transition-all duration-300 ${editingIndex !== null ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-200' : 'bg-slate-900 hover:bg-slate-800'}`}>{editingIndex !== null ? <><RefreshCw className="w-5 h-5"/> Update Item</> : <><Plus className="w-5 h-5"/> Add To Quotation</>}</button>
            </div>
        </div>
      </div>

      {/* --- ITEMS LIST TABLE --- */}
      <div className="flex-1 bg-white rounded-[25px] shadow-sm border border-gray-200 overflow-hidden flex flex-col mb-4 min-h-[300px] z-10 relative">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center backdrop-blur-sm">
            <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-500"/>
                <span className="text-xs font-bold uppercase text-slate-700 tracking-wide">Quotation Items</span>
            </div>
            <span className="bg-white border border-gray-200 px-2.5 py-1 rounded-lg text-xs font-black text-slate-700 shadow-sm">{cart.length}</span>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-3">
                    <ShoppingCart className="w-12 h-12 opacity-20"/>
                    <p className="text-sm font-bold opacity-40">List is empty</p>
                </div>
            ) : (
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10">
                        <tr className="text-[10px] text-gray-400 uppercase bg-gray-50/90 backdrop-blur-sm">
                            <th className="p-3 pl-4 rounded-l-lg">Product Details</th>
                            <th className="p-3 text-center">Qty</th>
                            <th className="p-3 text-center">Size</th>
                            <th className="p-3 text-center">Rate</th>
                            <th className="p-3 text-right">Total</th>
                            <th className="p-3 text-center rounded-r-lg">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {cart.map((item, i) => (
                            <motion.tr 
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
                                key={i} 
                                className={`border-b border-gray-50 last:border-0 group hover:bg-gray-50/50 transition-colors ${editingIndex === i ? 'bg-orange-50/50' : ''}`}
                            >
                                <td className="p-3 pl-4 font-bold text-slate-700">
                                    <div>{item.name}</div>
                                    {item.description && <div className="text-[10px] text-gray-500 mt-1 bg-gray-100/50 p-1.5 rounded-lg border border-gray-100 font-medium leading-relaxed whitespace-pre-wrap">{item.description}</div>}
                                </td>
                                <td className="p-3 text-center font-bold text-gray-500 bg-gray-50/30 rounded-lg mx-1">{item.qty}</td>
                                <td className="p-3 text-center font-bold text-gray-500">{item.feet||'-'}</td>
                                <td className="p-3 text-center font-medium text-gray-500">{item.price}</td>
                                <td className="p-3 text-right font-black text-slate-800">৳ {item.total.toLocaleString()}</td>
                                <td className="p-3 text-center">
                                    <div className="flex justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                        <button onClick={()=>handleEdit(i)} className="p-2 bg-white border border-gray-200 text-blue-600 rounded-lg hover:border-blue-200 hover:bg-blue-50 transition shadow-sm"><Pencil className="w-3.5 h-3.5"/></button>
                                        <button onClick={()=>confirmDelete(i)} className="p-2 bg-white border border-gray-200 text-red-600 rounded-lg hover:border-red-200 hover:bg-red-50 transition shadow-sm"><Trash2 className="w-3.5 h-3.5"/></button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
      </div>

      {/* --- BOTTOM SECTION (Calculation) --- */}
      <div className="bg-white rounded-t-[30px] md:rounded-[25px] shadow-[0_-10px_40px_rgba(0,0,0,0.08)] border border-gray-100 p-6 shrink-0 z-30 relative">
        <div className="flex flex-col md:flex-row gap-8">
           
           <div className="w-full flex flex-col gap-4">
               <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                   <span className="text-xs font-bold pl-1 text-gray-500 uppercase tracking-wide">Discount Amount:</span>
                   <div className="relative">
                       <span className="absolute left-3 top-2.5 font-bold text-gray-400">৳</span>
                       <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} className="w-32 bg-white border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-right font-bold outline-none focus:border-slate-800 transition-colors"/>
                   </div>
               </div>
               
               <div className="flex justify-between items-baseline px-2 border-t border-dashed border-gray-200 pt-3">
                   <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Grand Total</span> 
                   <span className="text-3xl font-black text-orange-600 tracking-tight">৳ {grandTotal.toLocaleString()}</span>
               </div>
               
               <div className="flex gap-3 mt-2 border-t border-gray-100 pt-4">
                 {editingQuotationId ? (
                     <button onClick={handleUpdateQuotation} className="flex-1 py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-[0.98] transition-all flex justify-center items-center gap-2">
                        {loading ? 'Updating...' : <><RefreshCw className="w-5 h-5"/> Update Quote</>}
                     </button>
                 ) : (
                     <button onClick={() => handleCreateQuotation(false)} className="flex-1 py-4 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-200 active:scale-[0.98] transition-all flex justify-center items-center gap-2">
                        {loading ? 'Saving...' : <><Save className="w-5 h-5"/> Save Quote</>}
                     </button>
                 )}
                 {/* Print Button */}
                 <button onClick={() => editingQuotationId ? handleDirectPrint() : handleCreateQuotation(true)} className="flex-1 py-4 rounded-xl font-bold text-slate-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 shadow-sm active:scale-[0.98] transition-all flex justify-center items-center gap-2">
                    <Printer className="w-5 h-5"/> Print & Save
                 </button>
               </div>
           </div>
        </div>
      </div>

    </div>
  );
};

export default CreateQuotation;
