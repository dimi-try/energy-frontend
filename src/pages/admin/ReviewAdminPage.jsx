import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import api from "../../hooks/api";

import "./ReviewAdminPage.css";

const ReviewAdminPage = ({ token }) => {
  const [reviews, setReviews] = useState([]);
  const [energyData, setEnergyData] = useState({}); // Храним данные энергетиков по ID
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка списка отзывов
  const fetchReviews = async () => {
    try {
      const response = await api.get("/reviews/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (err) {
      setError("Ошибка при загрузке отзывов: " + (err.response?.data?.detail || err.message));
      return [];
    }
  };

  // Загрузка данных энергетиков по их ID
  const fetchEnergies = async (energyIds) => {
    const promises = energyIds.map(async (energyId) => {
      try {
        const response = await api.get(`/energies/${energyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEnergyData((prev) => ({
          ...prev,
          [energyId]: {
            name: response.data.name,
            brand_name: response.data.brand?.name || "Без бренда",
          },
        }));
      } catch (err) {
        setEnergyData((prev) => ({
          ...prev,
          [energyId]: { name: null, brand_name: null },
        }));
        console.log(`Energy lookup: ${energyId} failed -`, err.message);
      }
    });
    await Promise.all(promises);
  };

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const reviewsData = await fetchReviews();
      setReviews(reviewsData);
      const energyIds = [...new Set(reviewsData.map((review) => review.energy_id))];
      await fetchEnergies(energyIds);
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Удаление отзыва
  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("Вы уверены, что хотите удалить этот отзыв?")) {
      try {
        await api.delete(`/reviews/${reviewId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReviews(reviews.filter((review) => review.id !== reviewId));
        setSuccess("Отзыв успешно удален");
        setError(null);
      } catch (err) {
        setError("Ошибка при удалении отзыва: " + (err.response?.data?.detail || err.message));
        setSuccess(null);
      }
    }
  };

  // Функция для получения названия энергетика и бренда
  const getEnergyName = (energyId) => {
    return `${energyData[energyId].brand_name} ${energyData[energyId].name}`
  };

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="review-admin-page">
      <h1>Управление отзывами</h1>

      {/* Сообщения об ошибках и успехе */}
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      {/* Список отзывов */}
      <ul className="review-list">
        {reviews.map((review) => (
          <li key={review.id}>
            <div>
              <p><strong>ID отзыва:</strong> {review.id}</p>
              <p><strong>Пользователь:</strong> {review.user?.username || "Не указано"}</p>
              <p>
                <strong>
                  Энергетик:
                </strong> 
                <Link to={`/energies/${review.energy_id}`} className="details-link">
                  {getEnergyName(review.energy_id)}
                </Link>
              </p>
              <p><strong>Текст:</strong> {review.review_text}</p>
              <p><strong>Средний рейтинг:</strong> {review.average_rating_review}</p>
              <p><strong>Создан:</strong> {new Date(review.created_at).toLocaleString()}</p>
            </div>
            <div>
              <button onClick={() => handleDeleteReview(review.id)}>Удалить</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReviewAdminPage;