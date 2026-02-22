import axios from 'axios'
import { API_BASE_URL } from './apiPaths'

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request interceptors
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptors 
axiosInstance.interceptors.response.use(
    (response) => {
        return response;    
    },
    (error) => {
        if (error.response) {
            if (error.response.status === 401) {
                window.location.href = '/login'
            }else if (error.response.status === 500) {
                console.error('Server error:', error.response.data);
            }
        }
        else if(error.code === 'ECONNABORTED'){
            console.error('Request timeout. Please try again.', error.message);
        }
        return Promise.reject(error);
    }
)

export default axiosInstance