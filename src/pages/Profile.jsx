import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../hooks/api";
import "./Profile.css";

// Компонент страницы профиля пользователя
const Profile = () => {
  // ID пользователя (тест - 1)
  const id = 1;
  // Состояние для данных профиля
  const [profile, setProfile] = useState(null);
  // Состояние для списка отзывов
  const [reviews, setReviews] = useState([]);
  // Состояние для ошибок
  const [error, setError] = useState(null);
  // Состояние для загрузки
  const [loading, setLoading] = useState(true);

  // Загружаем данные профиля и отзывы
  useEffect(() => {
    setError(null); // Сбрасываем ошибки
    setLoading(true); // Устанавливаем загрузку

    const fetchData = async () => {
      try {
        const [profileRes, reviewsRes] = await Promise.all([
          api.get(`/users/${id}/profile`),
          api.get(`/users/${id}/reviews`),
        ]);

        setProfile(profileRes.data); // Сохраняем данные профиля
        setReviews(reviewsRes.data.reviews); // Сохраняем отзывы
      } catch (err) {
        setError(err.message); // Сохраняем ошибку
      } finally {
        setLoading(false); // Сбрасываем загрузку
      }
    };
    fetchData();
  }, [id]);

  // Компонент для отображения отзыва
  const ReviewCard = ({ review }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
      <div className="card review-card">
        <div className="review-header">
          <h3>
            <Link to={`/energies/${review.energy_id}`} className="details-link">
              {review.brand}{" "}{review.energy}
            </Link>
          </h3>
          <p>{new Date(review.created_at).toLocaleDateString()}</p>
        </div>
        <p className={`review-text ${isExpanded ? "" : "truncated"}`}>
          {review.review_text}
        </p>
        {review.review_text.length > 100 && (
          <button
            className="toggle-button"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Свернуть" : "Читать далее"}
          </button>
        )}
        <div className="ratings">
          {review.ratings.map((rating) => (
            <span key={rating.id} className="rating">
              Критерий {rating.criteria_id}: {rating.rating_value}/10
            </span>
          ))}
        </div>
      </div>
    );
  };

  // Отображаем загрузку, ошибку или контент
  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">Ошибка: {error}</div>;
  if (!profile) return <div className="error">Профиль не найден</div>;

  return (
    <div className="profile-container container">
      {/* Аватарка и имя */}
      <div className="profile-header">
        <div className="profile-avatar">
          <img
            src={`https://api.dicebear.com/9.x/identicon/svg?seed=${profile.user.username}`}
            alt="Avatar"
          />
        </div>
        <h1>{profile.user.username}</h1>
      </div>

      {/* Оценки и средний балл */}
      <div className="stats-row">
        <div className="card stat-card">
          <h3>Мои оценки</h3>
          <p className="stat-value">{profile.total_ratings}</p>
        </div>
        <div className="card stat-card">
          <h3>Средний балл</h3>
          <p className="stat-value">
            {profile.average_rating ? `${profile.average_rating}/10` : "-"}
          </p>
        </div>
      </div>

      {/* Любимый энергетик и бренд */}
      <div className="stats-row">
        <div className="card stat-card">
          <h3>Любимый энергетик</h3>
          <p className="stat-value">
            {profile.favorite_energy ? (
              <Link
                to={`/energies/${profile.favorite_energy.id}`}
                className="details-link"
              >
                {profile.favorite_energy.name}
              </Link>
            ) : (
              "-"
            )}
          </p>
        </div>
        <div className="card stat-card">
          <h3>Любимый бренд</h3>
          <p className="stat-value">
            {profile.favorite_brand ? (
              <Link
                to={`/brands/${profile.favorite_brand.id}`}
                className="details-link"
              >
                {profile.favorite_brand.name}
              </Link>
            ) : (
              "-"
            )}
          </p>
        </div>
      </div>

      {/* История отзывов */}
      <div className="reviews-section">
        <h2>История отзывов ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <p className="no-reviews">Отзывов пока нет</p>
        ) : (
          <div className="list-container">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;