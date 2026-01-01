import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, UserPlus, PackagePlus, FileText,
  FileSpreadsheet, LogOut, Menu, ChevronRight, Package, Wallet, Sparkles,
  Layers, Receipt, Files, TrendingUp, Clock, ArrowUpRight,
  Box, UserCheck, Briefcase, HandCoins, History, X, Camera,
  User, Mail, Phone, Lock, Eye, EyeOff, Save, CheckCircle, XCircle,
  Shield, BadgeCheck, Key, Settings
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, BarChart, Bar
} from 'recharts';

const Dashboard = ({ onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [welcomeToast, setWelcomeToast] = useState(null);
  const [toast, setToast] = useState(null);

  // Admin Profile States
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileTab, setProfileTab] = useState('profile'); // 'profile' | 'security'
  
  const [adminData, setAdminData] = useState({
    name: 'Mehedi Hasan',
    email: '',
    phone: '',
    avatar: '',
    role: 'Admin'
  });

  // Form States
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: ''
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [saving, setSaving] = useState(false);

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

  const showToast = useCallback((type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Animated Counter
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

  // Welcome Toast
  useEffect(() => {
    const hasShownWelcome = sessionStorage.getItem('hasShownWelcome');
    if (!hasShownWelcome) {
      setWelcomeToast("System Ready!");
      sessionStorage.setItem('hasShownWelcome', 'true');
      setTimeout(() => setWelcomeToast(null), 4000);
    }
  }, []);

  // Fetch Admin Profile
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const res = await axios.get('/admin-profile');
        setAdminData(res.data);
      } catch (error) {
        console.error('Failed to fetch admin profile:', error);
      }
    };
    fetchAdminProfile();
  }, []);

  // Open Modal Handler
  const handleOpenProfileModal = useCallback(() => {
    setProfileForm({
      name: adminData.name || '',
      email: adminData.email || '',
      phone: adminData.phone || '',
      avatar: adminData.avatar || ''
    });
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswords({ current: false, new: false, confirm: false });
    setProfileTab('profile');
    setShowProfileModal(true);
  }, [adminData]);

  // Close Modal Handler
  const handleCloseProfileModal = useCallback(() => {
    setShowProfileModal(false);
  }, []);

  // Input Handlers
  const handleProfileInputChange = (field, value) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordInputChange = (field, value) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
  };

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

        const totalInvestVal = products.reduce((acc, item) => acc + (Number(item.price) * Number(item.stock)), 0);
        const totalSalesVal = invoices.reduce((acc, inv) => acc + (inv.payment?.grandTotal || 0), 0);
        const totalDueVal = invoices.reduce((acc, inv) => acc + (inv.payment?.due || 0), 0);
        const totalPaidVal = totalSalesVal - totalDueVal;

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
            paid: monthPaid
          });
        }

        const topProducts = [...products]
          .map(p => ({ name: p.name?.substring(0, 12) || 'Unknown', value: Number(p.price) * Number(p.stock) }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);

        const paymentStatus = [
          { name: 'Paid', value: totalPaidVal, color: '#10b981' },
          { name: 'Due', value: totalDueVal, color: '#64748b' }
        ];

        const activities = [];
        invoices.forEach(inv => {
          activities.push({
            type: 'Invoice',
            id: inv._id,
            date: new Date(inv.createdAt || inv.date),
            title: `Invoice Created`,
            subtitle: `${inv.invoiceNo} • ${inv.customer?.name}`,
            amount: inv.payment?.grandTotal
          });

          if (inv.payment?.history && inv.payment.history.length > 0) {
            inv.payment.history.forEach((payment, index) => {
              activities.push({
                type: 'Payment',
                id: `${inv._id}_payment_${index}`,
                date: new Date(payment.date),
                title: payment.remark === 'Initial Payment' ? 'Initial Payment' : 'Due Collected',
                subtitle: `${inv.invoiceNo} • ${inv.customer?.name}`,
                amount: payment.amount
              });
            });
          }
        });

        quotations.forEach(quo => {
          activities.push({
            type: 'Quotation',
            id: quo._id,
            date: new Date(quo.createdAt || quo.date),
            title: `Quotation Created`,
            subtitle: `${quo.quotationNo} • ${quo.customer?.name}`,
            amount: quo.payment?.grandTotal
          });
        });

        activities.sort((a, b) => b.date - a.date);

        setDashboardData({
          totalInvest: totalInvestVal,
          totalSales: totalSalesVal,
          totalDue: totalDueVal,
          totalProducts: products.length,
          totalCustomers: custRes.data.length,
          totalInvoices: invoices.length,
          totalQuotations: quotations.length,
          recentActivities: activities.slice(0, 10),
          monthlyData,
          topProducts,
          paymentStatus
        });

      } catch (error) { console.error("Dashboard Data Error:", error); }
    };

    if (isDashboardPage) fetchDashboardData();
  }, [isDashboardPage]);

  // Handle Avatar Upload
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Profile
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await axios.put('/admin-profile', profileForm);
      setAdminData(res.data);
      showToast('success', 'Profile updated successfully!');
      handleCloseProfileModal();
    } catch (error) {
      showToast('error', 'Failed to update profile!');
    }
    setSaving(false);
  };

  // Change Password
  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('error', 'Passwords do not match!');
      return;
    }
    if (passwordForm.newPassword.length < 4) {
      showToast('error', 'Password must be at least 4 characters!');
      return;
    }

    setSaving(true);
    try {
      await axios.put('/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      showToast('success', 'Password changed successfully!');
      handleCloseProfileModal();
    } catch (error) {
      showToast('error', error.response?.data?.error || 'Failed to change password!');
    }
    setSaving(false);
  };

  // Menu Items
  const menuItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'Manage Products', label: 'Inventory', icon: Package, path: '/products' },
    { id: 'Add Products', label: 'Add Product', icon: PackagePlus, path: '/add-product' },
    { id: 'Total Customers', label: 'Clients', icon: Users, path: '/customers' },
    { id: 'Add Customer', label: 'Add Client', icon: UserPlus, path: '/add-customer' },
    { id: 'Create Invoice', label: 'New Invoice', icon: FileText, path: '/create-invoice' },
    { id: 'View Invoices', label: 'Invoices', icon: Receipt, path: '/invoices' },
    { id: 'Create Quotation', label: 'New Estimate', icon: FileSpreadsheet, path: '/create-quotation' },
    { id: 'View Quotations', label: 'Estimates', icon: Files, path: '/quotations' },
    { id: 'Due List', label: 'Due Collection', icon: Wallet, path: '/due-list' },
  ];

  // Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 text-white p-3 rounded-lg shadow-xl border-0">
          <p className="font-bold text-sm mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs font-medium opacity-90">
              {entry.name}: BDT {Number(entry.value).toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full bg-white">
      <div className="h-[72px] flex items-center justify-between px-5 border-b border-slate-100">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 min-w-[40px] bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/20">
            <Layers className="text-white w-5 h-5" />
          </div>
          {(isSidebarOpen || isMobile) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-[11px] font-black text-slate-800 leading-tight uppercase tracking-tight">
                মেহেদী থাই অ্যালুমিনিয়াম<br />
                <span className="text-[9px] text-slate-400 font-semibold normal-case">& Glass House</span>
              </h2>
            </motion.div>
          )}
        </div>
        {isMobile && (
          <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <motion.button
              key={item.id}
              onClick={() => { navigate(item.path); if (isMobile) setMobileMenuOpen(false); }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                active
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/25'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 ${
                active 
                  ? 'bg-white/20' 
                  : 'bg-slate-100 group-hover:bg-slate-200'
              }`}>
                <Icon className={`w-[18px] h-[18px] transition-colors ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
              </div>
              {(isSidebarOpen || isMobile) && (
                <>
                  <span className="font-semibold text-[13px] truncate">{item.label}</span>
                  {active && <ChevronRight className="w-4 h-4 ml-auto opacity-70" />}
                </>
              )}
            </motion.button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <motion.button
          onClick={onLogout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-semibold text-sm transition-all duration-200 border border-red-100 hover:border-red-200"
        >
          <LogOut className="w-5 h-5" />
          {(isSidebarOpen || isMobile) && <span>Logout</span>}
        </motion.button>
      </div>
    </div>
  );

  const dashboardContent = (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Overview</h2>
          <p className="text-slate-400 font-medium mt-1">Financial summary & recent activities</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl shadow-sm border border-slate-200/60 text-sm font-semibold text-slate-600">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -8, scale: 1.02 }}
          onClick={() => navigate('/invoices')}
          className="relative bg-white p-6 rounded-2xl border border-slate-200/60 cursor-pointer group overflow-hidden shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-200 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-emerald-100 group-hover:bg-emerald-500 rounded-xl flex items-center justify-center transition-colors duration-300">
                <TrendingUp className="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Sales</span>
              </div>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Sales</p>
            <h2 className="text-3xl font-black text-slate-800 group-hover:text-emerald-700 transition-colors">BDT {animatedValues.totalSales.toLocaleString()}</h2>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -8, scale: 1.02 }}
          onClick={() => navigate('/due-list')}
          className="relative bg-white p-6 rounded-2xl border border-slate-200/60 cursor-pointer group overflow-hidden shadow-sm hover:shadow-xl hover:shadow-amber-500/10 hover:border-amber-200 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-amber-100 group-hover:bg-amber-500 rounded-xl flex items-center justify-center transition-colors duration-300">
                <Wallet className="w-6 h-6 text-amber-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <div className="flex items-center gap-1 text-amber-600 text-xs font-bold bg-amber-50 px-2 py-1 rounded-lg">
                <span>Pending</span>
              </div>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Due</p>
            <h2 className="text-3xl font-black text-slate-800 group-hover:text-amber-700 transition-colors">BDT {animatedValues.totalDue.toLocaleString()}</h2>
            <div className="mt-3 bg-slate-100 group-hover:bg-amber-100 rounded-full h-2 overflow-hidden transition-colors">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${dashboardData.totalSales > 0 ? ((dashboardData.totalSales - dashboardData.totalDue) / dashboardData.totalSales * 100) : 0}%` }}
                transition={{ delay: 0.5, duration: 1 }}
                className="h-full bg-emerald-500 rounded-full"
              />
            </div>
            <p className="text-slate-400 text-xs mt-2 font-medium">
              {dashboardData.totalSales > 0 ? Math.round((dashboardData.totalSales - dashboardData.totalDue) / dashboardData.totalSales * 100) : 0}% collected
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ y: -8, scale: 1.02 }}
          onClick={() => navigate('/products')}
          className="relative bg-white p-6 rounded-2xl border border-slate-200/60 cursor-pointer group overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-500/10 hover:border-slate-300 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-slate-800 group-hover:bg-slate-900 rounded-xl flex items-center justify-center transition-colors duration-300 shadow-lg shadow-slate-800/20">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-slate-500 text-xs font-bold bg-slate-100 px-2 py-1 rounded-lg">
                <Box className="w-3.5 h-3.5" />
                <span>Stock</span>
              </div>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Investment</p>
            <h2 className="text-3xl font-black text-slate-800">BDT {animatedValues.totalInvest.toLocaleString()}</h2>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Invoices', count: dashboardData.totalInvoices, icon: Receipt, color: 'slate' },
          { label: 'Quotations', count: dashboardData.totalQuotations, icon: FileSpreadsheet, color: 'slate' },
          { label: 'Clients', count: dashboardData.totalCustomers, icon: UserCheck, color: 'slate' },
          { label: 'Products', count: dashboardData.totalProducts, icon: Box, color: 'emerald' }
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * i }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white p-4 rounded-xl border border-slate-200/60 flex items-center gap-4 cursor-pointer hover:shadow-lg hover:border-slate-300 transition-all duration-300"
          >
            <div className={`w-11 h-11 ${item.color === 'emerald' ? 'bg-emerald-500' : 'bg-slate-800'} rounded-xl flex items-center justify-center shadow-lg ${item.color === 'emerald' ? 'shadow-emerald-500/25' : 'shadow-slate-800/25'}`}>
              <item.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800">{item.count}</h3>
              <p className="text-xs text-slate-400 font-semibold">{item.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Sales Trend</h3>
              <p className="text-sm text-slate-400 font-medium">Last 6 months analysis</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-800 rounded-full" />
                <span className="text-slate-500">Sales</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                <span className="text-slate-500">Paid</span>
              </div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardData.monthlyData}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e293b" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#1e293b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="paidGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} fontWeight={600} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="sales" name="Sales" stroke="#1e293b" strokeWidth={2.5} fill="url(#salesGrad)" />
                <Area type="monotone" dataKey="paid" name="Paid" stroke="#10b981" strokeWidth={2.5} fill="url(#paidGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm"
        >
          <h3 className="text-lg font-bold text-slate-800 mb-1">Payment Status</h3>
          <p className="text-sm text-slate-400 font-medium mb-4">Paid vs Due</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={dashboardData.paymentStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dashboardData.paymentStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `BDT ${Number(value).toLocaleString()}`} />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            {dashboardData.paymentStatus.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs font-bold text-slate-500">{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm"
        >
          <h3 className="text-lg font-bold text-slate-800 mb-1">Top Products</h3>
          <p className="text-sm text-slate-400 font-medium mb-4">By stock value</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} fontWeight={600} width={80} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => `BDT ${Number(value).toLocaleString()}`} />
                <Bar dataKey="value" name="Value" fill="#1e293b" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden"
        >
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <History className="w-5 h-5 text-slate-400" /> Recent Activity
            </h3>
            <p className="text-sm text-slate-400 font-medium">Real-time activity log</p>
          </div>
          <div className="max-h-72 overflow-y-auto scrollbar-hide">
            {dashboardData.recentActivities.length === 0 ? (
              <div className="p-10 text-center text-slate-400 font-semibold">
                <Box className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                No activity found
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {dashboardData.recentActivities.map((act, i) => (
                  <motion.div
                    key={act.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      act.type === 'Payment' ? 'bg-emerald-100 text-emerald-600' :
                      act.type === 'Invoice' ? 'bg-slate-100 text-slate-600' :
                      'bg-slate-50 text-slate-500'
                    }`}>
                      {act.type === 'Payment' ? <HandCoins className="w-5 h-5" /> :
                       act.type === 'Invoice' ? <FileText className="w-5 h-5" /> :
                       <FileSpreadsheet className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-700 text-sm truncate">{act.title}</p>
                      <p className="text-xs text-slate-400 font-medium truncate">{act.subtitle}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${act.type === 'Payment' ? 'text-emerald-600' : 'text-slate-700'}`}>
                        {act.type === 'Payment' ? '+' : ''} BDT {Number(act.amount).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">{act.date.toLocaleDateString()}</p>
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
    <div className="min-h-screen bg-slate-50 flex font-sans text-gray-800 overflow-hidden relative">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-0 left-1/2 z-[10001] flex items-center gap-3 bg-slate-800 text-white px-5 py-3 rounded-xl shadow-xl"
          >
            <div className={`p-1.5 rounded-full ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
              {toast.type === 'success' ? <CheckCircle className="w-4 h-4 text-white" /> : <XCircle className="w-4 h-4 text-white" />}
            </div>
            <span className="font-semibold text-sm">{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {welcomeToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-0 left-1/2 z-[10000] flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-xl border border-slate-200"
          >
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Welcome back, {adminData.name}!</h4>
              <p className="text-xs text-slate-400 font-medium">{welcomeToast}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ FIXED & REDESIGNED: Admin Profile Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[10000] flex items-center justify-center p-4"
            onClick={handleCloseProfileModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex overflow-hidden border border-slate-100"
            >
              {/* Left Sidebar (Minimal) */}
              <div className="w-56 bg-slate-50 border-r border-slate-100 flex flex-col p-6">
                {/* Avatar */}
                <div className="flex flex-col items-center mb-8">
                  <div className="relative group cursor-pointer mb-3" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-20 h-20 rounded-full bg-slate-200 overflow-hidden shadow-sm border-2 border-white">
                      {profileForm.avatar ? (
                        <img src={profileForm.avatar} alt="Admin" className="w-full h-full object-cover" />
                      ) : adminData.avatar ? (
                        <img src={adminData.avatar} alt="Admin" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white text-2xl font-bold">
                          {adminData.name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    {/* Hover Overlay Icon */}
                    <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 text-center truncate w-full">{adminData.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{adminData.role}</p>
                </div>

                {/* Navigation */}
                <div className="space-y-1">
                  <button
                    onClick={() => setProfileTab('profile')}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      profileTab === 'profile'
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <button
                    onClick={() => setProfileTab('password')}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      profileTab === 'password'
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    Security
                  </button>
                </div>
              </div>

              {/* Right Content */}
              <div className="flex-1 p-8 bg-white overflow-y-auto max-h-[80vh]">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-slate-900">
                    {profileTab === 'profile' ? 'Profile Settings' : 'Password & Security'}
                  </h2>
                  <button 
                    onClick={handleCloseProfileModal} 
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                {profileTab === 'profile' ? (
                  <div className="space-y-5">
                    {/* Minimal Input Style */}
                    <div className="space-y-4">
                      <div className="group">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => handleProfileInputChange('name', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border-b-2 border-slate-200 focus:border-slate-900 rounded-t-lg transition-colors outline-none text-sm font-semibold text-slate-800 placeholder-slate-400"
                          placeholder="Your full name"
                        />
                      </div>

                      <div className="group">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Email</label>
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => handleProfileInputChange('email', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border-b-2 border-slate-200 focus:border-slate-900 rounded-t-lg transition-colors outline-none text-sm font-semibold text-slate-800 placeholder-slate-400"
                          placeholder="name@example.com"
                        />
                      </div>

                      <div className="group">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Phone</label>
                        <input
                          type="text"
                          value={profileForm.phone}
                          onChange={(e) => handleProfileInputChange('phone', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border-b-2 border-slate-200 focus:border-slate-900 rounded-t-lg transition-colors outline-none text-sm font-semibold text-slate-800 placeholder-slate-400"
                          placeholder="+880..."
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="px-6 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 disabled:opacity-70 flex items-center gap-2"
                      >
                        {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="space-y-4">
                      <div className="group relative">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Current Password</label>
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordForm.currentPassword}
                          onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border-b-2 border-slate-200 focus:border-slate-900 rounded-t-lg transition-colors outline-none text-sm font-semibold text-slate-800"
                        />
                        <button 
                          onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                          className="absolute right-3 top-8 text-slate-400 hover:text-slate-600"
                        >
                          {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      <div className="group relative">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">New Password</label>
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordForm.newPassword}
                          onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border-b-2 border-slate-200 focus:border-slate-900 rounded-t-lg transition-colors outline-none text-sm font-semibold text-slate-800"
                        />
                         <button 
                          onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                          className="absolute right-3 top-8 text-slate-400 hover:text-slate-600"
                        >
                          {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      <div className="group relative">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Confirm Password</label>
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border-b-2 border-slate-200 focus:border-slate-900 rounded-t-lg transition-colors outline-none text-sm font-semibold text-slate-800"
                        />
                         <button 
                          onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                          className="absolute right-3 top-8 text-slate-400 hover:text-slate-600"
                        >
                          {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button
                        onClick={handleChangePassword}
                        disabled={saving}
                        className="px-6 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 disabled:opacity-70 flex items-center gap-2"
                      >
                         {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Shield className="w-4 h-4" /> Update Password</>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`fixed md:static inset-y-0 left-0 z-50 h-screen bg-white border-r border-slate-200/60 transition-all duration-300 ${
          isMobileMenuOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full md:translate-x-0'
        } ${isSidebarOpen ? 'md:w-[280px]' : 'md:w-[88px]'}`}
      >
        <SidebarContent isMobile={isMobileMenuOpen} />
      </motion.aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-[72px] bg-white flex items-center justify-between px-4 md:px-8 border-b border-slate-200/60">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => setMobileMenuOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="md:hidden p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden md:block p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </motion.button>
            <h1 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight truncate">
              {isDashboardPage ? 'Dashboard' : ''}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <h4 className="text-sm font-bold text-slate-800">{adminData.name}</h4>
              <p className="text-xs text-slate-400">{adminData.role}</p>
            </div>
            <motion.button
              onClick={handleOpenProfileModal}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-11 h-11 rounded-xl bg-slate-100 border-2 border-white shadow-lg overflow-hidden hover:ring-2 hover:ring-slate-200 transition-all"
            >
              {adminData.avatar ? (
                <img src={adminData.avatar} alt="Admin" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold text-sm">
                  {adminData.name?.charAt(0) || 'A'}
                </div>
              )}
            </motion.button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
          {isDashboardPage ? dashboardContent : <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
