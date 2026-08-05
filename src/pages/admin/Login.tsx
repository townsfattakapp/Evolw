import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { SEO } from "../../components/common/seo";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { api, ApiError } from "../../lib/api";

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("evolw_admin_auth");
    if (isAuthenticated) {
      navigate("/admin/dashboard");
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);

    try {
      const data = await api.login(email, password);

      if (data.success && data.token) {
        localStorage.setItem("evolw_admin_auth", data.token);
        navigate("/admin/dashboard");
      } else {
        setError(data.error || "Invalid credentials.");
      }
    } catch (err) {
      console.error("[admin/login] Failed", err);
      setError(
        err instanceof ApiError
          ? err.message
          : "Network error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Admin Login | EVOLW" />
      <div className="min-h-screen flex items-center justify-center bg-evolw-gray-50 dark:bg-evolw-black p-4 relative overflow-hidden">
        
        {/* Aesthetic Background Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-evolw-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

        <div className="w-full max-w-md relative z-10 flex flex-col items-center">
          <Link to="/" className="inline-flex items-center text-sm font-medium text-evolw-gray-600 dark:text-evolw-gray-400 hover:text-evolw-accent dark:hover:text-white transition-colors mb-6 group bg-white/50 dark:bg-white/5 backdrop-blur-md px-5 py-2.5 rounded-full border border-evolw-gray-200 dark:border-white/10 shadow-sm">
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Website
          </Link>

          <div className="w-full bg-white dark:bg-evolw-slate rounded-[2rem] shadow-2xl p-10 border border-evolw-gray-200 dark:border-white/10 backdrop-blur-xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2 tracking-tight">EVOLW Admin</h1>
            <p className="text-evolw-gray-500">Sign in to manage your platform</p>
          </div>
          
          {/* Professional Inline Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center text-red-600 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-evolw-gray-700 dark:text-gray-300">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl bg-evolw-gray-50 dark:bg-evolw-black/50 border border-evolw-gray-200 dark:border-white/10 focus:ring-2 focus:ring-evolw-accent focus:border-transparent outline-none transition-all disabled:opacity-50"
                placeholder="admin@evolw.in"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-evolw-gray-700 dark:text-gray-300">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl bg-evolw-gray-50 dark:bg-evolw-black/50 border border-evolw-gray-200 dark:border-white/10 focus:ring-2 focus:ring-evolw-accent focus:border-transparent outline-none transition-all disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading || !email || !password}
              className="w-full flex items-center justify-center bg-evolw-black dark:bg-white text-white dark:text-evolw-black py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-evolw-gray-500">
            <p>Secure connection established.</p>
          </div>
          </div>
        </div>
      </div>
    </>
  );
}
