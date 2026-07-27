// frontend/src/pages/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { adminStatsApi, logoutAdmin, getCourses } from "../utils/quizStore";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [stats, setStats] = useState({ 
    totalQuestions: 0, 
    totalCourses: 0, 
    totalSubjects: 0,
    totalAttempts: 0 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const [overview, courses] = await Promise.all([
          adminStatsApi.getOverview(),
          getCourses()
        ]);
        
        setStats({
          totalQuestions: overview.totalQuestions || 0,
          totalCourses: overview.totalCourses || 0,
          totalSubjects: overview.totalSubjects || 0,
          totalAttempts: overview.totalAttempts || 0,
        });
      } catch (err) {
        console.error('Error loading stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };
    loadStats();

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
        minute: '2-digit',
        second: '2-digit'
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logoutAdmin();
    setLocation("/admin-login");
  };

  const cards = [
    {
      title: "Add Course",
      desc: "Create a new degree program",
      icon: "M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z",
      color: "from-amber-500 to-orange-600",
      bg: "bg-amber-50",
      text: "text-amber-600",
      border: "border-amber-200",
      route: "/admin/add-course",
      testId: "btn-admin-add-course",
      gradient: "from-amber-50 to-orange-50",
    },
    {
      title: "Add Subject",
      desc: "Add subjects to any course",
      icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
      color: "from-teal-500 to-cyan-600",
      bg: "bg-teal-50",
      text: "text-teal-600",
      border: "border-teal-200",
      route: "/admin/add-subject",
      testId: "btn-admin-add-subject",
      gradient: "from-teal-50 to-cyan-50",
    },
    {
      title: "Add Question",
      desc: "Add MCQ questions to subjects",
      icon: "M12 4v16m8-8H4",
      color: "from-indigo-500 to-purple-600",
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      border: "border-indigo-200",
      route: "/admin/add",
      testId: "btn-admin-add",
      gradient: "from-indigo-50 to-purple-50",
    },
    {
      title: "Manage Questions",
      desc: "Edit or delete existing questions",
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
      color: "from-rose-500 to-pink-600",
      bg: "bg-rose-50",
      text: "text-rose-600",
      border: "border-rose-200",
      route: "/admin/manage",
      testId: "btn-admin-manage",
      gradient: "from-rose-50 to-pink-50",
    },
    {
      title: "Quiz System",
      desc: "Preview student experience",
      icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
      color: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-200",
      route: "/",
      testId: "btn-admin-preview",
      gradient: "from-emerald-50 to-teal-50",
    },
     {
    title: "Bulk Import",
    desc: "Import multiple MCQs from files",
    icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4",
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
    route: "/admin/bulk-import",
    testId: "btn-admin-bulk-import",
    gradient: "from-emerald-50 to-teal-50",
  },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-8 h-8 text-indigo-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
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
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  QuizMaster
                </h1>
                <p className="text-xs text-gray-500 font-medium">Administration Panel</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Time */}
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-xl">
                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-mono font-medium text-gray-700">{currentTime}</span>
              </div>

              {/* Admin Info */}
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                  A
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-gray-700">Admin</p>
                  <p className="text-[10px] text-gray-400">admin@gmail.com</p>
                </div>
              </div>

              <button
                data-testid="btn-admin-logout"
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
        {/* Greeting Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-500/25">
            {/* Animated background */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>
            
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <h2 className="text-3xl font-black tracking-tight">
                  {greeting}! 
                </h2>
                <p className="text-indigo-100 mt-1 text-lg font-medium">
                  Welcome back to your Quiz Management Dashboard
                </p>
                <p className="text-indigo-200/80 text-sm mt-2">
                  Here's what's happening with your quizzes today
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-white/90">System Active</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/10">
                  <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-white/90">{new Date().toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl shadow-sm animate-shake">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 mb-8">
          {[
            { 
              label: "Total Questions", 
              value: stats.totalQuestions, 
              icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
              color: "text-indigo-600",
              bg: "bg-indigo-500/10",
              border: "border-indigo-100",
              gradient: "from-indigo-600 to-indigo-400",
            },
            { 
              label: "Courses", 
              value: stats.totalCourses, 
              icon: "M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z",
              color: "text-purple-600",
              bg: "bg-purple-500/10",
              border: "border-purple-100",
              gradient: "from-purple-600 to-purple-400",
            },
            { 
              label: "Subjects", 
              value: stats.totalSubjects, 
              icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
              color: "text-teal-600",
              bg: "bg-teal-500/10",
              border: "border-teal-100",
              gradient: "from-teal-600 to-teal-400",
            },
            { 
              label: "Quiz Attempts", 
              value: stats.totalAttempts, 
              icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
              color: "text-rose-600",
              bg: "bg-rose-500/10",
              border: "border-rose-100",
              gradient: "from-rose-600 to-rose-400",
            },
          ].map((stat, index) => (
            <div 
              key={stat.label} 
              className={`${stat.bg} rounded-2xl p-5 border ${stat.border} backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group animate-fade-in-up`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                  <p className={`text-3xl font-black ${stat.color} mt-1`}>
                    {stat.value}
                  </p>
                  <div className="mt-2 flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${stat.gradient}`}></div>
                    <span className="text-[10px] text-gray-400">Updated now</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} bg-opacity-20 flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity`}>
                  <svg className={`w-6 h-6 ${stat.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Quick Actions</h2>
              <p className="text-sm text-gray-500 mt-1">Manage your quiz content efficiently</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              <span>All systems operational</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cards.map((card, index) => (
              <button
                key={card.route}
                data-testid={card.testId}
                onClick={() => setLocation(card.route)}
                className={`group bg-white rounded-2xl border ${card.border} shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 p-6 text-left relative overflow-hidden animate-fade-in-up`}
                style={{ animationDelay: `${(index + 4) * 100}ms` }}
              >
                {/* Animated gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                {/* Shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  <div className="absolute -inset-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>

                <div className="relative z-10">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} shadow-lg shadow-${card.text.split('-')[1]}-500/25 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                    </svg>
                  </div>
                  <h3 className={`text-lg font-bold text-gray-900 mb-1 group-hover:${card.text} transition-colors`}>
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed group-hover:text-gray-600 transition-colors">
                    {card.desc}
                  </p>
                  <div className={`flex items-center gap-1 mt-4 text-sm font-semibold ${card.text} opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-2`}>
                    <span>Get Started</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200/50 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} QuizMaster. All rights reserved.
          </p>
          <div className="flex items-center gap-4 mt-2 sm:mt-0">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              System Status: Operational
            </span>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-xs text-gray-400 hover:text-indigo-600 transition-colors flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              Back to Top
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}