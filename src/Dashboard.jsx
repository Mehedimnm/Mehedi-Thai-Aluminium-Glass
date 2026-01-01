import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, UserPlus, PackagePlus, FileText,
  FileSpreadsheet, LogOut, Menu, ChevronRight, Package, Wallet, Sparkles,
  Layers, Receipt, Files, TrendingUp, Clock, ArrowUpRight,
  Box, UserCheck, Briefcase, HandCoins, History, X, Camera,
  User, Mail, Phone, Lock, Eye, EyeOff, Save, CheckCircle, XCircle, Settings
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
  const [profileTab, setProfileTab] = useState('profile');
  
  // ✅ FIX: Separate state for form data to prevent reset
  const [adminData, setAdminData] = useState({
    name: 'Mehedi Hasan',
    email: '',
    phone: '',
    avatar: '',
    role: 'Admin'
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: ''
  });
  
  const [passwordData, setPasswordData] = useState({
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

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  };

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

  // ✅ FIX: Initialize form data when modal opens
  useEffect(() => {
    if (showProfileModal) {
      setFormData({
        name: adminData.name || '',
        email: adminData.email || '',
        phone: adminData.phone || '',
        avatar: adminData.avatar || ''
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setProfileTab('profile');
    }
  }, [showProfileModal, adminData]);

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
            type: 'Invoice', id: inv._id, date: new Date(inv.createdAt || inv.date),
            title: `Invoice Created`, subtitle: `${inv.invoiceNo} • ${inv.customer?.name}`,
            amount: inv.payment?.grandTotal
          });
          if (inv.payment?.paid > 0) {
            activities.push({
              type: 'Payment', id: inv._id + '_pay', date: new Date(inv.createdAt || inv.date),
              title: `Payment Received`, subtitle: `${inv.invoiceNo} • ${inv.customer?.name}`,
              amount: inv.payment?.paid
            });
          }
        });
        quotations.forEach(quo => {
          activities.push({
            type: 'Quotation', id: quo._id, date: new Date(quo.createdAt || quo.date),
            title: `Quotation Created`, subtitle: `${quo.quotationNo} • ${quo.customer?.name}`,
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
          recentActivities: activities.slice(0, 8),
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
        setFormData(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Profile
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await axios.put('/admin-profile', formData);
      setAdminData(res.data);
      showToast('success', 'Profile updated successfully!');
      setShowProfileModal(false);
    } catch (error) {
      showToast('error', 'Failed to update profile!');
    }
    setSaving(false);
  };

  // Change Password
  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('error', 'Passwords do not match!');
      return;
    }
    if (passwordData.newPassword.length < 4) {
      showToast('error', 'Password must be at least 4 characters!');
      return;
    }

    setSaving(true);
    try {
      await axios.put('/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      showToast('success', 'Password changed successfully!');
      setShowProfileModal(false);
    } catch (error) {
      showToast('error', error.response?.data?.error || 'Failed to change password!');
    }
    setSaving(false);
  };

  // Menu Items with modern icons
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

  // Custom Tooltip
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

  // ✅ Modern Sidebar Component
  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="h-[72px] flex items-center justify-between px-5 border-b border-gray-100/80">
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
          <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Menu */}
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

      {/* Logout */}
      <div className="p-4 border-t border-gray-100/80">
        <motion.button
          onClick={onLogout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 rounded-xl font-semibold text-sm transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          {(isSidebarOpen || isMobile) && <span>Logout</span>}
        </motion.button>
      </div>
    </div>
  );

  // ✅ Fixed Profile Modal Component
  const ProfileModal = () => (
    <AnimatePresence>
      {showProfileModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-4"
          onClick={() => setShowProfileModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-20 translate-x-20" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16" />
              
              <button
                onClick={() => setShowProfileModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col items-center relative z-10">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl bg-slate-700/50 border-4 border-white/20 overflow-hidden shadow-xl">
                    {formData.avatar ? (
                      <img src={formData.avatar} alt="Admin" className="w-full h-full object-cover" />
                    ) : adminData.avatar ? (
                      <img src={adminData.avatar} alt="Admin" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-600">
                        <User className="w-10 h-10 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 w-10 h-10 bg-white text-slate-800 rounded-xl flex items-center justify-center shadow-lg hover:bg-slate-50 transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                  </motion.button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                <h3 className="mt-4 text-xl font-bold">{adminData.name}</h3>
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold mt-2">{adminData.role}</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-50">
              <button
                onClick={() => setProfileTab('profile')}
                className={`flex-1 py-4 text-sm font-semibold transition-all relative ${
                  profileTab === 'profile'
                    ? 'text-slate-900 bg-white'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Profile Info
                {profileTab === 'profile' && (
                  <motion.div layoutId="activeProfileTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900" />
                )}
              </button>
              <button
                onClick={() => setProfileTab('password')}
                className={`flex-1 py-4 text-sm font-semibold transition-all relative ${
                  profileTab === 'password'
                    ? 'text-slate-900 bg-white'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Security
                {profileTab === 'password' && (
                  <motion.div layoutId="activeProfileTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900" />
                )}
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {profileTab === 'profile' ? (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl font-medium text-slate-800 focus:border-slate-300 focus:bg-white outline-none transition-all"
                          placeholder="Enter your name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl font-medium text-slate-800 focus:border-slate-300 focus:bg-white outline-none transition-all"
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                        <input
                          type="text"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl font-medium text-slate-800 focus:border-slate-300 focus:bg-white outline-none transition-all"
                          placeholder="Enter your phone"
                        />
                      </div>
                    </div>

                    <motion.button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-lg shadow-slate-900/25"
                    >
                      {saving ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Save Changes
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="password"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Current Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl font-medium text-slate-800 focus:border-slate-300 focus:bg-white outline-none transition-all"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl font-medium text-slate-800 focus:border-slate-300 focus:bg-white outline-none transition-all"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl font-medium text-slate-800 focus:border-slate-300 focus:bg-white outline-none transition-all"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <motion.button
                      onClick={handleChangePassword}
                      disabled={saving}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-lg shadow-slate-900/25"
                    >
                      {saving ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Lock className="w-5 h-5" />
                          Update Password
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ✅ Dashboard Content with enhanced cards
  const dashboardContent = (
    <div className="space-y-6 pb-10">
      {/* Header */}
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

      {/* ✅ Main Stats with enhanced hover effects */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Sales */}
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

        {/* Total Due */}
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

        {/* Total Investment */}
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

      {/* Quick Stats */}
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend */}
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

        {/* Payment Status */}
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

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
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

        {/* Recent Activity */}
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
                    key={i}
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
      {/* Toast */}
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

      {/* Welcome Toast */}
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

      {/* Profile Modal */}
      <ProfileModal />

      {/* Mobile Overlay */}
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

      {/* Sidebar */}
      <motion.aside
        className={`fixed md:static inset-y-0 left-0 z-50 h-screen bg-white border-r border-slate-200/60 transition-all duration-300 ${
          isMobileMenuOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full md:translate-x-0'
        } ${isSidebarOpen ? 'md:w-[280px]' : 'md:w-[88px]'}`}
      >
        <SidebarContent isMobile={isMobileMenuOpen} />
      </motion.aside>

      {/* Main */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
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
              onClick={() => setShowProfileModal(true)}
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

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
          {isDashboardPage ? dashboardContent : <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;