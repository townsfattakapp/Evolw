import React, { useState, useEffect, useRef } from 'react';
import { User, Calendar, Star, Download, Save, History, Award, Trash2, Upload, PenTool } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { CertificatePDF } from './CertificatePDF';

export interface CertificateData {
  id?: string;
  certId?: string;
  internName: string;
  role: string;
  startDate: string;
  endDate: string;
  performance: string;
  hrSignature?: string;
  createdAt?: string;
}

export function AdminCertificates() {
  const [activeTab, setActiveTab] = useState<'builder' | 'history'>('builder');
  const [history, setHistory] = useState<CertificateData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  const [data, setData] = useState<CertificateData>({
    internName: '',
    role: '',
    startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    performance: 'Outstanding',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load saved signature automatically on mount
    const savedSignature = localStorage.getItem('evolw_hr_signature');
    if (savedSignature) {
      setData(prev => ({ ...prev, hrSignature: savedSignature }));
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        localStorage.setItem('evolw_hr_signature', base64String);
        setData(prev => ({ ...prev, hrSignature: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/certificates');
      const json = await res.json();
      setHistory(json);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteCertificate = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this certificate?')) return;
    try {
      await fetch('/api/certificates', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      setHistory(prev => prev.filter(h => h.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const saveCertificate = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.success) {
        setData(result.certificate); // Updates state with the generated Cert ID!
        alert("Certificate saved successfully! The Certificate ID has been generated.");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to save certificate.");
    } finally {
      setIsSaving(false);
    }
  };

  const issueDate = new Intl.DateTimeFormat('en-IN', { dateStyle: 'long' }).format(new Date());
  
  const formatDate = (d: string) => {
    if (!d) return '[Date]';
    return new Intl.DateTimeFormat('en-IN', { dateStyle: 'long' }).format(new Date(d));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      
      {/* Tabs */}
      <div className="flex border-b border-evolw-gray-200 dark:border-white/5 mb-4">
        <button 
          onClick={() => setActiveTab('builder')}
          className={`px-6 py-3 font-semibold text-sm ${activeTab === 'builder' ? 'border-b-2 border-evolw-accent text-evolw-accent' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
        >
          <div className="flex items-center"><Award className="w-4 h-4 mr-2" /> Builder</div>
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
          <h2 className="text-2xl font-bold mb-6 text-evolw-black dark:text-white">Generated Certificates</h2>
          {history.length === 0 ? (
            <p className="text-evolw-gray-500 dark:text-evolw-gray-400">No certificates have been generated yet.</p>
          ) : (
            <div className="grid gap-4">
              {history.map((h, i) => (
                <div key={i} className="bg-white dark:bg-evolw-gray-900 p-5 rounded-xl border border-evolw-gray-200 dark:border-white/10 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-lg text-evolw-black dark:text-white">{h.internName}</div>
                    <div className="text-sm text-evolw-gray-500 dark:text-evolw-gray-400 mt-0.5">{h.role} Intern</div>
                    <div className="text-xs text-evolw-gray-400 dark:text-evolw-gray-500 mt-1">ID: {h.certId} • Issued: {new Date(h.createdAt!).toLocaleDateString('en-IN')}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <PDFDownloadLink
                      document={<CertificatePDF data={h} />}
                      fileName={`Certificate_${h.internName.replace(/\s+/g, '_')}.pdf`}
                      className="flex items-center bg-evolw-gray-100 dark:bg-white/10 hover:bg-evolw-gray-200 dark:hover:bg-white/20 px-4 py-2 rounded-lg font-medium transition-colors text-sm text-evolw-black dark:text-white"
                    >
                      {/* @ts-ignore */}
                      {({ loading }) => (
                        <><Download className="w-4 h-4 mr-2" /> {loading ? '...' : 'Download'}</>
                      )}
                    </PDFDownloadLink>
                    <button
                      onClick={() => deleteCertificate(h.id!)}
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
          {/* Left Panel - Editor */}
          <div className="w-1/3 h-full border-r border-evolw-gray-200 dark:border-white/5 overflow-y-auto p-8 print:hidden shrink-0">
            
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Certificate Builder</h1>
              <p className="text-evolw-gray-500">Generate internship completion certificates.</p>
            </div>

            <div className="flex space-x-3 mb-8">
              <button 
                onClick={saveCertificate}
                disabled={isSaving}
                className="flex-1 flex justify-center items-center bg-green-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Data'}
              </button>
              {data.certId && (
                <PDFDownloadLink
                  document={<CertificatePDF data={data} />}
                  fileName={`Certificate_${data.internName.replace(/\s+/g, '_')}.pdf`}
                  className="flex-1 flex justify-center items-center bg-evolw-accent text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-blue-600 transition-colors shadow-sm"
                >
                  {/* @ts-ignore */}
                  {({ loading }) => (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      {loading ? 'Wait...' : 'Download PDF'}
                    </>
                  )}
                </PDFDownloadLink>
              )}
            </div>

            {!data.certId && (
              <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-lg text-sm border border-amber-200 dark:border-amber-900/50">
                <strong>Note:</strong> You must click <strong>Save Data</strong> to generate a final Certificate ID before downloading the PDF.
              </div>
            )}

            <div className="space-y-6">
              <div className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-evolw-gray-200 dark:border-white/10">
                <h2 className="flex items-center text-lg font-bold mb-4">
                  <User className="w-5 h-5 mr-2 text-evolw-accent" /> Intern Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Intern Name</label>
                    <input type="text" name="internName" value={data.internName} onChange={handleChange} className="w-full p-2.5 rounded-lg border dark:bg-evolw-black dark:border-white/10" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Role/Department</label>
                    <input type="text" name="role" value={data.role} onChange={handleChange} className="w-full p-2.5 rounded-lg border dark:bg-evolw-black dark:border-white/10" placeholder="Software Engineering" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-evolw-gray-200 dark:border-white/10">
                <h2 className="flex items-center text-lg font-bold mb-4">
                  <Calendar className="w-5 h-5 mr-2 text-evolw-accent" /> Duration
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <input type="date" name="startDate" value={data.startDate} onChange={handleChange} className="w-full p-2.5 rounded-lg border dark:bg-evolw-black dark:border-white/10" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <input type="date" name="endDate" value={data.endDate} onChange={handleChange} className="w-full p-2.5 rounded-lg border dark:bg-evolw-black dark:border-white/10" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-evolw-gray-200 dark:border-white/10">
                <h2 className="flex items-center text-lg font-bold mb-4">
                  <Star className="w-5 h-5 mr-2 text-evolw-accent" /> Evaluation
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Performance Rating</label>
                    <select name="performance" value={data.performance} onChange={handleChange} className="w-full p-2.5 rounded-lg border dark:bg-evolw-black dark:border-white/10">
                      <option value="Outstanding">Outstanding</option>
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Satisfactory">Satisfactory</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-evolw-gray-200 dark:border-white/10">
                <h2 className="flex items-center text-lg font-bold mb-4">
                  <PenTool className="w-5 h-5 mr-2 text-evolw-accent" /> HR Signature
                </h2>
                <div className="space-y-4">
                  <p className="text-sm text-evolw-gray-500">
                    Upload a transparent PNG of the authorized signature. It will be saved automatically for future use.
                  </p>
                  
                  {data.hrSignature && (
                    <div className="border border-evolw-gray-200 dark:border-white/10 rounded-lg p-4 bg-evolw-gray-50 dark:bg-black/50 mb-4 flex justify-center">
                      <img src={data.hrSignature} alt="Signature" className="h-12 object-contain" />
                    </div>
                  )}

                  <input 
                    type="file" 
                    accept="image/png, image/jpeg" 
                    ref={fileInputRef} 
                    onChange={handleSignatureUpload} 
                    className="hidden" 
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center px-4 py-2.5 rounded-lg border-2 border-dashed border-evolw-gray-300 dark:border-white/20 text-evolw-gray-600 dark:text-gray-400 hover:border-evolw-accent hover:text-evolw-accent transition-colors font-medium text-sm"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {data.hrSignature ? 'Upload New Signature' : 'Upload Signature'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Live Preview */}
          <div className="flex-1 h-full overflow-y-auto bg-evolw-gray-100 dark:bg-black p-8 flex items-center justify-center">
            
            {/* HTML Approximation of the Landscape PDF */}
            <div className="bg-white w-[297mm] h-[210mm] shadow-lg p-[30px] font-serif text-black shrink-0 relative overflow-hidden" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
              
              <div className="border-[4px] border-slate-900 p-2 w-full h-full">
                <div className="border-[2px] border-slate-300 w-full h-full flex flex-col items-center justify-center relative p-8 overflow-hidden">
                  
                  {/* Techy Background Design Preview */}
                  <div className="absolute inset-0 z-0 opacity-[0.3] pointer-events-none">
                    <svg viewBox="0 0 842 595" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                      <path d="M 0 100 L 150 100 L 200 150 L 200 250 L 250 300" fill="none" stroke="#93c5fd" strokeWidth="1.5" />
                      <circle cx="250" cy="300" r="4" fill="#93c5fd" />
                      <path d="M 0 150 L 100 150 L 120 170 L 120 400 L 150 430" fill="none" stroke="#93c5fd" strokeWidth="0.5" />
                      <circle cx="150" cy="430" r="2" fill="#93c5fd" />
                      <path d="M 50 595 L 50 500 L 150 400 L 300 400 L 350 350" fill="none" stroke="#93c5fd" strokeWidth="1" />
                      <circle cx="350" cy="350" r="3" fill="none" stroke="#93c5fd" strokeWidth="1" />

                      <path d="M 842 450 L 700 450 L 650 400 L 650 250 L 600 200" fill="none" stroke="#93c5fd" strokeWidth="1.5" />
                      <circle cx="600" cy="200" r="4" fill="#93c5fd" />
                      <path d="M 842 500 L 750 500 L 700 450 L 700 200 L 650 150" fill="none" stroke="#93c5fd" strokeWidth="0.5" />
                      <circle cx="650" cy="150" r="2" fill="#93c5fd" />
                      <path d="M 750 0 L 750 100 L 650 200 L 500 200 L 450 250" fill="none" stroke="#93c5fd" strokeWidth="1" />
                      <circle cx="450" cy="250" r="3" fill="none" stroke="#93c5fd" strokeWidth="1" />
                      
                      <circle cx="50" cy="50" r="1" fill="#e2e8f0" />
                      <circle cx="90" cy="50" r="1" fill="#e2e8f0" />
                      <circle cx="130" cy="50" r="1" fill="#e2e8f0" />
                      <circle cx="170" cy="50" r="1" fill="#e2e8f0" />
                      <circle cx="210" cy="50" r="1" fill="#e2e8f0" />
                      <circle cx="630" cy="550" r="1" fill="#e2e8f0" />
                      <circle cx="670" cy="550" r="1" fill="#e2e8f0" />
                      <circle cx="710" cy="550" r="1" fill="#e2e8f0" />
                      <circle cx="750" cy="550" r="1" fill="#e2e8f0" />
                      <circle cx="790" cy="550" r="1" fill="#e2e8f0" />
                      
                      <path d="M 350 480 L 492 480 L 492 500 L 350 500 Z" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
                      <path d="M 352 482 L 358 482 M 490 498 L 484 498" fill="none" stroke="#93c5fd" strokeWidth="1" />
                    </svg>
                  </div>
                  
                  <div className="text-center mb-10 relative z-10">
                    <h1 className="text-5xl font-bold tracking-[0.2em] font-sans">EVOLW</h1>
                    <p className="text-xs text-gray-500 tracking-[0.2em] mt-1 font-sans">INNOVATION. EXCELLENCE. GROWTH.</p>
                  </div>

                  <h2 className="text-4xl font-bold text-slate-900 tracking-widest uppercase mb-2">Certificate of Completion</h2>
                  <p className="text-lg text-slate-500 tracking-widest mb-10 uppercase font-sans">Internship Program</p>

                  <p className="italic text-lg mb-6">This is proudly presented to</p>
                  
                  <div className="text-4xl font-bold border-b border-black w-2/3 text-center pb-2 mb-10">
                    {data.internName || '[Intern Name]'}
                  </div>

                  <p className="text-center text-lg leading-relaxed w-5/6 mb-16">
                    In recognition of their successful completion of the <span className="font-bold">{data.role || '[Role]'}</span> internship program at EVOLW. 
                    Their tenure from <span className="font-bold">{formatDate(data.startDate)}</span> to <span className="font-bold">{formatDate(data.endDate)}</span> was 
                    marked by dedication and excellent contribution. Their overall performance was rated as <span className="font-bold">{data.performance}</span>.
                  </p>

                  <div className="absolute bottom-10 left-12 right-12 flex justify-between items-end">
                    <div className="w-48 text-center">
                      <p className="text-lg mb-2">{issueDate}</p>
                      <div className="border-t border-black pt-2">
                        <p className="font-bold font-sans text-sm">Date of Issue</p>
                      </div>
                    </div>

                    <div className="w-64 text-center">
                      <div className="h-14 flex items-end justify-center mb-1">
                        {data.hrSignature ? (
                          <img src={data.hrSignature} alt="Signature" className="h-12 object-contain" />
                        ) : (
                          <div className="h-12"></div>
                        )}
                      </div>
                      <div className="border-t border-black pt-2">
                        <p className="font-bold font-sans text-sm">Authorized Signatory</p>
                        <p className="text-xs text-gray-600 font-sans mt-1">Human Resources, EVOLW</p>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-3 left-10 text-[10px] text-slate-400 font-sans">
                    ID: {data.certId || '[Pending Save]'} • Verify at evolw.in
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
