// frontend/src/components/Result.jsx
import { useState, useEffect } from "react";

export function getGrade(percentage) {
  if (percentage >= 90) return { 
    grade: "A+", 
    label: "Outstanding", 
    color: "text-yellow-600", 
    bg: "bg-yellow-50", 
    border: "border-yellow-200", 
    ring: "ring-yellow-400",
    emoji: "🌟",
    gradient: "from-yellow-400 to-amber-500"
  };
  if (percentage >= 80) return { 
    grade: "A", 
    label: "Excellent", 
    color: "text-green-600", 
    bg: "bg-green-50", 
    border: "border-green-200", 
    ring: "ring-green-400",
    emoji: "🎯",
    gradient: "from-green-400 to-emerald-500"
  };
  if (percentage >= 70) return { 
    grade: "B", 
    label: "Good", 
    color: "text-blue-600", 
    bg: "bg-blue-50", 
    border: "border-blue-200", 
    ring: "ring-blue-400",
    emoji: "💪",
    gradient: "from-blue-400 to-indigo-500"
  };
  if (percentage >= 60) return { 
    grade: "C", 
    label: "Average", 
    color: "text-orange-600", 
    bg: "bg-orange-50", 
    border: "border-orange-200", 
    ring: "ring-orange-400",
    emoji: "📚",
    gradient: "from-orange-400 to-amber-500"
  };
  return { 
    grade: "Fail", 
    label: "Needs Improvement", 
    color: "text-red-600", 
    bg: "bg-red-50", 
    border: "border-red-200", 
    ring: "ring-red-400",
    emoji: "💪",
    gradient: "from-red-400 to-rose-500"
  };
}

export default function Result({ correct, total, wrong, skipped }) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const percentage = Math.round((correct / total) * 100);
  const { grade, label, color, bg, border, ring, emoji, gradient } = getGrade(percentage);

  // Animate percentage on mount
  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const step = Math.max(1, Math.floor(percentage / 30));
    const timer = setInterval(() => {
      start += step;
      if (start >= percentage) {
        setAnimatedPercentage(percentage);
        clearInterval(timer);
      } else {
        setAnimatedPercentage(start);
      }
    }, duration / 30);
    return () => clearInterval(timer);
  }, [percentage]);

  // Confetti effect for high scores
  const showConfetti = percentage >= 80;

  return (
    <div className="relative">
      {/* Confetti Effect for High Scores */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                width: `${4 + Math.random() * 4}px`,
                height: `${4 + Math.random() * 4}px`,
                background: `hsl(${Math.random() * 360}, 80%, 60%)`,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
      )}

      {/* Main Result Card */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl shadow-black/5 p-8 relative overflow-hidden">
        {/* Gradient Background Effect */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`}></div>
        
        {/* Decorative Elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-200/20 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm mb-4">
              <span className="text-2xl">{emoji}</span>
              <span className="text-sm font-semibold text-gray-700">Quiz Complete</span>
            </div>
            <h3 className="text-3xl font-black text-gray-900">Your Results</h3>
            <p className="text-gray-500 text-sm mt-1">Here's how you performed on this quiz</p>
          </div>

          {/* Grade Display */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {/* Grade Badge - Premium */}
            <div className={`md:col-span-2 flex flex-col items-center justify-center p-6 rounded-2xl ${bg} border-2 ${border} relative overflow-hidden group`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
              <div className={`absolute -inset-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000`}></div>
              <div className="relative z-10 text-center">
                <span className={`text-6xl font-black ${color} animate-fade-in-up`}>{grade}</span>
                <span className={`block text-sm font-semibold ${color} mt-1`}>{label}</span>
                <div className="mt-2 flex items-center justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${i < Math.ceil(percentage / 20) ? 'text-yellow-400' : 'text-gray-200'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="md:col-span-3 grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/50 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="relative">
                  <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <span className="text-2xl font-black text-indigo-700 mt-1">{animatedPercentage}%</span>
                <span className="text-[10px] font-semibold text-indigo-500 uppercase tracking-wider">Score</span>
              </div>

              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100/50 shadow-sm hover:shadow-md transition-all duration-300">
                <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-2xl font-black text-emerald-600 mt-1">{correct}</span>
                <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">Correct</span>
              </div>

              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 border border-red-100/50 shadow-sm hover:shadow-md transition-all duration-300">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-2xl font-black text-red-600 mt-1">{wrong + (skipped || 0)}</span>
                <span className="text-[10px] font-semibold text-red-500 uppercase tracking-wider">Wrong/Skipped</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-gray-500">Progress</span>
              <span className="text-xs font-bold text-indigo-600">{percentage}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-1000 ease-out shadow-lg shadow-${color.split('-')[1]}-500/25`}
                style={{ width: `${animatedPercentage}%` }}
              >
                <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              </div>
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-gray-400">0%</span>
              <span className="text-[10px] text-gray-400">50%</span>
              <span className="text-[10px] text-gray-400">100%</span>
            </div>
          </div>

          {/* Achievement Message */}
          <div className="mt-6 p-4 rounded-2xl bg-gray-50/80 backdrop-blur-sm border border-gray-200/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">{emoji}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {percentage >= 90 ? "Exceptional Performance! 🌟" :
                   percentage >= 80 ? "Excellent Work! 🎯" :
                   percentage >= 70 ? "Great Effort! 💪" :
                   percentage >= 60 ? "Good Attempt! 📚" :
                   "Keep Learning! 💪"}
                </p>
                <p className="text-xs text-gray-500">
                  {percentage >= 90 ? "You've mastered this subject completely!" :
                   percentage >= 80 ? "You have a strong understanding of this material." :
                   percentage >= 70 ? "Review the missed questions to strengthen your knowledge." :
                   percentage >= 60 ? "With more practice you can do even better!" :
                   "Review the material and try again — you can do this!"}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats Footer */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-gray-100/50">
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                {correct} Correct
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                {wrong + (skipped || 0)} Wrong
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                {total} Total
              </span>
            </div>
            <span className="text-[10px] text-gray-400">
              {new Date().toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}