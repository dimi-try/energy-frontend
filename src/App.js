import { useEffect, useState } from "react";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { BackButton } from "@vkruglikov/react-telegram-web-app";

import { useTelegram } from "./hooks/useTelegram";
import { useUserVerification } from "./hooks/useUserVerification";

import "./styles/App.css";

import Top100 from "./pages/Top100";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import EnergyDrinkPage from "./pages/EnergyDrinkPage";
import BrandPage from "./pages/BrandPage";
import AdminPanel from "./pages/AdminPanel";
import BrandAdminPage from "./pages/admin/BrandAdminPage";
import EnergyAdminPage from "./pages/admin/EnergyAdminPage";
import BottomNav from "./components/BottomNav";

function App() {
  const { telegram, initData } = useTelegram(); // Получаем telegram и initData
  const { userId, token, role, verifyUser } = useUserVerification(telegram); // Получаем userId, token, role и verifyUser
  const navigate = useNavigate();
  const location = useLocation();
  const [showBackButton, setShowBackButton] = useState(true);

  // Инициализация и отслеживание темы Telegram
  useEffect(() => {
    if (telegram) {
      telegram.ready(); // Сообщаем Telegram, что приложение готово

      // Функция для применения темы Telegram
      const applyTheme = (params) => {
        const theme = params || {
          bg_color: "#f5f5f5",
          text_color: "#333333",
          secondary_bg_color: "#e5e5e5",
          button_color: "#007aff",
          button_text_color: "#ffffff",
        };
        console.log("Applying theme:", theme);

        // Устанавливаем все переменные из themeParams
        document.documentElement.style.setProperty("--background-color", theme.secondary_bg_color || "#ffffff");
        document.documentElement.style.setProperty("--text-color", theme.text_color);
        document.documentElement.style.setProperty("--card-background", theme.bg_color);
        document.documentElement.style.setProperty("--primary-color", theme.button_color || "#007aff");
        document.documentElement.style.setProperty("--button-text-color", theme.button_text_color || "#ffffff");
      };

      // Применяем начальную тему
      applyTheme(telegram.themeParams);

      // Событие: изменение темы в Telegram
      telegram.onEvent("themeChanged", () => {
        console.log("Событие изменения темы:", telegram.themeParams);
        applyTheme(telegram.themeParams);
      });
    } else {
      // Устанавливаем тему по умолчанию для браузера
      console.log("Приложение открыто в браузере, применяем тему по умолчанию");
      document.documentElement.style.setProperty("--background-color", "#f5f5f5");
      document.documentElement.style.setProperty("--text-color", "#333333");
      document.documentElement.style.setProperty("--card-background", "#ffffff");
      document.documentElement.style.setProperty("--primary-color", "#007aff");
      document.documentElement.style.setProperty("--button-text-color", "#ffffff");
    }
  }, [telegram]);

  // Управление видимостью кнопки "Назад"
  useEffect(() => {
    if (location.pathname === "/" || window.history.length === 1) {
      setShowBackButton(false); // Скрываем кнопку на главной странице
    } else {
      setShowBackButton(true); // Показываем кнопку на других страницах
    }
  }, [location]);

  // Обработка верификации пользователя
  useEffect(() => {
    if (initData && verifyUser) {
      verifyUser(initData); // Запускаем верификацию, если есть initData и verifyUser
    } else if (!telegram) {
      console.log("Приложение открыто в браузере, доступ к профилю ограничен");
    }
  }, [initData, verifyUser, telegram]);

  // Защита админских маршрутов
  useEffect(() => {
    if (role && role !== "admin" && location.pathname.startsWith("/admin")) {
      navigate("/"); // Перенаправляем неадминов на главную
    }
  }, [role, location, navigate]);

  // Основной рендер приложения
  return (
    <div className={`App ${telegram?.colorScheme || "light"}`}>
      <Routes>
        <Route index element={<Top100 />} />
        <Route path="/search" element={<Search />} />
        <Route path="/profile" element={<Profile userId={userId} token={token} />} />
        <Route path="/energies/:id" element={<EnergyDrinkPage userId={userId} token={token} />} />
        <Route path="/brands/:id" element={<BrandPage />} />
        {role === "admin" && (
          <>
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/brands" element={<BrandAdminPage token={token} />} />
            <Route path="/admin/energies" element={<EnergyAdminPage token={token} />} />
          </>
        )}
      </Routes>
      <BottomNav role={role} />
      {showBackButton && <BackButton onClick={() => navigate(-1)} />}
    </div>
  );
}

export default App;