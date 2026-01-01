import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, UserPlus, PackagePlus, FileText,
  FileSpreadsheet, LogOut, Menu, ChevronRight, Package, Wallet, Sparkles,
  Layers, Receipt, Files, TrendingUp, Clock, ArrowUpRight,
  Box, UserCheck, Briefcase, HandCoins, History, X, Camera,
  User, Mail, Phone, Lock, Eye, EyeOff, Save, CheckCircle, XCircle
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
  const [profileTab, setProfileTab] = useState('profile'); // 'profile' | 'password'
  const [adminData, setAdminData] = useState({
    name: 'Mehedi Hasan',
    email: '',
    phone: '',
    avatar: '',
    role: 'Admin'
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

  // Animated Counter Values
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

  // Show Toast
  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  };

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

        // Monthly Data
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

        // Top Products
        const topProducts = [...products]
          .map(p => ({ name: p.name?.substring(0, 12) || 'Unknown', value: Number(p.price) * Number(p.stock) }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);

        // Payment Status
        const paymentStatus = [
          { name: 'পরিশোধিত', value: totalPaidVal, color: '#10b981' },
          { name: 'বাকি', value: totalDueVal, color: '#64748b' }
        ];

        // Activities
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
        setAdminData({ ...adminData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Profile
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await axios.put('/admin-profile', adminData);
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
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowProfileModal(false);
    } catch (error) {
      showToast('error', error.response?.data?.error || 'Failed to change password!');
    }
    setSaving(false);
  };

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

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100">
          <p className="font-bold text-slate-800 text-sm mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs font-medium" style={{ color: entry.color }}>
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
      <div className="h-20 flex items-center justify-between px-5 border-b border-gray-100">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 min-w-[40px] bg-slate-900 rounded-xl flex items-center justify-center">
            <Layers className="text-white w-5 h-5" />
          </div>
          {(isSidebarOpen || isMobile) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-[11px] font-black text-slate-900 leading-tight uppercase tracking-tight">
                মেহেদী থাই অ্যালুমিনিয়াম<br />
                <span className="text-[9px] text-slate-400 font-bold">এন্ড গ্লাস</span>
              </h2>
            </motion.div>
          )}
        </div>
        {isMobile && (
          <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.id}
              onClick={() => { navigate(item.path); if (isMobile) setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                active
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
              {(isSidebarOpen || isMobile) && (
                <span className="font-semibold text-sm truncate">{item.label}</span>
              )}
              {(isSidebarOpen || isMobile) && active && (
                <ChevronRight className="w-4 h-4 ml-auto" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {(isSidebarOpen || isMobile) && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  // Profile Modal Component
  const ProfileModal = () => (
    <AnimatePresence>
      {showProfileModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4"
          onClick={() => setShowProfileModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Modal Header */}
            <div className="bg-slate-900 p-6 text-white relative">
              <button
                onClick={() => setShowProfileModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              {/* Avatar */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-slate-700 border-4 border-white/20 overflow-hidden">
                    {adminData.avatar ? (
                      <img src={adminData.avatar} alt="Admin" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <User className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-white text-slate-800 rounded-full flex items-center justify-center shadow-lg hover:bg-slate-100 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                <h3 className="mt-3 text-lg font-bold">{adminData.name}</h3>
                <p className="text-slate-400 text-sm">{adminData.role}</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => setProfileTab('profile')}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                  profileTab === 'profile'
                    ? 'text-slate-900 border-b-2 border-slate-900'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Profile Info
              </button>
              <button
                onClick={() => setProfileTab('password')}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                  profileTab === 'password'
                    ? 'text-slate-900 border-b-2 border-slate-900'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Change Password
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {profileTab === 'profile' ? (
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={adminData.name}
                        onChange={(e) => setAdminData({ ...adminData, name: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl font-medium text-slate-800 focus:border-slate-900 focus:bg-white outline-none transition-all"
                        placeholder="Enter your name"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        value={adminData.email}
                        onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl font-medium text-slate-800 focus:border-slate-900 focus:bg-white outline-none transition-all"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={adminData.phone}
                        onChange={(e) => setAdminData({ ...adminData, phone: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl font-medium text-slate-800 focus:border-slate-900 focus:bg-white outline-none transition-all"
                        placeholder="Enter your phone"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full pl-12 pr-12 py-3 bg-slate-50 border-2 border-transparent rounded-xl font-medium text-slate-800 focus:border-slate-900 focus:bg-white outline-none transition-all"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full pl-12 pr-12 py-3 bg-slate-50 border-2 border-transparent rounded-xl font-medium text-slate-800 focus:border-slate-900 focus:bg-white outline-none transition-all"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full pl-12 pr-12 py-3 bg-slate-50 border-2 border-transparent rounded-xl font-medium text-slate-800 focus:border-slate-900 focus:bg-white outline-none transition-all"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleChangePassword}
                    disabled={saving}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        Change Password
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Dashboard Content
  const dashboardContent = (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Overview</h2>
          <p className="text-slate-500 font-medium mt-1">Financial summary & recent activities</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl shadow-sm border border-gray-100 text-sm font-semibold text-slate-600">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Sales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => navigate('/invoices')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-gray-200 transition-all group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
              <ArrowUpRight className="w-4 h-4" />
              <span>Sales</span>
            </div>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Sales</p>
          <h2 className="text-3xl font-black text-slate-900">৳ {animatedValues.totalSales.toLocaleString()}</h2>
        </motion.div>

        {/* Total Due */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate('/due-list')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-gray-200 transition-all group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-slate-600" />
            </div>
            <div className="flex items-center gap-1 text-slate-500 text-xs font-bold">
              <span>Due</span>
            </div>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Due</p>
          <h2 className="text-3xl font-black text-slate-900">৳ {animatedValues.totalDue.toLocaleString()}</h2>
          <div className="mt-3 bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
              style={{ width: `${dashboardData.totalSales > 0 ? ((dashboardData.totalSales - dashboardData.totalDue) / dashboardData.totalSales * 100) : 0}%` }}
            />
          </div>
          <p className="text-slate-400 text-xs mt-2 font-medium">
            {dashboardData.totalSales > 0 ? Math.round((dashboardData.totalSales - dashboardData.totalDue) / dashboardData.totalSales * 100) : 0}% collected
          </p>
        </motion.div>

        {/* Total Investment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => navigate('/products')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-gray-200 transition-all group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-1 text-slate-500 text-xs font-bold">
              <Box className="w-4 h-4" />
              <span>Stock</span>
            </div>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Investment</p>
          <h2 className="text-3xl font-black text-slate-900">৳ {animatedValues.totalInvest.toLocaleString()}</h2>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Invoices', count: dashboardData.totalInvoices, icon: Receipt, bg: 'bg-slate-900', text: 'text-white' },
          { label: 'Quotations', count: dashboardData.totalQuotations, icon: FileSpreadsheet, bg: 'bg-slate-100', text: 'text-slate-600' },
          { label: 'Clients', count: dashboardData.totalCustomers, icon: UserCheck, bg: 'bg-slate-100', text: 'text-slate-600' },
          { label: 'Products', count: dashboardData.totalProducts, icon: Box, bg: 'bg-emerald-500', text: 'text-white' }
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * i }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4"
          >
            <div className={`w-11 h-11 ${item.bg} rounded-xl flex items-center justify-center`}>
              <item.icon className={`w-5 h-5 ${item.text}`} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">{item.count}</h3>
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
          className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black text-slate-900">Sales Trend</h3>
              <p className="text-sm text-slate-400 font-medium">Last 6 months analysis</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-900 rounded-full" />
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
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="paidGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} fontWeight={600} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(value) => `৳${(value / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="sales" name="Sales" stroke="#0f172a" strokeWidth={2} fill="url(#salesGrad)" />
                <Area type="monotone" dataKey="paid" name="Paid" stroke="#10b981" strokeWidth={2} fill="url(#paidGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Payment Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-black text-slate-900 mb-1">Payment Status</h3>
          <p className="text-sm text-slate-400 font-medium mb-4">Paid vs Due</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={dashboardData.paymentStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
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
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-black text-slate-900 mb-1">Top Products</h3>
          <p className="text-sm text-slate-400 font-medium mb-4">By stock value</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(value) => `৳${(value / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} fontWeight={600} width={80} />
                <Tooltip formatter={(value) => `৳${Number(value).toLocaleString()}`} />
                <Bar dataKey="value" name="Value" fill="#0f172a" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-slate-400" /> Recent Activity
            </h3>
            <p className="text-sm text-slate-400 font-medium">Real-time activity log</p>
          </div>
          <div className="max-h-72 overflow-y-auto custom-scrollbar">
            {dashboardData.recentActivities.length === 0 ? (
              <div className="p-10 text-center text-slate-400 font-semibold">
                <Box className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                No activity found
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {dashboardData.recentActivities.map((act, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      act.type === 'Payment' ? 'bg-emerald-50 text-emerald-600' :
                      act.type === 'Invoice' ? 'bg-slate-100 text-slate-600' :
                      'bg-slate-50 text-slate-500'
                    }`}>
                      {act.type === 'Payment' ? <HandCoins className="w-5 h-5" /> :
                       act.type === 'Invoice' ? <FileText className="w-5 h-5" /> :
                       <FileSpreadsheet className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate">{act.title}</p>
                      <p className="text-xs text-slate-400 font-medium truncate">{act.subtitle}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-black text-sm ${act.type === 'Payment' ? 'text-emerald-600' : 'text-slate-700'}`}>
                        {act.type === 'Payment' ? '+' : ''} ৳{Number(act.amount).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">{act.date.toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans text-gray-800 overflow-hidden relative">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-0 left-1/2 z-[10001] flex items-center gap-3 bg-slate-800 text-white px-5 py-3 rounded-xl shadow-xl"
          >
            <div className={`p-1.5 rounded-full ${toast.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
              {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
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
            className="fixed top-0 left-1/2 z-[10000] flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-xl border border-gray-100"
          >
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-full">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Hello, {adminData.name}!</h4>
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
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed md:static inset-y-0 left-0 z-50 h-screen bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ${
          isMobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'
        } ${isSidebarOpen ? 'md:w-72' : 'md:w-24'}`}
      >
        <SidebarContent isMobile={isMobileMenuOpen} />
      </motion.aside>

      {/* Main */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 bg-white rounded-lg shadow-sm text-gray-600 border border-gray-200"
            >
              <Menu className="w-6 h-6" />
            </button>
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="hidden md:block p-2 bg-white rounded-lg shadow-sm text-gray-600 border border-gray-200 hover:bg-gray-50"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight truncate">
              {isDashboardPage ? 'Dashboard' : ''}
            </h1>
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            <div className="text-right hidden md:block">
              <h4 className="text-sm font-bold text-slate-800">{adminData.name}</h4>
              <p className="text-xs text-gray-500">{adminData.role}</p>
            </div>
            <button
              onClick={() => setShowProfileModal(true)}
              className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden hover:ring-2 hover:ring-slate-300 transition-all"
            >
              {adminData.avatar ? (
                <img src={adminData.avatar} alt="Admin" className="w-full h-full object-cover" />
              ) : (
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Admin" className="w-full h-full object-cover" />
              )}
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          {isDashboardPage ? dashboardContent : <Outlet />}
        </main>
      </div>

      {/* Scrollbar Style */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
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