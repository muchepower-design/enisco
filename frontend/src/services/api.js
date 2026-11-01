import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  // Do NOT set Content-Type here – let Axios decide
});
//console.log("API Base URL:", api.defaults.baseURL);

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");

    //console.log("Token:", token);
    //console.log("Before:", config.headers);

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    //console.log("After:", config.headers);

    return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;