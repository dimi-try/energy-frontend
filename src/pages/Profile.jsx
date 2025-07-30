import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../hooks/api";
import ReviewCard from "../components/ReviewCard";
import "./Profile.css";
import { toast } from "react-toastify";

// Компонент страницы профиля пользователя
const Profile = ({ userId, token }) => {
  // Состояние для данных профиля
  const [profile, setProfile] = useState(null);
  // Состояние для списка отзывов
  const [reviews, setReviews] = useState([]);
  // Состояние для критериев оценки
  const [criteria, setCriteria] = useState([]);
  // Состояние для ошибок
  const [error, setError] = useState(null);
  // Состояние для загрузки
  const [loading, setLoading] = useState(true);
  // Состояние для режима редактирования
  const [isEditing, setIsEditing] = useState(false);
  // Состояние для нового имени пользователя
  const [newUsername, setNewUsername] = useState("");

  // Загружаем данные профиля, отзывы и критерии
  useEffect(() => {
    if (!userId || !token) {
      setLoading(false); // Если нет userId или token, не загружаем данные
      return;
    }
    setError(null); // Сбрасываем ошибки
    setLoading(true); // Устанавливаем загрузку

    const fetchData = async () => {
      try {
        const [profileRes, reviewsRes, criteriaRes] = await Promise.all([
          api.get(`/users/${userId}/profile`),
          api.get(`/users/${userId}/reviews`),
          api.get(`/criteria/`),
        ]);

        setProfile(profileRes.data); // Сохраняем данные профиля
        setReviews(reviewsRes.data.reviews); // Сохраняем отзывы
        setCriteria(criteriaRes.data); // Сохраняем критерии оценки
        setNewUsername(profileRes.data.user.username); // Устанавливаем начальное имя
      } catch (err) {
        setError(err.response?.data?.detail || err.message);
        toast.error(err.response?.data?.detail || "Ошибка при загрузке данных", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId, token]);

  // Обновление профиля и отзывов после редактирования/удаления
  const handleReviewUpdated = async () => {
    try {
      const [profileRes, reviewsRes] = await Promise.all([
        api.get(`/users/${userId}/profile`),
        api.get(`/users/${userId}/reviews`),
      ]);
      setProfile(profileRes.data);
      setReviews(reviewsRes.data.reviews);
      setNewUsername(profileRes.data.user.username); // Обновляем имя на случай изменения
      toast.success("Данные профиля и отзывы обновлены!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      toast.error(
        err.response?.data?.detail || "Ошибка при обновлении данных профиля.",
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    }
  };

  // Обработчик отправки формы редактирования юзернейма
  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/users/${userId}/profile`, {
        username: newUsername,
      });
      setProfile({ ...profile, user: response.data }); // Обновляем профиль
      setIsEditing(false); // Выключаем режим редактирования
      toast.success("Имя успешно обновлено!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      setError(err.response?.data?.detail || "Ошибка при обновлении имени");
      toast.error(err.response?.data?.detail || "Ошибка при обновлении имени", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  // Если пользователь не авторизован
  if (!userId || !token) {
    return (
      <div className="profile-container container">
        <h1>Доступ ограничен</h1>
        <p>
          Пожалуйста, зайдите через тг бот{" "}
          <a href="https://t.me/energy_charts_styula_bot">@energy_charts_styula_bot</a>
        </p>
      </div>
    );
  }

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
        {isEditing ? (
          <form onSubmit={handleUpdateUsername} className="edit-username-form">
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Новое имя пользователя"
              maxLength={100}
              required
            />
            <div className="edit-buttons">
              <button type="submit">Сохранить</button>
              <button type="button" onClick={() => setIsEditing(false)}>
                Отмена
              </button>
            </div>
          </form>
        ) : (
          <>
            <h1>{profile.user.username}</h1>
            <button
              className="edit-profile-button"
              onClick={() => setIsEditing(true)}
            >
              Редактировать имя
            </button>
          </>
        )}
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
              <ReviewCard
                key={review.id}
                review={review}
                criteria={criteria}
                isProfile={true}
                userId={userId}
                onReviewUpdated={handleReviewUpdated}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;