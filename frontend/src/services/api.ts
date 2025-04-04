// src/services/api.ts
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api',  // Ajustez l'URL de base selon votre configuration
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification si nécessaire
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
