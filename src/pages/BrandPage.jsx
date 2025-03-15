import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import "./BrandPage.css"; // Подключаем стили

const API_URL = process.env.REACT_APP_API_URL;

const BrandPage = () => {
  const { id } = useParams();
  const [brand, setBrand] = useState(null);
  const [energies, setEnergies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const listRef = useRef(null);

  // Подгружаем данные бренда и его энергетиков
  useEffect(() => {
    setLoading(true);
    setError(null);

    axios.get(`${API_URL}/brand/${id}`)
      .then((res) => setBrand(res.data))
      .catch((err) => setError(err.message));

    axios.get(`${API_URL}/brands/${id}/energies/`)
      .then((res) => setEnergies(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Восстановление скролла
  useEffect(() => {
    const scrollPos = sessionStorage.getItem(`scrollPosition-brand-${id}`);
    if (listRef.current && scrollPos) {
      listRef.current.scrollTo(0, parseInt(scrollPos, 10));
    }
  }, [id]);

  const handleLinkClick = () => {
    sessionStorage.setItem(`scrollPosition-brand-${id}`, listRef.current.scrollTop);
  };

  if (loading) return <p className="loading">⏳ Загрузка...</p>;
  if (error) return <p className="error">❌ Ошибка: {error}</p>;
  if (!brand) return <p className="not-found">⚠️ Информация о бренде не найдена</p>;

  return (
    <div className="brand-container">
      {/* Название бренда */}
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        {brand.name}
      </motion.h1>

      {/* Информация о бренде */}
      <div className="brand-info">
        <p><strong>⭐ Средняя оценка:</strong> {brand.average_rating || "N/A"}</p>
        <p><strong>📦 Количество энергетиков:</strong> {energies.length}</p>
      </div>

      {/* Список энергетиков */}
      <h2>⚡ Энергетики бренда:</h2>
      <div className="list-container" ref={listRef}>
        {energies.length > 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="cards">
            {energies.map((energy, index) => (
              <motion.div
                key={energy.id}
                className="card"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="rank">#{index + 1}</div>
                <h3>{energy.name}</h3>
                <p>⭐ {energy.average_rating || "N/A"}</p>
                <p>👥 {energy.votes || 0} оценок</p>
                <Link to={`/energy/${energy.id}`} onClick={handleLinkClick} className="details-link">
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
