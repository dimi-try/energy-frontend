import { useState, useEffect } from "react";

const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const useUserVerification = (telegram) => {
  const [result, setResult] = useState(null);
  const [userId, setUserId] = useState(null);

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
        console.log("Verified Telegram User ID:", data.user_id);
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

  return { result, userId, verifyUser };
};