// frontend/src/pages/AddCourse.jsx
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { adminCourseApi, getCourses, logoutAdmin } from "../utils/quizStore";

const COLOR_OPTIONS = [
  { label: "Blue / Indigo", color: "from-blue-600 to-indigo-700", textColor: "text-blue-600", bgLight: "bg-blue-50", hex: "#6366f1" },
  { label: "Violet / Purple", color: "from-violet-600 to-purple-700", textColor: "text-violet-600", bgLight: "bg-violet-50", hex: "#8b5cf6" },
  { label: "Red / Rose", color: "from-red-600 to-rose-700", textColor: "text-red-600", bgLight: "bg-red-50", hex: "#ef4444" },
  { label: "Emerald / Teal", color: "from-emerald-600 to-teal-700", textColor: "text-emerald-600", bgLight: "bg-emerald-50", hex: "#10b981" },
  { label: "Orange / Amber", color: "from-orange-600 to-amber-700", textColor: "text-orange-600", bgLight: "bg-orange-50", hex: "#f59e0b" },
  { label: "Pink / Fuchsia", color: "from-pink-600 to-fuchsia-700", textColor: "text-pink-600", bgLight: "bg-pink-50", hex: "#ec4899" },
  { label: "Cyan / Sky", color: "from-cyan-600 to-sky-700", textColor: "text-cyan-600", bgLight: "bg-cyan-50", hex: "#06b6d4" },
  { label: "Yellow / Orange", color: "from-yellow-500 to-orange-600", textColor: "text-yellow-600", bgLight: "bg-yellow-50", hex: "#eab308" },
];

const empty = { name: "", fullName: "", description: "", colorIndex: 0 };

