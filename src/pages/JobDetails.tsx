import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { SEO } from "../components/common/seo";
import { Container } from "../components/ui/container";
import { Button } from "../components/ui/button";
import { RichText } from "../components/ui/rich-text";
import { ArrowLeft, Briefcase, MapPin, CheckCircle, Upload, Sparkles, Loader2 } from "lucide-react";
import { api, ApiError, fileToDataUrl, type Job } from "../lib/api";
import { richTextToPlain } from "../lib/richText";
import { breadcrumbSchema, jobPostingSchema } from "../lib/seo/schema";
import * as pdfjsLib from "pdfjs-dist";

// Use Vite's URL import to bundle the worker locally and respect CSP
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
}

export function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hash } = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    linkedin: "",
    portfolio: "",
    experience: "",
    skills: "",
    message: "",
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [isParsing, setIsParsing] = useState(false);
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);

  useEffect(() => {
    if (hash === "#apply") {
      setTimeout(() => {
        document.getElementById("apply-form")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [hash, job]);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await api.getJobs({ id });
        setJob(Array.isArray(data) ? data[0] || null : data);
      } catch (err) {
        console.error("[job-details] Failed to load job", err);
        if (err instanceof ApiError && err.status === 404) {
          setJob(null);
        } else {
          setLoadError(err instanceof ApiError ? err.message : "Failed to load job details");
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <SEO title="Loading role | EVOLW Careers" path="/careers" noindex />
        Loading...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center text-center px-4">
        <SEO title="Unable to load role | EVOLW Careers" path="/careers" noindex />
        <h1 className="text-4xl font-bold mb-4">Unable to load role</h1>
        <p className="text-evolw-gray-500 mb-8">{loadError}</p>
        <Button onClick={() => navigate("/careers")}>Back to Careers</Button>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center text-center px-4">
        <SEO title="Job Not Found | EVOLW Careers" path="/careers" noindex />
        <h1 className="text-4xl font-bold mb-4">Job Not Found</h1>
        <p className="text-evolw-gray-500 mb-8">This position may have been filled or no longer exists.</p>
        <Button onClick={() => navigate("/careers")}>Back to Careers</Button>
      </div>
    );
  }

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!resumeFile) newErrors.resume = "Resume is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 4 * 1024 * 1024) {
        setErrors({ ...errors, resume: "File is too large (max 4MB)" });
        return;
      }
      setResumeFile(file);
      if (errors.resume) {
        setErrors({ ...errors, resume: "" });
      }

      try {
        setIsParsing(true);
        let resumeText = "";
        
        if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
          // Extract text from PDF on the client side to avoid server payload limits and 500 errors
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          
          // Only parse first 5 pages to save time/bandwidth
          const numPages = Math.min(pdf.numPages, 5); 
          for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const strings = content.items.map((item: any) => item.str);
            resumeText += strings.join(" ") + "\n";
          }
        }

        if (resumeText.trim()) {
          const result = await api.parseResume({ resumeText });
          
          if (result.data) {
            const normalizeUrl = (url: string) => {
              if (!url) return "";
              if (url.startsWith("http://") || url.startsWith("https://")) return url;
              return `https://${url}`;
            };

            setFormData(prev => ({
              ...prev,
              name: result.data.name || prev.name,
              email: result.data.email || prev.email,
              phone: result.data.phone || prev.phone,
              linkedin: normalizeUrl(result.data.linkedin) || prev.linkedin,
              portfolio: normalizeUrl(result.data.portfolio) || prev.portfolio,
              experience: result.data.experience || prev.experience,
              skills: result.data.skills || prev.skills,
            }));
          }
        }
      } catch (err) {
        console.error("Failed to parse resume:", err);
      } finally {
        setIsParsing(false);
      }
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!job) return;
    
    setIsGeneratingCoverLetter(true);
    try {
      const result = await api.generateCoverLetter({
        resumeData: formData as unknown as Record<string, string>,
        jobTitle: job.title,
        jobDescription: typeof job.description === 'string' ? job.description : richTextToPlain(job.description),
        department: job.department
      });
      
      if (result.coverLetter) {
        setFormData(prev => ({ ...prev, message: result.coverLetter }));
      }
    } catch (err) {
      console.error("Failed to generate cover letter:", err);
      alert("Failed to generate cover letter. Please ensure Groq API key is configured.");
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !resumeFile) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const resumeBase64 = await fileToDataUrl(resumeFile);

      await api.createApplication({
        jobId: job.id,
        jobTitle: job.title,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        linkedin: formData.linkedin,
        portfolio: formData.portfolio,
        experience: formData.experience,
        skills: formData.skills,
        message: formData.message,
        resumeBase64,
        resumeName: resumeFile.name,
        resumeContentType: resumeFile.type || undefined,
      });

      setIsSuccess(true);
    } catch (error) {
      console.error("[job-details] Application submit failed", error);
      const message =
        error instanceof ApiError
          ? error.message
          : "Failed to submit application. Please try again.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title={`${job.title} | Careers | EVOLW`}
        description={
          richTextToPlain(job.description).slice(0, 160) ||
          `Apply for ${job.title} at EVOLW — ${job.department}, ${job.location}, ${job.type}.`
        }
        path={`/careers/${job.id}`}
        keywords={[job.title, job.department, "EVOLW careers", "software jobs"]}
        jsonLd={[
          jobPostingSchema({
            id: job.id,
            title: job.title,
            description: richTextToPlain(job.description) || job.title,
            location: job.location,
            type: job.type,
            department: job.department,
            datePosted: job.createdAt?.split("T")[0],
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Careers", path: "/careers" },
            { name: job.title, path: `/careers/${job.id}` },
          ]),
        ]}
      />

      <div className="min-h-screen pt-32 pb-20 bg-evolw-gray-50 dark:bg-evolw-black">
        <Container>
          <div className="max-w-4xl mx-auto">
            <Link
              to="/careers"
              className="inline-flex items-center text-sm font-medium text-evolw-gray-500 hover:text-evolw-accent transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to all roles
            </Link>

            <div className="bg-white dark:bg-evolw-slate rounded-3xl p-8 md:p-12 shadow-sm border border-evolw-gray-200 dark:border-white/5 mb-8">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                <div>
                  <h1 className="text-3xl md:text-5xl font-bold mb-4">{job.title}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-evolw-gray-600 dark:text-evolw-gray-400">
                    <span className="flex items-center bg-evolw-gray-100 dark:bg-white/10 px-3 py-1.5 rounded-full text-evolw-gray-900 dark:text-white">
                      <Briefcase className="w-4 h-4 mr-2 text-evolw-accent" />
                      {job.department}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {job.location}
                    </span>
                    <span className="flex items-center">• {job.type}</span>
                  </div>
                </div>
                <Button
                  size="lg"
                  variant="accent"
                  className="w-full md:w-auto"
                  onClick={() =>
                    document.getElementById("apply-form")?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Apply for this role
                </Button>
              </div>

              <div className="max-w-none">
                <RichText
                  html={job.description}
                  className="text-lg md:text-xl text-evolw-gray-700 dark:text-evolw-gray-300"
                />
              </div>
            </div>

            <div
              id="apply-form"
              className="bg-white dark:bg-evolw-slate rounded-3xl p-8 md:p-12 shadow-sm border border-evolw-gray-200 dark:border-white/5 scroll-mt-32"
            >
              <h2 className="text-2xl font-bold mb-2">Submit your application</h2>
              <p className="text-evolw-gray-500 mb-8">Apply for {job.title}</p>

              {isSuccess ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-bold mb-2">Application Submitted!</h3>
                  <p className="text-evolw-gray-600 dark:text-evolw-gray-400 max-w-md">
                    Thank you for applying to EVOLW. We have successfully received your application
                    and resume. Our team will review your profile and get back to you soon.
                  </p>
                  <Button asChild variant="outline" className="mt-8 rounded-xl">
                    <Link to="/careers">Explore other roles</Link>
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {submitError && (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm font-medium">
                      {submitError}
                    </div>
                  )}

                  <div className="space-y-2 mb-8">
                    <label className="text-sm font-medium">Resume / CV *</label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
                        errors.resume
                          ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                          : "border-evolw-gray-300 dark:border-white/10 hover:border-evolw-accent hover:bg-blue-50 dark:hover:bg-blue-900/10 bg-evolw-gray-50 dark:bg-white/5"
                      }`}
                    >
                      <input
                        type="file"
                        name="attachment"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx"
                      />
                      <div className="w-12 h-12 rounded-full bg-white dark:bg-evolw-black shadow-sm flex items-center justify-center mb-4 text-evolw-accent">
                        {isParsing ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Upload className="w-5 h-5" />
                        )}
                      </div>
                      <p className="font-semibold mb-1 text-center">
                        {isParsing ? "Analyzing resume..." : resumeFile ? resumeFile.name : "Click to upload your resume"}
                      </p>
                      <p className="text-sm text-evolw-gray-500 text-center">
                        {isParsing 
                          ? "Extracting details..."
                          : resumeFile
                          ? `${(resumeFile.size / 1024 / 1024).toFixed(2)} MB`
                          : "PDF, DOC, or DOCX (Max 4MB)"}
                      </p>
                    </div>
                    {errors.resume && <p className="text-red-500 text-xs mt-1">{errors.resume}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Full Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (errors.name) setErrors({ ...errors, name: "" });
                        }}
                        className={`w-full px-4 py-3 rounded-xl border bg-evolw-gray-50 dark:bg-evolw-black focus:ring-2 focus:ring-evolw-accent outline-none ${
                          errors.name ? "border-red-500" : "border-transparent dark:border-white/10"
                        }`}
                      />
                      {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email Address *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          if (errors.email) setErrors({ ...errors, email: "" });
                        }}
                        className={`w-full px-4 py-3 rounded-xl border bg-evolw-gray-50 dark:bg-evolw-black focus:ring-2 focus:ring-evolw-accent outline-none ${
                          errors.email ? "border-red-500" : "border-transparent dark:border-white/10"
                        }`}
                      />
                      {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-transparent dark:border-white/10 bg-evolw-gray-50 dark:bg-evolw-black focus:ring-2 focus:ring-evolw-accent outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Years of Experience</label>
                      <input
                        type="text"
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-transparent dark:border-white/10 bg-evolw-gray-50 dark:bg-evolw-black focus:ring-2 focus:ring-evolw-accent outline-none"
                        placeholder="e.g. 3 years"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Skills</label>
                    <input
                      type="text"
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-transparent dark:border-white/10 bg-evolw-gray-50 dark:bg-evolw-black focus:ring-2 focus:ring-evolw-accent outline-none"
                      placeholder="e.g. React, TypeScript, Node.js"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">LinkedIn Profile URL (Optional)</label>
                      <input
                        type="url"
                        value={formData.linkedin}
                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-transparent dark:border-white/10 bg-evolw-gray-50 dark:bg-evolw-black focus:ring-2 focus:ring-evolw-accent outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Portfolio / GitHub URL (Optional)</label>
                      <input
                        type="url"
                        value={formData.portfolio}
                        onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-transparent dark:border-white/10 bg-evolw-gray-50 dark:bg-evolw-black focus:ring-2 focus:ring-evolw-accent outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Cover Letter / Message (Optional)</label>
                      <button
                        type="button"
                        onClick={handleGenerateCoverLetter}
                        disabled={isGeneratingCoverLetter || !formData.name}
                        className={`text-xs font-medium flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors ${
                          formData.name 
                            ? "bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50" 
                            : "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-white/5 dark:text-gray-600"
                        }`}
                      >
                        {isGeneratingCoverLetter ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3" />
                            Generate with AI
                          </>
                        )}
                      </button>
                    </div>
                    <textarea
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-transparent dark:border-white/10 bg-evolw-gray-50 dark:bg-evolw-black focus:ring-2 focus:ring-evolw-accent outline-none resize-none"
                    ></textarea>
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      size="lg"
                      variant="accent"
                      className="w-full md:w-auto px-12 rounded-xl"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Uploading..." : "Submit Application"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}
