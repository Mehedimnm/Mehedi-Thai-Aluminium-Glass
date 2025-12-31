import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- কম্পোনেন্ট ইম্পোর্ট ---
import Login from './Login';
import Dashboard from './Dashboard';
import PrintPage from './PrintPage';

// --- পেজ ইম্পোর্ট (নতুন যুক্ত করা হয়েছে) ---
import ProductList from './ProductList';
import AddProduct from './AddProduct';
import CustomerList from './CustomerList';
import AddCustomer from './AddCustomer';
import CreateInvoice from './CreateInvoice';
import InvoiceList from './InvoiceList';
import CreateQuotation from './CreateQuotation';
import QuotationList from './QuotationList';
import DueList from './DueList';

function App() {
  // লোকাল স্টোরেজ থেকে লগইন স্ট্যাটাস চেক করা
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem('isLoggedIn') === 'true'
  );

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
  };

  return (
    <Router>
      <Routes>
        {/* ১. লগইন রাউট (আলাদা হ্যান্ডেল করা হয়েছে যাতে রিডাইরেক্ট ঠিক থাকে) */}
        <Route 
          path="/login" 
          element={!isLoggedIn ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
        />

        {/* ২. ড্যাশবোর্ড লেআউট (Nested Routes) - এখন URL চেঞ্জ হবে */}
        <Route 
          path="/" 
          element={isLoggedIn ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" />} 
        >
            {/* ডিফল্ট পাথ dashboard এ নিয়ে যাবে */}
            <Route index element={<Navigate to="/dashboard" />} />
            
            {/* ড্যাশবোর্ড এবং অন্যান্য সাব-পেজ */}
            {/* নোট: 'dashboard' পাথে আমরা null রাখছি কারণ Dashboard.jsx নিজেই হোম কন্টেন্ট হ্যান্ডেল করবে যদি Outlet এ কিছু না থাকে, অথবা আপনি DashboardHome কম্পোনেন্ট বানালে এখানে দিবেন */}
            <Route path="dashboard" element={null} /> 
            
            <Route path="products" element={<ProductList />} />
            <Route path="add-product" element={<AddProduct />} />
            
            <Route path="customers" element={<CustomerList />} />
            <Route path="add-customer" element={<AddCustomer />} />
            
            <Route path="create-invoice" element={<CreateInvoice />} />
            <Route path="invoices" element={<InvoiceList />} />
            
            <Route path="create-quotation" element={<CreateQuotation />} />
            <Route path="quotations" element={<QuotationList />} />
            
            <Route path="due-list" element={<DueList />} />
        </Route>
        
        {/* ৩. প্রিন্ট প্রিভিউ পেজ (আলাদা লেআউট) */}
        <Route 
          path="/print-invoice" 
          element={<PrintPage />} 
        />

        {/* ৪. ভুল লিংকে গেলে হোমে রিডাইরেক্ট করবে */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
