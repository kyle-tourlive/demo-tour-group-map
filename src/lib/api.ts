import axios from 'axios';

const API_BASE_URL = 'https://stage-api.tourlive.co.kr';
const API_TOKEN = process.env.NEXT_PUBLIC_TOURLIVE_API_TOKEN || '';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_TOKEN}`,
    },
});

// Basic interceptor for global error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);
