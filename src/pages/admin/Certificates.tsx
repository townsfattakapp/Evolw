import React, { useState, useEffect } from 'react';
import { User, Calendar, Star, Download, Save, History, Award } from 'lucide-react';
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
  createdAt?: string;
}

export function AdminCertificates() {
  const [activeTab, setActiveTab] = useState<'builder' | 'history'>('builder');
  const [history, setHistory] = useState<CertificateData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  const [data, setData] = useState<CertificateData>({
    internName: 'Aarav Sharma',
    role: 'Frontend Development',
    startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 months ago
    endDate: new Date().toISOString().split('T')[0], // today
    performance: 'Outstanding',
  });

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/certificates');
      const json = await res.json();
      setHistory(json);
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
          <h2 className="text-2xl font-bold mb-6">Generated Certificates</h2>
          {history.length === 0 ? (
            <p className="text-gray-500">No certificates have been generated yet.</p>
          ) : (
            <div className="grid gap-4">
              {history.map((h, i) => (
                <div key={i} className="bg-white dark:bg-white/5 p-4 rounded-xl border border-evolw-gray-200 dark:border-white/10 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-lg">{h.internName}</div>
                    <div className="text-sm text-gray-500">{h.role} Intern</div>
                    <div className="text-xs text-gray-400 mt-1">ID: {h.certId} • Issued: {new Date(h.createdAt!).toLocaleDateString()}</div>
                  </div>
                  <PDFDownloadLink
                    document={<CertificatePDF data={h} />}
                    fileName={`Certificate_${h.internName.replace(/\s+/g, '_')}.pdf`}
                    className="flex items-center bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                  >
                    {/* @ts-ignore */}
                    {({ loading }) => (
                      <><Download className="w-4 h-4 mr-2" /> {loading ? '...' : 'Download'}</>
                    )}
                  </PDFDownloadLink>
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
            </div>
          </div>

          {/* Right Panel - Live Preview */}
          <div className="flex-1 h-full overflow-y-auto bg-evolw-gray-100 dark:bg-black p-8 flex items-center justify-center">
            
            {/* HTML Approximation of the Landscape PDF */}
            <div className="bg-white w-[297mm] h-[210mm] shadow-lg p-[30px] font-serif text-black shrink-0 relative overflow-hidden" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
              
              <div className="border-[4px] border-slate-900 p-2 w-full h-full">
                <div className="border-[2px] border-slate-300 w-full h-full flex flex-col items-center justify-center relative p-8">
                  
                  <div className="text-center mb-10">
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
                      <div className="border-t border-black pt-2 mt-8">
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
