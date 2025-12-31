import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft } from 'lucide-react';

import InvoiceDesign from './InvoiceTemplates/InvoiceDesign';
import QuotationDesign from './InvoiceTemplates/QuotationDesign'; 

const PrintPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const invoiceData = location.state?.invoiceData;
  const type = location.state?.type;
  const returnTab = location.state?.returnTab; // ✅ কোন ট্যাবে ফিরতে হবে তা রিসিভ করা হলো

  useEffect(() => {
    if (!invoiceData) {
      navigate('/');
    }
  }, [invoiceData, navigate]);

  // মোবাইল জুম এবং ভিউপোর্ট ফিক্স
  useEffect(() => {
    const metaViewport = document.querySelector('meta[name=viewport]');
    const originalContent = metaViewport ? metaViewport.getAttribute('content') : '';

    if (metaViewport) {
      metaViewport.setAttribute('content', 'width=1024, initial-scale=0.4, maximum-scale=5.0, user-scalable=yes');
    }

    return () => {
      if (metaViewport) {
        metaViewport.setAttribute('content', originalContent);
      }
    };
  }, []);

  // ✅ স্মার্ট ব্যাক বাটন হ্যান্ডলার
  const handleBack = () => {
    if (returnTab) {
      // যদি নির্দিষ্ট কোনো ট্যাবে ফেরার নির্দেশ থাকে (যেমন: 'Total Quotations')
      navigate('/', { state: { activeTab: returnTab } });
    } else {
      // স্বাভাবিক ব্যাক (যেমন: Browser Back)
      navigate(-1);
    }
  };

  if (!invoiceData) return null;

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col">
      
      {/* প্রিন্ট ফিক্স স্টাইল (সাদা পেজ সমস্যা সমাধান) */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-content, #printable-content * {
              visibility: visible;
            }
            #printable-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 0;
              background-color: white !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            @page {
              size: auto;
              margin: 0mm;
            }
            ::-webkit-scrollbar {
              display: none;
            }
          }
        `}
      </style>

      {/* --- কন্ট্রোল বার --- */}
      <div className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-200 px-4 py-3 print:hidden">
        <div className="w-full max-w-5xl mx-auto flex justify-between items-center">
          
          {/* ✅ আপডেটেড ব্যাক বাটন */}
          <button 
            onClick={handleBack} 
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full transition font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4"/>
            <span>Back</span>
          </button>

          <span className="hidden md:block text-slate-400 text-xs font-bold uppercase tracking-widest">
            Print Preview ({type === 'quotation' ? 'QUOTATION' : 'INVOICE'})
          </span>

          <button 
            onClick={() => window.print()} 
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-full font-bold text-sm shadow-lg transition active:scale-95"
          >
            <Printer className="w-4 h-4"/>
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* --- প্রিভিউ এরিয়া --- */}
      <div className="flex-1 overflow-auto bg-gray-500/10 p-4 md:p-8 flex justify-center items-start print:bg-white print:p-0 print:overflow-visible">
        
        <div 
          id="printable-content"
          className="bg-white shadow-2xl print:shadow-none print:m-0 shrink-0 origin-top"
          style={{ 
            width: '210mm',        
            minHeight: '297mm',    
            height: 'auto', 
            boxSizing: 'border-box'
          }}
        >
          {/* টাইপ অনুযায়ী ডিজাইন লোড */}
          {type === 'quotation' ? (
             <QuotationDesign quotationData={invoiceData} />
          ) : (
             <InvoiceDesign invoiceData={invoiceData} />
          )}
        </div>

      </div>
    </div>
  );
};

export default PrintPage;
