// frontend/src/pages/BulkImportQuestions.jsx
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getCourses, logoutAdmin } from "../utils/quizStore";

export default function BulkImportQuestions() {
  const [, setLocation] = useLocation();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [importMethod, setImportMethod] = useState("excel");
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("");
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await getCourses();
        setCourses(data);
      } catch (err) {
        console.error("Error loading courses:", err);
        setError("Failed to load courses");
      }
    };
    loadCourses();

    // Set greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    // Update time
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit'
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const selectedCourseData = courses.find(c => (c._id || c.id) === selectedCourse);
  const subjects = selectedCourseData?.subjects || [];

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setError("");
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/questions/template`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to download template');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mcq_template.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download template: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSubject) {
      setError("Please select a subject");
      return;
    }
    if (!file) {
      setError("Please upload a file");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setProgress(10);

    const formData = new FormData();
    formData.append("subjectId", selectedSubject);
    formData.append("file", file);

    try {
      setProgress(30);
      
      const endpoint = importMethod === "excel" 
        ? "/admin/questions/bulk-upload" 
        : "/admin/questions/ai-import";
      
      setProgress(50);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      setProgress(80);
      
      const data = await response.json();
      
      setProgress(100);
      
      if (data.success) {
        setResult(data.data);
        setFile(null);
        // Reset file input
        document.getElementById('file-upload').value = '';
      } else {
        setError(data.message || "Import failed");
        if (data.errors) {
          setError(data.message + "\n\nErrors:\n" + data.errors.join('\n'));
        }
      }
    } catch (err) {
      setError("Failed to import questions. Please try again. Error: " + err.message);
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 3000);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setLocation("/admin-login");
  };

  const getFileAccept = () => {
    if (importMethod === "excel") {
      return ".xlsx,.xls,.csv";
    }
    return ".pdf,.docx,.txt,.png,.jpg,.jpeg,.csv,.xlsx";
  };

  const getFileHint = () => {
    if (importMethod === "excel") {
      return "Excel files (.xlsx, .xls, .csv)";
    }
    return "PDF, Word, Image, Text, or Excel files";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setLocation("/admin")} 
                className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors group"
              >
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">Dashboard</span>
              </button>
              <span className="text-gray-300">/</span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Bulk Import Questions
                  </h1>
                  <p className="text-xs text-gray-500 font-medium">Upload MCQ files in bulk</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-xl">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-mono font-medium text-gray-700">{currentTime}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium rounded-xl hover:from-red-600 hover:to-rose-600 transition-all shadow-lg shadow-red-500/25"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Greeting Banner */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-emerald-500/25">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse-slow"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <h2 className="text-2xl font-black tracking-tight">
                  {greeting}! 📤
                </h2>
                <p className="text-emerald-100 mt-1">
                  Import multiple MCQs at once using file upload
                </p>
              </div>
              <button
                onClick={handleDownloadTemplate}
                className="mt-3 sm:mt-0 flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/30 transition-all text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Template
              </button>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">Import MCQs</h2>
              <p className="text-gray-500 text-sm mt-1">Upload Excel, PDF, Word, or Image files with MCQs</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Import Method */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Import Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setImportMethod("excel")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    importMethod === "excel" 
                      ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20" 
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">📊</div>
                    <p className="font-semibold text-gray-800">Excel/CSV</p>
                    <p className="text-xs text-gray-500">Structured format</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setImportMethod("ai")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    importMethod === "ai" 
                      ? "border-purple-500 bg-purple-50 ring-2 ring-purple-500/20" 
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">🤖</div>
                    <p className="font-semibold text-gray-800">AI Auto-Detect</p>
                    <p className="text-xs text-gray-500">PDF, Word, Images</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Course Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Select Course <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value);
                  setSelectedSubject("");
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white appearance-none"
                required
              >
                <option value="">-- Select Course --</option>
                {courses.map((c) => (
                  <option key={c._id || c.id} value={c._id || c.id}>
                    {c.name} — {c.fullName}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Select Subject <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white appearance-none"
                required
                disabled={!selectedCourse}
              >
                <option value="">
                  {!selectedCourse ? "Select a course first" : "-- Select Subject --"}
                </option>
                {subjects.map((s) => (
                  <option key={s._id || s.id} value={s._id || s.id}>
                    {s.name} {s.isAdminSubject ? "(Admin)" : ""}
                  </option>
                ))}
              </select>
              {selectedCourse && subjects.length === 0 && (
                <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  No subjects available for this course. Please add a subject first.
                </p>
              )}
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Upload File <span className="text-red-500">*</span>
              </label>
              <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                file ? "border-emerald-500 bg-emerald-50" : "border-gray-300 hover:border-gray-400"
              }`}>
                <input
                  type="file"
                  accept={getFileAccept()}
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer block">
                  {file ? (
                    <div className="flex items-center justify-center gap-3">
                      <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-left">
                        <p className="font-semibold text-gray-800">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB • {file.type}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="ml-4 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div>
                      <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="font-medium text-gray-600">
                        Click to upload {getFileHint()}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {importMethod === "excel" 
                          ? "Download the template for correct format" 
                          : "AI will automatically extract MCQs from the file"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Max file size: 10MB
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Progress Bar */}
            {loading && progress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Importing...</span>
                  <span className="text-emerald-600 font-semibold">{progress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm whitespace-pre-wrap">
                {error}
              </div>
            )}

            {/* Success Result */}
            {result && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-emerald-700">Import Successful! 🎉</p>
                    <p className="text-sm text-emerald-600">
                      {result.imported} questions imported successfully
                      {result.total && ` out of ${result.total} total`}
                    </p>
                    {result.errors && result.errors.length > 0 && (
                      <div className="mt-2 text-sm text-amber-600">
                        ⚠️ {result.errors.length} rows had errors
                        <details className="mt-1">
                          <summary className="cursor-pointer text-xs">View errors</summary>
                          <ul className="mt-1 text-xs text-red-500 space-y-1">
                            {result.errors.map((err, i) => (
                              <li key={i}>• {err}</li>
                            ))}
                          </ul>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !file || !selectedSubject}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-2xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {importMethod === "excel" ? "Importing Questions..." : "AI Processing..."}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                  Import Questions
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            How to Use
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs flex-shrink-0">1</span>
              <div>
                <p className="font-medium text-gray-700">Choose Method</p>
                <p className="text-xs text-gray-500">Excel for structured data, AI for any file</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs flex-shrink-0">2</span>
              <div>
                <p className="font-medium text-gray-700">Select Subject</p>
                <p className="text-xs text-gray-500">Pick the course and subject for the questions</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs flex-shrink-0">3</span>
              <div>
                <p className="font-medium text-gray-700">Upload & Import</p>
                <p className="text-xs text-gray-500">Upload your file and click import</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}