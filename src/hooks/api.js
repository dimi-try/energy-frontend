import axios from "axios";

// Базовый URL из переменной окружения
const BASE_URL = process.env.REACT_APP_BACKEND_URL;

const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`, // Добавляем префикс /api/v1
  headers: {
    "Content-Type": "application/json",
  },
});

// Перехватчик для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Ошибка авторизации:", error.response.data.detail);
      // Можно добавить логику перенаправления или очистки токена
    } else if (error.response?.status === 404) {
      console.error("Ресурс не найден:", error.response.data.detail);
    }
    return Promise.reject(error);
  }
);

export default api;