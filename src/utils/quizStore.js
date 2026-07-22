// frontend/src/utils/quizStore.js
// This now acts as a bridge between frontend components and API

import { courseApi, subjectApi, questionApi, quizApi, adminApi } from '../api/quizApi';
import apiClient from '../api/apiClient';
import { authApi } from '../api/quizApi';

// ===== COURSE FUNCTIONS =====
export const getCourses = async () => {
  try {
    const response = await courseApi.getAll();
    return response.data || [];
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
};

export const getCourseById = async (id) => {
  try {
    const response = await courseApi.getById(id);
    return response.data || null;
  } catch (error) {
    console.error('Error fetching course:', error);
    return null;
  }
};

export const getCourseSubjects = async (courseId) => {
  try {
    const response = await courseApi.getSubjects(courseId);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching course subjects:', error);
    return [];
  }
};

// ===== SUBJECT FUNCTIONS =====
export const getSubjectById = async (courseId, subjectId) => {
  try {
    // First try to get the course with subjects
    const course = await getCourseById(courseId);
    if (course && course.subjects) {
      // Try to find the subject by _id or id
      const subject = course.subjects.find(s => 
        (s._id || s.id) === subjectId
      );
      if (subject) {
        console.log('✅ Subject found in course data:', subject);
        return subject;
      }
    }
    
    // If not found in course, try direct API call
    const response = await subjectApi.getById(subjectId);
    console.log('📦 Subject from direct API:', response.data);
    return response.data || null;
  } catch (error) {
    console.error('Error fetching subject:', error);
    return null;
  }
};

export const getQuestionsBySubject = async (subjectId, page = 1, limit = 20) => {
  try {
    const response = await questionApi.getBySubject(subjectId, page, limit);
    return response.data || { questions: [], pagination: {} };
  } catch (error) {
    console.error('Error fetching questions:', error);
    return { questions: [], pagination: {} };
  }
};

// ===== QUIZ FUNCTIONS =====
export const submitQuizResult = async (resultData) => {
  try {
    const response = await quizApi.submit(resultData);
    return response.data;
  } catch (error) {
    console.error('Error submitting quiz:', error);
    throw error;
  }
};

export const getQuizResults = async (sessionId) => {
  try {
    const response = await quizApi.getResults(sessionId);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching results:', error);
    return [];
  }
};

// ===== ADMIN FUNCTIONS =====
export const adminCourseApi = {
  create: async (data) => {
    const response = await adminApi.createCourse(data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await adminApi.updateCourse(id, data);
    return response.data;
  },
  delete: async (id) => {
    await adminApi.deleteCourse(id);
  }
};

export const adminSubjectApi = {
  create: async (data) => {
    const payload = {
      courseId: data.courseId, // This should be the course ID string or ObjectId
      name: data.name,
      description: data.description,
      order: data.order || 0
    };
    
    console.log('📤 Creating subject with payload:', payload);
    
    const response = await adminApi.createSubject(data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await adminApi.updateSubject(id, data);
    return response.data;
  },
  delete: async (id) => {
    await adminApi.deleteSubject(id);
  }
};

export const adminQuestionApi = {
  create: async (data) => {
    const response = await adminApi.createQuestion(data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await adminApi.updateQuestion(id, data);
    return response.data;
  },
  delete: async (id) => {
    await adminApi.deleteQuestion(id);
  },
  bulkImport: async (data) => {
    const response = await adminApi.bulkImportQuestions(data);
    return response.data;
  }
};

export const adminStatsApi = {
  getOverview: async () => {
    const response = await adminApi.getStatsOverview();
    return response.data;
  },
  getResults: async (period = 'all') => {
    const response = await adminApi.getResultStats(period);
    return response.data;
  },
  getPopular: async (limit = 5) => {
    const response = await adminApi.getPopularSubjects(limit);
    return response.data;
  }
};

// ===== AUTH FUNCTIONS =====
export const loginAdmin = async (email, password) => {
  try {
    const response = await authApi.login(email, password);
    if (response.success) {
      apiClient.setToken(response.data.token);
      localStorage.setItem('adminLoggedIn', 'true');
      return response.data.user;
    }
    throw new Error(response.message || 'Login failed');
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logoutAdmin = () => {
  apiClient.setToken(null);
  localStorage.removeItem('adminLoggedIn');
  localStorage.removeItem('token');
};

export const verifyAdmin = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;
    const response = await authApi.verify();
    return response.success;
  } catch (error) {
    return false;
  }
};

// For backwards compatibility with existing components
// These will be replaced by API calls
export const getAdminCourses = async () => {
  const courses = await getCourses();
  return courses.filter(c => c.isAdminCourse);
};

export const getAdminSubjects = async () => {
  const courses = await getCourses();
  const allSubjects = [];
  courses.forEach(course => {
    course.subjects?.forEach(subject => {
      if (subject.isAdminSubject) {
        allSubjects.push({ ...subject, courseId: course.id });
      }
    });
  });
  return allSubjects;
};

// Keep this for backward compatibility but it will now use API
export const getAllQuestionsForAdmin = async () => {
  try {
    const response = await adminApi.getStatsOverview();
    // This is a temporary solution - we'll fetch all questions properly
    return [];
  } catch (error) {
    console.error('Error fetching questions:', error);
    return [];
  }
};

// REMOVED: export { baseCourses } from '../data/quizData';
// We don't need baseCourses anymore since we're using the API