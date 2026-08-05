import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { SEO } from "../../components/common/seo";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { api, ApiError } from "../../lib/api";
import { ThemeToggle } from "../../components/theme-toggle";

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
      <SEO title="Admin Login | EVOLW" path="/admin" noindex nofollow />
      <div className="min-h-[100dvh] flex items-center justify-center bg-evolw-gray-50 dark:bg-evolw-black p-4 sm:p-6 relative overflow-hidden text-evolw-black dark:text-white">
        <div className="absolute top-4 right-4 z-20">
          <ThemeToggle />
        </div>

        <div className="absolute top-0 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-evolw-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 sm:w-96 h-72 sm:h-96 bg-blue-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="w-full max-w-md relative z-10 flex flex-col items-center">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium text-evolw-gray-600 dark:text-evolw-gray-400 hover:text-evolw-accent dark:hover:text-white transition-colors mb-6 group bg-white/70 dark:bg-white/5 backdrop-blur-md px-4 sm:px-5 py-2.5 rounded-full border border-evolw-gray-200 dark:border-white/10 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Website
          </Link>

          <div className="w-full bg-white dark:bg-evolw-slate rounded-2xl sm:rounded-[2rem] shadow-2xl p-6 sm:p-10 border border-evolw-gray-200 dark:border-white/10 backdrop-blur-xl">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 tracking-tight text-evolw-black dark:text-white">
                EVOLW Admin
              </h1>
              <p className="text-evolw-gray-500 dark:text-evolw-gray-400 text-sm sm:text-base">
                Sign in to manage your platform
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-evolw-gray-700 dark:text-evolw-gray-300">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="username"
                  className="w-full px-4 py-3 rounded-xl bg-evolw-gray-50 dark:bg-evolw-black border border-evolw-gray-200 dark:border-white/10 focus:ring-2 focus:ring-evolw-accent focus:border-transparent outline-none transition-all disabled:opacity-50 text-evolw-black dark:text-white"
                  placeholder="admin@evolw.in"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-evolw-gray-700 dark:text-evolw-gray-300">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  className="w-full px-4 py-3 rounded-xl bg-evolw-gray-50 dark:bg-evolw-black border border-evolw-gray-200 dark:border-white/10 focus:ring-2 focus:ring-evolw-accent focus:border-transparent outline-none transition-all disabled:opacity-50 text-evolw-black dark:text-white"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full flex items-center justify-center bg-evolw-black dark:bg-white text-white dark:text-evolw-black py-3.5 sm:py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
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

            <div className="mt-6 sm:mt-8 text-center text-sm text-evolw-gray-500 dark:text-evolw-gray-400">
              <p>Secure connection established.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
