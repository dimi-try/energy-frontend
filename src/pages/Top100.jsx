import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Card from "../components/Card";
import "./Top100.css";

// URL API из переменных окружения
const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Компонент страницы Топ 100
const Top100 = () => {
  // Состояние для типа топа (энергетики или бренды)
  const [topType, setTopType] = useState("energies");
  // Состояние для списка энергетиков
  const [energies, setEnergies] = useState([]);
  // Состояние для списка брендов
  const [brands, setBrands] = useState([]);
  // Состояние для индикации загрузки
  const [loading, setLoading] = useState(false);
  // Состояние для отслеживания ошибок
  const [error, setError] = useState(null);
  // Хук для навигации
  const navigate = useNavigate();
  // Ссылка на контейнер списка для сохранения позиции прокрутки
  const listRef = useRef(null);

  // Загружаем данные при изменении типа топа
  useEffect(() => {
    setLoading(true); // Устанавливаем состояние загрузки
    setError(null); // Сбрасываем ошибку перед новым запросом
    const url = `${REACT_APP_BACKEND_URL}/top/${topType}/`;
    axios.get(url) // Запрашиваем данные с API
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : []; // Убеждаемся, что данные — массив
        if (topType === "energies") setEnergies(data); // Сохраняем энергетики
        else setBrands(data); // Сохраняем бренды
      })
      .catch((err) => {
        console.error("API Error:", err); // Логируем ошибку
        setError("Не удалось загрузить данные. Попробуйте позже."); // Устанавливаем сообщение об ошибке
      })
      .finally(() => setLoading(false)); // Снимаем состояние загрузки
  }, [topType]);

  // Функция для перехода на страницу с сохранением позиции прокрутки
  const handleNavigate = (path) => {
    sessionStorage.setItem(`scrollPosition-${topType}`, listRef.current.scrollTop); // Сохраняем позицию прокрутки
    navigate(path); // Переходим по указанному пути
  };

  return (
    <div className="top100-container container">
      {/* Кнопки переключения между типами топа */}
      <div className="toggle-buttons">
        <button
          className={topType === "energies" ? "active" : ""}
          onClick={() => setTopType("energies")}
        >
          Топ Энергетиков
        </button>
        <button
          className={topType === "brands" ? "active" : ""}
          onClick={() => setTopType("brands")}
        >
          Топ Производителей
        </button>
      </div>

      {/* Контейнер для списка */}
      <div className="list-container" ref={listRef}>
        {loading ? (
          // Показываем индикатор загрузки
          <div className="loading-container">
            <p className="loading">⏳ Загрузка...</p>
          </div>
        ) : error ? (
          // Показываем сообщение об ошибке
          <div className="error-container">
            <p className="error">❌ {error}</p>
          </div>
        ) : (
          // Отображаем список, если нет ошибок и загрузка завершена
          <div className="cards-grid">
            {topType === "energies"
              ? energies.length > 0 // Проверяем, есть ли данные
                ? energies.map((item, index) => (
                    // Карточка энергетика
                    <Card
                      key={item.id}
                      rank={index + 1}
                      onClick={() => handleNavigate(`/energy/${item.id}/`)}
                    >
                      <img
                        src={item.image_url}
                        alt={item.name}
                        style={{ width: "50px", borderRadius: "8px" }}
                      />
                      <div>
                        <h2>
                          {item.brand?.name} {item.name}
                        </h2>
                        <p>
                          <span className="star">★</span> {item.average_rating}/10 (
                          {item.review_count} отзывов)
                        </p>
                        <p>
                          {item.category.name}
                        </p>
                      </div>
                    </Card>
                  ))
                : // Сообщение, если данных нет
                  <p className="no-data">Нет данных об энергетиках</p>
              : brands.length > 0 // Проверяем, есть ли данные
              ? brands.map((item, index) => (
                  // Карточка бренда
                  <Card
                    key={item.id}
                    rank={index + 1}
                    onClick={() => handleNavigate(`/brand/${item.id}/`)}
                  >
                    <div>
                      <h3>{item.name}</h3>
                      <p>
                        <span className="star">★</span> {item.average_rating}/10 (
                        {item.review_count} отзывов, {item.energy_count} энергетиков)
                      </p>
                    </div>
                    
                  </Card>
                ))
              : // Сообщение, если данных нет
                <p className="no-data">Нет данных о брендах</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Top100;