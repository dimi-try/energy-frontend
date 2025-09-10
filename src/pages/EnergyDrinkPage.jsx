import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

import api from "../hooks/api";

import ReviewCard from "../components/ReviewCard";
import UnifiedCard from "../components/UnifiedCard";
import ImageUpload from '../components/ImageUpload';
import Pagination from "../components/Pagination";

import "./EnergyDrinkPage.css";

// Компонент страницы энергетика
const EnergyDrinkPage = ({ userId, token }) => {
  // Получаем ID энергетика из URL
  const { id } = useParams();
  //Состояния энергетиков, отзывов и критерий
  const [energy, setEnergy] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [criteria, setCriteria] = useState([]);
  // Состояние для нового отзыва
  const [newReview, setNewReview] = useState({ review_text: "", ratings: {}, image: null });
  // Состояние для звезд
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

  // Функция для отправки отзыва
  const handleSubmit = async (e) => {
    e.preventDefault(); // Предотвращаем перезагрузку страницы
    if (!userId || !token) return; // Проверяем авторизацию
    try {
      let imageUrl = null;
      if (newReview.image) {
        const formData = new FormData();
        formData.append("file", newReview.image);
        const uploadRes = await api.post("/reviews/upload-image/", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        imageUrl = uploadRes.data.image_url;
      }

      // Формируем массив оценок
      const ratings = Object.entries(newReview.ratings)
        .filter(([_, value]) => value !== "")
        .map(([criteriaId, value]) => ({
          criteria_id: parseInt(criteriaId),
          rating_value: parseFloat(value)
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
            <img src={`${process.env.REACT_APP_BACKEND_URL}/${energy.image_url}`} alt={energy.name} />
          ) : (
            <div className="no-image">Нет фото</div>
          )}
        </div>
        <div className="energy-details">
          <h1>{energy.brand?.name} {energy.name}</h1>
          <p className="rating">
            <span className="star">★</span>
            {energy.average_rating || "0.0"}/10 ({energy.review_count} отзывов)
          </p>
          {/* Информация об энергетике */}
          <UnifiedCard>
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
            {energy.description && (
              <p>
                <strong>Описание:</strong> {energy.description}
              </p>
            )}
            {energy.ingredients && (
              <p>
                <strong>Ингредиенты:</strong> {energy.ingredients}
              </p>
            )}
          </UnifiedCard>
        </div>
      </div>

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
            <ImageUpload
              image={newReview.image}
              imageUrl={null} // В EnergyDrinkPage нет текущего изображения
              onImageChange={(file) => setNewReview({ ...newReview, image: file })}
              backendUrl={process.env.REACT_APP_BACKEND_URL}
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

      {/* Список отзывов */}
      <UnifiedCard>
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
    </div>
  );
};

export default EnergyDrinkPage;