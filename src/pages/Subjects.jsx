// frontend/src/pages/Subjects.jsx
import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { getCourseById } from "../utils/quizStore";
import SubjectCard from "../components/SubjectCard";

export default function Subjects() {
  const { name } = useParams();
  const [, setLocation] = useLocation();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("🔍 Loading course with ID:", name);
        const data = await getCourseById(name);
        console.log("📦 Course data:", data);

        if (!data) {
          setError("Course not found");
        } else {
          setCourse(data);
        }
      } catch (err) {
        console.error("Error loading course:", err);
        setError("Failed to load course. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadCourse();
  }, [name]);

  // Calculate statistics
  const totalSubjects = course?.subjects?.length || 0;
  const totalQuestions = course?.subjects?.reduce(
    (a, s) => a + (s.questions?.length || 0),
    0
  ) || 0;
  const totalQuizzes = totalSubjects;
  const completionRate = totalSubjects > 0 ? Math.round((totalSubjects / totalSubjects) * 100) : 0;

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Skeleton Header */}
          <div className="mb-8">
            <div className="h-10 w-32 bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="mt-4 h-12 w-64 bg-gray-200 rounded-2xl animate-pulse"></div>
            <div className="mt-2 h-6 w-96 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
          
          {/* Skeleton Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-100/50">
                <div className="h-4 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="mt-2 h-8 w-12 bg-gray-200 rounded-xl animate-pulse"></div>
              </div>
            ))}
          </div>
          
          {/* Skeleton Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-gray-100/50">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-gray-200 rounded-2xl animate-pulse"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded-xl animate-pulse"></div>
                </div>
                <div className="mt-4 h-6 w-32 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="mt-2 h-4 w-full bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="h-4 w-16 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
                <div className="mt-4 h-10 w-full bg-gray-200 rounded-xl animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/5 p-8 text-center border border-white/50">
            <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
            <p className="text-gray-500 text-sm mb-6">
              {error || "The course you are looking for does not exist or has been removed."}
            </p>
            <button
              onClick={() => setLocation("/")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Go Back Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-200/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Hero Section */}
      <div className={`relative bg-gradient-to-r ${course.color || 'from-blue-600 to-indigo-700'} text-white`}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Button */}
          <button
            data-testid="btn-back-courses"
            onClick={() => setLocation("/")}
            className="group inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl text-sm font-medium text-white/90 hover:text-white transition-all duration-300 border border-white/10 hover:border-white/20 mb-8 shadow-lg shadow-black/5"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Courses
          </button>

          {/* Course Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10 shadow-xl shadow-black/10">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <div>
              <p className="text-white/70 text-sm font-medium uppercase tracking-wider">{course.name}</p>
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">{course.fullName}</h1>
              <p className="text-white/80 mt-2 text-base max-w-2xl">{course.description}</p>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 shadow-xl shadow-black/5">
              <p className="text-white/60 text-xs font-medium uppercase tracking-wider">Total Subjects</p>
              <p className="text-2xl font-bold text-white mt-1">{totalSubjects}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 shadow-xl shadow-black/5">
              <p className="text-white/60 text-xs font-medium uppercase tracking-wider">Total Questions</p>
              <p className="text-2xl font-bold text-white mt-1">{totalQuestions}+</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 shadow-xl shadow-black/5">
              <p className="text-white/60 text-xs font-medium uppercase tracking-wider">Active Quizzes</p>
              <p className="text-2xl font-bold text-white mt-1">{totalQuizzes}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 shadow-xl shadow-black/5">
              <p className="text-white/60 text-xs font-medium uppercase tracking-wider">Completion Rate</p>
              <p className="text-2xl font-bold text-white mt-1">{completionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Available Subjects</h2>
            <p className="text-gray-500 text-sm mt-1">
              {greeting}! Choose a subject to start your quiz journey
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">{totalSubjects} Subjects Available</span>
            </div>
          </div>
        </div>

        {course.subjects?.length === 0 ? (
          // Empty State
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl shadow-black/5 p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-32 h-32 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-6">
                <svg className="w-16 h-16 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Subjects Available</h3>
              <p className="text-gray-500 text-sm mb-6">
                This course doesn't have any subjects yet. Check back later or explore other courses.
              </p>
              <button
                onClick={() => setLocation("/")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Browse Other Courses
              </button>
            </div>
          </div>
        ) : (
          // Subject Cards Grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {course.subjects.map((subject, index) => (
              <div
                key={subject._id || subject.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${(index + 1) * 0.1}s` }}
              >
                <SubjectCard
                  subject={subject}
                  courseId={course}
                  color={course.color}
                  bgLight={course.bgLight}
                  textColor={course.textColor}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}