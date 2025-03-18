import React, { useState, useEffect, useRef } from "react"; // Импорт React и необходимых хуков
import { useParams } from "react-router-dom"; // Хук для работы с параметрами URL
import { motion } from "framer-motion"; // Библиотека для анимаций
import axios from "axios"; // HTTP-клиент
import "./EnergyDrinkPage.css"; // Стили компонента

const API_URL = process.env.REACT_APP_API_URL; // Базовый URL API из переменных окружения

const EnergyDrinkPage = () => {
  // Получаем ID энергетика из параметров URL
  const { id } = useParams();

  // Состояние для хранения данных об энергетике
  const [energy, setEnergy] = useState(null);
  
  // Состояние для хранения списка отзывов
  const [reviews, setReviews] = useState([]);
  
  // Состояние для хранения критериев оценки
  const [criteria, setCriteria] = useState([]);
  
  // Состояние для новой формы отзыва
  const [newReview, setNewReview] = useState({
    user_id: "", // ID пользователя
    review_text: "", // Текст отзыва
    ratings: {} // Оценки по критериям {criteriaId: value}
  });

  // Состояние загрузки данных
  const [loading, setLoading] = useState(true);
  
  // Состояние для обработки ошибок
  const [error, setError] = useState(null);
  
  // Референс для контейнера со списком отзывов
  const listRef = useRef(null);

  // Эффект для загрузки данных при монтировании компонента
  useEffect(() => {
    setLoading(true); // Включаем состояние загрузки
    setError(null); // Сбрасываем ошибки

    // Асинхронная функция загрузки данных
    const fetchData = async () => {
      try {
        // Параллельная загрузка данных с API
        const [energyRes, reviewsRes, criteriaRes] = await Promise.all([
          axios.get(`${API_URL}/energy/${id}`), // Данные энергетика
          axios.get(`${API_URL}/energy/${id}/reviews/`), // Список отзывов
          axios.get(`${API_URL}/criteria/`) // Критерии оценки
        ]);

        // Обновление состояний с полученными данными
        setEnergy(energyRes.data);
        setReviews(reviewsRes.data);
        setCriteria(criteriaRes.data);

        // Инициализация оценок для формы
        const initialRatings = criteriaRes.data.reduce((acc, curr) => {
          acc[curr.id] = ""; // Пустые значения для каждого критерия
          return acc;
        }, {});
        
        // Обновление состояния формы
        setNewReview(prev => ({
          ...prev,
          ratings: initialRatings
        }));
      } catch (err) {
        setError(err.message); // Обработка ошибок
      } finally {
        setLoading(false); // Выключаем состояние загрузки
      }
    };

    fetchData(); // Вызов функции загрузки
  }, [id]); // Зависимость от ID энергетика

  // Эффект для восстановления позиции скролла
  useEffect(() => {
    const scrollPos = sessionStorage.getItem(`scrollPosition-energy-${id}`);
    if (listRef.current && scrollPos) {
      listRef.current.scrollTo(0, parseInt(scrollPos, 10)); // Восстановление позиции
    }
  }, [id]);

  // Обработчик скролла для сохранения позиции
  const handleScroll = () => {
    sessionStorage.setItem(`scrollPosition-energy-${id}`, listRef.current.scrollTop);
  };

  // Обработчик изменения полей формы
  const handleChange = (e, criteriaId) => {
    const value = e.target.value;
    
    if (criteriaId) {
      // Обновление оценок по критериям
      setNewReview(prev => ({
        ...prev,
        ratings: {
          ...prev.ratings,
          [criteriaId]: value
        }
      }));
    } else {
      // Обновление основных полей формы
      setNewReview(prev => ({
        ...prev,
        [e.target.name]: value
      }));
    }
  };

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault(); // Предотвращаем стандартное поведение
    setError(null); // Сбрасываем ошибки
    
    try {
      // Преобразование оценок в нужный формат
      const ratings = Object.entries(newReview.ratings).map(([criteriaId, ratingValue]) => {
        const numericValue = parseFloat(ratingValue); // Парсим число
        
        // Валидация введенного значения
        if (isNaN(numericValue) || numericValue < 0 || numericValue > 10) {
          throw new Error("Оценка должна быть числом от 0 до 10");
        }

        // Формируем объект оценки для API
        return {
          criteria_id: parseInt(criteriaId), // ID критерия
          rating_value: numericValue // Значение оценки
        };
      });

      // Отправка POST-запроса на создание отзыва
      const response = await axios.post(`${API_URL}/review/`, {
        user_id: newReview.user_id, // ID пользователя
        review_text: newReview.review_text, // Текст отзыва
        energy_id: parseInt(id), // ID энергетика
        ratings // Массив оценок
      });

      // Обновляем список отзывов
      setReviews([...reviews, response.data]);
      
      // Сбрасываем форму
      setNewReview(prev => ({
        user_id: "",
        review_text: "",
        ratings: criteria.reduce((acc, curr) => ({
          ...acc,
          [curr.id]: ""
        }), {})
      }));

    } catch (err) {
      // Обработка ошибок ответа сервера
      const errorData = err.response?.data;
      let errorMessage = "Ошибка при отправке отзыва";
      
      if (errorData) {
        // Обработка разных форматов ошибок
        if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail.map(e => e.msg).join(", ");
        } else if (typeof errorData.detail === "string") {
          errorMessage = errorData.detail;
        }
      }
      
      setError(errorMessage); // Устанавливаем сообщение об ошибке
    }
  };

  // Отображение состояния загрузки
  if (loading) return <p className="loading">⏳ Загрузка...</p>;
  
  // Отображение ошибок
  if (error) return <p className="error">❌ Ошибка: {error}</p>;
  
  // Если энергетик не найден
  if (!energy) return <p className="not-found">⚠️ Энергетик не найден</p>;

  // Рендер компонента
  return (
    <div className="energy-container">
      {/* Анимированный заголовок */}
      <motion.h1 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.5 }}
      >
        {energy.brand?.name} {energy.name} 
      </motion.h1>

      {/* Блок с информацией об энергетике */}
      <div className="energy-info">
        <p><strong>⭐ Средняя оценка:</strong> {energy.average_rating || "N/A"}</p>
        <p><strong>📝 Описание:</strong> {energy.description}</p>
        <p><strong>📦 Категория:</strong> {energy.category?.name}</p>
      </div>

      {/* Форма для отправки отзыва */}
      <motion.div 
        initial={{ y: 20 }} 
        animate={{ y: 0 }} 
        className="review-form"
      >
        <h2>✍️ Оставить отзыв</h2>
        <form onSubmit={handleSubmit}>
          {/* Поле для ввода User ID */}
          <input
            type="number"
            name="user_id"
            placeholder="Ваш User ID"
            value={newReview.user_id}
            onChange={handleChange}
            required
            min="1"
          />

          {/* Текстовое поле для отзыва */}
          <textarea
            name="review_text"
            placeholder="Текст отзыва"
            value={newReview.review_text}
            onChange={handleChange}
            required
          />

          {/* Блок с критериями оценки */}
          <div className="ratings-form">
            {criteria.map(criterion => (
              <div key={criterion.id} className="rating-input">
                <label>
                  {criterion.name} (0-10):
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={newReview.ratings[criterion.id] || ""}
                    onChange={(e) => handleChange(e, criterion.id)}
                    required
                  />
                </label>
              </div>
            ))}
          </div>

          {/* Кнопка отправки формы */}
          <button type="submit" className="submit-btn">
            📤 Отправить отзыв
          </button>
        </form>
      </motion.div>

      {/* Секция со списком отзывов */}
      <h2>📜 Отзывы пользователей:</h2>
      <div 
        className="list-container" 
        ref={listRef} 
        onScroll={handleScroll}
      >
        {reviews.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="reviews-list"
          >
            {reviews.map(review => (
              <motion.div
                key={review.id}
                className="review-card"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                {/* Шапка отзыва */}
                <div className="review-header">
                  <span className="user-id">👤 Пользователь #{review.user_id}</span>
                  <span className="review-date">
                    📅 {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                {/* Текст отзыва */}
                <p className="review-text">{review.review_text}</p>
                
                {/* Список оценок */}
                <div className="ratings-list">
                  {review.ratings?.map(rating => (
                    <div key={rating.id} className="rating-item">
                      <span className="rating-category">
                        {criteria.find(c => c.id === rating.criteria_id)?.name}:
                      </span>
                      <span className="rating-value">{rating.rating_value}/10</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <p className="no-reviews">😞 Пока нет отзывов. Будьте первым!</p>
        )}
      </div>
    </div>
  );
};

export default EnergyDrinkPage;