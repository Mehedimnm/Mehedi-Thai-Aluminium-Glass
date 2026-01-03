import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Trash2, Printer, Wallet, CheckCircle, 
  XCircle, HandCoins, X, Save, Eye, Calendar, 
  ChevronDown, CreditCard, Banknote, Smartphone 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- PREMIUM CUSTOM DROPDOWN ---
const PaymentMethodDropdown = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const methods = [
    { id: 'Cash', label: 'Cash Payment', icon: Banknote },
    { id: 'Bkash', label: 'Bkash Transfer', icon: Smartphone },
    { id: 'Nagad', label: 'Nagad Transfer', icon: Smartphone },
    { id: 'Bank', label: 'Bank Deposit', icon: CreditCard },
  ];

  const selected = methods.find(m => m.id === value) || methods[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between border border-gray-300 rounded-xl px-3 py-2.5 cursor-pointer bg-white transition-all ${isOpen ? 'ring-2 ring-slate-800 border-transparent' : 'hover:border-slate-400'}`}
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-gray-50 rounded-md border border-gray-200 text-slate-600">
            <selected.icon className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-800 text-sm">{selected.label}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
          >
            {methods.map((method) => (
              <div 
                key={method.id}
                onClick={() => { onChange(method.id); setIsOpen(false); }}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition ${value === method.id ? 'bg-slate-50 border-l-4 border-slate-800' : ''}`}
              >
                <method.icon className={`w-4 h-4 ${value === method.id ? 'text-slate-800' : 'text-gray-400'}`} />
                <span className={`text-sm font-bold ${value === method.id ? 'text-slate-900' : 'text-gray-500'}`}>{method.label}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- MAIN COMPONENT ---
