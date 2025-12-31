import React from 'react';
import Barcode from 'react-barcode';

const QuotationDesign = ({ quotationData }) => {
  if (!quotationData) return null;

  const { quotationNo, date, customer, items, payment } = quotationData;

  // --- ইংরেজি সংখ্যাকে বাংলায় রূপান্তর ---
  const toBengaliNumber = (str) => {
    if (str === null || str === undefined) return '';
    const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const bengaliNumbers = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    
    return String(str).split('').map(char => {
      const index = englishNumbers.indexOf(char);
      return index > -1 ? bengaliNumbers[index] : char;
    }).join('');
  };

  // --- স্টাইল কনফিগারেশন ---
  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse', 
    border: '1px solid black',  
    fontSize: '11px'            
  };

  const headerCellStyle = {
    borderRight: '1px solid black', 
    borderBottom: '1px solid black', 
    backgroundColor: '#f3f4f6',      
    padding: '5px',
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'black' 
  };

  const bodyCellStyle = {
    borderRight: '1px solid black', 
    borderBottom: 'none',           
    padding: '4px 6px',
    verticalAlign: 'top',
    color: 'black' 
  };

  return (
    // ✅ প্যাডিং এবং মার্জিন ফিক্স করা হয়েছে (ইনভয়েসের মতো)
    <div id="quotation-print-area" className="w-full h-full relative text-black font-sans px-[14mm] py-[8mm] bg-white leading-snug">
      
      {/* ১. মেইন হেডার */}
      <div className="text-center mb-2">
        {/* ✅ বিসমিল্লাহ যোগ করা হয়েছে */}
        <p className="text-[10px] font-semibold text-black mb-1">বিসমিল্লাহির রহমানির রাহিম</p>
        
        <h1 className="text-3xl font-extrabold text-black mb-1 scale-y-110 tracking-tight">মেহেদী থাই অ্যালুমিনিয়াম এন্ড গ্লাস</h1>
        <p className="text-xs font-bold text-black">খারতৈল বড় মসজিদের পশ্চিম পাশে, সাতাইশ রোড, টঙ্গী, গাজীপুর-১৭০০।</p>
        
        <p className="text-[12px] font-bold tracking-wide text-black mt-1">
            এখানে সুদক্ষ কারিগর দ্বারা থাই অ্যালুমিনিয়াম ও গ্লাসের যাবতীয় কাজ যত্নসহকারে করা হয়।
        </p>
        
        <div className="w-full h-[1px] bg-black mt-1 mb-2"></div> 
      </div>

      {/* ২. বারকোড এবং কোটেশন ডিটেইলস (ছোট করা হয়েছে) */}
      <div className="flex justify-between items-end mb-2">
          {/* বাম পাশে বারকোড (সাইজ কমানো হয়েছে) */}
          <div className="w-[40%]">
             <Barcode 
                value={quotationNo || "QT-0000"} 
                width={1.2} 
                height={30} 
                fontSize={9}
                displayValue={false} 
                background="#ffffff"
                lineColor="#000000"
                margin={0}
             />
             <p className="text-[8px] font-bold text-black mt-1">Quotation ID: {quotationNo}</p>
          </div>

          {/* ডান পাশে কোটেশন নং ও তারিখ (টেক্সট ছোট করা হয়েছে) */}
          <div className="w-[40%] text-right">
            <div className="flex justify-between border-b border-black pb-0.5 mb-1">
              <span className="font-bold text-[10px] text-black">কোটেশন নং:</span>
              <span className="font-bold text-[11px] text-black">#{quotationNo}</span>
            </div>
            <div className="flex justify-between border-b border-black pb-0.5">
              <span className="font-bold text-[10px] text-black">তারিখ:</span>
              <span className="font-bold text-[11px] text-black">
                {date ? new Date(date).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}
              </span>
            </div>
          </div>
      </div>

      {/* ৩. কাস্টমার এবং প্রোপাইটর ইনফো */}
      <div className="flex justify-between items-start mb-1 text-xs text-black">
        {/* বাম পাশ: কাস্টমার */}
        <div className="w-[48%]">
          <p className="font-bold text-[10px] text-black mb-1 underline">গ্রাহকের তথ্য:</p>
          <h3 className="font-bold text-base text-black">{customer?.name || 'নাম নেই'}</h3>
          <p className="font-bold text-sm text-black">{customer?.mobile || 'N/A'}</p>
          <p className="w-3/4 text-black mt-0.5 leading-tight font-medium">{customer?.address || ''}</p>
        </div>

        {/* ডান পাশ: প্রোপাইটর */}
        <div className="w-[48%] text-right">
            <p className="font-bold text-[10px] text-black underline mb-1">প্রোপাইটর:</p>
            <h3 className="font-bold text-base text-black">আব্দুল হান্নান</h3>
            <p className="text-[11px] font-bold text-black">+880 1811-179656</p>
            <p className="text-[11px] font-bold text-black">+880 1911-121036</p> 
        </div>
      </div>

      {/* হেডার টেক্সট (Quotation Title) */}
      <div className="text-center mb-1">
         <span className="text-[13px] font-bold tracking-wider text-black">পণ্যের দরপত্র (Quotation)</span>
      </div>

      {/* ৪. প্রোডাক্ট টেবিল */}
      <div className="w-full mb-4">
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={{...headerCellStyle, width: '6%'}}>ক্র.</th>
              <th style={{...headerCellStyle, width: '46%', textAlign: 'left', paddingLeft: '10px'}}>বিবরণ</th>
              
              {/* ✅ পরিমাপ (ফিট) */}
              <th style={{...headerCellStyle, width: '12%'}}>পরিমাপ (ফিট)</th>
              
              {/* ✅ পরিমাণ (পিছ) */}
              <th style={{...headerCellStyle, width: '10%'}}>পরিমাণ (পিছ)</th>
              
              <th style={{...headerCellStyle, width: '12%'}}>দর</th>
              <th style={{...headerCellStyle, width: '14%', borderRight: 'none', textAlign: 'right', paddingRight: '10px'}}>মোট</th>
            </tr>
          </thead>
          <tbody>
            {items && items.map((item, idx) => (
              <tr key={idx}>
                <td style={{...bodyCellStyle, textAlign: 'center', fontWeight: 'bold'}}>
                  {toBengaliNumber(idx + 1)}
                </td>
                <td style={{...bodyCellStyle, padding: '4px'}}>
                  <p className="font-bold text-xs mb-1 pl-1 text-black">{item.name}</p>
                  
                  {item.description && (
                    <div className="inline-flex items-stretch pl-1 pr-1 mb-1 max-w-full"> 
                      <div className="w-1.5 border-l border-t border-b border-black my-0.5 shrink-0"></div>
                      <div className="whitespace-pre-wrap text-[10px] font-bold text-black leading-snug px-1.5 py-0.5">
                        {item.description}
                      </div>
                      <div className="w-1.5 border-r border-t border-b border-black my-0.5 shrink-0"></div>
                    </div>
                  )}
                  <div className="h-1"></div> 
                </td>
                <td style={{...bodyCellStyle, textAlign: 'center', fontWeight: '500'}}>
                  {toBengaliNumber(item.feet || '-')}
                </td>
                <td style={{...bodyCellStyle, textAlign: 'center', fontWeight: '500'}}>
                  {toBengaliNumber(item.qty)}
                </td>
                <td style={{...bodyCellStyle, textAlign: 'center', fontWeight: '500'}}>
                  {toBengaliNumber(item.price)}
                </td>
                <td style={{...bodyCellStyle, borderRight: 'none', textAlign: 'right', fontWeight: 'bold', paddingRight: '10px'}}>
                  {toBengaliNumber(item.total?.toLocaleString())}
                </td>
              </tr>
            ))}
            
            {/* ফাকা রো */}
            <tr style={{ height: '100%' }}>
                <td style={{ borderRight: '1px solid black' }}></td>
                <td style={{ borderRight: '1px solid black' }}></td>
                <td style={{ borderRight: '1px solid black' }}></td>
                <td style={{ borderRight: '1px solid black' }}></td>
                <td style={{ borderRight: '1px solid black' }}></td>
                <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ৫. ক্যালকুলেশন */}
      <div className="flex justify-between items-start mt-2 gap-4">
        
        {/* বাম পাশ: কাস্টমার-ফ্রেন্ডলি নোটস */}
        <div className="w-[55%]">
            <div className="border border-black p-2 rounded-sm"> 
                <p className="font-bold underline text-[9px] mb-1 text-black">বিশেষ দ্রষ্টব্য:</p>
                <ul className="list-disc pl-4 text-[9px] space-y-0.5 text-black font-medium">
                    <li>আমরা সর্বদা উন্নতমানের কাঁচামাল এবং দীর্ঘস্থায়ী কাজের নিশ্চয়তা প্রদান করি।</li>
                    <li>কাজের গুণগত মান এবং কাস্টমার সন্তুষ্টিই আমাদের প্রধান লক্ষ্য।</li>
                    <li>আপনার পছন্দ ও চাহিদা অনুযায়ী অত্যন্ত যত্নসহকারে কাজ সম্পন্ন করা হয়।</li>
                </ul>
            </div>
        </div>

        {/* ডান পাশ: টোটাল টেবিল */}
        <div className="w-[40%]">
          <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '11px'}}>
            <tbody>
              {payment?.discount > 0 && (
                <tr>
                  <td style={{border: '1px solid black', padding: '4px 6px', fontWeight: 'bold', color: 'black'}}>ডিসকাউন্ট:</td>
                  <td style={{border: '1px solid black', padding: '4px 6px', fontWeight: 'bold', textAlign: 'right', color: 'black'}}>
                    - {toBengaliNumber(payment?.discount?.toLocaleString())} টাকা
                  </td>
                </tr>
              )}
              <tr>
                <td style={{border: '1px solid black', padding: '4px 6px', fontWeight: '900', fontSize: '12px', backgroundColor: '#e5e7eb', color: 'black'}}>সর্বমোট:</td>
                <td style={{border: '1px solid black', padding: '4px 6px', fontWeight: '900', fontSize: '12px', textAlign: 'right', color: 'black'}}>
                    {toBengaliNumber(payment?.grandTotal?.toLocaleString())} টাকা
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ৬. সিগনেচার */}
      <div className="flex justify-between items-end mt-20 px-2">
          <div className="text-center w-32">
              <div className="border-t border-black pt-1">
                  <p className="text-[9px] font-bold text-black">গ্রাহকের স্বাক্ষর</p>
              </div>
          </div>
          <div className="text-center w-32">
              <div className="border-t border-black pt-1">
                  <p className="text-[9px] font-bold text-black">কর্তৃপক্ষের স্বাক্ষর</p>
              </div>
          </div>
      </div>
      
    </div>
  );
};

export default QuotationDesign;
