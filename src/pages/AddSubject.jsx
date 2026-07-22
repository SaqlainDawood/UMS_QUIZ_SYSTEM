// frontend/src/pages/AddSubject.jsx
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { adminSubjectApi, getCourses, logoutAdmin } from "../utils/quizStore";

const empty = { courseId: "", name: "", description: "" };

export default function AddSubject() {
  const [, setLocation] = useLocation();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [filterCourse, setFilterCourse] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [adminSubjects, setAdminSubjects] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    loadData();

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

  const loadData = async () => {
    try {
      setLoading(true);
      const courses = await getCourses();
      console.log('📚 All courses loaded:', courses.map(c => ({ 
        courseId: c._id || c.id,
        name: c.name, 
        fullName: c.fullName,
        display: `${c.name} — ${c.fullName}`
      })));
      setAllCourses(courses);
      
      // Get admin subjects from courses
      const subjects = [];
      courses.forEach(course => {
        course.subjects?.forEach(subject => {
          if (subject.isAdminSubject) {
            subjects.push({ ...subject, courseId: course._id || course.id });
          }
        });
      });
      setAdminSubjects(subjects);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const validate = () => {
    const e = {};
    if (!form.courseId) e.courseId = "Select a course";
    if (!form.name.trim()) e.name = "Subject name is required";
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
      const selectedCourse = allCourses.find(c => (c._id || c.id) === form.courseId);
      console.log('🔍 Selected course object:', selectedCourse);
      
      if (!selectedCourse) {
        throw new Error(`Course not found with ID: ${form.courseId}`);
      }

      const courseIdentifier = selectedCourse._id || selectedCourse.id;
      
      const subjectData = {
        courseId: courseIdentifier,
        name: form.name.trim(),
        description: form.description.trim(),
      };
      
      console.log('📤 Sending subject data:', subjectData);
      
      await adminSubjectApi.create(subjectData);
      
      setSuccess(true);
      setForm(empty);
      await loadData();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('❌ Error details:', error);
      let errorMessage = error.message || 'Failed to create subject';
      if (errorMessage.includes('duplicate') || errorMessage.includes('already exists')) {
        errorMessage = `A subject named "${form.name}" already exists in this course. Please use a different name.`;
      }
      setErrors({ submit: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminSubjectApi.delete(id);
      await loadData();
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting subject:', error);
      alert('Failed to delete subject. Please try again.');
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setLocation("/admin-login");
  };

  const getCourseLabel = (courseId) => {
    const c = allCourses.find((c) => (c._id || c.id) === courseId);
    return c ? `${c.name} — ${c.fullName}` : courseId;
  };

  const filteredSubjects = filterCourse
    ? adminSubjects.filter((s) => s.courseId === filterCourse)
    : adminSubjects;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-8 h-8 text-indigo-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading subjects...</p>
          <p className="text-sm text-gray-400">Please wait</p>
        </div>
      </div>
    );
  }

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
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/25">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    Manage Subjects
                  </h1>
                  <p className="text-xs text-gray-500 font-medium">Add subjects to any course</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-teal-50 rounded-xl">
                <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-teal-500/25">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse-slow"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <h2 className="text-2xl font-black tracking-tight">
                  {greeting}! 📚
                </h2>
                <p className="text-cyan-100 mt-1">
                  Add new subjects to your courses
                </p>
              </div>
              <div className="mt-3 sm:mt-0 flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-white/90">{adminSubjects.length} Subjects Created</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* ── Form ── */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="mb-6">
              <h2 className="text-2xl font-black text-gray-900">Add New Subject</h2>
              <p className="text-gray-500 text-sm mt-1">Add a subject to any existing course</p>
            </div>

            {/* Success Message */}
            {success && (
              <div data-testid="subject-success-msg" className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium text-sm mb-5 animate-shake">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold">Subject Added Successfully!</p>
                  <p className="text-emerald-600/80 text-xs">Students can now see it under the selected course.</p>
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
                  <p className="font-semibold">Failed to Create Subject</p>
                  <p className="text-red-600/80 text-xs">{errors.submit}</p>
                </div>
              </div>
            )}

            {/* Form Card */}
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 p-6 sm:p-8 space-y-6">
              {/* Course */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Select Course <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
                    </svg>
                  </div>
                  <select 
                    data-testid="select-course-for-subject"
                    value={form.courseId} 
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      console.log('📝 Selected course ID:', selectedId);
                      const course = allCourses.find(c => (c._id || c.id) === selectedId);
                      console.log('📝 Selected course object:', course);
                      setForm({ ...form, courseId: selectedId });
                    }}
                    className={`w-full pl-11 pr-4 py-3.5 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all bg-white appearance-none ${
                      errors.courseId ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-teal-500"
                    }`}
                  >
                    <option value="">-- Select Course --</option>
                    {allCourses.map((c) => {
                      const courseId = c._id || c.id;
                      return (
                        <option key={courseId} value={courseId}>
                          {c.name} — {c.fullName}{c.isAdminCourse ? " (Admin)" : ""}
                        </option>
                      );
                    })}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.courseId && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.courseId}
                </p>}
                {form.courseId && (
                  <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Selected Course ID: {form.courseId}
                  </p>
                )}
              </div>

              {/* Subject name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Subject Name <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <input 
                    data-testid="input-subject-name" 
                    type="text" 
                    placeholder="e.g. Artificial Neural Networks"
                    value={form.name} 
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={`w-full pl-11 pr-4 py-3.5 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all ${
                      errors.name ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-teal-500"
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
                    data-testid="input-subject-desc" 
                    rows={3}
                    placeholder="Brief description of the subject..."
                    value={form.description} 
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className={`w-full pl-11 pr-4 py-3.5 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all resize-none ${
                      errors.description ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-teal-500"
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

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button 
                  data-testid="btn-submit-subject" 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold rounded-2xl hover:from-teal-700 hover:to-cyan-700 transition-all shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Adding Subject...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Subject
                    </span>
                  )}
                </button>
                <button 
                  type="button" 
                  onClick={() => setLocation("/admin/add")}
                  className="px-6 py-4 border-2 border-gray-200 text-gray-600 font-semibold rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all text-base"
                >
                  Add Questions
                </button>
              </div>
            </form>
          </div>

          {/* ── Admin subjects list ── */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-gray-900">Your Subjects</h2>
                <p className="text-sm text-gray-500 mt-0.5">Subjects you've created</p>
              </div>
              <span className="px-3 py-1.5 bg-teal-100 text-teal-700 font-bold rounded-xl text-sm">
                {adminSubjects.length}
              </span>
            </div>

            {/* Filter */}
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
              <select 
                value={filterCourse} 
                onChange={(e) => setFilterCourse(e.target.value)}
                className="w-full pl-11 pr-10 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white appearance-none transition-all"
              >
                <option value="">All Courses</option>
                {allCourses.map((c) => {
                  const courseId = c._id || c.id;
                  return (
                    <option key={courseId} value={courseId}>
                      {c.name} — {c.fullName}
                    </option>
                  );
                })}
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {filteredSubjects.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-xl shadow-gray-200/50">
                <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">No subjects added yet</p>
                <p className="text-sm text-gray-400 mt-1">Use the form to create your first subject</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {filteredSubjects.map((subject, index) => (
                  <div
                    key={subject.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group animate-fade-in-up"
                    style={{ animationDelay: `${(index + 4) * 0.1}s` }}
                  >
                    <div className="p-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-900 truncate">{subject.name}</p>
                          <span className="text-[10px] text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Admin
                          </span>
                        </div>
                        <p className="text-xs text-indigo-500 font-medium truncate">{getCourseLabel(subject.courseId)}</p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{subject.description}</p>
                      </div>
                      <button 
                        data-testid={`btn-delete-subject-${subject.id}`}
                        onClick={() => setConfirmDelete(subject.id)}
                        className="flex-shrink-0 w-9 h-9 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110"
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
              <h3 className="text-2xl font-black text-gray-900 mb-2">Delete Subject?</h3>
              <p className="text-gray-500 text-sm mb-6">
                This action <span className="font-semibold text-red-500">cannot be undone</span>. 
                All questions added to this subject will be permanently removed.
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