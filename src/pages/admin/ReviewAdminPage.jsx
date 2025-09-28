import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

import api from "../../hooks/api";
import { formatTimestamp } from "../../hooks/formatDate";

import Loader from "../../components/Loader";
import Error from "../../components/Error";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Pagination from "../../components/Pagination";

import "./ReviewAdminPage.css";

const ReviewAdminPage = ({ token }) => {
  const [reviews, setReviews] = useState([]);
  const [energyData, setEnergyData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(() => {
    const savedPage = sessionStorage.getItem("review-admin-page");
    return savedPage ? parseInt(savedPage, 10) : 1;
  });
  const [totalPages, setTotalPages] = useState(1);
  const reviewsPerPage = 10;

  // Загрузка списка отзывов и общего количества
  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const [reviewsResponse, countResponse] = await Promise.all([
        api.get(`/reviews/?limit=${reviewsPerPage}&offset=${(page - 1) * reviewsPerPage}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get(`/reviews/count/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setReviews(reviewsResponse.data);
      setTotalPages(Math.ceil(countResponse.data.total / reviewsPerPage));
      return reviewsResponse.data;
    } catch (err) {
      setError("Ошибка при загрузке отзывов: " + (err.response?.data?.detail || err.message));
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Загрузка данных энергетиков по их ID
  const fetchEnergies = async (energyIds) => {
    const promises = energyIds.map(async (energyId) => {
      try {
        const response = await api.get(`/energies/${energyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEnergyData((prev) => ({
          ...prev,
          [energyId]: {
            name: response.data.name,
            brand_name: response.data.brand?.name || "Без бренда",
          },
        }));
      } catch (err) {
        setEnergyData((prev) => ({
          ...prev,
          [energyId]: { name: "Неизвестный энергетик", brand_name: "Неизвестный бренд" },
        }));
        console.error(`Ошибка загрузки энергетика ${energyId}:`, err.message);
      }
    });
    await Promise.all(promises);
  };

  // Загрузка данных при монтировании компонента или изменении страницы
  useEffect(() => {
    const loadData = async () => {
      const reviewsData = await fetchReviews();
      const energyIds = [...new Set(reviewsData.map((review) => review.energy_id))];
      await fetchEnergies(energyIds);
    };
    loadData();
  }, [page, token]);

  // Сохранение текущей страницы
  useEffect(() => {
    sessionStorage.setItem("review-admin-page", page);
  }, [page]);

  // Удаление отзыва
  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("Вы уверены, что хотите удалить этот отзыв?")) {
      try {
        await api.delete(`/reviews/${reviewId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        await fetchReviews(); // Обновляем список отзывов
        toast.success("Отзыв успешно удален!");
      } catch (err) {
        toast.error("Ошибка при удалении отзыва: " + (err.response?.data?.detail || err.message));
      }
    }
  };

  // Обработчик повторного запроса данных
  const handleRetry = () => {
    fetchReviews().then((reviewsData) => {
      const energyIds = [...new Set(reviewsData.map((review) => review.energy_id))];
      fetchEnergies(energyIds);
    });
  };

  // Функция для получения названия энергетика и бренда
  const getEnergyName = (energyId) => {
    return energyData[energyId]?.name
      ? `${energyData[energyId].brand_name} ${energyData[energyId].name}`
      : "Загрузка...";
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <Card type="container">
        <Error message={error} />
        <Button variant="primary" onClick={handleRetry}>
          Попробовать снова
        </Button>
      </Card>
    );
  }

  return (
    <div className="container">
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

      <h1>Управление отзывами</h1>

      <Card type="container">
        <div className="list-container">
          {reviews.length > 0 ? (
            <>
              {reviews.map((review) => (
                <Card key={review.id} type="container" className="review-card">
                  <div>
                    <p>
                      <strong>ID отзыва: </strong>{review.id}
                    </p>
                    <p>
                      <strong>ID пользователя: </strong>
                      <Link to={`/profile/${review.user_id}`} className="details-link">
                        {review.user_id}
                      </Link>
                    </p>
                    <p>
                      <strong>Пользователь: </strong>{review.user?.username || "Имя не указано"}
                    </p>
                    <p>
                      <strong>Энергетик: </strong>
                      <Link to={`/energies/${review.energy_id}`} className="details-link">
                        {getEnergyName(review.energy_id)}
                      </Link>
                    </p>
                    <p>
                      <strong>Текст: </strong>{review.review_text || "Нет текста"}
                    </p>
                    {review.image_url && (
                      <div className="review-image">
                        <img
                          src={`${process.env.REACT_APP_BACKEND_URL}/${review.image_url}`}
                          alt={`Отзыв ${review.id}`}
                          loading="lazy"
                        />
                      </div>
                    )}
                    <p>
                      <strong>Средний рейтинг: </strong>
                      {review.average_rating_review
                        ? `${Number(review.average_rating_review).toFixed(1)}/10`
                        : "Нет рейтинга"}
                    </p>
                    <p>
                      <strong>Создан: </strong>{formatTimestamp(review.created_at)}
                    </p>
                  </div>
                  <div>
                    <Button variant="danger" onClick={() => handleDeleteReview(review.id)}>
                      Удалить
                    </Button>
                  </div>
                </Card>
              ))}
              {totalPages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              )}
            </>
          ) : (
            <Error message="Отзывы не найдены" />
          )}
        </div>
      </Card>
    </div>
  );
};

export default ReviewAdminPage;