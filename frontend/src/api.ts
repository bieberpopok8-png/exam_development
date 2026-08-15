import axios from 'axios';

// Create an Axios instance pointing to your FastAPI backend
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export default api;