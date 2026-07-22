// frontend/src/pages/Quiz.jsx
import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { getCourseById, getSubjectById, submitQuizResult } from "../utils/quizStore";
import QuizBox from "../components/QuizBox";

const TIMER_SECONDS = 30;

export default function Quiz() {
  const { course: courseIdParam, subject: subjectIdParam } = useParams();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [course, setCourse] = useState(null);
  const [subject, setSubject] = useState(null);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 Loading quiz with courseId:', courseIdParam, 'subjectId:', subjectIdParam);
        
        // Try to get course by the parameter (could be ObjectId or string ID)
        const courseData = await getCourseById(courseIdParam);
        console.log('📦 Course data:', courseData);
        
        if (!courseData) {
          setError('Course not found');
          setLoading(false);
          return;
        }
        setCourse(courseData);

        // Try to get subject by the parameter
        // First check if the subject exists in the course's subjects
        let subjectData = null;
        
        // Try to find subject by _id or id
        if (courseData.subjects) {
          subjectData = courseData.subjects.find(s => 
            (s._id || s.id) === subjectIdParam
          );
          console.log('🔍 Found subject in course:', subjectData);
        }

        // If not found, try to fetch it directly
        if (!subjectData) {
          subjectData = await getSubjectById(courseIdParam, subjectIdParam);
          console.log('📦 Subject data from API:', subjectData);
        }

        if (!subjectData) {
          setError('Subject not found');
          setLoading(false);
          return;
        }
        
        // ✅ Ensure questions array exists
        if (!subjectData.questions || subjectData.questions.length === 0) {
          setError('No questions available for this subject');
          setLoading(false);
          return;
        }

        setSubject(subjectData);
      } catch (err) {
        console.error('Error loading quiz data:', err);
        setError('Failed to load quiz. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [courseIdParam, subjectIdParam]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = useCallback(async () => {
    if (!subject) return;
    
    const newAnswers = [...answers];
    newAnswers[currentIndex] = selectedAnswer;

    if (currentIndex + 1 < subject.questions.length) {
      setAnswers(newAnswers);
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setTimeLeft(TIMER_SECONDS);
      setShowAnswer(false);
    } else {
      // Quiz finished
      const questions = subject.questions || [];
      let correct = 0;
      newAnswers.forEach((ans, i) => {
        if (ans === questions[i]?.correct) correct++;
      });

      const result = {
        sessionId: localStorage.getItem('sessionId') || `session_${Date.now()}`,
        courseId: course?._id || courseIdParam,
        subjectId: subject?._id || subjectIdParam,
        courseName: course?.name || 'Course',
        subjectName: subject?.name || 'Subject',
        answers: newAnswers,
        correct,
        total: questions.length,
        wrong: questions.length - correct,
        percentage: Math.round((correct / questions.length) * 100),
        timeSpent: 0,
        completedAt: new Date().toISOString(),
      };

      // Save to localStorage for immediate display
      localStorage.setItem('quizResult', JSON.stringify(result));
      
      // Save to database via API
      try {
        setIsSubmitting(true);
        await submitQuizResult(result);
      } catch (error) {
        console.error('Error saving quiz result:', error);
      } finally {
        setIsSubmitting(false);
      }

      setLocation('/result');
    }
  }, [answers, currentIndex, selectedAnswer, subject, course, courseIdParam, subjectIdParam, setLocation]);

  useEffect(() => {
    if (showAnswer || !subject?.questions) return;
    if (timeLeft <= 0) {
      setShowAnswer(true);
      setTimeout(() => {
        setSelectedAnswer(null);
        handleNext();
      }, 1200);
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, showAnswer, handleNext, subject]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !course || !subject || !subject.questions?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-700 mb-2">Quiz not found</h2>
          <p className="text-gray-500 mb-4">{error || 'No questions available for this subject.'}</p>
          <button onClick={() => setLocation("/")} className="text-indigo-600 hover:underline">Go home</button>
        </div>
      </div>
    );
  }

  const question = subject.questions[currentIndex];
  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-700 mb-2">Question not found</h2>
          <button onClick={() => setLocation(`/course/${course._id || course.id}`)} className="text-indigo-600 hover:underline">
            Go back
          </button>
        </div>
      </div>
    );
  }

  const timerPercent = (timeLeft / TIMER_SECONDS) * 100;
  const timerDanger = timeLeft <= 10;

  const handleSelect = (index) => {
    if (showAnswer || isSubmitting) return;
    setSelectedAnswer(index);
  };

  const handleNextClick = () => {
    if (selectedAnswer === null && !showAnswer) return;
    if (isSubmitting) return;
    setShowAnswer(true);
    setTimeout(() => handleNext(), 800);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            data-testid="btn-quit-quiz"
            onClick={() => {
              if (window.confirm('Are you sure you want to quit? Your progress will be lost.')) {
                setLocation(`/course/${course._id || course.id}`);
              }
            }}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quit
          </button>
          <div className="text-center">
            <p className="text-xs text-gray-400 font-medium">{course.name}</p>
            <p className="text-sm font-bold text-gray-700">{subject.name}</p>
          </div>
          {/* Timer */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 transition-colors ${timerDanger ? "border-red-300 bg-red-50 timer-pulse" : "border-gray-200 bg-white"}`}>
            <svg className={`w-4 h-4 ${timerDanger ? "text-red-500" : "text-indigo-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span data-testid="quiz-timer" className={`text-sm font-black tabular-nums ${timerDanger ? "text-red-600" : "text-gray-700"}`}>
              {timeLeft}s
            </span>
          </div>
        </div>

        {/* Timer progress bar */}
        <div className="h-1.5 bg-gray-200 rounded-full mb-6 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${timerDanger ? "bg-red-400" : "bg-indigo-500"}`}
            style={{ width: `${timerPercent}%` }}
          />
        </div>

        {/* Quiz Box */}
        <QuizBox
          question={question.question}
          options={question.options}
          selectedAnswer={selectedAnswer}
          onSelectAnswer={handleSelect}
          questionNumber={currentIndex + 1}
          totalQuestions={subject.questions.length}
          showResult={showAnswer}
          correctAnswer={question.correct}
        />

        {/* Navigation */}
        <div className="flex justify-end mt-6">
          <button
            data-testid="btn-next-question"
            onClick={handleNextClick}
            disabled={(selectedAnswer === null && !showAnswer) || isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                {currentIndex + 1 === subject.questions.length ? "Finish Quiz" : "Next"}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {subject.questions.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? "w-6 h-2.5 bg-indigo-600"
                  : answers[i] !== undefined
                  ? "w-2.5 h-2.5 bg-indigo-300"
                  : "w-2.5 h-2.5 bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}