import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit, Trash2, Search, Phone, MapPin, 
  X, Save, Users, CheckCircle, Filter, Plus 
} from 'lucide-react';

// ✅ onAddNew প্রপ রিসিভ করা হলো
const CustomerList = ({ onAddNew }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/customers');
      setCustomers(response.data);
    } catch (err) {
      setError("Failed to load customer data.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const showSuccess = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const executeDelete = async () => {
    try {
      await axios.delete(`http://localhost:3001/delete-customer/${deleteId}`);
      setDeleteId(null);
      fetchCustomers();
      showSuccess("Customer Deleted Successfully!");
    } catch(err) { 
      alert("Delete failed!"); 
      setDeleteId(null);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:3001/update-customer/${editingCustomer._id}`, editingCustomer);
      setEditingCustomer(null);
      fetchCustomers();
      showSuccess("Customer Profile Updated!");
    } catch(err) { alert("Update Failed!"); }
  };

  const filtered = customers.filter(c => {
    const s = searchTerm.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(s)) ||
      (c.mobile && c.mobile.includes(s)) ||
      (c.address && c.address.toLowerCase().includes(s))
    );
  });

  const getAvatar = (name) => {
      const safeName = name ? name.trim() : 'User';
      const seed = encodeURIComponent(safeName);
      const lowerName = safeName.toLowerCase();
      const isFemale = lowerName.endsWith('a') || lowerName.endsWith('i') || lowerName.endsWith('y') || lowerName.includes('mst') || lowerName.includes('mrs') || lowerName.includes('begum');
      
      if (isFemale) {
          return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&eyebrows=defaultNatural&mouth=smile&top=longHair,longHairBigHair,longHairBob,longHairBun,longHairCurly,longHairCurvy,longHairDreads,longHairFrida,longHairFro,longHairFroBand,longHairMiaWallace,longHairNotTooLong,longHairShavedSides,longHairStraight,longHairStraight2,longHairStraightStrand`; 
      } else {
          return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&eyebrows=default&mouth=smile&top=shortHair,shortHairCaesar,shortHairCaesarSidePart,shortHairDreads01,shortHairDreads02,shortHairFrizzle,shortHairShaggyMullet,shortHairShortCurly,shortHairShortFlat,shortHairShortRound,shortHairShortWaved,shortHairSides,shortHairTheCaesar,shortHairTheCaesarSidePart`;
      }
  };

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
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Client Directory</h2>
            <p className="text-gray-500 text-sm font-medium">Total Clients: {customers.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-72 group">
                <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 peer-focus:text-slate-800 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search..." 
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-200 transition-all font-medium text-slate-700 placeholder:text-gray-400 peer"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            {/* ✅ Add New Button */}
            <button 
                onClick={onAddNew}
                className="bg-slate-900 hover:bg-slate-800 text-white p-3 rounded-xl shadow-lg shadow-slate-900/20 transition active:scale-95 flex items-center gap-2 font-bold"
            >
                <Plus className="w-5 h-5" /> 
                <span className="hidden md:inline">Add Client</span>
            </button>
        </div>
      </div>

      {/* --- TABLE --- */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        
        {loading && <div className="p-12 text-center text-gray-500 font-medium">Loading...</div>}

        {!loading && !error && filtered.length === 0 && (
            <div className="p-16 text-center">
              <h3 className="text-lg font-bold text-slate-700">No results found</h3>
            </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider first:pl-8">Client Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Address</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right last:pr-8">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((customer) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    key={customer._id} 
                    className="hover:bg-gray-50/60 transition-colors group"
                  >
                    {/* Client Name & Avatar */}
                    <td className="px-6 py-4 first:pl-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
                             <img 
                                src={getAvatar(customer.name)} 
                                alt="avatar"
                                className="w-full h-full object-cover grayscale opacity-80" 
                                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name)}&background=random&color=fff`; }}
                             />
                        </div>
                        
                        <div className="min-w-0"> 
                          <h3 className="font-bold text-slate-900 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] md:max-w-[200px]" title={customer.name}>
                              {customer.name}
                          </h3>
                          {/* ✅ Active Status with Green Dot */}
                          <div className="flex items-center gap-1.5 mt-0.5">
                             <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
                             <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Active</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        {customer.mobile || "N/A"}
                      </div>
                    </td>

                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-2 text-slate-600 font-medium text-sm max-w-[200px]">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate" title={customer.address}>{customer.address || "N/A"}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right last:pr-8">
                      <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingCustomer(customer)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition border border-transparent hover:border-gray-200">
                            <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteId(customer._id)} className="p-2 rounded-lg text-slate-400 hover:bg-gray-100 hover:text-slate-800 transition border border-transparent hover:border-gray-200">
                            <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- DELETE MODAL --- */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteId(null)} className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl relative z-10 text-center border border-gray-200">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Client?</h3>
              <p className="text-gray-500 text-sm mb-6">Action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-bold text-sm hover:bg-gray-50">Cancel</button>
                <button onClick={executeDelete} className="flex-1 py-2.5 rounded-lg bg-slate-800 text-white font-bold text-sm hover:bg-slate-900">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- EDIT MODAL --- */}
      <AnimatePresence>
      {editingCustomer && (
        <div className="fixed inset-0 bg-slate-900/20 z-[9999] flex items-center justify-center backdrop-blur-sm p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl relative border border-gray-200">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <h3 className="text-lg font-bold text-slate-900">Edit Profile</h3>
                <button onClick={() => setEditingCustomer(null)}><X className="w-5 h-5 text-gray-500"/></button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase ml-1">Client Name</label><input value={editingCustomer.name} onChange={(e) => setEditingCustomer({...editingCustomer, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 font-bold text-slate-800 focus:border-slate-500 outline-none transition" /></div>
              <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase ml-1">Mobile</label><input value={editingCustomer.mobile} onChange={(e) => setEditingCustomer({...editingCustomer, mobile: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 font-bold text-slate-800 focus:border-slate-500 outline-none transition" /></div>
              <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase ml-1">Address</label><input value={editingCustomer.address} onChange={(e) => setEditingCustomer({...editingCustomer, address: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 font-bold text-slate-800 focus:border-slate-500 outline-none transition" /></div>
              <button className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg mt-4 transition flex justify-center items-center gap-2"><Save className="w-4 h-4" /> Save</button>
            </form>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerList;
