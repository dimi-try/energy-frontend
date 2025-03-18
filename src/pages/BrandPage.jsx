import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion"; // Библиотека для анимаций
import axios from "axios";
import "./BrandPage.css"; // Импорт стилей

const API_URL = process.env.REACT_APP_API_URL; // Базовый URL API

const BrandPage = () => {
  const { id } = useParams(); // Получаем ID бренда из URL
  const [brand, setBrand] = useState(null); // Состояние для данных бренда
  const [energies, setEnergies] = useState([]); // Состояние для списка энергетиков
  const [loading, setLoading] = useState(true); // Состояние загрузки
  const [error, setError] = useState(null); // Состояние ошибки
  const listRef = useRef(null); // Ref для контейнера списка

  // Эффект для загрузки данных при монтировании
  useEffect(() => {
    setLoading(true);
    setError(null);

    // Запрос данных бренда
    axios.get(`${API_URL}/brand/${id}`)
      .then((res) => setBrand(res.data))
      .catch((err) => setError(err.message));

    // Запрос списка энергетиков бренда
    axios.get(`${API_URL}/brands/${id}/energies/`)
      .then((res) => setEnergies(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]); // Зависимость от ID

  // Восстановление позиции скролла
  useEffect(() => {
    const scrollPos = sessionStorage.getItem(`scrollPosition-brand-${id}`);
    if (listRef.current && scrollPos) {
      listRef.current.scrollTo(0, parseInt(scrollPos, 10));
    }
  }, [id]);

  // Сохранение позиции скролла перед переходом
  const handleLinkClick = () => {
    sessionStorage.setItem(`scrollPosition-brand-${id}`, listRef.current.scrollTop);
  };

  // Состояния загрузки и ошибок
  if (loading) return <p className="loading">⏳ Загрузка...</p>;
  if (error) return <p className="error">❌ Ошибка: {error}</p>;
  if (!brand) return <p className="not-found">⚠️ Информация о бренде не найдена</p>;

  return (
    <div className="brand-container">
      {/* Анимированный заголовок Название бренда*/}
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        {brand.name}
      </motion.h1>

      {/* Информация о бренде */}
      <div className="brand-info">
        <p><strong>⭐ Средняя оценка:</strong> {brand.average_rating || "N/A"}</p>
        <p><strong>📦 Количество энергетиков:</strong> { brand.energy_count || "N/A"}</p> {/*можно и energies.length*/}
        <p><strong>👥 Количество отзывов:</strong> { brand.review_count || "N/A"}</p>
      </div>

      {/* Список энергетиков */}
      <h2>⚡ Энергетики бренда:</h2>
      <div className="list-container" ref={listRef}>
        {energies.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.5 }} 
            className="cards"
          >
            {energies.map((energy, index) => (
              <motion.div
                key={energy.id}
                className="card"
                whileHover={{ scale: 1.03 }} // Анимация при наведении
                whileTap={{ scale: 0.97 }} // Анимация при клике
              >
                <div className="rank">#{index + 1}</div>
                <h3>{energy.name}</h3>
                <p>⭐ {energy.average_rating || "N/A"}</p>
                <p>👥 {energy.review_count || 0} оценок</p>
                <Link 
                  to={`/energy/${energy.id}`} 
                  onClick={handleLinkClick} 
                  className="details-link"
                >
                  Подробнее →
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <p className="no-energy">⚠️ У этого бренда пока нет энергетиков</p>
        )}
      </div>
    </div>
  );
};

export default BrandPage;