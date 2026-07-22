// frontend/src/pages/AdminLogin.jsx
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { loginAdmin } from "../utils/quizStore";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Load saved email if remember me was checked
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const validateEmail = (value) => {
    if (!value) {
      setEmailError("Email is required");
      return false;
    } else if (!/\S+@\S+\.\S+/.test(value)) {
      setEmailError("Please enter a valid email");
      return false;
    } else {
      setEmailError("");
      return true;
    }
  };

  const validatePassword = (value) => {
    if (!value) {
      setPasswordError("Password is required");
      return false;
    } else if (value.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return false;
    } else {
      setPasswordError("");
      return true;
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (focusedField === "email") validateEmail(value);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (focusedField === "password") validatePassword(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isEmailValid || !isPasswordValid) {
      setError("Please fix the errors before continuing");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await loginAdmin(email, password);
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
      setLocation("/admin");
    } catch (err) {
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
        
        {/* Floating Shapes */}
        <div className="absolute top-20 left-10 w-16 h-16 border-4 border-indigo-500/20 rounded-full animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute bottom-20 right-10 w-12 h-12 border-4 border-purple-500/20 rounded-lg rotate-45 animate-float" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/3 right-20 w-8 h-8 border-4 border-violet-500/20 rounded-full animate-float" style={{ animationDelay: '3s' }}></div>
        <div className="absolute bottom-1/3 left-20 w-10 h-10 border-4 border-fuchsia-500/20 rounded-lg rotate-12 animate-float" style={{ animationDelay: '4.5s' }}></div>
        
        {/* Stars/Dots */}
        <div className="absolute top-40 left-1/4 w-1 h-1 bg-white/20 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
        <div className="absolute bottom-60 right-1/3 w-1.5 h-1.5 bg-white/20 rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
        <div className="absolute top-60 right-1/4 w-1 h-1 bg-white/20 rounded-full animate-ping" style={{ animationDuration: '3.5s', animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 left-1/3 w-1.5 h-1.5 bg-white/20 rounded-full animate-ping" style={{ animationDuration: '4.5s', animationDelay: '3s' }}></div>
      </div>

      {/* Main Card Container */}
      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-500 shadow-2xl shadow-indigo-500/25 mb-4 relative group">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-500 animate-pulse-slow opacity-50"></div>
            <svg className="w-10 h-10 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Admin Panel</h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">QuizMaster Administration</p>
        </div>

        {/* Glassmorphism Login Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 p-8 relative overflow-hidden">
          {/* Card Glow Effect */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl"></div>
          
          {/* Welcome Text */}
          <div className="mb-8 relative z-10">
            <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
            <p className="text-slate-400 text-sm mt-1">Sign in to access the Admin Dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2" htmlFor="admin-email">
                Email Address
              </label>
              <div className={`relative group transition-all duration-300 ${
                focusedField === "email" ? "scale-[1.02]" : ""
              }`}>
                <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                  focusedField === "email" ? "bg-indigo-500/20 blur-xl" : ""
                }`}></div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className={`w-5 h-5 transition-colors duration-300 ${
                      focusedField === "email" ? "text-indigo-400" : "text-slate-500"
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="admin-email"
                    data-testid="input-admin-email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => {
                      setFocusedField(null);
                      validateEmail(email);
                    }}
                    placeholder="admin@gmail.com"
                    required
                    className={`w-full pl-12 pr-4 py-3.5 bg-white/5 border-2 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-all duration-300 ${
                      focusedField === "email" 
                        ? "border-indigo-500 shadow-lg shadow-indigo-500/25 bg-white/10" 
                        : emailError 
                          ? "border-red-500/50 hover:border-red-500" 
                          : "border-white/10 hover:border-white/20"
                    }`}
                  />
                  {email && !emailError && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {emailError && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
              {emailError && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1 animate-shake">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {emailError}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2" htmlFor="admin-password">
                Password
              </label>
              <div className={`relative group transition-all duration-300 ${
                focusedField === "password" ? "scale-[1.02]" : ""
              }`}>
                <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                  focusedField === "password" ? "bg-indigo-500/20 blur-xl" : ""
                }`}></div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className={`w-5 h-5 transition-colors duration-300 ${
                      focusedField === "password" ? "text-indigo-400" : "text-slate-500"
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="admin-password"
                    data-testid="input-admin-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => {
                      setFocusedField(null);
                      validatePassword(password);
                    }}
                    placeholder="Enter password"
                    required
                    className={`w-full pl-12 pr-14 py-3.5 bg-white/5 border-2 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-all duration-300 ${
                      focusedField === "password" 
                        ? "border-indigo-500 shadow-lg shadow-indigo-500/25 bg-white/10" 
                        : passwordError 
                          ? "border-red-500/50 hover:border-red-500" 
                          : "border-white/10 hover:border-white/20"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              {passwordError && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1 animate-shake">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {passwordError}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-md border-2 transition-all duration-300 flex items-center justify-center ${
                    rememberMe 
                      ? "bg-indigo-500 border-indigo-500" 
                      : "border-white/20 group-hover:border-white/40 bg-white/5"
                  }`}>
                    {rememberMe && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-slate-400 group-hover:text-white transition-colors">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                onClick={() => {
                  // Forgot password functionality
                  alert("Please contact admin@quizmaster.com to reset your password");
                }}
              >
                Forgot Password?
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div data-testid="admin-login-error" className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-shake">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Authentication Failed</p>
                  <p className="text-red-400/80 text-xs">{error}</p>
                </div>
              </div>
            )}

            {/* Login Button */}
            <button
              data-testid="btn-admin-login"
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500 text-white font-bold rounded-2xl hover:from-indigo-600 hover:via-purple-600 hover:to-violet-600 transition-all duration-500 shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-base relative overflow-hidden group"
            >
              {/* Shine effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="relative z-10">Authenticating...</span>
                </>
              ) : (
                <>
                  <span className="relative z-10">Sign In</span>
                  <svg className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center relative z-10">
            <a href="/" className="text-sm text-slate-400 hover:text-white transition-colors font-medium inline-flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Quiz System
            </a>
          </div>
        </div>

        {/* Secure Footer */}
        <p className="text-center text-slate-500 text-xs mt-6 flex items-center justify-center gap-2">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Secure Administrative Access
        </p>
      </div>
    </div>
  );
}