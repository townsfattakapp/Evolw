import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Calendar, Briefcase, Trash2, Globe, Link2, Star, FileText, Loader2, Download, Sparkles } from "lucide-react";
import { api, ApiError, type Application } from "../../lib/api";
import * as pdfjsLib from "pdfjs-dist";
import DOMPurify from "dompurify";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
}

const STATUS_OPTIONS = ["new", "reviewing", "shortlisted", "rejected", "hired"] as const;

export function AdminApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [app, setApp] = useState<Application | null>(location.state?.app || null);
  const [loading, setLoading] = useState(!app);
  const [error, setError] = useState<string | null>(null);
  const [resumeBlobUrl, setResumeBlobUrl] = useState<string | null>(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiSummaryError, setAiSummaryError] = useState<string | null>(null);

  useEffect(() => {
    if (!app) {
      fetchApp();
    }
  }, [id]);

  // Fetch resume PDF as a blob URL to bypass CSP frame-ancestors restrictions
  useEffect(() => {
    if (!app?.resumeUrl) return;
    let cancelled = false;
    setResumeLoading(true);
    setResumeError(null);

    fetch(`/api/proxy-resume?url=${encodeURIComponent(app.resumeUrl)}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load resume');
        return res.blob();
      })
      .then(blob => {
        if (cancelled) return;
        // Revoke previous blob URL if any
        if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        setResumeBlobUrl(url);
      })
      .catch(err => {
        if (!cancelled) setResumeError(err.message || 'Failed to load resume preview');
      })
      .finally(() => {
        if (!cancelled) setResumeLoading(false);
      });

    return () => {
      cancelled = true;
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [app?.resumeUrl]);

  const fetchApp = async () => {
    setLoading(true);
    setError(null);
    try {
      // Since there's no single fetch endpoint, fetch all and filter
      const apps = await api.getApplications();
      const found = apps.find(a => a.id === id);
      if (found) {
        setApp(found);
      } else {
        setError("Application not found.");
      }
    } catch (err) {
      console.error("[admin/application-detail] Failed to fetch", err);
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        navigate("/admin");
        return;
      }
      setError("Failed to load application details.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!app) return;
    try {
      await api.updateApplicationStatus(app.id, newStatus);
      setApp({ ...app, status: newStatus });
    } catch (error) {
      console.error("[admin/application-detail] Failed to update status", error);
      alert(error instanceof ApiError ? error.message : "Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!app || !confirm("Are you sure you want to delete this application? This cannot be undone.")) return;
    try {
      await api.deleteApplication(app.id);
      navigate("/admin/applications");
    } catch (error) {
      console.error("[admin/application-detail] Failed to delete", error);
      alert(error instanceof ApiError ? error.message : "Failed to delete application");
    }
  };

  const generateSummary = async () => {
    if (!app?.resumeUrl) return;
    setAiSummaryLoading(true);
    setAiSummaryError(null);
    try {
      // Fetch PDF directly from our proxy (same-origin, no CSP issues)
      const response = await fetch(`/api/proxy-resume?url=${encodeURIComponent(app.resumeUrl)}`);
      if (!response.ok) throw new Error('Failed to load resume for summarization');
      const arrayBuffer = await response.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = Math.min(pdf.numPages, 5); // Max 5 pages
      let resumeText = "";
      
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((item: any) => item.str);
        resumeText += strings.join(" ") + "\n";
      }

      if (!resumeText.trim()) throw new Error("Could not extract text from the PDF.");

      const result = await api.summarizeResume({ resumeText });
      if (result.html) {
        setAiSummary(DOMPurify.sanitize(result.html));
      } else {
        throw new Error("Invalid response from summary API.");
      }
    } catch (err) {
      console.error("Failed to generate summary:", err);
      setAiSummaryError(err instanceof Error ? err.message : "Failed to generate summary");
    } finally {
      setAiSummaryLoading(false);
    }
  };

  const statusClass = (status: string) => {
    const s = (status || "new").toLowerCase();
    if (s === "new") return "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400";
    if (s === "reviewing") return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400";
    if (s === "shortlisted") return "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400";
    if (s === "hired") return "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400";
    return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400";
  };

  if (loading) {
    return <div className="p-8 text-center text-evolw-gray-500">Loading application details...</div>;
  }

  if (error || !app) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center">
        <p className="text-red-500 mb-4">{error || "Application not found"}</p>
        <Link to="/admin/applications" className="text-evolw-accent hover:underline">
          &larr; Back to Applications
        </Link>
      </div>
    );
  }

  const currentStatus = String(app.status || "new").toLowerCase();

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-evolw-black dark:text-white pb-12">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/admin/applications" className="text-sm font-medium text-evolw-gray-500 hover:text-evolw-accent flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-evolw-slate p-6 rounded-2xl border border-evolw-gray-200 dark:border-white/10 shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">{app.name}</h1>
          <div className="flex items-center gap-3 text-sm text-evolw-gray-500 dark:text-evolw-gray-400">
            <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {app.jobTitle || "Unknown Role"}</span>
            <span>&bull;</span>
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {app.date || app.createdAt?.split("T")[0]}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={STATUS_OPTIONS.includes(currentStatus as any) ? currentStatus : "new"}
            onChange={(e) => updateStatus(e.target.value)}
            className={`px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wider appearance-none cursor-pointer outline-none shadow-sm ${statusClass(currentStatus)}`}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <button
            onClick={handleDelete}
            className="p-2 text-evolw-gray-400 hover:text-red-500 bg-evolw-gray-50 hover:bg-red-50 dark:bg-white/5 dark:hover:bg-red-900/20 rounded-xl transition-colors"
            title="Delete Application"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column - Contact & Quick Info */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-evolw-slate p-6 rounded-2xl border border-evolw-gray-200 dark:border-white/10 shadow-sm">
            <h3 className="text-sm font-bold text-evolw-gray-400 uppercase tracking-wider mb-4">Contact Info</h3>
            <div className="space-y-4">
              <a href={`mailto:${app.email}`} className="flex items-center gap-3 text-sm hover:text-evolw-accent transition-colors">
                <div className="w-8 h-8 rounded-lg bg-evolw-gray-50 dark:bg-white/5 flex items-center justify-center text-evolw-gray-500"><Mail className="w-4 h-4" /></div>
                <span className="break-all">{app.email}</span>
              </a>
              {app.phone && (
                <a href={`tel:${app.phone}`} className="flex items-center gap-3 text-sm hover:text-evolw-accent transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-evolw-gray-50 dark:bg-white/5 flex items-center justify-center text-evolw-gray-500"><Phone className="w-4 h-4" /></div>
                  <span>{app.phone}</span>
                </a>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-evolw-slate p-6 rounded-2xl border border-evolw-gray-200 dark:border-white/10 shadow-sm">
            <h3 className="text-sm font-bold text-evolw-gray-400 uppercase tracking-wider mb-4">Links & Resume</h3>
            <div className="space-y-4">
              {app.resumeUrl ? (
                <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm font-medium text-evolw-accent hover:underline group">
                  <div className="w-8 h-8 rounded-lg bg-evolw-accent/10 flex items-center justify-center text-evolw-accent group-hover:bg-evolw-accent group-hover:text-white transition-colors"><FileText className="w-4 h-4" /></div>
                  <span className="truncate">{app.resumeName || "View Resume PDF"}</span>
                </a>
              ) : (
                <p className="text-sm text-evolw-gray-500 italic">No resume attached.</p>
              )}
              
              {app.linkedin && app.linkedin !== "Not provided" && (
                <a href={app.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm hover:text-[#0A66C2] transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-evolw-gray-50 dark:bg-white/5 flex items-center justify-center text-evolw-gray-500"><Link2 className="w-4 h-4" /></div>
                  <span className="truncate">LinkedIn Profile</span>
                </a>
              )}

              {app.portfolio && (
                <a href={app.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm hover:text-evolw-black dark:hover:text-white transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-evolw-gray-50 dark:bg-white/5 flex items-center justify-center text-evolw-gray-500"><Globe className="w-4 h-4" /></div>
                  <span className="truncate">Portfolio / Website</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Experience & Cover Letter */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-evolw-slate p-6 rounded-2xl border border-evolw-gray-200 dark:border-white/10 shadow-sm">
            <h3 className="text-sm font-bold text-evolw-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-evolw-accent" /> Experience & Skills
            </h3>
            
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-evolw-gray-500 uppercase mb-2">Years of Experience</h4>
              <p className="text-sm md:text-base font-medium">{app.experience || "Not specified"}</p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-evolw-gray-500 uppercase mb-2">Technical Skills</h4>
              {app.skills ? (
                <div className="flex flex-wrap gap-2">
                  {app.skills.split(',').map((skill, i) => (
                    <span key={i} className="bg-evolw-gray-100 dark:bg-white/5 text-evolw-gray-800 dark:text-evolw-gray-200 text-sm px-3 py-1.5 rounded-lg border border-evolw-gray-200 dark:border-white/5">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-evolw-gray-500">No skills listed</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-evolw-slate p-6 rounded-2xl border border-evolw-gray-200 dark:border-white/10 shadow-sm">
            <h3 className="text-sm font-bold text-evolw-gray-400 uppercase tracking-wider mb-4">Cover Letter / Message</h3>
            {app.message ? (
              <div className="prose prose-sm dark:prose-invert max-w-none bg-evolw-gray-50 dark:bg-evolw-black p-5 rounded-xl border border-evolw-gray-100 dark:border-white/5">
                <p className="whitespace-pre-wrap leading-relaxed text-evolw-gray-700 dark:text-evolw-gray-300">{app.message}</p>
              </div>
            ) : (
              <p className="text-sm text-evolw-gray-500 italic">No cover letter provided.</p>
            )}
          </div>
        </div>

      </div>

      {app.resumeUrl && (
        <div className="bg-white dark:bg-evolw-slate p-6 rounded-2xl border border-evolw-gray-200 dark:border-white/10 shadow-sm mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-evolw-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-evolw-accent" /> AI Resume Summary
            </h3>
            {!aiSummary && (
              <button
                onClick={generateSummary}
                disabled={aiSummaryLoading || !resumeBlobUrl || resumeLoading}
                className="px-4 py-2 bg-evolw-accent text-white text-xs font-semibold rounded-xl hover:bg-evolw-accent-dark transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {aiSummaryLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {aiSummaryLoading ? "Generating..." : "Generate Summary"}
              </button>
            )}
          </div>
          
          {aiSummaryError && (
            <p className="text-sm text-red-500 mb-4">{aiSummaryError}</p>
          )}

          {aiSummary && (
            <div 
              className="prose prose-sm dark:prose-invert max-w-none text-evolw-gray-700 dark:text-evolw-gray-300 leading-relaxed [&>p]:mb-4 [&>ul]:pl-5 [&>ul>li]:mb-1 [&_strong]:text-evolw-black dark:[&_strong]:text-white"
              dangerouslySetInnerHTML={{ __html: aiSummary }} 
            />
          )}

          {!aiSummary && !aiSummaryLoading && !aiSummaryError && (
            <p className="text-sm text-evolw-gray-500 italic">Generate an AI summary to get a quick overview of this candidate's profile.</p>
          )}
        </div>
      )}

      {app.resumeUrl && (
        <div className="bg-white dark:bg-evolw-slate p-6 rounded-2xl border border-evolw-gray-200 dark:border-white/10 shadow-sm mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-evolw-gray-400 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-evolw-accent" /> Resume Preview
            </h3>
            <div className="flex items-center gap-3">
              {resumeBlobUrl && (
                <a
                  href={resumeBlobUrl}
                  download={app.resumeName || 'resume.pdf'}
                  className="flex items-center gap-1 text-xs font-semibold text-evolw-gray-500 hover:text-evolw-accent transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
              )}
              <a 
                href={app.resumeUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs font-semibold text-evolw-accent hover:underline"
              >
                Open in new tab
              </a>
            </div>
          </div>
          <div className="w-full h-[600px] md:h-[800px] rounded-xl overflow-hidden border border-evolw-gray-200 dark:border-white/10 bg-evolw-gray-50 dark:bg-evolw-black relative">
            {resumeLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-evolw-accent animate-spin" />
                <span className="ml-3 text-sm text-evolw-gray-500">Loading resume…</span>
              </div>
            )}
            {resumeError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-sm text-red-500">{resumeError}</p>
              </div>
            )}
            {resumeBlobUrl && (
              <object
                data={resumeBlobUrl}
                type="application/pdf"
                className="w-full h-full absolute inset-0"
                aria-label={`${app.name}'s Resume`}
              >
                <p className="p-6 text-center text-evolw-gray-500">
                  Your browser cannot display PDFs inline.{' '}
                  <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-evolw-accent hover:underline">
                    Download the resume instead
                  </a>.
                </p>
              </object>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
