// frontend/src/components/SubjectCard.jsx
import { useLocation } from "wouter";

export default function SubjectCard({ subject, courseId, color, bgLight, textColor }) {
  const [, setLocation] = useLocation();
  
  const subjectId = subject._id || subject.id;
  const courseIdentifier = courseId._id || courseId;
  
  const questionCount = subject.questions?.length || 0;
  
  // Calculate estimated time (30 seconds per question)
  const estimatedTime = Math.ceil(questionCount * 0.5);
  const timeDisplay = estimatedTime < 1 ? '< 1 min' : `${estimatedTime} min`;
  
  // Get difficulty based on question count
  const getDifficulty = () => {
    if (questionCount <= 3) return { label: 'Easy', color: 'text-emerald-600', bg: 'bg-emerald-50' };
    if (questionCount <= 6) return { label: 'Medium', color: 'text-amber-600', bg: 'bg-amber-50' };
    if (questionCount <= 10) return { label: 'Hard', color: 'text-rose-600', bg: 'bg-rose-50' };
    return { label: 'Advanced', color: 'text-purple-600', bg: 'bg-purple-50' };
  };
  
  const difficulty = getDifficulty();
  
  // Subject icons based on name
  const getSubjectIcon = () => {
    const name = subject.name.toLowerCase();
    if (name.includes('programming') || name.includes('code')) {
      return "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4";
    }
    if (name.includes('data') || name.includes('sql') || name.includes('database')) {
      return "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4";
    }
    if (name.includes('network') || name.includes('security')) {
      return "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9";
    }
    if (name.includes('math') || name.includes('calculus')) {
      return "M9 7h6m0 10v-3m-6 3v-3m-6 3h18M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z";
    }
    if (name.includes('english') || name.includes('literature')) {
      return "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253";
    }
    if (name.includes('ai') || name.includes('intelligence') || name.includes('machine')) {
      return "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z";
    }
    return "M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z";
  };

  return (
    <div
      data-testid={`subject-card-${subjectId}`}
      onClick={() => setLocation(`/quiz/${courseIdentifier}/${subjectId}`)}
      className="group relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 cursor-pointer overflow-hidden hover:-translate-y-2"
    >
      {/* Gradient Border Effect */}
      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`}></div>
      <div className="absolute inset-[1px] rounded-3xl bg-white/80 backdrop-blur-xl transition-all duration-500 group-hover:bg-white/95 z-0"></div>
      
      {/* Shine Effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent z-10 pointer-events-none"></div>
      
      {/* Content */}
      <div className="relative z-10 p-6">
        {/* Icon & Badge */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-14 h-14 rounded-2xl ${bgLight} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-black/5`}>
            <svg className={`w-7 h-7 ${textColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getSubjectIcon()} />
            </svg>
          </div>
          <div className={`px-3 py-1.5 rounded-xl ${difficulty.bg} border border-opacity-20`}>
            <span className={`text-xs font-bold ${difficulty.color}`}>{difficulty.label}</span>
          </div>
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-700 transition-colors duration-300">
          {subject.name}
        </h3>
        
        {/* Description */}
        <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed group-hover:text-gray-600 transition-colors duration-300">
          {subject.description}
        </p>
        
        {/* Stats */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{questionCount} Questions</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{timeDisplay}</span>
          </div>
        </div>
        
        {/* Start Button */}
        <button className={`w-full mt-5 py-3 rounded-xl ${bgLight} ${textColor} font-semibold text-sm group-hover:bg-gradient-to-r ${color} group-hover:text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-black/5 group-hover:shadow-xl`}>
          <span>Start Quiz</span>
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}