// frontend/src/pages/AddQuestion.jsx
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { adminQuestionApi, getCourses, logoutAdmin } from "../utils/quizStore";

const emptyForm = {
  courseId: "",
  subjectId: "",
  question: "",
  options: ["", "", "", ""],
  correct: "",
};

export default function AddQuestion() {
  const [, setLocation] = useLocation();
  const [form, setForm] = useState(emptyForm);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const courses = await getCourses();
        console.log('📚 FULL COURSE DATA:', JSON.stringify(courses, null, 2));
        console.log('📚 First course subjects:', courses[0]?.subjects);
        setAllCourses(courses);
      } catch (error) {
        console.error('Error loading courses:', error);
      } finally {
        setLoading(false);
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

  // Find course using either _id or id
  const selectedCourse = allCourses.find((c) => (c._id || c.id) === form.courseId);

  console.log('🔍 Selected course:', selectedCourse);
  console.log('📝 Available subjects:', selectedCourse?.subjects);

  const handleOption = (index, value) => {
    const options = [...form.options];
    options[index] = value;
    setForm({ ...form, options });
  };

  const validate = () => {
    const e = {};
    if (!form.courseId) e.courseId = "Select a course";
    if (!form.subjectId) e.subjectId = "Select a subject";
    if (!form.question.trim()) e.question = "Question is required";
    form.options.forEach((opt, i) => {
      if (!opt.trim()) e[`option${i}`] = "Option is required";
    });
    if (form.correct === "") e.correct = "Select the correct answer";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);

    try {
      await adminQuestionApi.create({
        subjectId: form.subjectId,
        question: form.question.trim(),
        options: form.options.map((o) => o.trim()),
        correct: parseInt(form.correct, 10),
      });

      setSuccess(true);
      setForm(emptyForm);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('❌ Error adding question:', error);
      setErrors({ submit: error.message || 'Failed to add question' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setLocation("/admin-login");
  };

  const optionLabels = ["A", "B", "C", "D"];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-8 h-8 text-indigo-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Add Question
                  </h1>
                  <p className="text-xs text-gray-500 font-medium">Create MCQ questions</p>
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

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  {greeting}! 📝
                </h2>
                <p className="text-indigo-100 mt-1">
                  Add new MCQ questions to any subject
                </p>
              </div>
              <div className="mt-3 sm:mt-0 flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-white/90">Question Bank</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="mb-6">
            <h2 className="text-2xl font-black text-gray-900">Add New Question</h2>
            <p className="text-gray-500 text-sm mt-1">Create a multiple choice question for any course and subject</p>
          </div>

          {/* Success Message */}
          {success && (
            <div data-testid="add-success-msg" className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium text-sm mb-5 animate-shake">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">Question Added Successfully!</p>
                <p className="text-emerald-600/80 text-xs">It is now live in the quiz system.</p>
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
                <p className="font-semibold">Failed to Add Question</p>
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
                  data-testid="select-course"
                  value={form.courseId}
                  onChange={(e) => {
                    const courseId = e.target.value;
                    console.log('📝 Selected course ID:', courseId);
                    setForm({ ...form, courseId: courseId, subjectId: "" });
                  }}
                  className={`w-full pl-11 pr-4 py-3.5 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all bg-white appearance-none ${
                    errors.courseId ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-indigo-500"
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

            {/* Subject */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Select Subject <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <select
                  data-testid="select-subject"
                  value={form.subjectId}
                  onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                  disabled={!selectedCourse}
                  className={`w-full pl-11 pr-4 py-3.5 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all bg-white appearance-none disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.subjectId ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-indigo-500"
                  }`}
                >
                  <option value="">-- Select Subject --</option>
                  {selectedCourse?.subjects?.map((s) => {
                    const subjectId = s._id || s.id;
                    return (
                      <option key={subjectId} value={subjectId}>
                        {s.name} {s.isAdminSubject ? "(Admin)" : ""}
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
              {errors.subjectId && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.subjectId}
              </p>}
              {selectedCourse && selectedCourse.subjects?.length === 0 && (
                <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  No subjects available for this course. Please add a subject first.
                </p>
              )}
            </div>

            {/* Question Text */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Question Text <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <div className="absolute top-3.5 left-0 pl-4 flex items-start pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <textarea
                  data-testid="input-question"
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  rows={3}
                  placeholder="Enter the question text..."
                  className={`w-full pl-11 pr-4 py-3.5 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none ${
                    errors.question ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-indigo-500"
                  }`}
                />
              </div>
              {errors.question && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.question}
              </p>}
            </div>

            {/* Options */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Answer Options <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="space-y-3">
                {form.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-3 group">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all ${
                      form.correct === String(i) 
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25" 
                        : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                    }`}>
                      {optionLabels[i]}
                    </div>
                    <div className="relative flex-1">
                      <input
                        data-testid={`input-option-${i}`}
                        type="text"
                        value={opt}
                        onChange={(e) => handleOption(i, e.target.value)}
                        placeholder={`Option ${optionLabels[i]}`}
                        className={`w-full px-4 py-3 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                          errors[`option${i}`] ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-indigo-500"
                        }`}
                      />
                      {form.correct === String(i) && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            ✓ Correct
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Correct Answer */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Select Correct Answer <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {optionLabels.map((label, i) => (
                  <label
                    key={i}
                    data-testid={`radio-correct-${i}`}
                    className={`flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border-2 cursor-pointer transition-all text-sm font-medium ${
                      form.correct === String(i)
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-lg shadow-emerald-500/10"
                        : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name="correct"
                      value={i}
                      checked={form.correct === String(i)}
                      onChange={(e) => setForm({ ...form, correct: e.target.value })}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      form.correct === String(i) 
                        ? "border-emerald-500 bg-emerald-500" 
                        : "border-gray-300 group-hover:border-indigo-400"
                    }`}>
                      {form.correct === String(i) && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    Option {label}
                  </label>
                ))}
              </div>
              {errors.correct && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.correct}
              </p>}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                data-testid="btn-submit-question"
                type="submit"
                disabled={submitting}
                className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed text-base"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Adding Question...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Question
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => { setForm(emptyForm); setErrors({}); }}
                className="px-6 py-4 border-2 border-gray-200 text-gray-600 font-semibold rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all text-base"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}