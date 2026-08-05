import React, { useState, useRef } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { SEO } from "../components/common/seo";
import { Container } from "../components/ui/container";
import { Button } from "../components/ui/button";
import { ArrowLeft, Briefcase, MapPin, CheckCircle, Upload } from "lucide-react";
import { useContent } from "../context/ContentContext";

export function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hash } = useLocation();
  const { content, isLoading } = useContent();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    linkedin: "",
    portfolio: "",
    message: ""
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto scroll to apply form if hash is #apply
  React.useEffect(() => {
    if (hash === '#apply') {
      setTimeout(() => {
        document.getElementById('apply-form')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [hash]);

  if (isLoading) {
    return <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">Loading...</div>;
  }

  const job = content.jobs?.find(j => j.id === id);

  if (!job) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl font-bold mb-4">Job Not Found</h1>
        <p className="text-evolw-gray-500 mb-8">This position may have been filled or no longer exists.</p>
        <Button onClick={() => navigate('/careers')}>Back to Careers</Button>
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check file size (max 5MB for FormSubmit)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, resume: "File is too large (max 5MB)" });
        return;
      }
      setResumeFile(file);
      if (errors.resume) {
        setErrors({ ...errors, resume: "" });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      // Step 1: Save metadata & File to the Admin CMS Database
      // Convert the file to Base64 so we can upload it as JSON
      let resumeBase64 = null;
      let resumeName = null;
      
      if (resumeFile) {
        resumeName = resumeFile.name;
        resumeBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(resumeFile);
        });
      }

      await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          jobTitle: job.title,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          linkedin: formData.linkedin,
          portfolio: formData.portfolio,
          message: formData.message,
          resumeAttached: resumeFile ? true : false,
          resumeBase64: resumeBase64,
          resumeName: resumeName
        })
      });

      // Step 2: Prepare FormData for FormSubmit API
      const submitData = new FormData();
      submitData.append("_subject", `New Job Application: ${job.title} - ${formData.name}`);
      submitData.append("_template", "table");
      submitData.append("_captcha", "false");
      submitData.append("Name", formData.name);
      submitData.append("Email", formData.email);
      submitData.append("Phone", formData.phone || "Not provided");
      submitData.append("LinkedIn", formData.linkedin || "Not provided");
      submitData.append("Portfolio", formData.portfolio || "Not provided");
      submitData.append("Cover Letter", formData.message || "Not provided");
      
      // CRITICAL: FormSubmit requires the file field to be named exactly "attachment"
      if (resumeFile) {
        submitData.append("attachment", resumeFile, resumeFile.name);
      }

      // Step 3: Send Email via FormSubmit AJAX API
      const emailResponse = await fetch("https://formsubmit.co/ajax/fattaksein@gmail.com", {
        method: "POST",
        headers: {
          "Accept": "application/json"
        },
        body: submitData
      });

      if (!emailResponse.ok) {
        throw new Error("Failed to send email application");
      }

      setIsSuccess(true);
      
    } catch (error) {
      console.error(error);
      alert("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <>
      <SEO title={`${job.title} | Careers | EVOLW`} description={`Apply for ${job.title} at EVOLW.`} />
      
      <div className="min-h-screen pt-32 pb-20 bg-evolw-gray-50 dark:bg-evolw-black">
        <Container>
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Link to="/careers" className="inline-flex items-center text-sm font-medium text-evolw-gray-500 hover:text-evolw-accent transition-colors mb-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to all roles
            </Link>

            {/* Job Header */}
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
                    <span className="flex items-center">
                      • {job.type}
                    </span>
                  </div>
                </div>
                <Button 
                  size="lg" 
                  variant="accent" 
                  className="w-full md:w-auto"
                  onClick={() => document.getElementById('apply-form')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Apply for this role
                </Button>
              </div>

              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-xl leading-relaxed text-evolw-gray-700 dark:text-evolw-gray-300">
                  {job.description}
                </p>
              </div>
            </div>

            {/* Application Form */}
            <div id="apply-form" className="bg-white dark:bg-evolw-slate rounded-3xl p-8 md:p-12 shadow-sm border border-evolw-gray-200 dark:border-white/5 scroll-mt-32">
              <h2 className="text-2xl font-bold mb-2">Submit your application</h2>
              <p className="text-evolw-gray-500 mb-8">Apply for {job.title}</p>

              {isSuccess ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-bold mb-2">Application Submitted!</h3>
                  <p className="text-evolw-gray-600 dark:text-evolw-gray-400 max-w-md">
                    Thank you for applying to EVOLW. We have successfully received your application and resume. Our team will review your profile and get back to you soon.
                  </p>
                  <Button asChild variant="outline" className="mt-8 rounded-xl">
                    <Link to="/careers">Explore other roles</Link>
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* File Upload Area */}
                  <div className="space-y-2 mb-8">
                    <label className="text-sm font-medium">Resume / CV *</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors ${errors.resume ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-evolw-gray-300 dark:border-white/10 hover:border-evolw-accent hover:bg-blue-50 dark:hover:bg-blue-900/10 bg-evolw-gray-50 dark:bg-white/5'}`}
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
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="font-semibold mb-1 text-center">
                        {resumeFile ? resumeFile.name : "Click to upload your resume"}
                      </p>
                      <p className="text-sm text-evolw-gray-500 text-center">
                        {resumeFile ? `${(resumeFile.size / 1024 / 1024).toFixed(2)} MB` : "PDF, DOC, or DOCX (Max 5MB)"}
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
                        className={`w-full px-4 py-3 rounded-xl border bg-evolw-gray-50 dark:bg-evolw-black focus:ring-2 focus:ring-evolw-accent outline-none ${errors.name ? 'border-red-500' : 'border-transparent dark:border-white/10'}`}
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
                        className={`w-full px-4 py-3 rounded-xl border bg-evolw-gray-50 dark:bg-evolw-black focus:ring-2 focus:ring-evolw-accent outline-none ${errors.email ? 'border-red-500' : 'border-transparent dark:border-white/10'}`}
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
                      <label className="text-sm font-medium">LinkedIn Profile URL (Optional)</label>
                      <input
                        type="url"
                        value={formData.linkedin}
                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-transparent dark:border-white/10 bg-evolw-gray-50 dark:bg-evolw-black focus:ring-2 focus:ring-evolw-accent outline-none"
                      />
                    </div>
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

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cover Letter / Message (Optional)</label>
                    <textarea
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-transparent dark:border-white/10 bg-evolw-gray-50 dark:bg-evolw-black focus:ring-2 focus:ring-evolw-accent outline-none resize-none"
                    ></textarea>
                  </div>

                  <div className="pt-4">
                    <Button type="submit" size="lg" variant="accent" className="w-full md:w-auto px-12 rounded-xl" disabled={isSubmitting}>
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
