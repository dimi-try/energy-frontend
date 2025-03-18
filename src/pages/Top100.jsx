import React, { useState, useEffect, useRef } from "react"; // Импортируем React и хуки
import { useNavigate } from "react-router-dom"; // Хук для навигации между страницами
import { motion } from "framer-motion"; // Библиотека анимаций
import axios from "axios"; // HTTP-клиент для запросов
import "./Top100.css"; // Подключаем файл стилей

const API_URL = process.env.REACT_APP_API_URL; // Берем URL API из переменных окружения

const Top100 = () => {
  // Состояние для хранения типа рейтинга (энергетики или бренды)
  const [topType, setTopType] = useState(localStorage.getItem("topType") || "energies");
  
  // Состояние для хранения списка энергетиков и брендов (загружается из localStorage или пустой массив)
  const [energies, setEnergies] = useState(JSON.parse(localStorage.getItem("energies")) || []);
  const [brands, setBrands] = useState(JSON.parse(localStorage.getItem("brands")) || []);
  
  const [loading, setLoading] = useState(false); // Состояние загрузки
  const [error, setError] = useState(null); // Состояние ошибки

  const listRef = useRef(null); // Реф для контейнера списка
  const navigate = useNavigate(); // Функция для переходов между страницами

  // useEffect для загрузки данных при смене типа топа
  useEffect(() => {
    setLoading(true); // Включаем индикатор загрузки
    setError(null); // Сбрасываем ошибку

    // Делаем GET-запрос на сервер
    axios.get(`${API_URL}/top/${topType}`)
      .then((res) => {
        if (topType === "energies") {
          setEnergies(res.data || []); // Обновляем список энергетиков
          localStorage.setItem("energies", JSON.stringify(res.data)); // Кэшируем данные
        } else {
          setBrands(res.data || []); // Обновляем список брендов
          localStorage.setItem("brands", JSON.stringify(res.data)); // Кэшируем данные
        }
      })
      .catch((err) => setError(err.message)) // Обрабатываем ошибку
      .finally(() => setLoading(false)); // Выключаем индикатор загрузки

    localStorage.setItem("topType", topType); // Запоминаем текущий тип топа
  }, [topType]); // Эффект срабатывает при изменении topType

  // useEffect для восстановления позиции скролла после переключения списка
  useEffect(() => {
    const scrollPos = sessionStorage.getItem(`scrollPosition-${topType}`);
    if (listRef.current && scrollPos) {
      listRef.current.scrollTo(0, parseInt(scrollPos, 10)); // Восстанавливаем скролл
    }
  }, [topType]);

  // Функция для перехода на другую страницу с сохранением позиции скролла
  const handleNavigate = (path) => {
    sessionStorage.setItem(`scrollPosition-${topType}`, listRef.current.scrollTop); // Сохраняем позицию скролла
    navigate(path); // Переход на новую страницу
  };

  return (
    <div className="top100-container">
      {/* Кнопки переключения типа топа */}
      <div className="toggle-buttons">
        <button 
          className={topType === "energies" ? "active" : ""} 
          onClick={() => setTopType("energies")}
        >
          🔋 Топ энергетиков
        </button>
        <button 
          className={topType === "brands" ? "active" : ""} 
          onClick={() => setTopType("brands")}
        >
          🏢 Топ брендов
        </button>
      </div>

      {/* Отображение загрузки или ошибки */}
      {loading && <p className="loading">⏳ Загрузка...</p>}
      {error && <p className="error">❌ Ошибка: {error}</p>}

      {/* Контейнер списка */}
      <div className="list-container" ref={listRef}>
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0 }} // Начальная прозрачность
            animate={{ opacity: 1 }} // Анимация появления
            transition={{ duration: 0.5 }} // Длительность анимации
            className="cards"
          >
            {/* Отображаем список энергетиков или брендов */}
            {topType === "energies"
              ? energies.map((item, index) => (
                  <motion.div
                    key={item.id}
                    className="card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleNavigate(`/energy/${item.id}`)}
                  >
                    <div className="rank">#{index + 1}</div>
                    <h3>{item.brand?.name || "Неизвестный бренд"}</h3>
                    <p>{item.name || "Без названия"}</p>
                    <div className="rating">
                      ⭐ {item.average_rating || "N/A"} ({item.review_count || 0} оценок)
                    </div>
                    <p>{item.category.name || "Без категории"}</p>
                  </motion.div>
                ))
              : brands.map((item, index) => (
                  <motion.div
                    key={item.id}
                    className="card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleNavigate(`/brand/${item.id}`)}
                  >
                    <div className="rank">#{index + 1}</div>
                    <h3>{item.name || "Неизвестный бренд"}</h3>
                    <div className="rating">⭐ {item.average_rating || "N/A"}</div>
                    <p>📦 Энергетиков всего: {item.energy_count || 0}</p>
                    <p>👥 Отзывов всего: {item.review_count || 0}</p>
                  </motion.div>
                ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Top100;
