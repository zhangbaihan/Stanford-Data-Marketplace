// Configures axios to work with our backend

// Axios is an HTTP clinet that makes API requests to the backend
import axios from 'axios';
const api = axios.create({
    // Hardcoded backend URL. Need to change.
    baseURL: 'http://localhost:5001',
    withCredentials: true,
});

export default api;