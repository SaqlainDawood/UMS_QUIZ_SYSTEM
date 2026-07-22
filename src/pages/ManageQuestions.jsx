// frontend/src/pages/ManageQuestions.jsx
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { adminQuestionApi, getCourses, logoutAdmin } from "../utils/quizStore";

const optionLabels = ["A", "B", "C", "D"];

const emptyEdit = { question: "", options: ["", "", "", ""], correct: "" };

export default function ManageQuestions() {
  const [, setLocation] = useLocation();
  const [questions, setQuestions] = useState([]);
  const [filterCourse, setFilterCourse] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyEdit);
  const [editErrors, setEditErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Helper function to get course ID
  const getCourseId = (course) => course._id || course.id;

  useEffect(() => {
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

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const coursesData = await getCourses();
      console.log('📚 Courses loaded for ManageQuestions:', coursesData.map(c => ({
        _id: c._id,
        id: c.id,
        name: c.name,
        fullName: c.fullName,
        subjectsCount: c.subjects?.length || 0
      })));
      setCourses(coursesData);
      
      // Flatten all questions from all courses
      const allQuestions = [];
      coursesData.forEach(course => {
        course.subjects?.forEach(subject => {
          subject.questions?.forEach(q => {
            allQuestions.push({
              ...q,
              courseId: course._id || course.id,
              subjectId: subject._id || subject.id,
              courseName: course.name,
              subjectName: subject.name,
              isBase: !q._id?.startsWith('admin__'),
            });
          });
        });
      });
      console.log('📚 All questions loaded:', allQuestions.length);
      setQuestions(allQuestions);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load questions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (_id) => {
    try {
      await adminQuestionApi.delete(_id);
      await loadData();
      setConfirmDelete(null);
      if (editingId === _id) setEditingId(null);
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Failed to delete question. Please try again.');
    }
  };

  const openEdit = (q) => {
    setEditingId(q._id);
    setEditForm({
      question: q.question,
      options: [...q.options],
      correct: String(q.correct),
    });
    setEditErrors({});
  };

  const closeEdit = () => { setEditingId(null); setEditErrors({}); };

  const validateEdit = () => {
    const e = {};
    if (!editForm.question.trim()) e.question = "Question is required";
    editForm.options.forEach((opt, i) => {
      if (!opt.trim()) e[`option${i}`] = "Required";
    });
    if (editForm.correct === "") e.correct = "Select the correct answer";
    return e;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const errs = validateEdit();
    if (Object.keys(errs).length) { setEditErrors(errs); return; }
    
    setSaving(true);
    try {
      await adminQuestionApi.update(editingId, {
        question: editForm.question.trim(),
        options: editForm.options.map((o) => o.trim()),
        correct: parseInt(editForm.correct, 10),
      });
      await loadData();
      closeEdit();
    } catch (error) {
      console.error('Error updating question:', error);
      setEditErrors({ submit: 'Failed to update question' });
    } finally {
      setSaving(false);
    }
  };

  const handleEditOption = (i, val) => {
    const options = [...editForm.options];
    options[i] = val;
    setEditForm({ ...editForm, options });
  };

  const handleLogout = () => {
    logoutAdmin();
    setLocation("/admin-login");
  };

  // Find selected course using _id or id
  const selectedCourse = courses.find((c) => (c._id || c.id) === filterCourse);
  console.log('🔍 Selected course for filter:', selectedCourse);

  // Get subjects for the selected course
  const courseSubjects = selectedCourse?.subjects || [];
  console.log('📝 Subjects for selected course:', courseSubjects);

  // Filter questions using _id or id
  const filteredQuestions = questions.filter((q) => {
    if (filterCourse && q.courseId !== filterCourse) return false;
    if (filterSubject && q.subjectId !== filterSubject) return false;
    if (filterType === "base" && !q.isBase) return false;
    if (filterType === "admin" && q.isBase) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-8 h-8 text-indigo-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading questions...</p>
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
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/25">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                    Manage Questions
                  </h1>
                  <p className="text-xs text-gray-500 font-medium">View, edit, and delete questions</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-rose-50 rounded-xl">
                <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-rose-500/25">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse-slow"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <h2 className="text-2xl font-black tracking-tight">
                  {greeting}! 📊
                </h2>
                <p className="text-rose-100 mt-1">
                  Manage and organize your question bank
                </p>
              </div>
              <div className="mt-3 sm:mt-0 flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-white/90">{questions.length} Total Questions</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/10">
                  <span className="text-sm font-medium text-white/90">{filteredQuestions.length} Shown</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Question Bank</h2>
            <p className="text-gray-500 text-sm mt-1">View and manage all questions across your courses</p>
            {error && (
              <div className="mt-2 flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-xl border border-red-200">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}
          </div>
          <button
            data-testid="btn-go-add"
            onClick={() => setLocation("/admin/add")}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 text-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Question
          </button>
        </div>

        {/* Premium Filters */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="text-sm font-semibold text-gray-700">Filter Questions</span>
            {(filterCourse || filterSubject || filterType !== "all") && (
              <button
                onClick={() => { setFilterCourse(""); setFilterSubject(""); setFilterType("all"); }}
                className="ml-auto text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Course Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
                </svg>
              </div>
              <select
                data-testid="filter-course"
                value={filterCourse}
                onChange={(e) => { 
                  const courseId = e.target.value;
                  console.log('📝 Selected filter course:', courseId);
                  setFilterCourse(courseId); 
                  setFilterSubject("");
                }}
                className="w-full pl-11 pr-10 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white appearance-none transition-all"
              >
                <option value="">All Courses</option>
                {courses.map((c) => {
                  const courseId = getCourseId(c);
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

            {/* Subject Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <select
                data-testid="filter-subject"
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                disabled={!filterCourse || courseSubjects.length === 0}
                className={`w-full pl-11 pr-10 py-3 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white appearance-none transition-all ${
                  !filterCourse || courseSubjects.length === 0
                    ? "border-gray-200 opacity-50 cursor-not-allowed"
                    : "border-gray-200"
                }`}
              >
                <option value="">
                  {!filterCourse ? "Select a course first" : courseSubjects.length === 0 ? "No subjects available" : "All Subjects"}
                </option>
                {courseSubjects.map((s) => {
                  const subjectId = s._id || s.id;
                  return (
                    <option key={subjectId} value={subjectId}>
                      {s.name}
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

            {/* Type Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <select
                data-testid="filter-type"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full pl-11 pr-10 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white appearance-none transition-all"
              >
                <option value="all">All Types</option>
                <option value="base">📚 Base Questions</option>
                <option value="admin">✨ Admin Added</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Questions List */}
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium text-lg">No questions found</p>
            <p className="text-gray-400 text-sm mt-2">
              {filterCourse ? "Try adjusting your filters" : "Select a course to see questions"}
            </p>
            {filterCourse && (
              <button
                onClick={() => { setFilterCourse(""); setFilterSubject(""); setFilterType("all"); }}
                className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium transition-colors text-sm"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((q, idx) => (
              <div
                key={q._id}
                data-testid={`question-card-${idx}`}
                className="bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group animate-fade-in-up"
                style={{ animationDelay: `${(idx + 4) * 0.05}s` }}
              >
                {/* View mode */}
                {editingId !== q._id ? (
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
                            </svg>
                            {q.courseName}
                          </span>
                          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            {q.subjectName}
                          </span>
                          {!q.isBase && (
                            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                              Admin Added
                            </span>
                          )}
                          <span className="ml-auto text-[10px] text-gray-400">
                            Q{idx + 1}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 mb-3 leading-relaxed">
                          {q.question}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, i) => (
                            <div
                              key={i}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                i === q.correct
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm"
                                  : "bg-gray-50 text-gray-600 border border-transparent"
                              }`}
                            >
                              <span className={`font-bold w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                                i === q.correct
                                  ? "bg-emerald-500 text-white"
                                  : "bg-gray-200 text-gray-600"
                              }`}>
                                {optionLabels[i]}
                              </span>
                              {opt}
                              {i === q.correct && (
                                <svg className="w-3.5 h-3.5 ml-auto text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Action buttons */}
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button
                          data-testid={`btn-edit-${idx}`}
                          onClick={() => openEdit(q)}
                          className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 hover:bg-indigo-500 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110"
                          title="Edit question"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          data-testid={`btn-delete-${idx}`}
                          onClick={() => setConfirmDelete(q._id)}
                          className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110"
                          title="Delete question"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Edit mode - Premium */
                  <form onSubmit={handleEditSubmit} className="p-6 bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-indigo-600">✏️ Editing Question</span>
                        <span className="text-[10px] text-gray-400 bg-white px-2 py-0.5 rounded-full">ID: {editingId?.slice(0, 8)}</span>
                      </div>
                      <button type="button" onClick={closeEdit} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-white">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {editErrors.submit && (
                      <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-xl border border-red-200 mb-4 text-sm">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {editErrors.submit}
                      </div>
                    )}

                    {/* Question text */}
                    <div className="mb-4">
                      <label className="block text-xs font-bold text-gray-600 mb-1.5">Question Text *</label>
                      <textarea
                        rows={2}
                        value={editForm.question}
                        onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                        className={`w-full px-4 py-3 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none ${
                          editErrors.question ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-indigo-500"
                        }`}
                      />
                      {editErrors.question && <p className="text-red-500 text-xs mt-1">{editErrors.question}</p>}
                    </div>

                    {/* Options */}
                    <div className="mb-4">
                      <label className="block text-xs font-bold text-gray-600 mb-1.5">Answer Options *</label>
                      <div className="space-y-2">
                        {editForm.options.map((opt, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                              editForm.correct === String(i)
                                ? "bg-emerald-500 text-white"
                                : "bg-gray-100 text-gray-600"
                            }`}>
                              {optionLabels[i]}
                            </span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => handleEditOption(i, e.target.value)}
                              className={`flex-1 px-4 py-2.5 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                                editErrors[`option${i}`] ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-indigo-500"
                              }`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Correct answer */}
                    <div className="mb-4">
                      <label className="block text-xs font-bold text-gray-600 mb-1.5">Correct Answer *</label>
                      <div className="grid grid-cols-4 gap-2">
                        {optionLabels.map((label, i) => (
                          <label
                            key={i}
                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all text-sm font-medium ${
                              editForm.correct === String(i)
                                ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-lg shadow-emerald-500/10"
                                : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-600"
                            }`}
                          >
                            <input
                              type="radio"
                              name="edit-correct"
                              value={i}
                              checked={editForm.correct === String(i)}
                              onChange={(e) => setEditForm({ ...editForm, correct: e.target.value })}
                              className="sr-only"
                            />
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              editForm.correct === String(i)
                                ? "border-emerald-500 bg-emerald-500"
                                : "border-gray-300"
                            }`}>
                              {editForm.correct === String(i) && (
                                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            {label}
                          </label>
                        ))}
                      </div>
                      {editErrors.correct && <p className="text-red-500 text-xs mt-1">{editErrors.correct}</p>}
                    </div>

                    {/* Save / Cancel */}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {saving ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Saving...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Save Changes
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={closeEdit}
                        className="px-6 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal - Premium */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full transform transition-all">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Delete Question?</h3>
              <p className="text-gray-500 text-sm mb-6">
                This action <span className="font-semibold text-red-500">cannot be undone</span>. 
                The question will be removed from the quiz system immediately.
              </p>
              <div className="flex gap-3">
                <button
                  data-testid="btn-confirm-delete"
                  onClick={() => handleDelete(confirmDelete)}
                  className="flex-1 py-3.5 bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold rounded-xl hover:from-red-600 hover:to-rose-600 transition-all shadow-lg shadow-red-500/25"
                >
                  Delete Permanently
                </button>
                <button
                  data-testid="btn-cancel-delete"
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