// frontend/src/components/Navbar.jsx
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useCourses } from "../hooks/useCourses";
import logo from "../assets/logo.png";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const [courses] = useCourses();

  // Helper function to get course ID
  const getCourseId = (course) => course._id || course.id;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && menuOpen) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [menuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [menuOpen]);

  return (
    <>
      {/* Navbar Container with Glassmorphism */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "py-2 bg-white/70 backdrop-blur-xl shadow-2xl shadow-black/5 border-b border-white/20"
            : "py-4 bg-white/40 backdrop-blur-md shadow-sm border-b border-white/10"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <Link
              href="/"
              className="flex items-center gap-3 group"
              data-testid="nav-logo"
            >
              {/* Logo Container with Glow Effect */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-all duration-300 group-hover:scale-105">
                  <img
                    src={logo}
                    alt="Logo"
                    className="w-8 h-8 object-contain filter brightness-0 invert"
                  />
                </div>
              </div>

              {/* Brand Text */}
              <div className="hidden sm:block">
                <span className="text-lg font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 bg-clip-text text-transparent group-hover:from-indigo-500 group-hover:via-purple-500 group-hover:to-violet-500 transition-all duration-300">
                  Day-1 Competency
                </span>
                <span className="block text-[10px] font-medium text-gray-400 tracking-wider uppercase">
                  Learn Today, Lead Tomorrow ✨
                </span>
              </div>

              {/* Mobile Brand */}
              <div className="sm:hidden">
                <span className="text-sm font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Day-1 Competency
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1">
              {/* Home Link */}
              <Link
                href="/"
                data-testid="nav-home"
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 group ${
                  location === "/"
                    ? "text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/25"
                    : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/50"
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${
                      location === "/" ? "" : "group-hover:scale-110"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Home
                </span>
                {location === "/" && (
                  <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 blur-xl opacity-50 -z-10"></span>
                )}
              </Link>

              {/* Course Links as Premium Chips */}
              {courses.map((course) => {
                const courseId = getCourseId(course);
                const isActive = location === `/course/${courseId}`;
                return (
                  <Link
                    key={courseId}
                    href={`/course/${courseId}`}
                    data-testid={`nav-course-${courseId}`}
                    className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 group ${
                      isActive
                        ? `text-white bg-gradient-to-r ${course.color} shadow-lg shadow-indigo-500/25`
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          isActive
                            ? "bg-white shadow-lg shadow-white/50"
                            : `bg-gradient-to-r ${course.color} opacity-40 group-hover:opacity-100`
                        }`}
                      />
                      {course.name}
                    </span>
                    {isActive && (
                      <span
                        className={`absolute inset-0 rounded-xl bg-gradient-to-r ${course.color} blur-xl opacity-50 -z-10`}
                      ></span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right Side - Mobile Toggle */}
            <div className="flex items-center gap-3">
              {/* Admin Link - Desktop */}
              <Link
                href="/admin-login"
                className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors duration-300 rounded-xl hover:bg-indigo-50/50"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Admin
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                data-testid="nav-hamburger"
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden relative w-10 h-10 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20 hover:bg-white/80 transition-all duration-300 flex items-center justify-center group"
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
              >
                <div className="relative w-5 h-5">
                  <span
                    className={`absolute left-0 h-0.5 bg-gray-600 rounded-full transition-all duration-300 ${
                      menuOpen ? "top-1/2 rotate-45 -translate-y-1/2 w-5" : "top-1 w-5"
                    }`}
                  />
                  <span
                    className={`absolute left-0 top-1/2 h-0.5 bg-gray-600 rounded-full transition-all duration-300 -translate-y-1/2 ${
                      menuOpen ? "opacity-0 w-0" : "w-5"
                    }`}
                  />
                  <span
                    className={`absolute left-0 h-0.5 bg-gray-600 rounded-full transition-all duration-300 ${
                      menuOpen ? "top-1/2 -rotate-45 -translate-y-1/2 w-5" : "bottom-1 w-5"
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-500 ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />

        {/* Mobile Menu Drawer */}
        <div
          className={`absolute right-0 top-0 h-full w-full max-w-sm bg-white/95 backdrop-blur-xl shadow-2xl transition-all duration-500 transform ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Menu Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <img src={logo} alt="Logo" className="w-6 h-6 object-contain filter brightness-0 invert" />
                </div>
                <div>
                  <span className="text-sm font-bold text-gray-900">Menu</span>
                  <span className="block text-[10px] text-gray-400">Navigate to courses</span>
                </div>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Menu Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Home Link */}
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  location === "/"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="font-medium">Home</span>
              </Link>

              {/* Course Links */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-3">
                  Your Courses
                </p>
                <div className="space-y-2">
                  {courses.map((course) => {
                    const courseId = getCourseId(course);
                    const isActive = location === `/course/${courseId}`;
                    return (
                      <Link
                        key={courseId}
                        href={`/course/${courseId}`}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                          isActive
                            ? `bg-gradient-to-r ${course.color} text-white shadow-lg`
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <div
                          className={`w-3 h-3 rounded-full bg-gradient-to-r ${course.color} ${
                            isActive ? "bg-white" : ""
                          }`}
                        />
                        <div className="flex-1">
                          <span className="font-medium">{course.name}</span>
                          <span className="block text-xs opacity-70">{course.fullName}</span>
                        </div>
                        {isActive && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Admin Link - Mobile */}
              <Link
                href="/admin-login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all duration-300 text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium">Admin Panel</span>
              </Link>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100/50">
              <p className="text-xs text-gray-400 text-center">
                © {new Date().getFullYear()} Day-1 Competency
                <br />
                <span className="text-[10px]">Learn Today, Lead Tomorrow ✨</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}