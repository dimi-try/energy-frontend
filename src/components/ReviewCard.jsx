import React from "react";

// Компонент карточки отзыва
const ReviewCard = ({ review, criteria }) => (
  <div className="card" style={{ flexDirection: "column", alignItems: "flex-start" }}>
    {/* Заголовок отзыва с именем пользователя и датой */}
    <div className="review-header" style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
      <span>{review.user_name}</span>
      <span>{new Date(review.created_at).toLocaleDateString()}</span>
    </div>
    {/* Текст отзыва */}
    <p>{review.review_text}</p>
    {/* Список критериев и оценок */}
    {review.ratings?.map(rating => (
      <div key={rating.id} className="rating-item" style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
        <span>{criteria.find(c => c.id === rating.criteria_id)?.name}: </span>
        <span className="rating">{rating.rating_value}/10</span>
      </div>
    ))}
  </div>
);

export default ReviewCard;