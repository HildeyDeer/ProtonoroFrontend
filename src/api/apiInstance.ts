import axios, { type AxiosInstance } from "axios";
import { API_BASE_URL } from "../utils/constants";

const apiInstance: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// ✅ Добавьте интерцептор для запросов
apiInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('SuperSecretKeyForJWT32CharactersMinimum'); // Или из вашего хранилища
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ✅ Добавьте интерцептор для ответов (для отладки)
apiInstance.interceptors.response.use(
    (response) => {
        console.log('✅ Response:', response.status, response.config.url);
        return response;
    },
    (error) => {
        console.error('❌ API Error:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.message,
            data: error.response?.data
        });
        
        // Если ошибка 401 (Unauthorized), перенаправляем на логин
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        
        return Promise.reject(error);
    }
);

export default apiInstance;