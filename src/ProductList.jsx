import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Search, Trash2, Pencil, 
  Box, X, Save, AlertTriangle, CheckCircle, XCircle 
} from 'lucide-react';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalItems: 0, totalValue: 0, lowStock: 0 });

  // Modal & Toast States
  const [deleteId, setDeleteId] = useState(null); 
  const [isEditOpen, setIsEditOpen] = useState(false); 
  const [editFormData, setEditFormData] = useState(null); 
  const [processing, setProcessing] = useState(false); 
  const [successToast, setSuccessToast] = useState(null); // ✅ টোস্ট স্টেট

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/products');
      const data = res.data;
      setProducts(data);
      calculateStats(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const totalItems = data.length;
    const totalValue = data.reduce((acc, item) => acc + (Number(item.price) * Number(item.stock)), 0);
    const lowStock = data.filter(item => Number(item.stock) <= 5).length;
    setStats({ totalItems, totalValue, lowStock });
  };

  // ✅ ফ্ল্যাশ ম্যাসেজ ফাংশন
  const showSuccess = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const confirmDelete = (id) => { setDeleteId(id); };

  const executeDelete = async () => {
    setProcessing(true);
    try {
      await axios.delete(`/delete-product/${deleteId}`);
      const updatedList = products.filter(p => p._id !== deleteId);
      setProducts(updatedList);
      calculateStats(updatedList);
      setDeleteId(null); 
      showSuccess("Product Deleted Successfully!"); // ✅ ম্যাসেজ কল
    } catch (err) {
      alert("Failed to delete product!");
    }
    setProcessing(false);
  };

  const openEditModal = (item) => {
    setEditFormData({ ...item }); 
    setIsEditOpen(true);
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const saveEdit = async () => {
    if (!editFormData.name) { alert("Product Name is required!"); return; }
    if (editFormData.price === "" || editFormData.price === null) { alert("Price is required!"); return; }

    setProcessing(true);
    try {
      const res = await axios.put(`/update-product/${editFormData._id}`, editFormData);
      if(res.data) {
          const updatedList = products.map(p => p._id === editFormData._id ? editFormData : p);
          setProducts(updatedList);
          calculateStats(updatedList);
          setIsEditOpen(false); 
          setEditFormData(null);
          showSuccess("Product Updated Successfully!"); // ✅ ম্যাসেজ কল
      }
    } catch (err) { alert("Failed to update!"); }
    setProcessing(false);
  };

  const filteredProducts = products.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Status Badge Component
  const StatusBadge = ({ stock }) => {
    const s = Number(stock);
    if (s === 0) return <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-2.5 py-1 rounded-md text-[11px] font-bold border border-red-100 w-fit whitespace-nowrap"><XCircle className="w-3 h-3"/> Out</div>;
    if (s <= 5) return <div className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md text-[11px] font-bold border border-orange-100 w-fit whitespace-nowrap"><AlertTriangle className="w-3 h-3"/> Low: {s}</div>;
    return <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md text-[11px] font-bold border border-emerald-100 w-fit whitespace-nowrap"><CheckCircle className="w-3 h-3"/> Stock: {s}</div>;
  };

  return (
    <div className="space-y-6 pb-10 relative font-sans text-slate-800">
      
      {/* --- ✅ CLEAN FLASH MESSAGE (Toast) --- */}
      <AnimatePresence>
        {successToast && (
          <motion.div 
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-0 left-1/2 z-[10000] flex items-center gap-3 bg-slate-800 text-white px-6 py-3 rounded-lg shadow-xl"
          >
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <p className="text-sm font-medium whitespace-nowrap">{successToast}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- HEADER & SUMMARY --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div><p className="text-xs font-bold text-gray-400 uppercase">Total Products</p><h3 className="text-2xl font-black text-slate-800">{stats.totalItems}</h3></div>
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Box className="w-6 h-6"/></div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div><p className="text-xs font-bold text-gray-400 uppercase">Inventory Value</p><h3 className="text-2xl font-black text-emerald-600">৳ {stats.totalValue.toLocaleString()}</h3></div>
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600"><Save className="w-6 h-6"/></div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div><p className="text-xs font-bold text-gray-400 uppercase">Low Stock</p><h3 className="text-2xl font-black text-red-500">{stats.lowStock}</h3></div>
              <div className="p-3 bg-red-50 rounded-xl text-red-500"><AlertTriangle className="w-6 h-6"/></div>
          </div>
      </div>

      {/* --- SEARCH --- */}
      <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-400 ml-2" />
        <input 
            type="text" 
            placeholder="Search by name or category..." 
            className="w-full bg-transparent outline-none font-bold text-slate-700 placeholder:text-gray-400"
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* --- TABLE --- */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        
        {loading && <div className="p-12 text-center text-gray-500 font-medium">Loading Inventory...</div>}

        {!loading && filteredProducts.length === 0 && (
            <div className="p-16 text-center">
              <h3 className="text-lg font-bold text-slate-700">No products found</h3>
            </div>
        )}

        {!loading && filteredProducts.length > 0 && (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse table-auto">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider first:pl-8 whitespace-nowrap">Product Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Category</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center whitespace-nowrap">Unit</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right whitespace-nowrap">Price</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right last:pr-8 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((item) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    key={item._id} 
                    className="hover:bg-gray-50/60 transition-colors group"
                  >
                    {/* ✅ Product Name - Fixed Width & Truncated */}
                    <td className="px-6 py-4 first:pl-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-slate-400 border border-gray-200 shrink-0">
                            <Package className="w-5 h-5"/>
                        </div>
                        <div className="min-w-0 max-w-[150px] md:max-w-[250px]">
                            <h3 className="font-bold text-slate-900 text-sm truncate" title={item.name}>{item.name}</h3>
                            <span className="text-[10px] text-gray-400 font-mono block truncate">#{item._id.slice(-6)}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-600 bg-gray-100 px-2 py-1 rounded text-[11px] whitespace-nowrap">{item.category || 'General'}</span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-bold text-slate-500 whitespace-nowrap">{item.unit}</span>
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge stock={item.stock} />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-slate-800 text-sm whitespace-nowrap">৳ {Number(item.price).toLocaleString()}</span>
                    </td>

                    <td className="px-6 py-4 text-right last:pr-8">
                      <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(item)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition border border-transparent hover:border-gray-200">
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => confirmDelete(item._id)} className="p-2 rounded-lg text-slate-400 hover:bg-gray-100 hover:text-slate-800 transition border border-transparent hover:border-gray-200">
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

      {/* --- ✅ DELETE MODAL (Same as CustomerList) --- */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteId(null)} className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl relative z-10 text-center border border-gray-200">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Product?</h3>
              <p className="text-gray-500 text-sm mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-bold text-sm hover:bg-gray-50">Cancel</button>
                <button onClick={executeDelete} disabled={processing} className="flex-1 py-2.5 rounded-lg bg-slate-800 text-white font-bold text-sm hover:bg-slate-900">
                    {processing ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- EDIT MODAL (Clean Design) --- */}
      <AnimatePresence>
        {isEditOpen && editFormData && (
          <div className="fixed inset-0 bg-slate-900/20 z-[9999] flex items-center justify-center backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl relative border border-gray-200">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                  <h3 className="text-lg font-bold text-slate-900">Update Product</h3>
                  <button onClick={() => setIsEditOpen(false)}><X className="w-5 h-5 text-gray-500"/></button>
              </div>
              
              <div className="space-y-4">
                  <div>
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Product Name</label>
                      <input type="text" name="name" value={editFormData.name} onChange={handleEditChange} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 font-bold text-slate-800 focus:border-slate-500 outline-none transition" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Category</label>
                        <input type="text" name="category" value={editFormData.category} onChange={handleEditChange} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 font-bold text-slate-800 focus:border-slate-500 outline-none transition" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Unit</label>
                        <input type="text" name="unit" value={editFormData.unit} onChange={handleEditChange} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 font-bold text-slate-800 focus:border-slate-500 outline-none transition" />
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Price</label>
                        <input type="number" name="price" value={editFormData.price} onChange={handleEditChange} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 font-bold text-slate-800 focus:border-slate-500 outline-none transition" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Stock</label>
                        <input type="number" name="stock" value={editFormData.stock} onChange={handleEditChange} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 font-bold text-slate-800 focus:border-slate-500 outline-none transition" />
                      </div>
                  </div>

                  <button onClick={saveEdit} disabled={processing} className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg mt-4 transition flex justify-center items-center gap-2">
                    {processing ? 'Saving...' : <><Save className="w-4 h-4"/> Save Changes</>}
                  </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ProductList;
