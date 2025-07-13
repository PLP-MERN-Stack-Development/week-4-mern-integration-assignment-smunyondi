// api.js - API service for making requests to the backend

import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: '/api', // Adjust if your API base URL is different
});

// Add a request interceptor to include the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Post API services
export const postService = {
  // Get all posts with optional pagination, search, and filters
  getAllPosts: async (page = 1, limit = 10, category = null, search = '') => {
    let url = `/posts?page=${page}&limit=${limit}`;
    if (category) {
      url += `&category=${category}`;
    }
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  // Get a single post by ID or slug
  getPost: async (idOrSlug) => {
    const response = await api.get(`/posts/${idOrSlug}`);
    return response.data;
  },

  // Create a new post
  createPost: async (postData) => {
    const response = await api.post('/posts', postData);
    return response.data;
  },

  // Update an existing post
  updatePost: async (id, postData) => {
    const response = await api.put(`/posts/${id}`, postData);
    return response.data;
  },

  // Delete a post
  deletePost: async (id) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },

  // Add a comment to a post
  addComment: async (postId, commentData) => {
    const response = await api.post(`/posts/${postId}/comments`, commentData);
    return response.data;
  },

  // Search posts
  searchPosts: async (query) => {
    const response = await api.get(`/posts/search?q=${query}`);
    return response.data;
  },
};

// Category API services
export const categoryService = {
  // Get all categories
  getAllCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  // Create a new category
  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  // Delete a category
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};

// Auth API services
export const authService = {
  // Register a new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

export default api;