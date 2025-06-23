import axios from "axios";

// Базовый URL из переменной окружения
const BASE_URL = process.env.REACT_APP_BACKEND_URL;

const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`, // Добавляем префикс /api/v1
});

export default api;