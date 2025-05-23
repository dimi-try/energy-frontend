import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import ReviewCard from "../components/ReviewCard";
import "./EnergyDrinkPage.css";

// URL API из переменных окружения
const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Компонент страницы энергетика
const EnergyDrinkPage = () => {
  // Получаем ID энергетика из URL
  const { id } = useParams();
  // Состояние для данных об энергетике
  const [energy, setEnergy] = useState(null);
  // Состояние для списка отзывов
  const [reviews, setReviews] = useState([]);
  // Состояние для критериев оценки
  const [criteria, setCriteria] = useState([]);
  // Состояние для нового отзыва
  const [newReview, setNewReview] = useState({ user_id: "", review_text: "", ratings: {} });

  // Загружаем данные об энергетике, отзывах и критериях
  useEffect(() => {
    const fetchData = async () => {
      const [energyRes, reviewsRes, criteriaRes] = await Promise.all([
        axios.get(`${REACT_APP_BACKEND_URL}/energy/${id}`),
        axios.get(`${REACT_APP_BACKEND_URL}/energy/${id}/reviews/`),
        axios.get(`${REACT_APP_BACKEND_URL}/criteria/`)
      ]);

      setEnergy(energyRes.data); // Сохраняем данные об энергетике
      setReviews(reviewsRes.data); // Сохраняем отзывы
      setCriteria(criteriaRes.data); // Сохраняем критерии
      // Инициализируем состояние для нового отзыва
      setNewReview({ ...newReview, ratings: criteriaRes.data.reduce((acc, curr) => ({ ...acc, [curr.id]: "" }), {}) });
    };
    fetchData();
  }, [id]);

  // Функция для отправки отзыва
  const handleSubmit = async (e) => {
    e.preventDefault(); // Предотвращаем перезагрузку страницы
    // Формируем массив оценок
    const ratings = Object.entries(newReview.ratings).map(([criteriaId, value]) => ({
      criteria_id: parseInt(criteriaId),
      rating_value: parseFloat(value)
    }));
    // Отправляем отзыв на сервер
    const response = await axios.post(`${REACT_APP_BACKEND_URL}/review/`, {
      user_id: newReview.user_id,
      review_text: newReview.review_text,
      energy_id: parseInt(id),
      ratings
    });
    // Добавляем новый отзыв в список
    setReviews([...reviews, response.data]);
    // Сбрасываем форму
    setNewReview({ user_id: "", review_text: "", ratings: criteria.reduce((acc, curr) => ({ ...acc, [curr.id]: "" }), {}) });
  };

  // Показываем индикатор загрузки, если данные еще не загружены
  if (!energy) return <p>Загрузка...</p>;

  return (
    <div className="energy-container container">
      {/* Заголовок с изображением и рейтингом */}
      <div className="energy-header">
        <img src={energy.image_url} alt={energy.name} style={{ width: "80px", borderRadius: "8px" }} />
        <div>
          <h1>{energy.brand?.name} {energy.name}</h1>
          <p>
            <span className="star">★</span> 
              {energy.average_rating}/10 ({energy.review_count} отзывов)
          </p>
        </div>
      </div>

      {/* Информация об энергетике */}
      <div className="energy-info card">
        <h2>Об энергике</h2>
        <p><strong>Производитель:</strong></p>
        <p>
          <Link to={`/brand/${energy.brand.id}`} className="details-link">
            {energy.brand?.name}
          </Link>
        </p>
        <p><strong>Категория:</strong> {energy.category.name}</p>
        <p><strong>Описание:</strong> {energy.description}</p>
        <p><strong>Ингридиенты:</strong> {energy.ingredients}</p>
      </div>

      {/* Форма для отправки отзыва */}
      <div className="review-form card">
        <h2>Оставить отзыв</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="number"
            name="user_id"
            placeholder="Ваш User ID"
            value={newReview.user_id}
            onChange={(e) => setNewReview({ ...newReview, user_id: e.target.value })}
            required
          />
          <textarea
            name="review_text"
            placeholder="Текст отзыва"
            value={newReview.review_text}
            onChange={(e) => setNewReview({ ...newReview, review_text: e.target.value })}
            required
          />
          {criteria.map(criterion => (
            <div key={criterion.id}>
              <label>{criterion.name}</label>
              <input
                type="number"
                min="0"
                max="10"
                value={newReview.ratings[criterion.id] || ""}
                onChange={(e) => setNewReview({ ...newReview, ratings: { ...newReview.ratings, [criterion.id]: e.target.value } })}
                required
              />
            </div>
          ))}
          <button type="submit">Отправить</button>
        </form>
      </div>

      {/* Список отзывов */}
      <h2>Отзывы</h2>
      <div className="list-container">
        {reviews.map(review => (
          <ReviewCard key={review.id} review={review} criteria={criteria} />
        ))}
      </div>
    </div>
  );
};

export default EnergyDrinkPage;