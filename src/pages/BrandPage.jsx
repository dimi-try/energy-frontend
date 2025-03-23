import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Card from "../components/Card";
import BottomNav from "../components/BottomNav";
import "./BrandPage.css";

// URL API из переменных окружения
const API_URL = process.env.REACT_APP_API_URL;

// Компонент страницы бренда
const BrandPage = () => {
  // Получаем ID бренда из URL
  const { id } = useParams();
  // Состояние для данных о бренде
  const [brand, setBrand] = useState(null);
  // Состояние для списка энергетиков бренда
  const [energies, setEnergies] = useState([]);
  // Состояние для индикации загрузки
  const [loading, setLoading] = useState(true);
  // Состояние для ошибок
  const [error, setError] = useState(null);
  // Ссылка на контейнер списка для сохранения позиции прокрутки
  const listRef = useRef(null);

  // Загружаем данные о бренде и энергетиках
  useEffect(() => {
    setLoading(true); // Устанавливаем состояние загрузки
    setError(null); // Сбрасываем ошибки

    const fetchData = async () => {
      try {
        const [brandRes, energiesRes] = await Promise.all([
          axios.get(`${API_URL}/brand/${id}`),
          axios.get(`${API_URL}/brands/${id}/energies/`)
        ]);

        setBrand(brandRes.data); // Сохраняем данные о бренде
        setEnergies(energiesRes.data); // Сохраняем энергетики
      } catch (err) {
        setError(err.message); // Сохраняем ошибку
      } finally {
        setLoading(false); // Снимаем состояние загрузки
      }
    };

    fetchData();
  }, [id]);

  // Восстанавливаем позицию прокрутки при загрузке
  useEffect(() => {
    const scrollPos = sessionStorage.getItem(`scrollPosition-brand-${id}`);
    if (listRef.current && scrollPos) {
      listRef.current.scrollTo(0, parseInt(scrollPos, 10));
    }
  }, [id]);

  // Функция для сохранения позиции прокрутки при клике
  const handleLinkClick = () => {
    sessionStorage.setItem(`scrollPosition-brand-${id}`, listRef.current.scrollTop);
  };

  // Показываем индикатор загрузки
  if (loading) return <p>Загрузка...</p>;
  // Показываем сообщение об ошибке
  if (error) return <p>Ошибка: {error}</p>;
  // Показываем сообщение, если бренд не найден
  if (!brand) return <p>Бренд не найден</p>;

  return (
    <div className="brand-container container">
      {/* Заголовок страницы */}
      <h1>{brand.name}</h1>
      {/* Информация о бренде */}
      <div className="brand-info card">
        <p><strong>Оценка:</strong> <span className="star">★</span> {brand.average_rating || "N/A"} ({brand.review_count} оценок)</p>
        <p><strong>Энергетиков:</strong> {brand.energy_count || "N/A"}</p>
        <p><strong>Отзывов:</strong> {brand.review_count || "N/A"}</p>
      </div>

      {/* Список энергетиков */}
      <h2>Энергетики</h2>
      <div className="list-container" ref={listRef}>
        {energies.length > 0 ? (
          <div className="cards-grid">
            {energies.map((energy, index) => (
              // Карточка энергетика
              <Card key={energy.id}>
                <span className="rank">{index + 1}</span>
                <img src={energy.image} alt={energy.name} style={{ width: "50px", borderRadius: "8px" }} />
                <div>
                  <h3>{energy.name}</h3>
                  <p><span className="star">★</span> {energy.average_rating || "N/A"} ({energy.review_count || 0} оценок)</p>
                  <Link to={`/energy/${energy.id}`} onClick={handleLinkClick} className="details-link">
                    Подробнее
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="no-energy">Пока нет энергетиков</p>
        )}
      </div>

      {/* Нижняя навигационная панель */}
      <BottomNav />
    </div>
  );
};

export default BrandPage;