const DueList = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [deleteId, setDeleteId] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  
  const [collectionData, setCollectionData] = useState({
    amount: '',
    method: 'Cash',
    remark: ''
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchDueInvoices();
  }, []);

  const fetchDueInvoices = async () => {
    setLoading(true);
    try {
      // ✅ FIX: Added /api prefix
      const res = await axios.get('/api/invoices');
      const dueData = res.data.filter(inv => inv.payment?.due > 0);
      setInvoices(dueData);
    } catch (err) {
      console.error("Error:", err);
    }
    setLoading(false);
  };

  const totalDueAmount = invoices.reduce((acc, curr) => acc + (curr.payment?.due || 0), 0);

  const showSuccess = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const openCollectModal = (invoice) => {
    setSelectedInvoice(invoice);
    setCollectionData({ amount: '', method: 'Cash', remark: '' });
    setIsCollectModalOpen(true);
  };

  const openHistoryModal = (invoice) => {
    setSelectedInvoice(invoice);
    setIsHistoryModalOpen(true);
  };

  // --- UPDATED PAYMENT SUBMIT HANDLER ---
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    
    const payAmount = Number(collectionData.amount);
    if (!collectionData.amount || payAmount <= 0) {
        alert('Please enter a valid amount!');
        return;
    }
    if (payAmount > selectedInvoice.payment.due) {
        alert('Amount cannot exceed Due!');
        return;
    }

    setProcessing(true);
    try {
        const prevPaid = Number(selectedInvoice.payment.paid) || 0;
        const newPaid = prevPaid + payAmount;
        const newDue = Number(selectedInvoice.payment.grandTotal) - newPaid;

        const newHistoryRecord = {
            date: new Date().toISOString(), 
            amount: payAmount,
            method: collectionData.method,
            remark: collectionData.remark
        };

        const previousHistory = selectedInvoice.payment.history || [];

        const updatedInvoice = {
            ...selectedInvoice,
            payment: {
                ...selectedInvoice.payment,
                paid: newPaid,
                due: newDue,
                method: collectionData.method,
                history: [...previousHistory, newHistoryRecord] 
            }
        };

        // ✅ FIX: Added /api prefix
        const res = await axios.put(`/api/update-invoice/${selectedInvoice._id}`, updatedInvoice);

        if (res.data.status === "Success") {
            showSuccess('Payment Collected Successfully!');
            setIsCollectModalOpen(false);
            fetchDueInvoices();
        }
    } catch (error) {
        alert('Update Failed! (Check Backend Schema for "history" array)');
    }
    setProcessing(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      // ✅ FIX: Added /api prefix
      await axios.delete(`/api/delete-invoice/${deleteId}`);
      setInvoices(invoices.filter(inv => inv._id !== deleteId));
      setDeleteId(null);
      showSuccess("Record Deleted!");
    } catch (err) {
      setDeleteId(null);
    }
  };

  const handlePrint = (invoice) => {
    navigate('/print-invoice', { state: { invoiceData: invoice, returnTab: 'Total Due' } });
  };

  const filteredInvoices = invoices.filter(inv => 
    (inv.invoiceNo && inv.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (inv.customer?.name && inv.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (inv.customer?.mobile && inv.customer.mobile.includes(searchTerm))
  );

  return (
    <div className="space-y-6 pb-10 relative font-sans text-slate-800">
      
      {/* --- TOAST --- */}
      <AnimatePresence>
        {successToast && (
          <motion.div 
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-0 left-1/2 z-[10000] flex items-center gap-3 bg-slate-800 text-white px-6 py-3 rounded-lg shadow-xl"
          >
            <CheckCircle className="w-5 h-5 text-gray-400" />
            <p className="text-sm font-medium">{successToast}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- HEADER --- */}
      <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="p-3 bg-gray-100 text-slate-700 rounded-xl border border-gray-200">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Due Collection</h2>
            <p className="text-gray-500 text-sm font-medium">Market Outstanding: <span className="font-bold text-rose-600">৳{totalDueAmount.toLocaleString()}</span></p>
          </div>
        </div>
        
        <div className="relative w-full md:w-72 group">
          <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 peer-focus:text-slate-800 transition-colors" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-200 transition-all font-medium text-slate-700 peer"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* --- TABLE AREA --- */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider first:pl-8">Client Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Invoice Total</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Paid</th>
                <th className="px-6 py-4 text-xs font-bold text-rose-500 uppercase tracking-wider text-right">Due Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center last:pr-8">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInvoices.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50/60 transition-colors group">
                  <td className="px-6 py-4 first:pl-8">
                    <button onClick={() => openCollectModal(item)} className="text-left group/name">
                      <div className="font-bold text-slate-900 text-sm group-hover/name:text-blue-600 transition-colors">{item.customer?.name}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{item.invoiceNo} • {item.customer?.mobile}</div>
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-slate-600 text-sm">৳{item.payment?.grandTotal?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-semibold text-emerald-600 text-sm">৳{item.payment?.paid?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-black text-rose-600 text-sm bg-rose-50 px-2 py-1 rounded border border-rose-100">৳{item.payment?.due?.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-center last:pr-8">
                    <div className="flex items-center justify-center gap-3 opacity-90 group-hover:opacity-100 transition-opacity">
                      
                      {/* ✅ BIG COLLECT BUTTON */}
                      <button 
                        onClick={() => openCollectModal(item)} 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition active:scale-95"
                      >
                        <HandCoins className="w-4 h-4" /> Collect
                      </button>

                      <button onClick={() => openHistoryModal(item)} className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition border border-transparent hover:border-blue-200" title="Payment History">
                        <Eye className="w-4 h-4" />
                      </button>

                      <button onClick={() => handlePrint(item)} className="p-2 rounded-lg text-slate-500 hover:bg-gray-100 transition border border-transparent hover:border-gray-200">
                        <Printer className="w-4 h-4" />
                      </button>
                      
                      <button onClick={() => setDeleteId(item._id)} className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition border border-transparent hover:border-red-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- COLLECT MODAL --- */}
      <AnimatePresence>
        {isCollectModalOpen && selectedInvoice && (
          <div className="fixed inset-0 bg-slate-900/40 z-[9999] flex items-center justify-center backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl relative border border-gray-200">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                  <h3 className="text-lg font-bold text-slate-900">Receive Payment</h3>
                  <button onClick={() => setIsCollectModalOpen(false)}><X className="w-5 h-5 text-gray-500"/></button>
              </div>
              
              <div className="mb-6 bg-rose-50 p-4 rounded-xl flex justify-between items-center border border-rose-100">
                <span className="text-xs font-bold text-rose-400 uppercase">Current Due</span>
                <span className="text-xl font-bold text-rose-600">৳{selectedInvoice.payment.due.toLocaleString()}</span>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Received Amount</label>
                  <input 
                    type="number" 
                    value={collectionData.amount} 
                    onChange={(e) => setCollectionData({...collectionData, amount: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 font-bold text-slate-800 focus:border-slate-500 outline-none transition placeholder:font-normal" 
                    placeholder="Enter Amount" 
                    autoFocus
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Payment Method</label>
                  <PaymentMethodDropdown 
                    value={collectionData.method} 
                    onChange={(val) => setCollectionData({...collectionData, method: val})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Remark</label>
                  <textarea 
                    value={collectionData.remark} 
                    onChange={(e) => setCollectionData({...collectionData, remark: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:border-slate-500 outline-none transition h-20 resize-none"
                    placeholder="Optional note..."
                  />
                </div>

                <button 
                  disabled={processing}
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl mt-4 transition flex justify-center items-center gap-2 shadow-lg active:scale-95"
                >
                  <Save className="w-4 h-4" /> {processing ? 'Processing...' : 'Confirm Receipt'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- PAYMENT HISTORY MODAL --- */}
      <AnimatePresence>
        {isHistoryModalOpen && selectedInvoice && (
          <div className="fixed inset-0 bg-slate-900/40 z-[9999] flex items-center justify-center backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative border border-gray-200 overflow-hidden flex flex-col max-h-[80vh]">
              
              <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Eye className="w-5 h-5 text-blue-500"/> Transaction Log</h3>
                    <p className="text-xs text-gray-500 mt-1 font-medium">{selectedInvoice.invoiceNo}</p>
                  </div>
                  <button onClick={() => setIsHistoryModalOpen(false)} className="bg-white p-1.5 rounded-full border hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition"><X className="w-5 h-5"/></button>
              </div>

              <div className="overflow-y-auto p-6 custom-scrollbar">
                
                {/* Summary Info */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-slate-50 p-3 rounded-xl border text-center">
                        <p className="text-[10px] text-gray-500 uppercase font-bold">Total</p>
                        <p className="text-sm font-bold text-slate-800">৳{selectedInvoice.payment.grandTotal}</p>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-center">
                        <p className="text-[10px] text-emerald-600 uppercase font-bold">Paid</p>
                        <p className="text-sm font-bold text-emerald-700">৳{selectedInvoice.payment.paid}</p>
                    </div>
                    <div className="bg-rose-50 p-3 rounded-xl border border-rose-100 text-center">
                        <p className="text-[10px] text-rose-600 uppercase font-bold">Due</p>
                        <p className="text-sm font-bold text-rose-700">৳{selectedInvoice.payment.due}</p>
                    </div>
                </div>

                {/* History Table */}
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2"><Calendar className="w-3 h-3"/> Payment Timeline</h4>
                
                {(!selectedInvoice.payment.history || selectedInvoice.payment.history.length === 0) ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <p className="text-xs text-gray-400 font-medium">No detailed history available.</p>
                        <p className="text-[10px] text-gray-300 mt-1">(Only total amount tracked)</p>
                    </div>
                ) : (
                    <div className="border border-gray-100 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase font-bold">
                                <tr>
                                    <th className="px-4 py-3">Date & Time</th>
                                    <th className="px-4 py-3">Method</th>
                                    <th className="px-4 py-3 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {selectedInvoice.payment.history.map((hist, index) => (
                                    <tr key={index} className="hover:bg-slate-50 transition">
                                        <td className="px-4 py-3 text-gray-600 font-bold text-xs">
                                            {hist.date ? new Date(hist.date).toLocaleDateString('en-GB') : 'N/A'}
                                            <span className="block text-[9px] text-gray-400 font-normal">
                                                {hist.date ? new Date(hist.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-700 font-bold text-xs">{hist.method || 'Cash'}</td>
                                        <td className="px-4 py-3 text-right font-black text-emerald-600">
                                            + ৳{Number(hist.amount).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- DELETE MODAL --- */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteId(null)} className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl relative z-10 text-center border border-gray-200">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Record?</h3>
              <p className="text-gray-500 text-sm mb-6">Action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-bold text-sm hover:bg-gray-50">Cancel</button>
                <button onClick={handleDelete} className="flex-1 py-2.5 rounded-lg bg-slate-800 text-white font-bold text-sm hover:bg-slate-900">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default DueList;
