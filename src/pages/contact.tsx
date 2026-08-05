import React, { useState } from "react";
import { SEO } from "../components/common/seo";
import { Container } from "../components/ui/container";
import { Button } from "../components/ui/button";
import { Phone, MapPin, Send } from "lucide-react";
import { motion } from "framer-motion";

const appleEase = [0.32, 0.72, 0, 1];

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 1.2, ease: appleEase }
};

const staggerContainer = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: "-100px" },
  transition: { staggerChildren: 0.15 }
};

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    help: "",
    message: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.message.trim()) newErrors.message = "Message is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      // Step 1: Send to Email via FormSubmit
      const emailResponse = await fetch("https://formsubmit.co/ajax/fattaksein@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          _subject: `New EVOLW Website Lead: ${formData.name}`,
          _template: "table",
          Name: formData.name,
          Email: formData.email,
          Phone: formData.phone || "Not provided",
          Service_Needed: formData.help || "Not specified",
          Message: formData.message
        })
      });

      if (!emailResponse.ok) {
        throw new Error("Form email submission failed");
      }

      // Step 2: Save to Local Admin CMS
      await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || "Not provided",
          service: formData.help || "Not specified",
          company: "Direct Lead",
          message: formData.message
        })
      });

      // Success
      setIsSuccess(true);
      setFormData({ name: "", email: "", phone: "", help: "", message: "" });
      
    } catch (error) {
      console.error("Failed to submit", error);
      alert("There was a problem sending your message. Please try again or contact us directly at +91 92092 50725.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: "" }));
    }
  };

  return (
    <>
      <SEO title="Contact | EVOLW" description="Let's build something meaningful together. Contact EVOLW." />
      
      <section className="pt-40 pb-32 md:pt-64 md:pb-48 bg-white dark:bg-black overflow-hidden relative">
        <Container className="relative z-10">
          <motion.div 
            className="text-center max-w-4xl mx-auto mb-20"
            initial="initial"
            animate="whileInView"
            variants={staggerContainer}
          >
            <motion.h1 variants={fadeInUp} className="text-6xl md:text-8xl lg:text-[7rem] font-bold tracking-tighter mb-8 text-black dark:text-white leading-[1.02]">
              Let's build something <span className="text-evolw-accent">meaningful.</span>
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-2xl md:text-3xl text-evolw-gray-500 font-medium tracking-tight max-w-3xl mx-auto leading-snug">
              Have a project in mind? Let's discuss how our engineering team can help bring your vision to life.
            </motion.p>
          </motion.div>

          <motion.div 
            initial="initial"
            whileInView="whileInView"
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8 items-start"
          >
            {/* Contact Information Cards */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div variants={fadeInUp} className="p-10 rounded-[2.5rem] bg-[#050505] text-white border border-white/10 flex items-start space-x-6 group hover:border-white/30 transition-all duration-500">
                <div className="p-4 bg-white/5 rounded-2xl">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-2xl mb-2 tracking-tighter">Call Us</h3>
                  <p className="text-white/60 font-medium text-lg">+91 92092 50725</p>
                </div>
              </motion.div>

              <motion.div variants={fadeInUp} className="p-10 rounded-[2.5rem] bg-evolw-gray-50 dark:bg-[#111] border border-black/5 dark:border-white/5 flex items-start space-x-6 group hover:border-black/20 dark:hover:border-white/20 transition-all duration-500">
                <div className="p-4 bg-white dark:bg-white/5 rounded-2xl shadow-sm dark:shadow-none">
                  <MapPin className="w-8 h-8 text-evolw-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-2xl mb-2 tracking-tighter text-black dark:text-white">Office</h3>
                  <p className="text-evolw-gray-500 font-medium text-lg leading-relaxed">
                    Waraseoni, Dist Balaghat<br/>
                    Madhya Pradesh, India<br/>
                    481331
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Glassmorphic Contact Form */}
            <motion.div variants={fadeInUp} className="lg:col-span-3 p-10 md:p-12 rounded-[2.5rem] bg-white dark:bg-[#111] border border-black/5 dark:border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-evolw-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
              
              <div className="relative z-10">
                <h2 className="text-4xl font-bold tracking-tighter mb-8 text-black dark:text-white">Send a message</h2>
                
                {isSuccess ? (
                  <div className="p-12 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-[2rem] text-center">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-800/40 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Send className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-3xl font-bold text-green-800 dark:text-green-400 mb-4 tracking-tighter">Message Received</h3>
                    <p className="text-green-600 dark:text-green-300 font-medium text-lg">Thank you for reaching out. Our engineering team will get back to you shortly.</p>
                    <Button onClick={() => setIsSuccess(false)} variant="outline" className="mt-8 rounded-full">Send another message</Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-evolw-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Full Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className={`w-full px-5 py-4 rounded-xl bg-evolw-gray-50 dark:bg-black border ${errors.name ? 'border-red-300 focus:ring-red-500' : 'border-black/5 dark:border-white/10 focus:ring-black dark:focus:ring-white'} focus:ring-2 focus:border-transparent outline-none transition-all text-lg`} placeholder="John Doe" />
                        {errors.name && <p className="mt-2 text-sm text-red-500 font-medium">{errors.name}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-evolw-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Email Address</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className={`w-full px-5 py-4 rounded-xl bg-evolw-gray-50 dark:bg-black border ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-black/5 dark:border-white/10 focus:ring-black dark:focus:ring-white'} focus:ring-2 focus:border-transparent outline-none transition-all text-lg`} placeholder="john@example.com" />
                        {errors.email && <p className="mt-2 text-sm text-red-500 font-medium">{errors.email}</p>}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-evolw-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Phone Number <span className="text-evolw-gray-400 font-normal">(Optional)</span></label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-5 py-4 rounded-xl bg-evolw-gray-50 dark:bg-black border border-black/5 dark:border-white/10 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-none transition-all text-lg" placeholder="+1 (555) 000-0000" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-evolw-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">How can we help?</label>
                        <select name="help" value={formData.help} onChange={handleChange} className="w-full px-5 py-4 rounded-xl bg-evolw-gray-50 dark:bg-black border border-black/5 dark:border-white/10 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-none transition-all text-lg appearance-none">
                          <option value="">Select an option</option>
                          <option value="Software Development">Software Development</option>
                          <option value="Web Applications">Web Applications</option>
                          <option value="Product Engineering">Product Engineering</option>
                          <option value="Tech Consulting">Tech Consulting</option>
                          <option value="Careers">Careers</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-evolw-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Message</label>
                      <textarea name="message" value={formData.message} onChange={handleChange} rows={5} className={`w-full px-5 py-4 rounded-xl bg-evolw-gray-50 dark:bg-black border ${errors.message ? 'border-red-300 focus:ring-red-500' : 'border-black/5 dark:border-white/10 focus:ring-black dark:focus:ring-white'} focus:ring-2 focus:border-transparent outline-none transition-all resize-none text-lg`} placeholder="Tell us about your project or inquiry..."></textarea>
                      {errors.message && <p className="mt-2 text-sm text-red-500 font-medium">{errors.message}</p>}
                    </div>
                    
                    <Button type="submit" size="lg" disabled={isSubmitting} className="w-full h-16 text-lg rounded-full bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 transition-all font-bold">
                      {isSubmitting ? "Sending Request..." : "Send Message"}
                    </Button>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </section>
    </>
  );
}
