// frontend/src/api/quizApi.js

import apiClient from './apiClient';

// ===== AUTH API =====
export const authApi = {
  login: (email, password) => 
    apiClient.post('/auth/login', { email, password }),
  
  logout: () => {
    apiClient.setToken(null);
    return apiClient.post('/auth/logout');
  },
  
  verify: () => 
    apiClient.get('/auth/verify'),
};

// ===== COURSES API =====
export const courseApi = {
  getAll: () => 
    apiClient.get('/courses'),
  
  getById: (id) => 
    apiClient.get(`/courses/${id}`),
  
  getSubjects: (courseId) => 
    apiClient.get(`/courses/${courseId}/subjects`),
};

// ===== SUBJECTS API =====

export const subjectApi = {
  getById: (id) => {
    console.log('🔍 Fetching subject by ID:', id);
    return apiClient.get(`/subjects/${id}`);
  },
  getByCourse: (courseId) => {
    console.log('🔍 Fetching subjects for course:', courseId);
    return apiClient.get(`/subjects/course/${courseId}`);
  },
};

// ===== QUESTIONS API =====
export const questionApi = {
  getBySubject: (subjectId, page = 1, limit = 20) => 
    apiClient.get(`/questions/subject/${subjectId}?page=${page}&limit=${limit}`),
  
  getById: (id) => 
    apiClient.get(`/questions/${id}`),
};

// ===== QUIZ API =====
export const quizApi = {
  submit: (data) => 
    apiClient.post('/quiz/submit', data),
  
  getResults: (sessionId) => 
    apiClient.get(`/quiz/results/${sessionId}`),
  
  getHistory: (page = 1, limit = 20) => 
    apiClient.get(`/quiz/history?page=${page}&limit=${limit}`),
};

// ===== ADMIN API =====
export const adminApi = {
  // Courses
  createCourse: (data) => 
    apiClient.post('/admin/courses', data),
  
  updateCourse: (id, data) => 
    apiClient.put(`/admin/courses/${id}`, data),
  
  deleteCourse: (id) => 
    apiClient.delete(`/admin/courses/${id}`),
  
  // Subjects
  createSubject: (data) => 
    apiClient.post('/admin/subjects', data),
  
  updateSubject: (id, data) => 
    apiClient.put(`/admin/subjects/${id}`, data),
  
  deleteSubject: (id) => 
    apiClient.delete(`/admin/subjects/${id}`),
  
  // Questions
  createQuestion: (data) => 
    apiClient.post('/admin/questions', data),
  
  updateQuestion: (id, data) => 
    apiClient.put(`/admin/questions/${id}`, data),
  
  deleteQuestion: (id) => 
    apiClient.delete(`/admin/questions/${id}`),
  
  bulkImportQuestions: (data) => 
    apiClient.post('/admin/questions/bulk', data),
  
  // Stats
  getStatsOverview: () => 
    apiClient.get('/admin/stats/overview'),
  
  getResultStats: (period = 'all') => 
    apiClient.get(`/admin/stats/results?period=${period}`),
  
  getPopularSubjects: (limit = 5) => 
    apiClient.get(`/admin/stats/popular?limit=${limit}`),
};