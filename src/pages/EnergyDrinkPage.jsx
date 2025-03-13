import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const EnergyDrinkPage = () => {
  const { id } = useParams();
  const [drink, setDrink] = useState(null);
  const [review, setReview] = useState({ criteria1: '', criteria2: '', criteria3: '', text: '' });
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/energy-drinks/${id}`).then((res) => setDrink(res.data));
    axios.get(`${API_URL}/reviews/${id}`).then((res) => setReviews(res.data));
  }, [id]);

  const handleReviewChange = (e) => {
    setReview({ ...review, [e.target.name]: e.target.value });
  };

  const handleSubmitReview = () => {
    if (review.criteria1 && review.criteria2 && review.criteria3 && review.text) {
      axios.post(`${API_URL}/reviews`, { ...review, drinkId: id }).then(() => {
        setReviews([...reviews, review]);
        setReview({ criteria1: '', criteria2: '', criteria3: '', text: '' });
      });
    }
  };

  return drink ? (
    <div>
      <h1>{drink.name}</h1>
      <p>Категория: {drink.category}</p>
      <p>Средняя оценка: {drink.avgRating}</p>
      <p>Описание: {drink.description}</p>

      <h2>Оставить отзыв</h2>
      <input name="criteria1" type="number" placeholder="Критерий 1 (0-10)" onChange={handleReviewChange} value={review.criteria1} />
      <input name="criteria2" type="number" placeholder="Критерий 2 (0-10)" onChange={handleReviewChange} value={review.criteria2} />
      <input name="criteria3" type="number" placeholder="Критерий 3 (0-10)" onChange={handleReviewChange} value={review.criteria3} />
      <textarea name="text" placeholder="Текст отзыва" onChange={handleReviewChange} value={review.text} />
      <button onClick={handleSubmitReview} disabled={!review.criteria1 || !review.criteria2 || !review.criteria3 || !review.text}>
        Оставить отзыв
      </button>

      <h2>Отзывы</h2>
      {reviews.map((r, i) => (
        <div key={i}>
          <p>Пользователь: {r.user}</p>
          <p>Оценки: {r.criteria1}, {r.criteria2}, {r.criteria3}</p>
          <p>{r.text}</p>
        </div>
      ))}
    </div>
  ) : <p>Загрузка...</p>;
};

export default EnergyDrinkPage;
