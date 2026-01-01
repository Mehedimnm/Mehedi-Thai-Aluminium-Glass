import React, { useState, useEffect } from 'react';
import axios from 'axios';
// ✅ Outlet এবং useNavigate যুক্ত করা হয়েছে রাউটিং এর জন্য
import { useLocation, useNavigate, Outlet } from 'react-router-dom'; 
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, UserPlus, PackagePlus, FileText, 
  FileSpreadsheet, LogOut, Menu, ChevronRight, Package, Wallet, Sparkles,
  Layers, Receipt, Files, TrendingUp, Clock, ArrowUpRight, 
  Box, UserCheck, Briefcase, HandCoins, History 
} from 'lucide-react';

const Dashboard = ({ onLogout }) => {
  const location = useLocation(); 
  const navigate = useNavigate(); // ✅ নেভিগেশন হুক

  const [isSidebarOpen, setSidebarOpen] = useState(true); 
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [welcomeToast, setWelcomeToast] = useState(null);
  
  const [dashboardData, setDashboardData] = useState({
    totalInvest: 0, totalSales: 0, totalDue: 0,
    totalProducts: 0, totalCustomers: 0, totalInvoices: 0, totalQuotations: 0,
    recentActivities: [] 
  });

  // ✅ বর্তমান অ্যাক্টিভ পাথ চেক করার ফাংশন
  const isActive = (path) => location.pathname === path;
  const isDashboardPage = location.pathname === '/dashboard' || location.pathname === '/';

  useEffect(() => {
    const hasShownWelcome = sessionStorage.getItem('hasShownWelcome');
    if (!hasShownWelcome) {
        setWelcomeToast("Welcome back! System Ready.");
        sessionStorage.setItem('hasShownWelcome', 'true');
        setTimeout(() => setWelcomeToast(null), 4000); 
    }
  }, []);

  // --- DATA FETCHING (Only runs on Dashboard Page) ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [prodRes, custRes, invRes, quotRes] = await Promise.all([
          axios.get('/products'),
          axios.get('/customers'),
          axios.get('/invoices'),
          axios.get('/quotations')
        ]);
        
        const products = prodRes.data;
        const invoices = invRes.data;
        const quotations = quotRes.data;

        // Calculations
        const totalInvestVal = products.reduce((acc, item) => acc + (Number(item.price) * Number(item.stock)), 0);
        const totalSalesVal = invoices.reduce((acc, inv) => acc + (inv.payment?.grandTotal || 0), 0);
        const totalDueVal = invoices.reduce((acc, inv) => acc + (inv.payment?.due || 0), 0);

        // ✅ UNIFIED RECENT HISTORY LOGIC
        let activities = [];

        // 1. Add Invoices
        invoices.forEach(inv => {
            activities.push({
                type: 'Invoice',
                id: inv._id,
                date: new Date(inv.createdAt || inv.date),
                title: `Invoice Created`,
                subtitle: `${inv.invoiceNo} • ${inv.customer?.name}`,
                amount: inv.payment?.grandTotal,
                status: 'new'
            });

            // 2. Add Payment History (Collections)
            if (inv.payment?.history && Array.isArray(inv.payment.history)) {
                inv.payment.history.forEach(hist => {
                    activities.push({
                        type: 'Payment',
                        id: hist._id || Math.random(),
                        date: new Date(hist.date),
                        title: `Payment Received`,
                        subtitle: `${inv.invoiceNo} • via ${hist.method}`,
                        amount: hist.amount,
                        status: 'paid'
                    });
                });
            }
        });

        // 3. Add Quotations
        quotations.forEach(quo => {
            activities.push({
                type: 'Quotation',
                id: quo._id,
                date: new Date(quo.createdAt || quo.date),
                title: `Quotation Created`,
                subtitle: `${quo.quotationNo} • ${quo.customer?.name}`,
                amount: quo.payment?.grandTotal,
                status: 'quote'
            });
        });

        // Sort by Date Descending
        activities.sort((a, b) => b.date - a.date);
        const recentActivities = activities.slice(0, 15);

        setDashboardData({
          totalInvest: totalInvestVal,
          totalSales: totalSalesVal,
          totalDue: totalDueVal,
          totalProducts: products.length,
          totalCustomers: custRes.data.length,
          totalInvoices: invoices.length,
          totalQuotations: quotations.length,
          recentActivities: recentActivities
        });

      } catch (error) { console.error("Dashboard Data Error:", error); }
    };
    
    // শুধুমাত্র ড্যাশবোর্ড পেজে থাকলেই ডাটা ফেচ হবে
    if (isDashboardPage) fetchDashboardData();
  }, [isDashboardPage]);

  // ✅ মেনু আইটেম এবং তাদের রাউট লিংক
  const menuItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'Manage Products', label: 'Inventory List', icon: Package, path: '/products' },
    { id: 'Add Products', label: 'Add Product', icon: PackagePlus, path: '/add-product' },
    { id: 'Total Customers', label: 'Client List', icon: Users, path: '/customers' }, 
    { id: 'Add Customer', label: 'Add Client', icon: UserPlus, path: '/add-customer' },
    { id: 'Create Invoice', label: 'Create Invoice', icon: FileText, path: '/create-invoice' },
    { id: 'Total Invoices', label: 'All Invoices', icon: Receipt, path: '/invoices' },
    { id: 'Create Quotation', label: 'Create Quotation', icon: FileSpreadsheet, path: '/create-quotation' }, 
    { id: 'Total Quotations', label: 'All Quotations', icon: Files, path: '/quotations' }, 
    { id: 'Total Due', label: 'Due List', icon: Wallet, path: '/due-list' },
  ];

  // ✅ রাউটিং হ্যান্ডলার
  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  // --- DASHBOARD OVERVIEW UI (Stats & History) ---
  const dashboardContent = (
    <div className="space-y-8 pb-10">
       {/* Top Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Overview</h2>
          <p className="text-gray-500 font-medium mt-1">Financial summary & recent activities</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 text-sm font-bold text-slate-600">
          <Clock className="w-4 h-4 text-orange-500"/> <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>
      
      {/* --- BIG STATS CARDS (Clickable & Functional) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Total Sales */}
         <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate('/invoices')} className="cursor-pointer relative overflow-hidden rounded-[25px] shadow-2xl bg-slate-900 group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="relative z-10 p-8 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-white/10 rounded-2xl border border-white/10"><TrendingUp className="w-6 h-6 text-emerald-400"/></div>
                    <ArrowUpRight className="text-gray-500 group-hover:text-white transition-colors"/>
                </div>
                <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Revenue</p>
                    <h2 className="text-4xl font-black text-white">৳ {dashboardData.totalSales.toLocaleString()}</h2>
                </div>
            </div>
         </motion.div>

         {/* Total Due */}
         <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate('/due-list')} className="cursor-pointer bg-white p-8 rounded-[25px] border border-gray-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-red-50 rounded-bl-full -mr-10 -mt-10 opacity-60"></div>
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="p-3 bg-red-50 rounded-2xl text-red-500 border border-red-100"><Wallet className="w-6 h-6"/></div>
                <span className="text-[10px] font-black bg-red-100 text-red-600 px-3 py-1 rounded-full uppercase tracking-wider">Unpaid</span>
            </div>
            <div className="relative z-10">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Outstanding</p>
                <h2 className="text-4xl font-black text-slate-900">৳ {dashboardData.totalDue.toLocaleString()}</h2>
            </div>
         </motion.div>

         {/* Total Invest */}
         <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate('/products')} className="cursor-pointer bg-white p-8 rounded-[25px] border border-gray-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-10 -mt-10 opacity-60"></div>
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="p-3 bg-blue-50 rounded-2xl text-blue-500 border border-blue-100"><Briefcase className="w-6 h-6"/></div>
                <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-3 py-1 rounded-full uppercase tracking-wider">Asset Value</span>
            </div>
            <div className="relative z-10">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Investment</p>
                <h2 className="text-4xl font-black text-slate-900">৳ {dashboardData.totalInvest.toLocaleString()}</h2>
            </div>
         </motion.div>
      </div>

      {/* --- SMALL STATS GRID --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
            { label: 'Invoices', count: dashboardData.totalInvoices, icon: Receipt, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/invoices' },
            { label: 'Estimates', count: dashboardData.totalQuotations, icon: FileSpreadsheet, color: 'text-orange-600', bg: 'bg-orange-50', link: '/quotations' },
            { label: 'Clients', count: dashboardData.totalCustomers, icon: UserCheck, color: 'text-purple-600', bg: 'bg-purple-50', link: '/customers' },
            { label: 'Products', count: dashboardData.totalProducts, icon: Box, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/products' }
        ].map((item, i) => (
            <motion.div key={i} whileHover={{ y: -5 }} onClick={() => navigate(item.link)} className="cursor-pointer bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all flex flex-col items-center text-center">
                <div className={`w-12 h-12 ${item.bg} rounded-2xl flex items-center justify-center ${item.color} mb-3 border border-white shadow-sm`}>
                    <item.icon className="w-6 h-6"/>
                </div>
                <h4 className="text-2xl font-black text-slate-800">{item.count}</h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{item.label}</p>
            </motion.div>
        ))}
      </div>

      {/* --- UNIFIED RECENT ACTIVITY LIST (Full Width) --- */}
      <div className="bg-white rounded-[30px] border border-gray-200 shadow-lg shadow-slate-200/40 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 backdrop-blur-sm">
              <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <History className="w-5 h-5 text-slate-500"/> Recent Activity
                  </h3>
                  <p className="text-xs text-gray-500 font-medium mt-1">Real-time log of Invoices, Quotations & Payments</p>
              </div>
          </div>
          
          <div className="max-h-[500px] overflow-y-auto custom-scrollbar p-2">
              <table className="w-full text-left border-collapse">
                  <tbody className="text-sm">
                      {dashboardData.recentActivities.length === 0 ? (
                          <tr><td colSpan="4" className="py-12 text-center text-gray-400 font-bold">No recent activity found.</td></tr>
                      ) : (
                          dashboardData.recentActivities.map((act, i) => (
                              <tr key={i} className="group hover:bg-slate-50/80 transition-colors border-b border-gray-50 last:border-0">
                                  {/* Icon & Type */}
                                  <td className="p-4 pl-6 w-[60px]">
                                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                                          act.type === 'Payment' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
                                          act.type === 'Invoice' ? 'bg-blue-50 border-blue-100 text-blue-600' : 
                                          'bg-orange-50 border-orange-100 text-orange-600'
                                      }`}>
                                          {act.type === 'Payment' ? <HandCoins className="w-5 h-5"/> : 
                                           act.type === 'Invoice' ? <FileText className="w-5 h-5"/> : 
                                           <FileSpreadsheet className="w-5 h-5"/>}
                                      </div>
                                  </td>
                                  
                                  {/* Details */}
                                  <td className="p-4">
                                      <div className="font-bold text-slate-800">{act.title}</div>
                                      <div className="text-xs text-gray-500 font-medium mt-0.5">{act.subtitle}</div>
                                  </td>

                                  {/* Date */}
                                  <td className="p-4 text-right">
                                      <div className="text-xs font-bold text-gray-500">{act.date.toLocaleDateString()}</div>
                                      <div className="text-[10px] text-gray-400 font-medium">{act.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                  </td>

                                  {/* Amount */}
                                  <td className="p-4 pr-6 text-right">
                                      <span className={`font-black text-sm ${
                                          act.type === 'Payment' ? 'text-emerald-600' : 'text-slate-700'
                                      }`}>
                                          {act.type === 'Payment' ? '+' : ''} ৳ {Number(act.amount).toLocaleString()}
                                      </span>
                                  </td>
                              </tr>
                          ))
                      )}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans text-gray-800 overflow-hidden relative">
      <AnimatePresence>{welcomeToast && <motion.div initial={{ opacity: 0, y: -50, x: '-50%' }} animate={{ opacity: 1, y: 20, x: '-50%' }} exit={{ opacity: 0, y: -50, x: '-50%' }} className="fixed top-0 left-1/2 z-[10000] flex items-center gap-3 bg-white/90 backdrop-blur-md px-6 py-4 rounded-full shadow-2xl border border-emerald-100"><div className="bg-emerald-100 p-2 rounded-full text-emerald-600"><Sparkles className="w-5 h-5" /></div><div><h4 className="font-bold text-slate-800 text-sm">Hello, Mehedi!</h4><p className="text-xs text-gray-500 font-medium">{welcomeToast}</p></div></motion.div>}</AnimatePresence>

      {/* --- SIDEBAR --- */}
      <motion.aside className={`fixed md:static inset-y-0 left-0 z-50 h-screen bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ${isMobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'} ${isSidebarOpen ? 'md:w-72' : 'md:w-24'}`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100">
          <div className="flex items-center gap-3 overflow-hidden"><div className="w-10 h-10 min-w-[40px] bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/20"><Layers className="text-white w-6 h-6" /></div>{(isSidebarOpen || isMobileMenuOpen) && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><h2 className="text-[12px] font-black text-slate-900 leading-tight uppercase tracking-tight">মেহেদী থাই অ্যালুমিনিয়াম এন্ড গ্লাস<br/> <span className="text-[9px] text-slate-500 font-bold">
         প্রোপাইটরঃ আব্দুল হান্নান</span></h2></motion.div>}</div>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-gray-500 hover:text-red-500"><Menu className="w-6 h-6" /></button>
        </div>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="hidden md:flex absolute -right-3 top-24 bg-white shadow-md p-1.5 rounded-full border border-gray-200 text-gray-500 hover:text-slate-900 transition z-50"><ChevronRight className={`w-4 h-4 transition-transform ${isSidebarOpen ? 'rotate-180' : ''}`} /></button>
        
        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar h-[calc(100vh-160px)]">
          {menuItems.map((item) => (
            <div 
                key={item.id} 
                onClick={() => handleNavigation(item.path)} 
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-300 group ${isActive(item.path) ? 'bg-slate-900 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />{(isSidebarOpen || isMobileMenuOpen) && <span className="font-semibold text-sm whitespace-nowrap">{item.label}</span>}
            </div>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100 bg-white"><button onClick={onLogout} className="flex items-center gap-4 px-4 py-3 w-full text-red-500 hover:bg-red-50 rounded-xl transition-all font-bold"><LogOut className="w-5 h-5" />{(isSidebarOpen || isMobileMenuOpen) && <span>Logout</span>}</button></div>
      </motion.aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 border-b border-gray-200">
          <div className="flex items-center gap-4"><button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 bg-white rounded-lg shadow-sm text-gray-600 border border-gray-200"><Menu className="w-6 h-6" /></button><h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight truncate">{isDashboardPage ? 'Dashboard' : ''}</h1></div>
          <div className="flex items-center gap-3 md:gap-6">
            <div className="text-right hidden md:block"><h4 className="text-sm font-bold text-slate-800">Mehedi Hasan</h4><p className="text-xs text-gray-500">Admin</p></div>
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Admin" className="w-full h-full object-cover"/>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          {/* ✅ যদি ড্যাশবোর্ড পাথে থাকি, তবে স্ট্যাটস দেখাবে, অন্যথায় Outlet দিয়ে অন্য পেজ দেখাবে */}
          {isDashboardPage ? dashboardContent : <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
