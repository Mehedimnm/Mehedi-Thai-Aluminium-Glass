import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- কম্পোনেন্ট ইম্পোর্ট ---
import Login from './Login';
import Dashboard from './Dashboard';
import PrintPage from './PrintPage';

// --- পেজ ইম্পোর্ট ---
import ProductList from './ProductList';
import AddProduct from './AddProduct';
import CustomerList from './CustomerList';
import AddCustomer from './AddCustomer';
import CreateInvoice from './CreateInvoice';
import InvoiceList from './InvoiceList';
import CreateQuotation from './CreateQuotation';
import QuotationList from './QuotationList';
import DueList from './DueList';

// 🔥 ১. অ্যাপ ভার্সন (আপডেট দিলে এটি পরিবর্তন করবেন, যেমন: '1.1')
const APP_VERSION = '1.0'; 

// 🔥 ২. ইনঅ্যাক্টিভিটি টাইম (১০ মিনিট = ৬০০০০০ মিলি সেকেন্ড)
const INACTIVITY_LIMIT = 10 * 60 * 1000; 

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // --- লগআউট ফাংশন ---
  const handleLogout = useCallback(() => {
    localStorage.clear(); // সব ডাটা মুছে ফেলা
    setIsLoggedIn(false);
    // যদি ইউজার ড্যাশবোর্ডে থাকে তবেই রিডাইরেক্ট করবে
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'; 
    }
  }, []);

  // --- লগিন হ্যান্ডলার ---
  const handleLogin = () => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('lastActivity', Date.now().toString()); // বর্তমান সময় সেট
    localStorage.setItem('appVersion', APP_VERSION);
    setIsLoggedIn(true);
  };

  // --- চেক ১: লোড হওয়ার সময় অথেন্টিকেশন এবং ভার্সন চেক ---
  useEffect(() => {
    const checkAuth = () => {
      const storedAuth = localStorage.getItem('isLoggedIn');
      const storedVersion = localStorage.getItem('appVersion');
      const lastActivity = localStorage.getItem('lastActivity');
      const currentTime = Date.now();

      // ১. ভার্সন চেক (ম্যাচ না করলে লগআউট)
      if (storedVersion !== APP_VERSION) {
        handleLogout();
        setIsChecking(false);
        return;
      }

      // ২. টাইম চেক (১০ মিনিট পার হয়েছে কিনা)
      if (storedAuth === 'true' && lastActivity) {
        if (currentTime - parseInt(lastActivity) > INACTIVITY_LIMIT) {
          handleLogout(); // মেয়াদ শেষ
        } else {
          setIsLoggedIn(true); // সব ঠিক আছে
        }
      }
      setIsChecking(false);
    };

    checkAuth();
  }, [handleLogout]);

  // --- চেক ২: রিয়েল-টাইম ইনঅ্যাক্টিভিটি ট্র্যাকার ---
  useEffect(() => {
    if (!isLoggedIn) return;

    let activityTimer;

    // ইউজার অ্যাক্টিভ থাকলে সময় আপডেট করবে
    const updateActivity = () => {
      localStorage.setItem('lastActivity', Date.now().toString());
      
      clearTimeout(activityTimer);
      activityTimer = setTimeout(() => {
        handleLogout(); // ১০ মিনিট চুপচাপ থাকলে লগআউট
      }, INACTIVITY_LIMIT);
    };

    // ইভেন্ট লিসেনার
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, updateActivity));

    updateActivity(); // ইনিশিয়াল কল

    return () => {
      events.forEach(event => window.removeEventListener(event, updateActivity));
      clearTimeout(activityTimer);
    };
  }, [isLoggedIn, handleLogout]);

  if (isChecking) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* ১. লগইন রাউট */}
        <Route 
          path="/login" 
          element={!isLoggedIn ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
        />

        {/* ২. ড্যাশবোর্ড লেআউট (Protected Routes) */}
        <Route 
          path="/" 
          element={isLoggedIn ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" />} 
        >
            {/* ডিফল্ট রিডাইরেক্ট */}
            <Route index element={<Navigate to="/dashboard" />} />
            
            {/* ড্যাশবোর্ড হোম (এখানে আপনার ড্যাশবোর্ড চার্ট শো করবে) */}
            <Route path="dashboard" element={null} /> 
            
            {/* প্রোডাক্ট পেজসমূহ */}
            <Route path="products" element={<ProductList />} />
            <Route path="add-product" element={<AddProduct />} />
            
            {/* কাস্টমার পেজসমূহ */}
            <Route path="customers" element={<CustomerList />} />
            <Route path="add-customer" element={<AddCustomer />} />
            
            {/* ইনভয়েস পেজসমূহ */}
            <Route path="create-invoice" element={<CreateInvoice />} />
            <Route path="invoices" element={<InvoiceList />} />
            
            {/* কোটেশন পেজসমূহ */}
            <Route path="create-quotation" element={<CreateQuotation />} />
            <Route path="quotations" element={<QuotationList />} />
            
            {/* ডিউ লিস্ট */}
            <Route path="due-list" element={<DueList />} />
        </Route>
        
        {/* ৩. প্রিন্ট প্রিভিউ পেজ (আলাদা লেআউট) */}
        <Route 
          path="/print-invoice" 
          element={isLoggedIn ? <PrintPage /> : <Navigate to="/login" />} 
        />

        {/* ৪. ভুল লিংকে গেলে হোমে রিডাইরেক্ট করবে */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
