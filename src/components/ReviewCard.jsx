import React from "react";
import { Link } from "react-router-dom";
import "./ReviewCard.css"; // Подключение стилей

const ReviewCard = ({ review, criteria, isProfile = false }) => (
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

    {/* Текст отзыва */}
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
  </div>
);

export default ReviewCard;
