import React, { useState } from 'react';
import { Search, CheckCircle, XCircle, ShieldCheck, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { SEO } from '../components/common/seo';
import { PAGE_SEO } from '../lib/seo/site';
import { breadcrumbSchema } from '../lib/seo/schema';

interface CertificateVerifyData {
  internName?: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  performance?: string;
}

export function VerifyCertificate() {
  const [certId, setCertId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ valid: boolean; data?: CertificateVerifyData } | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certId.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const data = await api.verifyCertificate(certId.trim());
      setResult({
        valid: Boolean(data.valid),
        data: data.data as CertificateVerifyData | undefined,
      });
    } catch (e) {
      console.error('[verify] Failed', e);
      setResult({ valid: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-evolw-gray-50 flex flex-col">
      <SEO
        title={PAGE_SEO.verify.title}
        description={PAGE_SEO.verify.description}
        path={PAGE_SEO.verify.path}
        jsonLd={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Verify Certificate', path: '/verify' },
        ])}
      />
      {/* Simple Header */}
      <header className="bg-white border-b border-evolw-gray-200 px-8 h-20 flex items-center justify-between shadow-sm shrink-0">
        <Link to="/" className="text-2xl font-bold tracking-tight text-evolw-black hover:text-evolw-accent transition-colors">EVOLW</Link>
        <div className="flex items-center space-x-2 text-sm font-semibold text-evolw-gray-500">
          <ShieldCheck className="w-5 h-5 text-green-500" />
          <span>Credential Verification Portal</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-evolw-gray-100 max-w-lg w-full text-center">
          
          <div className="w-20 h-20 bg-evolw-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Award className="w-10 h-10 text-evolw-accent" />
          </div>

          <h1 className="text-3xl font-bold mb-2 text-evolw-black">Verify a Certificate</h1>
          <p className="text-evolw-gray-500 mb-8 leading-relaxed">
            Enter the unique Certificate ID found at the bottom left of any EVOLW completion certificate to verify its authenticity.
          </p>

          <form onSubmit={handleVerify} className="relative mb-8">
            <input
              type="text"
              placeholder="e.g. EV/CERT/2026/001"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-evolw-gray-50 border border-evolw-gray-200 rounded-xl text-lg font-medium focus:ring-2 focus:ring-evolw-accent focus:border-transparent outline-none transition-all placeholder:font-normal uppercase"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-evolw-gray-400" />
            <button
              type="submit"
              disabled={loading || !certId.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-evolw-black text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>

          {/* Results Area */}
          {result && (
            <div className={`p-6 rounded-2xl text-left border ${result.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} transition-all animate-in fade-in slide-in-from-bottom-4`}>
              {result.valid ? (
                <>
                  <div className="flex items-center space-x-3 mb-6 border-b border-green-200 pb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <h3 className="font-bold text-green-900 text-lg">Certificate Verified</h3>
                      <p className="text-sm text-green-700">This is a valid, authentic EVOLW credential.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-green-800 uppercase tracking-wider mb-1">Intern Name</p>
                      <p className="font-semibold text-lg text-green-950">{result.data?.internName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-green-800 uppercase tracking-wider mb-1">Role / Department</p>
                      <p className="font-medium text-green-900">{result.data?.role}</p>
                    </div>
                    <div className="flex gap-8">
                      <div>
                        <p className="text-xs font-bold text-green-800 uppercase tracking-wider mb-1">Tenure</p>
                        <p className="font-medium text-green-900">
                          {result.data?.startDate
                            ? new Date(result.data.startDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric'})
                            : '—'}{' '}
                          -{' '}
                          {result.data?.endDate
                            ? new Date(result.data.endDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric'})
                            : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-green-800 uppercase tracking-wider mb-1">Rating</p>
                        <p className="font-medium text-green-900">{result.data?.performance}</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <XCircle className="w-8 h-8 text-red-600 shrink-0" />
                  <div>
                    <h3 className="font-bold text-red-900 text-lg">Invalid Certificate ID</h3>
                    <p className="text-sm text-red-700 leading-relaxed">No credential was found matching this ID. Please check the spelling and try again.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
