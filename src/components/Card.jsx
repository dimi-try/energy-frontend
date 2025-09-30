import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../hooks/api";
import { formatTimestamp } from "../hooks/formatDate";

import ImageUpload from "./ImageUpload";
import Button from "./Button";

import "./Card.css";

//компонент карточки с поддержкой разных типов
const Card = ({
  children,
  className = "",
  type = "container",
  review,
  criteria,
  isProfile = false,
  userId,
  token,
  onReviewUpdated,
  rank,
  onClick,
}) => {
  //состояние для режима редактирования отзыва
  const [isEditing, setIsEditing] = React.useState(false);
  //состояние для редактируемого отзыва
  const [editReview, setEditReview] = React.useState(
    review
      ? {
          review_text: review.review_text || "",
          ratings: review.ratings.reduce(
            (acc, curr) => ({ ...acc, [curr.criteria_id]: curr.rating_value }),
            {}
          ),
          image: null,
          image_url: review.image_url || "",
        }
      : {}
  );
  //состояние для подсветки звезд при наведении
  const [hoveredStars, setHoveredStars] = React.useState({});

  //обработчик клика по звезде для установки рейтинга
  const handleStarClick = (criterionId, rating) => {
    setEditReview({
      ...editReview,
      ratings: { ...editReview.ratings, [criterionId]: rating },
    });
  };

  //обработчик наведения на звезду
  const handleStarHover = (criterionId, rating) => {
    setHoveredStars({ ...hoveredStars, [criterionId]: rating });
  };

  //обработчик ухода курсора со звезды
  const handleStarLeave = (criterionId) => {
    setHoveredStars({ ...hoveredStars, [criterionId]: 0 });
  };

  //обработчик отправки формы редактирования отзыва
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      //загрузка изображения, если оно выбрано
      let imageUrl = editReview.image_url;
      if (editReview.image) {
        const formData = new FormData();
        formData.append("file", editReview.image);
        const uploadRes = await api.post("/reviews/upload-image/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrl = uploadRes.data.image_url;
      }

      //формирование массива оценок
      const ratings = Object.entries(editReview.ratings)
        .filter(([_, value]) => value !== "")
        .map(([criteriaId, value]) => ({
          criteria_id: parseInt(criteriaId),
          rating_value: parseFloat(value),
        }));

      //проверка наличия оценок
      if (ratings.length === 0) {
        toast.error("Оценки обязательны!");
        return;
      }

      //отправка обновленного отзыва
      await api.put(`/reviews/${review.id}`, {
        review_text: editReview.review_text || null,
        ratings,
        image_url: imageUrl,
      });
      setIsEditing(false);
      onReviewUpdated();
      toast.success("Отзыв успешно обновлен!");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Ошибка при обновлении отзыва.");
    }
  };

  //обработчик удаления отзыва
  const handleDelete = async () => {
    if (window.confirm("Вы уверены, что хотите удалить отзыв?")) {
      try {
        await api.delete(`/reviews/${review.id}`);
        onReviewUpdated();
        toast.success("Отзыв успешно удален!");
      } catch (err) {
        toast.error(err.response?.data?.detail || "Ошибка при удаления отзыва.");
      }
    }
  };

  //анимации для карточки
  const motionProps = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.6, ease: "easeOut" },
  };

  //класс для медали в зависимости от ранга
  const medalClass =
    rank === 1 ? "medal-gold" : rank === 2 ? "medal-silver" : rank === 3 ? "medal-bronze" : "medal-default";

  //карточка типа list для топов
  if (type === "list") {
    return (
      <motion.div {...motionProps} className={`card-base card-list ${className}`} onClick={onClick}>
        {/* ранг карточки */}
        {rank && <span className={`card-rank ${medalClass}`}>{rank}</span>}
        {children}
      </motion.div>
    );
  }

  //карточка типа review для отзыва
  if (type === "review") {
    return (
      <motion.div {...motionProps} className={`card-base card-review ${className}`}>
        {/* заголовок отзыва */}
        <div className="card-header">
          <span className="card-review-item">
            {isProfile && review.energy_id ? (
              <Link to={`/energies/${review.energy_id}`} className="details-link">
                🥤 {review.brand} {review.energy}
              </Link>
            ) : (
              <div className="card-review-user">
                {/* аватар пользователя */}
                {review.user?.image_url ? (
                  <img
                    src={`${process.env.REACT_APP_BACKEND_URL}/${review.user.image_url}`}
                    alt={review.user?.username || "Пользователь"}
                    className="card-user-avatar"
                  />
                ) : (
                  <span className="card-user-placeholder">👤</span>
                )}
                {/* имя пользователя */}
                {userId && token ? (
                  <Link to={`/profile/${review.user_id}`} className="card-username">
                    {review.user?.username || "Имя пустое"}
                  </Link>
                ) : (
                  <span className="card-username">{review.user?.username || "Имя пустое"}</span>
                )}
              </div>
            )}
          </span>
        </div>

        {/* средний рейтинг отзыва */}
        {review.average_rating_review !== null && (
          <p className="card-review-average-rating">
            <span className="card-star">★</span>
            <span className="card-rating">{Number(review.average_rating_review).toFixed(1)}/10</span>
          </p>
        )}

        {/* изображение отзыва */}
        {review.image_url && (
          <div className="card-review-image">
            <img src={`${process.env.REACT_APP_BACKEND_URL}/${review.image_url}`} alt="Отзыв" />
          </div>
        )}

        {/* форма редактирования отзыва */}
        {isEditing ? (
          <form onSubmit={handleUpdate} className="card-edit-form">
            <textarea
              name="review_text"
              placeholder="Текст отзыва (необязательно)"
              value={editReview.review_text}
              onChange={(e) => setEditReview({ ...editReview, review_text: e.target.value })}
            />
            <ImageUpload
              image={editReview.image}
              imageUrl={editReview.image_url}
              onImageChange={(file) => setEditReview({ ...editReview, image: file, image_url: "" })}
              backendUrl={process.env.REACT_APP_BACKEND_URL}
            />
            {criteria.map((criterion) => (
              <div key={criterion.id} className="card-star-criteria">
                <label>{criterion.name}</label>
                <div
                  className="card-stars-rating"
                  onMouseLeave={() => handleStarLeave(criterion.id)}
                >
                  {[...Array(10)].map((_, index) => {
                    const ratingValue = index + 1;
                    return (
                      <span
                        key={index}
                        className={`card-star-rating ${
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
            <div className="card-edit-buttons">
              <Button type="submit" variant="primary">
                Сохранить
              </Button>
              <Button variant="danger" onClick={() => setIsEditing(false)}>
                Отмена
              </Button>
            </div>
          </form>
        ) : (
          <>
            <p>{review.review_text || "Нет текста отзыва"}</p>
            {review.ratings?.map((rating) => (
              <div key={rating.id} className="card-rating-item">
                <span>
                  {criteria.find((c) => c.id === rating.criteria_id)?.name ||
                    `Критерий ${rating.criteria_id}`}
                  :
                </span>
                <span className="card-rating">{rating.rating_value}/10</span>
              </div>
            ))}
          </>
        )}

        {/* дата отзыва */}
        <div className="card-footer">
          <span className="card-review-date">📅 {formatTimestamp(review.created_at)}</span>
        </div>

        {/* кнопки редактирования и удаления */}
        {userId && review.user_id === userId && !isEditing && (
          <div className="card-review-actions">
            <Button variant="primary" onClick={() => setIsEditing(true)}>
              Редактировать
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Удалить
            </Button>
          </div>
        )}
      </motion.div>
    );
  }

  //карточка типа container для обертки
  return (
    <motion.div {...motionProps} className={`card-base card-container ${className}`}>
      {children}
    </motion.div>
  );
};

export default Card;