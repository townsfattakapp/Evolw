import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { SEO } from "../components/common/seo";
import { Container } from "../components/ui/container";
import { Button } from "../components/ui/button";
import { RichText } from "../components/ui/rich-text";
import {
  ArrowLeft, Briefcase, MapPin, CheckCircle, Upload, Sparkles, Loader2,
  Clock, User, Mail, Phone, Link2, Globe, Star, FileText, Send,
  Zap, ChevronRight
} from "lucide-react";
import { api, ApiError, fileToDataUrl, type Job } from "../lib/api";
import { richTextToPlain } from "../lib/richText";
import { breadcrumbSchema, jobPostingSchema } from "../lib/seo/schema";
import { extractPdfText } from "../lib/extract-pdf-text";
import { ensureReadableStreamAsyncIterator } from "../lib/readable-stream-async-iterator";

if (typeof window !== "undefined") {
  ensureReadableStreamAsyncIterator();
}

function InputField({
  label,
  icon,
  required,
  error,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-semibold text-evolw-gray-700 dark:text-evolw-gray-300">
        {icon && <span className="text-evolw-accent">{icon}</span>}
        {label}
        {required && <span className="text-evolw-accent">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-red-500 text-xs flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass = (hasError?: boolean) =>
  `w-full px-4 py-3 rounded-xl border text-sm bg-white dark:bg-evolw-black/60 focus:ring-2 focus:ring-evolw-accent/50 outline-none transition-all placeholder:text-evolw-gray-400 ${
    hasError
      ? "border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/10"
      : "border-evolw-gray-200 dark:border-white/10 hover:border-evolw-gray-300 dark:hover:border-white/20 focus:border-evolw-accent"
  }`;

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
  const [parseSuccess, setParseSuccess] = useState(false);

  useEffect(() => {
    if (hash === "#apply") {
      setTimeout(() => {
        document.getElementById("apply-form")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [hash, job]);

  useEffect(() => {
    const load = async () => {
      if (!id) { setIsLoading(false); return; }
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
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-evolw-accent" />
          <p className="text-evolw-gray-500 font-medium">Loading role...</p>
        </div>
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
      setParseSuccess(false);
      if (errors.resume) setErrors({ ...errors, resume: "" });

      try {
        setIsParsing(true);
        let resumeText = "";

        if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
          const arrayBuffer = await file.arrayBuffer();
          resumeText = await extractPdfText(arrayBuffer, 5);
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
            setParseSuccess(true);
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
        jobDescription: typeof job.description === "string" ? job.description : richTextToPlain(job.description),
        department: job.department,
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
      const message = error instanceof ApiError ? error.message : "Failed to submit application. Please try again.";
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

      <div className="min-h-screen pt-28 pb-24 bg-gradient-to-br from-evolw-gray-50 via-white to-blue-50/30 dark:from-evolw-black dark:via-evolw-black dark:to-blue-950/10">
        <Container>
          <div className="max-w-5xl mx-auto">

            {/* Back link */}
            <Link
              to="/careers"
              className="inline-flex items-center gap-2 text-sm font-medium text-evolw-gray-500 hover:text-evolw-accent transition-colors mb-8 group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back to all roles
            </Link>

            {/* ── Job Header Card ── */}
            <div className="relative overflow-hidden bg-white dark:bg-evolw-slate rounded-3xl shadow-xl shadow-black/5 dark:shadow-black/30 border border-evolw-gray-100 dark:border-white/5 mb-6">
              {/* Top gradient stripe */}
              <div className="h-1.5 w-full bg-gradient-to-r from-evolw-accent via-blue-500 to-purple-500" />

              <div className="p-8 md:p-12">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                  <div className="flex-1 min-w-0">
                    {/* Role badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-evolw-accent/10 text-evolw-accent rounded-full text-xs font-semibold mb-4 uppercase tracking-wide">
                      <Briefcase className="w-3.5 h-3.5" />
                      {job.department}
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                      {job.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-evolw-gray-100 dark:bg-white/10 rounded-full font-medium text-evolw-gray-700 dark:text-evolw-gray-200">
                        <MapPin className="w-3.5 h-3.5 text-evolw-accent" />
                        {job.location}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-evolw-gray-100 dark:bg-white/10 rounded-full font-medium text-evolw-gray-700 dark:text-evolw-gray-200">
                        <Clock className="w-3.5 h-3.5 text-purple-500" />
                        {job.type}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 lg:min-w-[200px]">
                    <Button
                      size="lg"
                      variant="accent"
                      className="w-full rounded-2xl font-semibold shadow-lg shadow-evolw-accent/20 hover:shadow-evolw-accent/40 transition-shadow"
                      onClick={() =>
                        document.getElementById("apply-form")?.scrollIntoView({ behavior: "smooth" })
                      }
                    >
                      Apply Now
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                    <p className="text-xs text-center text-evolw-gray-400 dark:text-evolw-gray-500">
                      Takes less than 2 minutes
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="my-8 border-t border-evolw-gray-100 dark:border-white/5" />

                {/* Job description */}
                <div className="max-w-none">
                  <RichText
                    html={job.description}
                    className="text-base md:text-lg text-evolw-gray-700 dark:text-evolw-gray-300 leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* ── Application Form ── */}
            <div
              id="apply-form"
              className="relative overflow-hidden bg-white dark:bg-evolw-slate rounded-3xl shadow-xl shadow-black/5 dark:shadow-black/30 border border-evolw-gray-100 dark:border-white/5 scroll-mt-32"
            >
              {/* Top gradient stripe */}
              <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 via-evolw-accent to-blue-500" />

              <div className="p-8 md:p-12">
                {/* Form header */}
                <div className="mb-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded-full text-xs font-semibold mb-4 uppercase tracking-wide">
                    <Star className="w-3.5 h-3.5" />
                    AI-Powered Application
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">
                    Submit your application
                  </h2>
                  <p className="text-evolw-gray-500 dark:text-evolw-gray-400">
                    Applying for <span className="font-semibold text-evolw-gray-700 dark:text-evolw-gray-200">{job.title}</span> · Upload your resume and our AI will auto-fill the form for you.
                  </p>
                </div>

                {isSuccess ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center">
                    <div className="relative mb-8">
                      <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-xl shadow-green-500/30">
                        <CheckCircle className="w-12 h-12 text-white" />
                      </div>
                      <div className="absolute inset-0 bg-green-400/20 rounded-full animate-ping" />
                    </div>
                    <h3 className="text-3xl md:text-4xl font-extrabold mb-3 bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                      Application Submitted!
                    </h3>
                    <p className="text-evolw-gray-500 dark:text-evolw-gray-400 max-w-md text-base leading-relaxed mb-8">
                      Thank you for applying to EVOLW. We've received your application and resume. Our team will review your profile and be in touch soon.
                    </p>
                    <Button asChild variant="outline" className="rounded-2xl px-8">
                      <Link to="/careers">Explore other roles</Link>
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {submitError && (
                      <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm font-medium flex items-start gap-3">
                        <span className="mt-0.5 flex-shrink-0 w-5 h-5 bg-red-100 dark:bg-red-800/40 rounded-full flex items-center justify-center text-red-600 dark:text-red-300 text-xs font-bold">!</span>
                        {submitError}
                      </div>
                    )}

                    {/* ─── Step 1: Resume Upload ─── */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-7 h-7 rounded-full bg-evolw-accent text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                        <div>
                          <p className="font-semibold text-sm text-evolw-gray-800 dark:text-white">Upload Resume</p>
                          <p className="text-xs text-evolw-gray-400">AI will instantly extract your details</p>
                        </div>
                        {parseSuccess && (
                          <div className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Auto-filled!
                          </div>
                        )}
                      </div>

                      <div
                        onClick={() => !isParsing && fileInputRef.current?.click()}
                        className={`relative w-full rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
                          errors.resume
                            ? "border-red-400 bg-red-50 dark:bg-red-900/10"
                            : isParsing
                            ? "border-evolw-accent/50 bg-evolw-accent/5 dark:bg-evolw-accent/10"
                            : resumeFile
                            ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/10"
                            : "border-evolw-gray-200 dark:border-white/10 hover:border-evolw-accent/60 hover:bg-evolw-accent/5 dark:hover:bg-evolw-accent/10 bg-evolw-gray-50 dark:bg-white/5"
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
                        <div className="flex flex-col sm:flex-row items-center gap-4 p-6 sm:p-8">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                            isParsing
                              ? "bg-evolw-accent text-white"
                              : resumeFile
                              ? "bg-emerald-500 text-white"
                              : "bg-white dark:bg-evolw-black text-evolw-accent"
                          }`}>
                            {isParsing ? (
                              <Loader2 className="w-6 h-6 animate-spin" />
                            ) : resumeFile ? (
                              <FileText className="w-6 h-6" />
                            ) : (
                              <Upload className="w-6 h-6" />
                            )}
                          </div>
                          <div className="text-center sm:text-left flex-1">
                            <p className="font-semibold text-sm mb-0.5">
                              {isParsing
                                ? "Analyzing your resume with AI..."
                                : resumeFile
                                ? resumeFile.name
                                : "Click to upload your resume"}
                            </p>
                            <p className="text-xs text-evolw-gray-500 dark:text-evolw-gray-400">
                              {isParsing
                                ? "Extracting name, email, skills & experience..."
                                : resumeFile
                                ? `${(resumeFile.size / 1024 / 1024).toFixed(2)} MB · Click to replace`
                                : "PDF, DOC, or DOCX · Max 4MB"}
                            </p>
                          </div>
                          {!isParsing && (
                            <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-evolw-accent bg-evolw-accent/10 px-3 py-1.5 rounded-full">
                              <Zap className="w-3 h-3" />
                              AI Auto-fill
                            </div>
                          )}
                        </div>
                      </div>
                      {errors.resume && (
                        <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                          <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                          {errors.resume}
                        </p>
                      )}
                    </div>

                    {/* ─── Step 2: Personal Info ─── */}
                    <div>
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                        <div>
                          <p className="font-semibold text-sm text-evolw-gray-800 dark:text-white">Personal Information</p>
                          <p className="text-xs text-evolw-gray-400">Auto-filled from your resume · Edit if needed</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <InputField label="Full Name" icon={<User className="w-3.5 h-3.5" />} required error={errors.name}>
                          <input
                            type="text"
                            value={formData.name}
                            placeholder="John Doe"
                            onChange={(e) => {
                              setFormData({ ...formData, name: e.target.value });
                              if (errors.name) setErrors({ ...errors, name: "" });
                            }}
                            className={inputClass(!!errors.name)}
                          />
                        </InputField>

                        <InputField label="Email Address" icon={<Mail className="w-3.5 h-3.5" />} required error={errors.email}>
                          <input
                            type="email"
                            value={formData.email}
                            placeholder="john@example.com"
                            onChange={(e) => {
                              setFormData({ ...formData, email: e.target.value });
                              if (errors.email) setErrors({ ...errors, email: "" });
                            }}
                            className={inputClass(!!errors.email)}
                          />
                        </InputField>

                        <InputField label="Phone Number" icon={<Phone className="w-3.5 h-3.5" />}>
                          <input
                            type="tel"
                            value={formData.phone}
                            placeholder="+91 98765 43210"
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className={inputClass()}
                          />
                        </InputField>

                        <InputField label="Years of Experience" icon={<Star className="w-3.5 h-3.5" />}>
                          <input
                            type="text"
                            value={formData.experience}
                            placeholder="e.g. 3 years"
                            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                            className={inputClass()}
                          />
                        </InputField>
                      </div>
                    </div>

                    {/* ─── Step 3: Skills & Links ─── */}
                    <div>
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-7 h-7 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                        <div>
                          <p className="font-semibold text-sm text-evolw-gray-800 dark:text-white">Skills & Profiles</p>
                          <p className="text-xs text-evolw-gray-400">Your technical stack and online presence</p>
                        </div>
                      </div>

                      <div className="space-y-5">
                        <InputField label="Skills" icon={<Zap className="w-3.5 h-3.5" />}>
                          <input
                            type="text"
                            value={formData.skills}
                            placeholder="e.g. React, TypeScript, Node.js, PostgreSQL"
                            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                            className={inputClass()}
                          />
                        </InputField>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <InputField label="LinkedIn Profile" icon={<Link2 className="w-3.5 h-3.5" />}>
                            <input
                              type="url"
                              value={formData.linkedin}
                              placeholder="https://linkedin.com/in/you"
                              onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                              className={inputClass()}
                            />
                          </InputField>

                          <InputField label="Portfolio / GitHub" icon={<Globe className="w-3.5 h-3.5" />}>
                            <input
                              type="url"
                              value={formData.portfolio}
                              placeholder="https://github.com/you"
                              onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                              className={inputClass()}
                            />
                          </InputField>
                        </div>
                      </div>
                    </div>

                    {/* ─── Step 4: Cover Letter ─── */}
                    <div>
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-7 h-7 rounded-full bg-pink-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                        <div>
                          <p className="font-semibold text-sm text-evolw-gray-800 dark:text-white">Cover Letter</p>
                          <p className="text-xs text-evolw-gray-400">Optional · Let our AI write one for you</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-semibold text-evolw-gray-700 dark:text-evolw-gray-300">
                            Cover Letter / Message <span className="text-evolw-gray-400 font-normal">(Optional)</span>
                          </label>
                          <button
                            type="button"
                            onClick={handleGenerateCoverLetter}
                            disabled={isGeneratingCoverLetter || !formData.name}
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                              formData.name
                                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 shadow-md shadow-purple-500/20 hover:shadow-purple-500/40"
                                : "bg-evolw-gray-100 text-evolw-gray-400 cursor-not-allowed dark:bg-white/5 dark:text-evolw-gray-600"
                            }`}
                          >
                            {isGeneratingCoverLetter ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Writing...
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
                          rows={6}
                          value={formData.message}
                          placeholder="Write a short introduction, or click 'Generate with AI' to let our AI craft a personalized cover letter based on your resume and the job description..."
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className={`${inputClass()} resize-none leading-relaxed`}
                        />
                        {formData.message && (
                          <p className="text-xs text-evolw-gray-400 text-right">{formData.message.length} characters</p>
                        )}
                      </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-2 border-t border-evolw-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <p className="text-xs text-evolw-gray-400 dark:text-evolw-gray-500 text-center sm:text-left">
                        By submitting, you agree that we may store your data for hiring purposes.
                      </p>
                      <Button
                        type="submit"
                        size="lg"
                        variant="accent"
                        className="w-full sm:w-auto px-10 rounded-2xl font-bold shadow-lg shadow-evolw-accent/20 hover:shadow-evolw-accent/40 transition-shadow"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Submit Application
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>

          </div>
        </Container>
      </div>
    </>
  );
}
