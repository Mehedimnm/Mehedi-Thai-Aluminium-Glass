import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Trash2, Pencil, Printer, 
  FileSpreadsheet, CheckCircle, XCircle, Filter 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QuotationList = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [deleteId, setDeleteId] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      const res = await axios.get('/quotations');
      setQuotations(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching quotations:", err);
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
      setMessage({ type, text });
      setTimeout(() => setMessage(null), 3000);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`/delete-quotation/${deleteId}`);
      setQuotations(quotations.filter(q => q._id !== deleteId));
      setDeleteId(null);
      showMessage('success', 'Quotation Deleted Successfully!');
    } catch (err) {
      showMessage('error', 'Failed to delete quotation!');
    }
  };

  const handlePrint = (quotation) => {
    navigate('/print-invoice', { 
      state: { 
        invoiceData: quotation, 
        type: 'quotation',
        returnTab: 'Total Quotations' 
      } 
    });
  };

  // ✅ Fix: Edit handler - navigate to create-quotation with state
  const handleEdit = (quotation) => {
    navigate('/create-quotation', { state: { editData: quotation } });
  };

  const filteredQuotations = quotations.filter(q => 
    (q.quotationNo && q.quotationNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (q.customer?.name && q.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (q.customer?.mobile && q.customer.mobile.includes(searchTerm))
  );

  return (
    <div className="bg-white rounded-[25px] shadow-sm border border-gray-200 flex flex-col h-full relative overflow-hidden font-sans text-slate-800">
      
      {/* --- TOAST --- */}
      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-0 left-1/2 z-[10000] flex items-center gap-3 bg-slate-800 text-white px-6 py-3 rounded-lg shadow-xl border border-slate-700/50"
          >
            <div className={`p-2 rounded-full ${message.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
              {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">{message.type === 'success' ? 'Success!' : 'Error!'}</h4>
              <p className="text-xs text-gray-300 font-medium">{message.text}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- HEADER --- */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white sticky top-0 z-20">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl border border-orange-100">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Quotation History</h2>
            <p className="text-gray-500 text-sm font-medium">{quotations.length} Total Records</p>
          </div>
        </div>
        
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-slate-800 transition-colors" />
          <input 
            type="text" 
            placeholder="Search quotation..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-200 transition-all font-medium text-slate-700 placeholder:text-gray-400 peer"
          />
          <div className="absolute right-3 top-3 text-gray-400">
            <Filter className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* --- TABLE AREA --- */}
      {/* ✅ Fix: p-2 সরিয়ে দেওয়া হয়েছে যাতে gap না থাকে */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        
        <table className="w-full text-left border-collapse min-w-[900px]">
          {/* ✅ Fix: shadow-sm যোগ করা হয়েছে এবং প্রতিটি th তে bg-gray-50 */}
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-50 border-b border-gray-200 shadow-sm">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap first:pl-8 bg-gray-50">Date & ID</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-50">Customer Info</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center whitespace-nowrap bg-gray-50">Items</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right whitespace-nowrap bg-gray-50">Total Amount</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right last:pr-8 whitespace-nowrap bg-gray-50">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr><td colSpan="5" className="p-10 text-center text-gray-400 font-medium">Loading Quotations...</td></tr>
            ) : filteredQuotations.length === 0 ? (
              <tr><td colSpan="5" className="p-10 text-center text-gray-400 font-medium">No Quotations Found</td></tr>
            ) : (
              filteredQuotations.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50 transition-colors group">
                  
                  {/* Date & ID */}
                  <td className="px-6 py-4 whitespace-nowrap first:pl-8">
                    <div className="font-bold text-slate-900">{item.quotationNo}</div>
                    <div className="text-[11px] text-gray-400 font-bold uppercase mt-0.5">{new Date(item.date || item.createdAt).toLocaleDateString('en-GB')}</div>
                  </td>

                  {/* Customer */}
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 truncate max-w-[180px]" title={item.customer?.name}>{item.customer?.name}</div>
                    <div className="text-[11px] text-gray-400 font-bold mt-0.5">{item.customer?.mobile}</div>
                  </td>

                  {/* Items */}
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded text-xs font-bold border border-orange-100">
                        {item.items?.length || 0}
                    </span>
                  </td>

                  {/* Grand Total */}
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <span className="font-bold text-slate-900">৳ {item.payment?.grandTotal?.toLocaleString()}</span>
                  </td>
                  
                  {/* Actions */}
                  <td className="px-6 py-4 text-right whitespace-nowrap last:pr-8">
                    <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handlePrint(item)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition border border-transparent hover:border-gray-200">
                        <Printer className="w-4 h-4" />
                      </button>
                      {/* ✅ Fix: Edit button */}
                      <button onClick={() => handleEdit(item)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition border border-transparent hover:border-gray-200">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteId(item._id)} className="p-2 rounded-lg text-slate-400 hover:bg-gray-100 hover:text-slate-800 transition border border-transparent hover:border-gray-200">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- DELETE MODAL --- */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteId(null)}
              className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
            />
            <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl relative z-10 text-center border border-gray-200"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Quotation?</h3>
              <p className="text-gray-500 text-sm mb-6">Action cannot be undone.</p>
              <div className="flex gap-3">
                <button 
                    onClick={() => setDeleteId(null)} 
                    className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-bold text-sm hover:bg-gray-50 transition"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleDelete} 
                    className="flex-1 py-2.5 rounded-lg bg-slate-800 text-white font-bold text-sm hover:bg-slate-900 transition"
                >
                    Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuotationList;