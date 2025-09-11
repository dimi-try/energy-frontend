import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

import api from "../hooks/api";

import ReviewCard from "../components/ReviewCard";
import UnifiedCard from "../components/UnifiedCard";
import Pagination from "../components/Pagination";
import AvatarUpload from "../components/AvatarUpload";

import "./Profile.css";

// Компонент страницы профиля пользователя
const Profile = ({ userId: currentUserId, token }) => {
  // Получаем userId из URL
  const { profileUserId } = useParams();
  // Используем ID из URL или текущего пользователя
  const targetUserId = profileUserId ? BigInt(profileUserId) : currentUserId;

  // Состояние для данных профиля
  const [profile, setProfile] = useState(null);
  // Состояние для аватарки
  const [avatar, setAvatar] = useState(null);
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
  // Состояние для текущей страницы
  const [page, setPage] = useState(() => {
    const savedPage = sessionStorage.getItem(`profile-page-${targetUserId}`);
    return savedPage ? parseInt(savedPage, 10) : 1;
  });
  // Состояние для общего количества страниц
  const [totalPages, setTotalPages] = useState(1);
  // Количество отзывов на странице
  const reviewsPerPage = 10;

  // Загружаем данные профиля, отзывы, критерии и общее количество отзывов
  useEffect(() => {
    if (!currentUserId || !token) {
      setLoading(false); // Если нет текущего пользователя или токена, не загружаем данные
      return;
    }
    setError(null); // Сбрасываем ошибки
    setLoading(true); // Устанавливаем загрузку

    const fetchData = async () => {
      try {
        const [profileRes, reviewsRes, criteriaRes, countRes] = await Promise.all([
          api.get(`/users/${targetUserId}/profile`),
          api.get(`/users/${targetUserId}/reviews?limit=${reviewsPerPage}&offset=${(page - 1) * reviewsPerPage}`),
          api.get(`/criteria/`),
          api.get(`/users/${targetUserId}/reviews/count/`),
        ]);

        setProfile(profileRes.data); // Сохраняем данные профиля
        setReviews(reviewsRes.data.reviews); // Сохраняем отзывы
        setCriteria(criteriaRes.data); // Сохраняем критерии оценки
        setNewUsername(profileRes.data.user.username); // Устанавливаем начальное имя
        setTotalPages(Math.ceil(countRes.data.total / reviewsPerPage)); // Устанавливаем общее количество страниц
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
  }, [currentUserId, token, targetUserId, page]);

  // Сохранение текущей страницы
  useEffect(() => {
    sessionStorage.setItem(`profile-page-${targetUserId}`, page);
  }, [page, targetUserId]);

  // Обновление профиля после изменения аватарки
  const handleAvatarUpdated = (updatedUser) => {
    console.log('Обновленный профиль:', updatedUser); // Логирование для отладки
    setProfile({ ...profile, user: updatedUser });
  };

  // Обновление профиля и отзывов после редактирования/удаления
  const handleReviewUpdated = async () => {
    try {
      const [profileRes, reviewsRes, countRes] = await Promise.all([
        api.get(`/users/${targetUserId}/profile`),
        api.get(`/users/${targetUserId}/reviews?limit=${reviewsPerPage}&offset=${(page - 1) * reviewsPerPage}`),
        api.get(`/users/${targetUserId}/reviews/count/`),
      ]);
      setProfile(profileRes.data);
      setReviews(reviewsRes.data.reviews);
      setNewUsername(profileRes.data.user.username); // Обновляем имя на случай изменения
      setTotalPages(Math.ceil(countRes.data.total / reviewsPerPage)); // Обновляем количество страниц
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
      const response = await api.put(`/users/${targetUserId}/profile`, {
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
  if (!currentUserId || !token) {
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
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      {/* Аватарка и имя */}
      <div className="profile-header">
        <AvatarUpload
          image={avatar}
          imageUrl={profile.user.image_url}
          onImageChange={(file) => setAvatar(file)}
          backendUrl={process.env.REACT_APP_BACKEND_URL}
          userId={currentUserId}
          token={token}
          onAvatarUpdated={handleAvatarUpdated}
          isEditable={targetUserId === currentUserId} //Разрешаем редактировать только свой профиль
        />
        {/* Редактирование только для своего профиля */}
        {isEditing && targetUserId === currentUserId ? (
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
            {/* Кнопка редактирования только для своего профиля */}
            {targetUserId === currentUserId && (
              <button
                className="edit-profile-button"
                onClick={() => setIsEditing(true)}
              >
                Редактировать имя
              </button>
            )}
          </>
        )}
      </div>

      {/* Оценки и средний балл */}
      <div className="stats-row">
        <div className="card stat-card">
          <h3>Всего оценок</h3>
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
                {profile.favorite_energy.brand.name} {profile.favorite_energy.name}
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
      <UnifiedCard>
        <h2>История отзывов ({profile.total_ratings})</h2>
        {reviews.length === 0 ? (
          <p className="no-reviews">Отзывов пока нет</p>
        ) : (
          <>
            <div className="list-container">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  criteria={criteria}
                  isProfile={true}
                  userId={currentUserId}
                  token={token}
                  onReviewUpdated={handleReviewUpdated}
                />
              ))}
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </UnifiedCard>
    </div>
  );
};

export default Profile;