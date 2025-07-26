import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../hooks/api";
import ReviewCard from "../components/ReviewCard";
import UnifiedCard from "../components/UnifiedCard";
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
  const [newReview, setNewReview] = useState({ review_text: "", ratings: {} });
  const [hoveredStars, setHoveredStars] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  // Загружаем данные об энергетике, отзывах и критериях
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [energyRes, reviewsRes, criteriaRes] = await Promise.all([
          api.get(`/energies/${id}`),
          api.get(`/energies/${id}/reviews`),
          api.get(`/criteria/`),
        ]);

        setEnergy(energyRes.data); // Сохраняем данные об энергетике
        setReviews(reviewsRes.data); // Сохраняем отзывы
        setCriteria(criteriaRes.data); // Сохраняем критерии
        // Инициализируем состояние для нового отзыва
        setNewReview({
          review_text: "",
          ratings: criteriaRes.data.reduce((acc, curr) => ({ ...acc, [curr.id]: "" }), {}),
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
  }, [id]);

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

  // Функция для отправки отзыва
  const handleSubmit = async (e) => {
    e.preventDefault(); // Предотвращаем перезагрузку страницы
    if (!userId || !token) return; // Проверяем авторизацию
    try {
      // Формируем массив оценок
      const ratings = Object.entries(newReview.ratings)
        .filter(([_, value]) => value !== "")
        .map(([criteriaId, value]) => ({
          criteria_id: parseInt(criteriaId),
          rating_value: parseFloat(value),
          created_at: new Date().toISOString(),
        }));
      // Отправляем отзыв на сервер
      await api.post(`/reviews/`, {
        user_id: userId,
        review_text: newReview.review_text,
        energy_id: parseInt(id),
        created_at: new Date().toISOString(),
        ratings,
      });
      // Загружаем обновленный список отзывов
      const reviewsRes = await api.get(`/energies/${id}/reviews`);
      setReviews(reviewsRes.data);
      // Сбрасываем форму
      setNewReview({
        review_text: "",
        ratings: criteria.reduce((acc, curr) => ({ ...acc, [curr.id]: "" }), {}),
      });
      setHoveredStars({});
      setCurrentPage(1);
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

  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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
            {energy.average_rating}/10 ({energy.review_count} отзывов)
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
        <h2>Отзывы</h2>
        <div className="list-container">
          {currentReviews.length > 0 ? (
            currentReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                criteria={criteria}
                isProfile={false}
                userId={userId}
                onReviewUpdated={() => api.get(`/energies/${id}/reviews`).then((res) => setReviews(res.data))}
              />
            ))
          ) : (
            <p>Отзывов пока нет.</p>
          )}
        </div>
        {totalPages > 1 && (
          <div className="pagination">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={currentPage === index + 1 ? "active" : ""}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}
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
              placeholder="Текст отзыва"
              value={newReview.review_text}
              onChange={(e) => setNewReview({ ...newReview, review_text: e.target.value })}
              required
            />
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