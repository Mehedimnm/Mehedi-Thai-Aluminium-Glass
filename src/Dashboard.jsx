import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, UserPlus, PackagePlus, FileText,
  FileSpreadsheet, LogOut, Menu, ChevronRight, Package, Wallet, Sparkles,
  Layers, Receipt, Files, TrendingUp, Clock, ArrowUpRight, ArrowDownRight,
  Box, UserCheck, Briefcase, HandCoins, History, X, Bell, Search,
  BarChart3, PieChart, Activity, Calendar, AlertTriangle, CheckCircle2,
  DollarSign, ShoppingCart, CreditCard, Target
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, BarChart, Bar, Legend, LineChart, Line
} from 'recharts';

const Dashboard = ({ onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [welcomeToast, setWelcomeToast] = useState(null);
  const [animatedValues, setAnimatedValues] = useState({
    totalInvest: 0, totalSales: 0, totalDue: 0
  });

  const [dashboardData, setDashboardData] = useState({
    totalInvest: 0, totalSales: 0, totalDue: 0,
    totalProducts: 0, totalCustomers: 0, totalInvoices: 0, totalQuotations: 0,
    recentActivities: [],
    monthlyData: [],
    topProducts: [],
    paymentStatus: []
  });

  const isActive = (path) => location.pathname === path;
  const isDashboardPage = location.pathname === '/dashboard' || location.pathname === '/';

  // Animated Counter Effect
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setAnimatedValues({
        totalInvest: Math.floor(dashboardData.totalInvest * easeOut),
        totalSales: Math.floor(dashboardData.totalSales * easeOut),
        totalDue: Math.floor(dashboardData.totalDue * easeOut)
      });

      if (currentStep >= steps) clearInterval(timer);
    }, stepDuration);

    return () => clearInterval(timer);
  }, [dashboardData.totalInvest, dashboardData.totalSales, dashboardData.totalDue]);

  useEffect(() => {
    const hasShownWelcome = sessionStorage.getItem('hasShownWelcome');
    if (!hasShownWelcome) {
      setWelcomeToast("Welcome back! System Ready.");
      sessionStorage.setItem('hasShownWelcome', 'true');
      setTimeout(() => setWelcomeToast(null), 4000);
    }
  }, []);

  // Data Fetching
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
        const totalPaidVal = totalSalesVal - totalDueVal;

        // Monthly Data for Charts (Last 6 months)
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();
        const monthlyData = [];

        for (let i = 5; i >= 0; i--) {
          const monthIndex = (currentMonth - i + 12) % 12;
          const monthInvoices = invoices.filter(inv => {
            const invDate = new Date(inv.createdAt || inv.date);
            return invDate.getMonth() === monthIndex;
          });
          const monthSales = monthInvoices.reduce((acc, inv) => acc + (inv.payment?.grandTotal || 0), 0);
          const monthPaid = monthInvoices.reduce((acc, inv) => acc + ((inv.payment?.grandTotal || 0) - (inv.payment?.due || 0)), 0);
          monthlyData.push({
            name: monthNames[monthIndex],
            sales: monthSales,
            paid: monthPaid,
            due: monthSales - monthPaid
          });
        }

        // Top Products by Stock Value
        const topProducts = [...products]
          .map(p => ({ name: p.name?.substring(0, 15) || 'Unknown', value: Number(p.price) * Number(p.stock) }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);

        // Payment Status for Pie Chart
        const paymentStatus = [
          { name: 'পরিশোধিত', value: totalPaidVal, color: '#10b981' },
          { name: 'বাকি', value: totalDueVal, color: '#f59e0b' }
        ];

        // Activities
        const activities = [];
        invoices.forEach(inv => {
          activities.push({
            type: 'Invoice', id: inv._id, date: new Date(inv.createdAt || inv.date),
            title: `Invoice Created`, subtitle: `${inv.invoiceNo} • ${inv.customer?.name}`,
            amount: inv.payment?.grandTotal, status: 'invoice'
          });
          if (inv.payment?.paid > 0) {
            activities.push({
              type: 'Payment', id: inv._id + '_pay', date: new Date(inv.createdAt || inv.date),
              title: `Payment Received`, subtitle: `${inv.invoiceNo} • ${inv.customer?.name}`,
              amount: inv.payment?.paid, status: 'paid'
            });
          }
        });
        quotations.forEach(quo => {
          activities.push({
            type: 'Quotation', id: quo._id, date: new Date(quo.createdAt || quo.date),
            title: `Quotation Created`, subtitle: `${quo.quotationNo} • ${quo.customer?.name}`,
            amount: quo.payment?.grandTotal, status: 'quote'
          });
        });

        activities.sort((a, b) => b.date - a.date);
        const recentActivities = activities.slice(0, 10);

        setDashboardData({
          totalInvest: totalInvestVal,
          totalSales: totalSalesVal,
          totalDue: totalDueVal,
          totalProducts: products.length,
          totalCustomers: custRes.data.length,
          totalInvoices: invoices.length,
          totalQuotations: quotations.length,
          recentActivities,
          monthlyData,
          topProducts,
          paymentStatus
        });

      } catch (error) { console.error("Dashboard Data Error:", error); }
    };

    if (isDashboardPage) fetchDashboardData();
  }, [isDashboardPage]);

  // Menu Items
  const menuItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'Manage Products', label: 'Inventory List', icon: Package, path: '/products' },
    { id: 'Add Products', label: 'Add Product', icon: PackagePlus, path: '/add-product' },
    { id: 'Total Customers', label: 'Client List', icon: Users, path: '/customers' },
    { id: 'Add Customer', label: 'Add Client', icon: UserPlus, path: '/add-customer' },
    { id: 'Create Invoice', label: 'Create Invoice', icon: FileText, path: '/create-invoice' },
    { id: 'View Invoices', label: 'Invoice List', icon: Receipt, path: '/invoices' },
    { id: 'Create Quotation', label: 'Create Estimate', icon: FileSpreadsheet, path: '/create-quotation' },
    { id: 'View Quotations', label: 'Estimate List', icon: Files, path: '/quotations' },
    { id: 'Due List', label: 'Due Collection', icon: Wallet, path: '/due-list' },
  ];

  // Chart Colors
  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  // Custom Tooltip for Charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-gray-100">
          <p className="font-bold text-slate-800 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ৳{Number(entry.value).toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Sidebar Component
  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-20 flex items-center justify-between px-5 border-b border-gray-100/50">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-11 h-11 min-w-[44px] bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/30">
            <Layers className="text-white w-6 h-6" />
          </div>
          {(isSidebarOpen || isMobile) && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <h2 className="text-[11px] font-black text-slate-900 leading-tight uppercase tracking-tight">
                মেহেদী থাই অ্যালুমিনিয়াম<br />
                <span className="text-[9px] text-slate-400 font-bold">এন্ড গ্লাস</span>
              </h2>
            </motion.div>
          )}
        </div>
        {isMobile && (
          <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <motion.button
              key={item.id}
              onClick={() => { navigate(item.path); if (isMobile) setMobileMenuOpen(false); }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                active
                  ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg shadow-slate-900/30'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {active && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <Icon className={`w-5 h-5 relative z-10 ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
              {(isSidebarOpen || isMobile) && (
                <span className="font-semibold text-sm relative z-10 truncate">{item.label}</span>
              )}
              {(isSidebarOpen || isMobile) && active && (
                <ChevronRight className="w-4 h-4 ml-auto relative z-10" />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-100/50">
        <motion.button
          onClick={onLogout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-shadow"
        >
          <LogOut className="w-5 h-5" />
          {(isSidebarOpen || isMobile) && <span>Logout</span>}
        </motion.button>
      </div>
    </div>
  );

  // Dashboard Content
  const dashboardContent = (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-black bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent"
          >
            ড্যাশবোর্ড ওভারভিউ
          </motion.h2>
          <p className="text-gray-500 font-medium mt-1">আজকের আর্থিক সারসংক্ষেপ এবং সাম্প্রতিক কার্যক্রম</p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 bg-white/80 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-lg shadow-slate-200/50 border border-white"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">আজকের তারিখ</p>
            <p className="font-bold text-slate-800">{new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </motion.div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Sales Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -5, scale: 1.02 }}
          onClick={() => navigate('/invoices')}
          className="relative group cursor-pointer bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 p-6 rounded-3xl shadow-2xl shadow-emerald-500/30 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20 group-hover:scale-150 transition-transform duration-500" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-xl px-3 py-1.5 rounded-full">
                <ArrowUpRight className="w-4 h-4 text-white" />
                <span className="text-xs font-bold text-white">+12%</span>
              </div>
            </div>
            <p className="text-emerald-100 text-sm font-semibold uppercase tracking-wider mb-1">মোট বিক্রয়</p>
            <h2 className="text-4xl font-black text-white tracking-tight">
              ৳ {animatedValues.totalSales.toLocaleString()}
            </h2>
            <p className="text-emerald-200 text-xs mt-2 font-medium">গত মাসের তুলনায়</p>
          </div>
        </motion.div>

        {/* Total Due Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -5, scale: 1.02 }}
          onClick={() => navigate('/due-list')}
          className="relative group cursor-pointer bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-6 rounded-3xl shadow-2xl shadow-orange-500/30 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20 group-hover:scale-150 transition-transform duration-500" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                <Wallet className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-xl px-3 py-1.5 rounded-full">
                <AlertTriangle className="w-4 h-4 text-white" />
                <span className="text-xs font-bold text-white">বাকি</span>
              </div>
            </div>
            <p className="text-orange-100 text-sm font-semibold uppercase tracking-wider mb-1">মোট বাকি</p>
            <h2 className="text-4xl font-black text-white tracking-tight">
              ৳ {animatedValues.totalDue.toLocaleString()}
            </h2>
            <div className="mt-3 bg-white/20 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-1000"
                style={{ width: `${dashboardData.totalSales > 0 ? ((dashboardData.totalSales - dashboardData.totalDue) / dashboardData.totalSales * 100) : 0}%` }}
              />
            </div>
            <p className="text-orange-200 text-xs mt-2 font-medium">
              {dashboardData.totalSales > 0 ? Math.round((dashboardData.totalSales - dashboardData.totalDue) / dashboardData.totalSales * 100) : 0}% পরিশোধিত
            </p>
          </div>
        </motion.div>

        {/* Total Investment Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ y: -5, scale: 1.02 }}
          onClick={() => navigate('/products')}
          className="relative group cursor-pointer bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 rounded-3xl shadow-2xl shadow-purple-500/30 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20 group-hover:scale-150 transition-transform duration-500" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                <Briefcase className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-xl px-3 py-1.5 rounded-full">
                <Box className="w-4 h-4 text-white" />
                <span className="text-xs font-bold text-white">স্টক</span>
              </div>
            </div>
            <p className="text-purple-100 text-sm font-semibold uppercase tracking-wider mb-1">মোট বিনিয়োগ</p>
            <h2 className="text-4xl font-black text-white tracking-tight">
              ৳ {animatedValues.totalInvest.toLocaleString()}
            </h2>
            <p className="text-purple-200 text-xs mt-2 font-medium">{dashboardData.totalProducts} টি প্রোডাক্ট স্টকে</p>
          </div>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'ইনভয়েস', count: dashboardData.totalInvoices, icon: Receipt, gradient: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/20' },
          { label: 'কোটেশন', count: dashboardData.totalQuotations, icon: FileSpreadsheet, gradient: 'from-violet-500 to-purple-500', shadow: 'shadow-violet-500/20' },
          { label: 'কাস্টমার', count: dashboardData.totalCustomers, icon: UserCheck, gradient: 'from-pink-500 to-rose-500', shadow: 'shadow-pink-500/20' },
          { label: 'প্রোডাক্ট', count: dashboardData.totalProducts, icon: Box, gradient: 'from-teal-500 to-emerald-500', shadow: 'shadow-teal-500/20' }
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * i }}
            whileHover={{ scale: 1.05 }}
            className={`bg-white p-5 rounded-2xl shadow-xl ${item.shadow} border border-gray-100/50 cursor-pointer group`}
          >
            <div className={`w-12 h-12 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
              <item.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-3xl font-black text-slate-800">{item.count}</h3>
            <p className="text-sm text-gray-500 font-medium">{item.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Activity className="w-6 h-6 text-indigo-500" />
                বিক্রয় ট্রেন্ড
              </h3>
              <p className="text-sm text-gray-500 font-medium mt-1">গত ৬ মাসের বিক্রয় বিশ্লেষণ</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-indigo-500 rounded-full" />
                <span className="text-gray-600">বিক্রয়</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                <span className="text-gray-600">পরিশোধিত</span>
              </div>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardData.monthlyData}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="paidGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} fontWeight={600} />
                <YAxis stroke="#94a3b8" fontSize={12} fontWeight={600} tickFormatter={(value) => `৳${(value / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="sales" name="বিক্রয়" stroke="#6366f1" strokeWidth={3} fill="url(#salesGradient)" />
                <Area type="monotone" dataKey="paid" name="পরিশোধিত" stroke="#10b981" strokeWidth={3} fill="url(#paidGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Payment Status Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-gray-100/50"
        >
          <div className="mb-6">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <PieChart className="w-6 h-6 text-pink-500" />
              পেমেন্ট স্ট্যাটাস
            </h3>
            <p className="text-sm text-gray-500 font-medium mt-1">পরিশোধিত vs বাকি</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={dashboardData.paymentStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dashboardData.paymentStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `৳${Number(value).toLocaleString()}`} />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {dashboardData.paymentStatus.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm font-bold text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Second Row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-gray-100/50"
        >
          <div className="mb-6">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-violet-500" />
              টপ প্রোডাক্ট (মূল্য অনুযায়ী)
            </h3>
            <p className="text-sm text-gray-500 font-medium mt-1">সর্বাধিক মূল্যবান স্টক</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} tickFormatter={(value) => `৳${(value / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} fontWeight={600} width={100} />
                <Tooltip formatter={(value) => `৳${Number(value).toLocaleString()}`} />
                <Bar dataKey="value" name="মূল্য" radius={[0, 8, 8, 0]}>
                  {dashboardData.topProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-gray-100/50 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <History className="w-6 h-6 text-slate-500" />
              সাম্প্রতিক কার্যক্রম
            </h3>
            <p className="text-sm text-gray-500 font-medium mt-1">রিয়েল-টাইম অ্যাক্টিভিটি লগ</p>
          </div>
          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {dashboardData.recentActivities.length === 0 ? (
              <div className="p-12 text-center text-gray-400 font-bold">
                <Box className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                কোনো কার্যক্রম নেই
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {dashboardData.recentActivities.map((act, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className="flex items-center gap-4 p-4 hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg ${
                      act.type === 'Payment' ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-500/30' :
                      act.type === 'Invoice' ? 'bg-gradient-to-br from-blue-400 to-indigo-500 shadow-blue-500/30' :
                      'bg-gradient-to-br from-orange-400 to-amber-500 shadow-orange-500/30'
                    }`}>
                      {act.type === 'Payment' ? <HandCoins className="w-5 h-5 text-white" /> :
                       act.type === 'Invoice' ? <FileText className="w-5 h-5 text-white" /> :
                       <FileSpreadsheet className="w-5 h-5 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate">{act.title}</p>
                      <p className="text-xs text-gray-500 font-medium truncate">{act.subtitle}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-black text-sm ${act.type === 'Payment' ? 'text-emerald-600' : 'text-slate-700'}`}>
                        {act.type === 'Payment' ? '+' : ''} ৳{Number(act.amount).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium">
                        {act.date.toLocaleDateString('bn-BD')}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex font-sans text-gray-800 overflow-hidden relative">
      {/* Background Decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full blur-3xl" />
      </div>

      {/* Welcome Toast */}
      <AnimatePresence>
        {welcomeToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-0 left-1/2 z-[10000] flex items-center gap-3 bg-white/95 backdrop-blur-xl px-6 py-4 rounded-2xl shadow-2xl shadow-slate-900/10 border border-white"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-black text-slate-800">স্বাগতম, মেহেদী!</h4>
              <p className="text-sm text-gray-500 font-medium">{welcomeToast}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed md:static inset-y-0 left-0 z-50 h-screen bg-white/80 backdrop-blur-xl border-r border-white/50 shadow-2xl shadow-slate-900/5 transition-all duration-300 ${
          isMobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'
        } ${isSidebarOpen ? 'md:w-72' : 'md:w-24'}`}
      >
        <SidebarContent isMobile={isMobileMenuOpen} />
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        {/* Header */}
        <header className="h-20 bg-white/70 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 border-b border-white/50 shadow-lg shadow-slate-900/5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2.5 bg-white rounded-xl shadow-lg text-gray-600 border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="hidden md:flex p-2.5 bg-white rounded-xl shadow-lg text-gray-600 border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              {isDashboardPage ? 'Dashboard' : ''}
            </h1>
          </div>
          <div className="flex items-center gap-3 md:gap-5">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-3 bg-white rounded-xl shadow-lg text-gray-600 border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-rose-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center shadow-lg shadow-red-500/30">
                3
              </span>
            </motion.button>
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-xl pl-4 pr-2 py-2 rounded-2xl shadow-lg border border-white">
              <div className="text-right hidden md:block">
                <h4 className="text-sm font-black text-slate-800">Mehedi Hasan</h4>
                <p className="text-xs text-gray-500 font-medium">Admin</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 border-2 border-white shadow-lg shadow-indigo-500/30 overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Admin" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          {isDashboardPage ? dashboardContent : <Outlet />}
        </main>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 100px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;