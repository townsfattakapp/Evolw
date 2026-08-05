import React, { useState, useEffect } from 'react';
import { Calculator, Briefcase, User, IndianRupee, Download, Save, History, FileText, Trash2 } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { OfferLetterPDF } from './OfferLetterPDF';

export interface OfferData {
  id?: string;
  refId?: string;
  employmentType: 'Full-Time' | 'Internship';
  candidateName: string;
  address: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  doj: string;
  probation: string;
  notice: string;
  reportingTo: string;
  annualCtc: string; // If Internship, this acts as Monthly Stipend
  basic: string;
  hra: string;
  pf: string;
  specialAllowance: string;
  createdAt?: string;
}

export function AdminOfferLetters() {
  const [activeTab, setActiveTab] = useState<'builder' | 'history'>('builder');
  const [history, setHistory] = useState<OfferData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  const [data, setData] = useState<OfferData>({
    employmentType: 'Full-Time',
    candidateName: '',
    address: '',
    email: '',
    phone: '',
    designation: '',
    department: '',
    doj: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    probation: '6',
    notice: '30',
    reportingTo: '',
    annualCtc: '',
    basic: '',
    hra: '',
    pf: '',
    specialAllowance: ''
  });

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/offer-letters');
      const json = await res.json();
      setHistory(json);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteOfferLetter = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this offer letter?')) return;
    try {
      await fetch('/api/offer-letters', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      setHistory(prev => prev.filter(h => h.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Auto clear salary splits if switching to internship
    if (name === 'employmentType' && value === 'Internship') {
      setData({ ...data, employmentType: 'Internship', basic: '0', hra: '0', pf: '0', specialAllowance: '0' });
    } else {
      setData({ ...data, [name]: value });
    }
  };

  const autoCalculate = () => {
    if (data.employmentType === 'Internship') {
      alert("Auto-Calculate is not needed for Internships. The Monthly Stipend is treated as a flat amount.");
      return;
    }

    const ctc = parseFloat(data.annualCtc);
    if (isNaN(ctc) || ctc <= 0) {
      alert("Please enter a valid Annual CTC first.");
      return;
    }

    const basic = Math.round(ctc * 0.50);
    const hra = Math.round(basic * 0.50);
    
    let pf = Math.round(basic * 0.12);
    if (pf > 21600) {
      pf = 21600; 
    }

    const specialAllowance = ctc - (basic + hra + pf);

    setData({
      ...data,
      basic: basic.toString(),
      hra: hra.toString(),
      pf: pf.toString(),
      specialAllowance: specialAllowance.toString()
    });
  };

  const saveOfferLetter = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/offer-letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.success) {
        setData(result.offer); // This updates the state with the generated Ref ID!
        alert("Offer Letter saved successfully! The Reference ID has been generated.");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to save offer letter.");
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const currentDate = new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'long'
  }).format(new Date());

  const formattedDoj = data.doj ? new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'long'
  }).format(new Date(data.doj)) : '[Date of Joining]';

  const isIntern = data.employmentType === 'Internship';

  return (
    <div className="flex flex-col h-full overflow-hidden">
      
      {/* Tabs */}
      <div className="flex border-b border-evolw-gray-200 dark:border-white/5 mb-4">
        <button 
          onClick={() => setActiveTab('builder')}
          className={`px-6 py-3 font-semibold text-sm ${activeTab === 'builder' ? 'border-b-2 border-evolw-accent text-evolw-accent' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
        >
          <div className="flex items-center"><FileText className="w-4 h-4 mr-2" /> Builder</div>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 font-semibold text-sm ${activeTab === 'history' ? 'border-b-2 border-evolw-accent text-evolw-accent' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
        >
          <div className="flex items-center"><History className="w-4 h-4 mr-2" /> History</div>
        </button>
      </div>

      {activeTab === 'history' ? (
        <div className="p-8 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-6 text-evolw-black dark:text-white">Generated Offer Letters</h2>
          {history.length === 0 ? (
            <p className="text-evolw-gray-500 dark:text-evolw-gray-400">No offer letters have been generated yet.</p>
          ) : (
            <div className="grid gap-4">
              {history.map((h, i) => (
                <div key={i} className="bg-white dark:bg-evolw-gray-900 p-5 rounded-xl border border-evolw-gray-200 dark:border-white/10 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-lg text-evolw-black dark:text-white">{h.candidateName}</div>
                    <div className="text-sm text-evolw-gray-500 dark:text-evolw-gray-400 mt-0.5">{h.designation} • <span className="font-medium">{h.employmentType}</span></div>
                    <div className="text-xs text-evolw-gray-400 dark:text-evolw-gray-500 mt-1">Ref: {h.refId} • Generated: {new Date(h.createdAt!).toLocaleDateString('en-IN')}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <PDFDownloadLink
                      document={<OfferLetterPDF data={h} />}
                      fileName={`Offer_Letter_${h.candidateName.replace(/\s+/g, '_')}.pdf`}
                      className="flex items-center bg-evolw-gray-100 dark:bg-white/10 hover:bg-evolw-gray-200 dark:hover:bg-white/20 px-4 py-2 rounded-lg font-medium transition-colors text-sm text-evolw-black dark:text-white"
                    >
                      {/* @ts-ignore */}
                      {({ loading }) => (
                        <><Download className="w-4 h-4 mr-2" /> {loading ? '...' : 'Download'}</>
                      )}
                    </PDFDownloadLink>
                    <button
                      onClick={() => deleteOfferLetter(h.id!)}
                      className="flex items-center bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg font-medium transition-colors text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden print:bg-white print:m-0 print:p-0 print:fixed print:inset-0 print:z-50 print:overflow-visible">
          {/* Left Panel - Editor (Hidden on Print) */}
          <div className="w-1/2 h-full border-r border-evolw-gray-200 dark:border-white/5 overflow-y-auto p-8 print:hidden">
            
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Offer Letter Builder</h1>
                <p className="text-evolw-gray-500">Generate Full-Time and Internship offer letters.</p>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={saveOfferLetter}
                  disabled={isSaving}
                  className="flex items-center bg-green-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Data'}
                </button>
                {data.refId && (
                  <PDFDownloadLink
                    document={<OfferLetterPDF data={data} />}
                    fileName={`Offer_Letter_${data.candidateName.replace(/\s+/g, '_')}.pdf`}
                    className="flex items-center bg-evolw-accent text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-600 transition-colors shadow-sm"
                  >
                    {/* @ts-ignore */}
                    {({ loading }) => (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        {loading ? 'Preparing PDF...' : 'Download PDF'}
                      </>
                    )}
                  </PDFDownloadLink>
                )}
              </div>
            </div>

            {!data.refId && (
              <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-lg text-sm border border-amber-200 dark:border-amber-900/50">
                <strong>Note:</strong> You must click <strong>Save Data</strong> to generate a final Reference ID before downloading the PDF.
              </div>
            )}

            <div className="space-y-8">
              
              <div className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-evolw-gray-200 dark:border-white/10">
                <h2 className="flex items-center text-lg font-bold mb-4">
                  <User className="w-5 h-5 mr-2 text-evolw-accent" /> Candidate Details
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Employment Type</label>
                      <select name="employmentType" value={data.employmentType} onChange={handleChange} className="w-full p-2.5 rounded-lg border dark:bg-evolw-black dark:border-white/10">
                        <option value="Full-Time">Full-Time</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Full Name</label>
                      <input type="text" name="candidateName" value={data.candidateName} onChange={handleChange} className="w-full p-2.5 rounded-lg border dark:bg-evolw-black dark:border-white/10" placeholder="John Doe" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Phone</label>
                      <input type="text" name="phone" value={data.phone} onChange={handleChange} className="w-full p-2.5 rounded-lg border dark:bg-evolw-black dark:border-white/10" placeholder="+91 9876543210" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input type="email" name="email" value={data.email} onChange={handleChange} className="w-full p-2.5 rounded-lg border dark:bg-evolw-black dark:border-white/10" placeholder="john@example.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Residential Address</label>
                    <textarea name="address" value={data.address} onChange={handleChange} rows={2} className="w-full p-2.5 rounded-lg border dark:bg-evolw-black dark:border-white/10 resize-none" placeholder="123, Tech Park, Bangalore" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-evolw-gray-200 dark:border-white/10">
                <h2 className="flex items-center text-lg font-bold mb-4">
                  <Briefcase className="w-5 h-5 mr-2 text-evolw-accent" /> Job Details
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Designation</label>
                      <input type="text" name="designation" value={data.designation} onChange={handleChange} className="w-full p-2.5 rounded-lg border dark:bg-evolw-black dark:border-white/10" placeholder="Software Engineer" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Department</label>
                      <input type="text" name="department" value={data.department} onChange={handleChange} className="w-full p-2.5 rounded-lg border dark:bg-evolw-black dark:border-white/10" placeholder="Engineering" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Date of Joining</label>
                      <input type="date" name="doj" value={data.doj} onChange={handleChange} className="w-full p-2.5 rounded-lg border dark:bg-evolw-black dark:border-white/10" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Reporting To</label>
                      <input type="text" name="reportingTo" value={data.reportingTo} onChange={handleChange} className="w-full p-2.5 rounded-lg border dark:bg-evolw-black dark:border-white/10" placeholder="Manager" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Probation (Months)</label>
                      <input type="number" name="probation" value={data.probation} onChange={handleChange} className="w-full p-2.5 rounded-lg border dark:bg-evolw-black dark:border-white/10" disabled={isIntern} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Notice Period (Days)</label>
                      <input type="number" name="notice" value={data.notice} onChange={handleChange} className="w-full p-2.5 rounded-lg border dark:bg-evolw-black dark:border-white/10" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-evolw-gray-200 dark:border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="flex items-center text-lg font-bold">
                    <IndianRupee className="w-5 h-5 mr-2 text-evolw-accent" /> {isIntern ? 'Stipend' : 'Compensation'}
                  </h2>
                  {!isIntern && (
                    <button 
                      onClick={autoCalculate}
                      className="flex items-center text-xs bg-evolw-gray-100 dark:bg-white/10 hover:bg-evolw-gray-200 dark:hover:bg-white/20 transition-colors px-3 py-1.5 rounded-md font-semibold"
                    >
                      <Calculator className="w-3.5 h-3.5 mr-1.5" /> Auto-Calculate Split
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-1 text-evolw-accent">{isIntern ? 'Monthly Stipend (₹)' : 'Annual CTC (₹)'}</label>
                    <input type="number" name="annualCtc" value={data.annualCtc} onChange={handleChange} className="w-full p-3 text-lg font-bold rounded-lg border border-evolw-accent/30 focus:border-evolw-accent dark:bg-evolw-black outline-none" placeholder={isIntern ? "15000" : "1200000"} />
                  </div>
                  
                  {!isIntern && (
                    <div className="pt-4 border-t border-evolw-gray-200 dark:border-white/10 grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium mb-1 text-evolw-gray-500">Basic Salary (Annual)</label>
                        <input type="number" name="basic" value={data.basic} onChange={handleChange} className="w-full p-2.5 rounded-lg border dark:bg-evolw-black dark:border-white/10 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-evolw-gray-500">HRA (Annual)</label>
                        <input type="number" name="hra" value={data.hra} onChange={handleChange} className="w-full p-2.5 rounded-lg border dark:bg-evolw-black dark:border-white/10 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-evolw-gray-500">Special Allowance (Annual)</label>
                        <input type="number" name="specialAllowance" value={data.specialAllowance} onChange={handleChange} className="w-full p-2.5 rounded-lg border dark:bg-evolw-black dark:border-white/10 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-evolw-gray-500">PF Employer (Annual)</label>
                        <input type="number" name="pf" value={data.pf} onChange={handleChange} className="w-full p-2.5 rounded-lg border dark:bg-evolw-black dark:border-white/10 text-sm" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Right Panel - Live Preview / Printable A4 */}
          <div className="w-1/2 h-full overflow-y-auto bg-evolw-gray-100 dark:bg-black p-8 print:w-full print:p-0 print:m-0 print:overflow-visible flex justify-center">
            
            <div id="offer-letter-content" className="bg-white w-[210mm] min-h-[297mm] shadow-lg print:shadow-none p-12 text-black font-serif mx-auto relative overflow-visible print:absolute print:left-0 print:top-0">
              
              {/* Print Letterhead styling */}
              <div className="flex justify-between items-center border-b-2 border-gray-900 pb-6 mb-8">
                <div>
                  <h1 className="text-3xl font-bold tracking-tighter text-black">EVOLW</h1>
                  <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-sans">Waraseoni, Dist Balaghat , M.P India</p>
                </div>
                <div className="text-right text-sm text-gray-500 font-sans">
                  <p>contact@evolw.in</p>
                  <p>www.evolw.in</p>
                </div>
              </div>

              <div className="text-sm space-y-6">
                <div className="flex justify-between">
                  <p><strong>Date:</strong> {currentDate}</p>
                  <p><strong>Ref:</strong> {data.refId || '[Pending Save]'}</p>
                </div>

                <div>
                  <p>To,</p>
                  <p className="font-bold text-lg mt-1">{data.candidateName || '[Candidate Name]'}</p>
                  <p className="whitespace-pre-wrap">{data.address || '[Candidate Address]'}</p>
                  <p>Email: {data.email || '[Candidate Email]'}</p>
                  <p>Phone: {data.phone || '[Candidate Phone]'}</p>
                </div>

                <div className="text-center font-bold text-lg underline my-8">
                  Subject: Offer of {isIntern ? 'Internship' : 'Employment'}
                </div>

                <p>Dear {data.candidateName ? data.candidateName.split(' ')[0] : '[Name]'},</p>
                
                <p className="text-justify leading-relaxed">
                  We are pleased to offer you the position of <strong>{data.designation || '[Designation]'}</strong> at EVOLW in the <strong>{data.department || '[Department]'}</strong> department. We feel that your skills and background will be valuable assets to our team.
                </p>

                <p className="text-justify leading-relaxed">
                  Your scheduled date of joining will be <strong>{formattedDoj}</strong>. You will be reporting directly to the <strong>{data.reportingTo || '[Reporting Manager]'}</strong>.
                </p>

                <div className="pl-4 space-y-3">
                  {isIntern ? (
                    <p><strong>1. Stipend:</strong> Your consolidated monthly stipend will be <strong>{formatCurrency(data.annualCtc)}</strong>.</p>
                  ) : (
                    <p><strong>1. Compensation:</strong> Your Annual Cost to Company (CTC) will be <strong>{formatCurrency(data.annualCtc)}</strong>. The detailed breakdown of your salary is provided in <strong>Annexure A</strong>.</p>
                  )}
                  
                  {!isIntern && (
                    <p><strong>2. Probation:</strong> You will be on a probation period of <strong>{data.probation || '6'} months</strong> from your date of joining. Upon successful completion, your employment will be confirmed.</p>
                  )}
                  
                  <p><strong>{isIntern ? '2' : '3'}. Notice Period:</strong> {isIntern ? 'Either' : 'During probation or after confirmation, either'} party may terminate this agreement by providing <strong>{data.notice || '30'} days</strong> of written notice.</p>
                  <p><strong>{isIntern ? '3' : '4'}. Confidentiality:</strong> You will be required to sign a Non-Disclosure Agreement (NDA) ensuring the confidentiality of all proprietary company information.</p>
                </div>

                <p className="text-justify leading-relaxed mt-6">
                  Please signify your acceptance of these terms and conditions by signing and returning the duplicate copy of this letter. We look forward to welcoming you to the EVOLW family.
                </p>

                <div className="mt-16 flex justify-between pt-8">
                  <div>
                    <p className="mb-12">For <strong>EVOLW</strong>,</p>
                    <div className="w-48 border-t border-black"></div>
                    <p className="mt-2 font-bold">Authorized Signatory</p>
                    <p className="text-gray-500 text-xs mt-1">Human Resources Dept.</p>
                  </div>

                  <div>
                    <p className="mb-12">Accepted By,</p>
                    <div className="w-48 border-t border-black"></div>
                    <p className="mt-2 font-bold">{data.candidateName || '[Candidate Name]'}</p>
                    <p className="text-gray-500 text-xs mt-1">Date: ________________</p>
                  </div>
                </div>
              </div>

              {!isIntern && (
                <>
                  {/* Page Break for Annexure */}
                  <div className="html2pdf__page-break mt-24 print:mt-0 print:pt-24 print:break-before-all">
                    <h2 className="text-center font-bold text-xl underline mb-8">Annexure A: Compensation Breakdown</h2>
                    
                    <div className="mb-6 flex justify-between">
                      <p><strong>Name:</strong> {data.candidateName || '[Candidate Name]'}</p>
                      <p><strong>Designation:</strong> {data.designation || '[Designation]'}</p>
                    </div>

                    <table className="w-full border-collapse border border-black text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-black p-3 text-left">Salary Components</th>
                          <th className="border border-black p-3 text-right">Monthly (₹)</th>
                          <th className="border border-black p-3 text-right">Annually (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-black p-3 font-medium">Basic Salary</td>
                          <td className="border border-black p-3 text-right">{formatCurrency(parseFloat(data.basic) / 12)}</td>
                          <td className="border border-black p-3 text-right">{formatCurrency(data.basic)}</td>
                        </tr>
                        <tr>
                          <td className="border border-black p-3 font-medium">House Rent Allowance (HRA)</td>
                          <td className="border border-black p-3 text-right">{formatCurrency(parseFloat(data.hra) / 12)}</td>
                          <td className="border border-black p-3 text-right">{formatCurrency(data.hra)}</td>
                        </tr>
                        <tr>
                          <td className="border border-black p-3 font-medium">Special Allowance</td>
                          <td className="border border-black p-3 text-right">{formatCurrency(parseFloat(data.specialAllowance) / 12)}</td>
                          <td className="border border-black p-3 text-right">{formatCurrency(data.specialAllowance)}</td>
                        </tr>
                        <tr className="bg-gray-50 font-bold">
                          <td className="border border-black p-3">Gross Salary (A)</td>
                          <td className="border border-black p-3 text-right">
                            {formatCurrency((parseFloat(data.basic) + parseFloat(data.hra) + parseFloat(data.specialAllowance)) / 12)}
                          </td>
                          <td className="border border-black p-3 text-right">
                            {formatCurrency(parseFloat(data.basic) + parseFloat(data.hra) + parseFloat(data.specialAllowance))}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={3} className="border border-black p-3 bg-gray-100 font-bold text-center">Employer Contributions</td>
                        </tr>
                        <tr>
                          <td className="border border-black p-3 font-medium">Provident Fund (PF)</td>
                          <td className="border border-black p-3 text-right">{formatCurrency(parseFloat(data.pf) / 12)}</td>
                          <td className="border border-black p-3 text-right">{formatCurrency(data.pf)}</td>
                        </tr>
                        <tr className="bg-gray-50 font-bold">
                          <td className="border border-black p-3">Total Benefits (B)</td>
                          <td className="border border-black p-3 text-right">{formatCurrency(parseFloat(data.pf) / 12)}</td>
                          <td className="border border-black p-3 text-right">{formatCurrency(data.pf)}</td>
                        </tr>
                        <tr className="bg-gray-900 text-white font-bold text-base">
                          <td className="border border-gray-900 p-4">Cost To Company (A + B)</td>
                          <td className="border border-gray-900 p-4 text-right">{formatCurrency(parseFloat(data.annualCtc) / 12)}</td>
                          <td className="border border-gray-900 p-4 text-right">{formatCurrency(data.annualCtc)}</td>
                        </tr>
                      </tbody>
                    </table>

                    <p className="text-xs text-gray-500 mt-6 text-justify">
                      * Note: Income Tax and other statutory deductions will be applicable as per prevailing government laws. The employee is responsible for their own tax declarations. 
                    </p>
                    <p className="text-xs text-gray-500 mt-2 text-justify">
                      * Gratuity is payable as per the Payment of Gratuity Act, 1972 upon completion of 5 continuous years of service. It is not calculated in the immediate monthly gross above but is a statutory benefit.
                    </p>

                    <div className="mt-16 text-center text-xs text-gray-400 border-t border-gray-200 pt-4">
                      CONFIDENTIAL - INTERNAL PURPOSES ONLY
                    </div>
                  </div>
                </>
              )}
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
