import { useState, useEffect } from "react";
import api from "./api"; // Импортируем настроенный api клиент

const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const useUserVerification = (telegram) => {
  const [result, setResult] = useState(null);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null); // Добавляем состояние для роли

  // Функция для получения роли
  const fetchUserRole = async (userId, token) => {
    try {
      const response = await api.get("/users/me/role");
      setRole(response.data.role);
      console.log("User role:", response.data.role);
    } catch (error) {
      console.error("Ошибка при получении роли:", error);
      setRole("user"); // По умолчанию user, если ошибка
    }
  };

  // Функция для верификации пользователя
  const verifyUser = async (initData) => {
    if (!initData) {
      setResult("initData не предоставлен");
      return;
    }

    try {
      const response = await fetch(`${REACT_APP_BACKEND_URL}/api/v1/auth/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ init_data: initData }),
      });

      const data = await response.json();
      if (data.success) {
        setResult("Верификация успешна!");
        setUserId(data.user_id);
        setToken(data.access_token); // Сохраняем токен
        // Устанавливаем токен в api клиент
        api.defaults.headers.common["Authorization"] = `Bearer ${data.access_token}`;
        console.log("Verified Telegram User ID:", data.user_id);
        // Получаем роль после успешной верификации
        await fetchUserRole(data.user_id, data.access_token);
      } else {
        setResult(`Верификация не удалась: ${data.message}`);
      }
    } catch (error) {
      console.error("Ошибка при верификации:", error);
      setResult("Произошла ошибка при верификации.");
    }
  };

  // Автоматически запускаем верификацию при наличии initData
  useEffect(() => {
    if (telegram?.initData) {
      verifyUser(telegram.initData);
    }
  }, [telegram]);

  return { result, userId, token, role, verifyUser };
};