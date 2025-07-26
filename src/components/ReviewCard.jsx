import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../hooks/api";
import { toast } from "react-toastify";
import "./ReviewCard.css"; // Подключение стилей

const ReviewCard = ({ review, criteria, isProfile = false, userId, onReviewUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editReview, setEditReview] = useState({
    review_text: review.review_text,
    ratings: review.ratings.reduce((acc, curr) => ({ ...acc, [curr.criteria_id]: curr.rating_value }), {}),
  });
  const [hoveredStars, setHoveredStars] = useState({});

  // Обработчик клика по звезде
  const handleStarClick = (criterionId, rating) => {
    setEditReview({
      ...editReview,
      ratings: { ...editReview.ratings, [criterionId]: rating },
    });
  };

  // Обработчик наведения на звезду
  const handleStarHover = (criterionId, rating) => {
    setHoveredStars({ ...hoveredStars, [criterionId]: rating });
  };

  // Обработчик ухода курсора со звезды
  const handleStarLeave = (criterionId) => {
    setHoveredStars({ ...hoveredStars, [criterionId]: 0 });
  };

  // Обработчик отправки отредактированного отзыва
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const ratings = Object.entries(editReview.ratings)
        .filter(([_, value]) => value !== "")
        .map(([criteriaId, value]) => ({
          criteria_id: parseInt(criteriaId),
          rating_value: parseFloat(value),
        }));
      await api.put(`/reviews/${review.id}`, {
        review_text: editReview.review_text,
        ratings,
      });
      setIsEditing(false);
      onReviewUpdated(); // Обновляем список отзывов
      toast.success("Отзыв успешно обновлен!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      toast.error(
        err.response?.data?.detail || "Ошибка при обновлении отзыва. Попробуйте позже.",
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

  // Обработчик удаления отзыва
  const handleDelete = async () => {
    if (window.confirm("Вы уверены, что хотите удалить отзыв?")) {
      try {
        await api.delete(`/reviews/${review.id}`);
        onReviewUpdated(); // Обновляем список отзывов
        toast.success("Отзыв успешно удален!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } catch (err) {
        toast.error(
          err.response?.data?.detail || "Ошибка при удалении отзыва. Попробуйте позже.",
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
    }
  };

  return (
    <div className="card review-card">
      {/* Заголовок отзыва */}
      <div className="review-header">
        <span>
          {isProfile && review.energy_id ? (
            <Link to={`/energies/${review.energy_id}`} className="details-link">
              {review.brand} {review.energy}
            </Link>
          ) : (
            review.user?.username || `${review.brand} ${review.energy}`
          )}
        </span>
        <span>{new Date(review.created_at).toLocaleDateString()}</span>
      </div>

      {/* Средний балл отзыва */}
      {review.average_rating_review !== null && (
        <p className="review-average-rating">
          <span className="star">★</span>
          <span className="rating">{Number(review.average_rating_review).toFixed(1)}/10</span>
        </p>
      )}

      {/* Форма редактирования или текст отзыва */}
      {isEditing ? (
        <form onSubmit={handleUpdate} className="edit-review-form">
          <textarea
            name="review_text"
            placeholder="Текст отзыва"
            value={editReview.review_text}
            onChange={(e) => setEditReview({ ...editReview, review_text: e.target.value })}
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
                        ratingValue <= (hoveredStars[criterion.id] || editReview.ratings[criterion.id] || 0)
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
          <div className="edit-buttons">
            <button type="submit">Сохранить</button>
            <button type="button" onClick={() => setIsEditing(false)}>
              Отмена
            </button>
          </div>
        </form>
      ) : (
        <>
          <p>{review.review_text || "Нет текста отзыва"}</p>

          {/* Список критериев и оценок */}
          {review.ratings?.map((rating) => (
            <div key={rating.id} className="rating-item">
              <span>
                {criteria.find((c) => c.id === rating.criteria_id)?.name || `Критерий ${rating.criteria_id}`}:
              </span>
              <span className="rating">{rating.rating_value}/10</span>
            </div>
          ))}
        </>
      )}

      {/* Кнопки редактирования и удаления для владельца отзыва */}
      {userId && review.user_id === userId && !isEditing && (
        <div className="review-actions">
          <button className="edit-button" onClick={() => setIsEditing(true)}>
            Редактировать
          </button>
          <button className="delete-button" onClick={handleDelete}>
            Удалить
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;