export default function AddCourse() {
  const [, setLocation] = useLocation();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [adminCourses, setAdminCourses] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    reload();

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

  const reload = async () => {
    try {
      const courses = await getCourses();
      setAdminCourses(courses.filter(c => c.isAdminCourse));
    } catch (error) {
      console.error('Error reloading courses:', error);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Short name is required (e.g. BSIT)";
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.description.trim()) e.description = "Description is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);

    try {
      const chosen = COLOR_OPTIONS[form.colorIndex];
      const courseData = {
        name: form.name.trim().toLowerCase(),
        fullName: form.fullName.trim(),
        description: form.description.trim(),
        color: chosen.color,
        textColor: chosen.textColor,
        bgLight: chosen.bgLight,
      };
      
      console.log('📤 Sending course data:', courseData);
      
      await adminCourseApi.create(courseData);
      
      setSuccess(true);
      setForm(empty);
      await reload();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('❌ Error details:', error);
      setErrors({ submit: error.message || 'Failed to create course' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await adminCourseApi.delete(id);
      await reload();
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setLocation("/admin-login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Premium Navbar */}
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
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Manage Courses
                  </h1>
                  <p className="text-xs text-gray-500 font-medium">Create and manage degree programs</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-indigo-50 rounded-xl">
                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-mono font-medium text-gray-700">{currentTime}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium rounded-xl hover:from-red-600 hover:to-rose-600 transition-all shadow-lg shadow-red-500/25 hover:shadow-red-500/40"
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Greeting Banner */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-indigo-500/25">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse-slow"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <h2 className="text-2xl font-black tracking-tight">
                  {greeting}!
                </h2>
                <p className="text-indigo-100 mt-1">
                  Create a new degree program for students
                </p>
              </div>
              <div className="mt-3 sm:mt-0 flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-white/90">{adminCourses.length} Courses Created</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* ── Form ── */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="mb-6">
              <h2 className="text-2xl font-black text-gray-900">Add New Course</h2>
              <p className="text-gray-500 text-sm mt-1">Create a new degree program visible to students</p>
            </div>

            {/* Success Message */}
            {success && (
              <div data-testid="course-success-msg" className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium text-sm mb-5 animate-shake">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold">Course Added Successfully!</p>
                  <p className="text-emerald-600/80 text-xs">It is now live in the student quiz system.</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errors.submit && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 font-medium text-sm mb-5 animate-shake">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold">Failed to Create Course</p>
                  <p className="text-red-600/80 text-xs">{errors.submit}</p>
                </div>
              </div>
            )}

            {/* Form Card */}
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 p-6 sm:p-8 space-y-6">
              {/* Short name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Short Name <span className="text-gray-400 font-normal">(shown in navbar)</span>
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-4m0 0l4 4m-4-4V4" />
                    </svg>
                  </div>
                  <input
                    data-testid="input-course-name"
                    type="text"
                    placeholder="e.g. BS Data Science"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={`w-full pl-11 pr-4 py-3.5 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                      errors.name ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-indigo-500"
                    }`}
                  />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.name}
                </p>}
              </div>

              {/* Full name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Full Program Name <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <input
                    data-testid="input-course-fullname"
                    type="text"
                    placeholder="e.g. Data Science"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className={`w-full pl-11 pr-4 py-3.5 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                      errors.fullName ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-indigo-500"
                    }`}
                  />
                </div>
                {errors.fullName && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.fullName}
                </p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Description <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <div className="absolute top-3.5 left-0 pl-4 flex items-start pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                  </div>
                  <textarea
                    data-testid="input-course-desc"
                    rows={3}
                    placeholder="Bachelor of Science in ..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className={`w-full pl-11 pr-4 py-3.5 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none ${
                      errors.description ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-indigo-500"
                    }`}
                  />
                </div>
                {errors.description && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.description}
                </p>}
              </div>

              {/* Color theme */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Color Theme <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2.5">
                  {COLOR_OPTIONS.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      data-testid={`color-option-${i}`}
                      onClick={() => setForm({ ...form, colorIndex: i })}
                      className={`h-12 rounded-xl bg-gradient-to-r ${opt.color} transition-all duration-300 ${
                        form.colorIndex === i 
                          ? "ring-4 ring-offset-2 ring-indigo-500 scale-105 shadow-lg" 
                          : "opacity-60 hover:opacity-100 hover:scale-105"
                      }`}
                      title={opt.label}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${COLOR_OPTIONS[form.colorIndex].color}`} />
                  <p className="text-xs text-gray-500">Selected: <span className="font-medium text-gray-700">{COLOR_OPTIONS[form.colorIndex].label}</span></p>
                </div>
              </div>

              {/* Preview Bar */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Preview</label>
                <div className={`h-3 rounded-full bg-gradient-to-r ${COLOR_OPTIONS[form.colorIndex].color} opacity-80 transition-all duration-300`} />
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] text-gray-400">Color preview</span>
                  <span className="text-[10px] text-gray-400">Applied to course cards</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                data-testid="btn-submit-course"
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed text-base"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating Course...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Course
                  </span>
                )}
              </button>
            </form>
          </div>

          {/* ── Admin-added courses list ── */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-gray-900">Your Courses</h2>
                <p className="text-sm text-gray-500 mt-0.5">Courses you've created</p>
              </div>
              <span className="px-3 py-1.5 bg-indigo-100 text-indigo-700 font-bold rounded-xl text-sm">
                {adminCourses.length}
              </span>
            </div>

            {loading ? (
              <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-xl shadow-gray-200/50">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-500 mt-4 font-medium">Loading courses...</p>
              </div>
            ) : adminCourses.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-xl shadow-gray-200/50">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">No courses added yet</p>
                <p className="text-sm text-gray-400 mt-1">Use the form to create your first course</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {adminCourses.map((course, index) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group animate-fade-in-up"
                    style={{ animationDelay: `${(index + 4) * 0.1}s` }}
                  >
                    <div className={`h-2 w-full bg-gradient-to-r ${course.color}`} />
                    <div className="p-5 flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-bold ${course.textColor} ${course.bgLight} px-3 py-1 rounded-full`}>
                            {course.name}
                          </span>
                          <span className="text-xs text-gray-400 bg-violet-50 text-violet-500 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Admin
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 mt-1.5">{course.fullName}</p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{course.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Created {new Date(course.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button
                        data-testid={`btn-delete-course-${course.id}`}
                        onClick={() => setConfirmDelete(course.id)}
                        className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setLocation("/admin/add-subject")}
              className="mt-5 w-full flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-dashed border-indigo-300 text-indigo-600 font-semibold text-sm hover:bg-indigo-50 hover:border-indigo-400 transition-all group"
            >
              <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Subjects to Courses
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirm Modal - Premium */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full transform transition-all">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Delete Course?</h3>
              <p className="text-gray-500 text-sm mb-6">
                This action <span className="font-semibold text-red-500">cannot be undone</span>. 
                All subjects and questions inside this course will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  className="flex-1 py-3.5 bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold rounded-xl hover:from-red-600 hover:to-rose-600 transition-all shadow-lg shadow-red-500/25"
                >
                  Delete Permanently
                </button>
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-3.5 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}