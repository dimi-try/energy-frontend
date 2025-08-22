import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../hooks/api";
import ReviewCard from "../components/ReviewCard";
import UnifiedCard from "../components/UnifiedCard";
import Pagination from "../components/Pagination";
import { ToastContainer, toast } from "react-toastify";
import "./EnergyDrinkPage.css";

// Компонент страницы энергетика
const EnergyDrinkPage = ({ userId, token }) => {
  // Получаем ID энергетика из URL
  const { id } = useParams();
  // Состояние для данных об энергетике
  const [energy, setEnergy] = useState(null);
  // Состояние для списка отзывов
  const [reviews, setReviews] = useState([]);
  // Состояние для критериев оценки
  const [criteria, setCriteria] = useState([]);
  // Состояние для нового отзыва
  const [newReview, setNewReview] = useState({ review_text: "", ratings: {}, image: null });
  const [hoveredStars, setHoveredStars] = useState({});
  // Состояние для текущей страницы
  const [page, setPage] = useState(() => {
    const savedPage = sessionStorage.getItem(`energy-page-${id}`);
    return savedPage ? parseInt(savedPage, 10) : 1;
  });
  // Состояние для общего количества страниц
  const [totalPages, setTotalPages] = useState(1);
  // Количество отзывов на странице
  const reviewsPerPage = 10;

  // Загружаем данные об энергетике, отзывах, критериях и общем количестве отзывов
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [energyRes, reviewsRes, criteriaRes, countRes] = await Promise.all([
          api.get(`/energies/${id}`),
          api.get(`/energies/${id}/reviews?limit=${reviewsPerPage}&offset=${(page - 1) * reviewsPerPage}`),
          api.get(`/criteria/`),
          api.get(`/energies/${id}/reviews/count/`)
        ]);

        setEnergy(energyRes.data); // Сохраняем данные об энергетике
        setReviews(reviewsRes.data); // Сохраняем отзывы
        setCriteria(criteriaRes.data); // Сохраняем критерии
        setTotalPages(Math.ceil(countRes.data.total / reviewsPerPage)); // Устанавливаем общее количество страниц
        // Инициализируем состояние для нового отзыва
        setNewReview({
          review_text: "",
          ratings: criteriaRes.data.reduce((acc, curr) => ({ ...acc, [curr.id]: "" }), {}),
          image: null
        });
      } catch (err) {
        toast.error("Ошибка при загрузке данных. Попробуйте позже.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    };
    fetchData();
  }, [id, page]);

  // Сохранение текущей страницы
  useEffect(() => {
    sessionStorage.setItem(`energy-page-${id}`, page);
  }, [page, id]);

  const handleStarClick = (criterionId, rating) => {
    setNewReview({
      ...newReview,
      ratings: { ...newReview.ratings, [criterionId]: rating },
    });
  };

  const handleStarHover = (criterionId, rating) => {
    setHoveredStars({ ...hoveredStars, [criterionId]: rating });
  };

  const handleStarLeave = (criterionId) => {
    setHoveredStars({ ...hoveredStars, [criterionId]: 0 });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Файл слишком большой. Максимальный размер: 5 МБ", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }
      const allowedTypes = ["image/jpeg", "image/png", "image/heic"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Недопустимый формат. Разрешены: JPG, JPEG, PNG, HEIC", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }
      setNewReview({ ...newReview, image: file });
    }
  };

  // Функция для отправки отзыва
  const handleSubmit = async (e) => {
    e.preventDefault(); // Предотвращаем перезагрузку страницы
    if (!userId || !token) return; // Проверяем авторизацию
    try {
      let imageUrl = null;
      if (newReview.image) {
        const formData = new FormData();
        formData.append("file", newReview.image);
        const uploadRes = await api.post("/reviews/upload-review-image/", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        imageUrl = uploadRes.data.image_url;
      }

      // Формируем массив оценок
      const ratings = Object.entries(newReview.ratings)
        .filter(([_, value]) => value !== "")
        .map(([criteriaId, value]) => ({
          criteria_id: parseInt(criteriaId),
          rating_value: parseFloat(value),
          created_at: new Date().toISOString(),
        }));

      if (ratings.length === 0) {
        toast.error("Оценки обязательны!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }

      await api.post(`/reviews/`, {
        user_id: userId,
        review_text: newReview.review_text || null,
        energy_id: parseInt(id),
        created_at: new Date().toISOString(),
        ratings,
        image_url: imageUrl,
      });
      // Обновляем данные энергетика и отзывы
      const [energyRes, reviewsRes, countRes] = await Promise.all([
        api.get(`/energies/${id}`),
        api.get(`/energies/${id}/reviews?limit=${reviewsPerPage}&offset=${(page - 1) * reviewsPerPage}`),
        api.get(`/energies/${id}/reviews/count/`)
      ]);
      setEnergy(energyRes.data);
      setReviews(reviewsRes.data);
      setTotalPages(Math.ceil(countRes.data.total / reviewsPerPage)); // Обновляем количество страниц
      // Сбрасываем форму
      setNewReview({
        review_text: "",
        ratings: criteria.reduce((acc, curr) => ({ ...acc, [curr.id]: "" }), {}),
        image: null
      });
      setHoveredStars({});
      toast.success("Отзыв успешно отправлен!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      toast.error(
        err.response?.data?.detail || "Ошибка при отправке отзыва. Попробуйте позже.",
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

  // Обновление данных после редактирования/удаления отзыва
  const handleReviewUpdated = async () => {
    try {
      const [energyRes, reviewsRes, countRes] = await Promise.all([
        api.get(`/energies/${id}`),
        api.get(`/energies/${id}/reviews?limit=${reviewsPerPage}&offset=${(page - 1) * reviewsPerPage}`),
        api.get(`/energies/${id}/reviews/count/`)
      ]);
      setEnergy(energyRes.data);
      setReviews(reviewsRes.data);
      setTotalPages(Math.ceil(countRes.data.total / reviewsPerPage)); // Обновляем количество страниц
      toast.success("Данные энергетика и отзывы обновлены!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      toast.error(
        err.response?.data?.detail || "Ошибка при обновлении данных.",
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

  // Показываем индикатор загрузки, если данные еще не загружены
  if (!energy) return <p className="loading">Загрузка...</p>;

  return (
    <div className="energy-container container">
      {/* Контейнер для уведомлений */}
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

      <div className="energy-header">
        <div className="energy-image">
          {energy.image_url ? (
            <img src={energy.image_url} alt={energy.name} />
          ) : (
            <div className="no-image">Нет фото</div>
          )}
        </div>
        <div className="energy-details">
          <h1>{energy.brand?.name} {energy.name}</h1>
          <p className="rating">
            <span className="star">★</span>
            {energy.average_rating ? `${energy.average_rating}/10` : "-"} ({energy.review_count} отзывов)
          </p>
          {/* Информация об энергетике */}
          <UnifiedCard className="energy-info">
            <h2>Об энергетике</h2>
            <p>
              <strong>Производитель:</strong>
            </p>
            <p>
              <Link to={`/brands/${energy.brand.id}`} className="details-link">
                {energy.brand?.name}
              </Link>
            </p>
            <p>
              <strong>Категория:</strong> {energy.category.name}
            </p>
            <p>
              <strong>Описание:</strong> {energy.description}
            </p>
            <p>
              <strong>Ингредиенты:</strong> {energy.ingredients}
            </p>
          </UnifiedCard>
        </div>
      </div>

      {/* Список отзывов */}
      <UnifiedCard className="reviews-section">
        <h2>Отзывы ({energy.review_count})</h2>
        <div className="list-container">
          {reviews.length > 0 ? (
            <>
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  criteria={criteria}
                  isProfile={false}
                  userId={userId}
                  onReviewUpdated={handleReviewUpdated}
                />
              ))}
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </>
          ) : (
            <p>Отзывов пока нет.</p>
          )}
        </div>
      </UnifiedCard>

      <UnifiedCard className="review-form">
        <h2>Оставить отзыв</h2>
        {!userId || !token ? (
          <div className="auth-required">
            <p>
              Доступ ограничен. Пожалуйста, зайдите через тг бот{" "}
              <a href="https://t.me/energy_charts_styula_bot">@energy_charts_styula_bot</a>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <textarea
              name="review_text"
              placeholder="Текст отзыва (необязательно)"
              value={newReview.review_text}
              onChange={(e) => setNewReview({ ...newReview, review_text: e.target.value })}
            />
            <div className="image-upload">
              <label>Фото (необязательно, макс. 5 МБ, JPG/JPEG/PNG/HEIC):</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/heic"
                onChange={handleImageChange}
              />
            </div>
            {criteria.map((criterion) => (
              <div key={criterion.id} className="star-criteria">
                <label>{criterion.name}</label>
                <div
                  className="stars-rating"
                  onMouseLeave={() => handleStarLeave(criterion.id)}
                >
                  {[...Array(10)].map((_, index) => {
                    const ratingValue = index + 1;
                    return (
                      <span
                        key={index}
                        className={`star-rating ${
                          ratingValue <= (hoveredStars[criterion.id] || newReview.ratings[criterion.id] || 0)
                            ? "filled"
                            : ""
                        }`}
                        onClick={() => handleStarClick(criterion.id, ratingValue)}
                        onMouseEnter={() => handleStarHover(criterion.id, ratingValue)}
                      >
                        ★
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
            <button type="submit">Отправить</button>
          </form>
        )}
      </UnifiedCard>
    </div>
  );
};

export default EnergyDrinkPage;