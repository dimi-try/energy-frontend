import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

import api from "../hooks/api";
import { useUploadWithProgress } from "../hooks/useUploadWithProgress";

import Card from "../components/Card";
import Button from "../components/Button";
import ImageUpload from "../components/ImageUpload";
import Loader from "../components/Loader";

/**
 * Форма создания/редактирования предложки энергетика.
 * 
 * Для админа: загрузка любой предложки по ID из URL (/admin/suggestions/edit/:id)
 * Для пользователя: загрузка своих предложок через ?edit=<id>
 * 
 * Валидация:
 * - Название, бренд, категория - обязательны
 * - Описание - необязательно
 * - Если есть отзыв/фото/хоть одна оценка - все оценки обязательны
 */
const SuggestionForm = ({ userId, token, isAdmin = false }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id: paramId } = useParams();
  
  // Для админа ID берется из URL параметра, для пользователя из query параметра
  const editId = isAdmin ? paramId : searchParams.get("edit");
  const isEditMode = !!editId;

  const { uploadFile, UploadProgressComponent } = useUploadWithProgress();

  const [form, setForm] = useState({
    name: "",
    description: "",
    brand_id: "",
    new_brand_name: "",
    category_id: "",
    review_text: "",
    ratings: {},
    photo: null,
    image_url: "",
    is_new_brand: false,
  });

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [hoveredStars, setHoveredStars] = useState({});

  // Загрузка брендов, категорий и критериев
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandsRes, categoriesRes, criteriaRes] = await Promise.all([
          api.get("/brands/admin/select", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/categories/select", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/criteria/"),
        ]);
        setBrands(brandsRes.data);
        setCategories(categoriesRes.data);
        setCriteria(criteriaRes.data);
      } catch (err) {
        console.error("Ошибка при загрузке данных:", err);
      } finally {
        setFetchingData(false);
      }
    };
    fetchData();
  }, [token]);

  // Загрузка существующей предложки для редактирования
  useEffect(() => {
    if (isEditMode && !fetchingData) {
      const fetchSuggestion = async () => {
        try {
          const endpoint = isAdmin ? `/suggestions/admin` : "/suggestions/me";
          const response = await api.get(endpoint, { headers: { Authorization: `Bearer ${token}` } });
          const suggestion = response.data.find((p) => p.id === parseInt(editId));
          
          if (suggestion) {
            // Загружаем данные из связанного отзыва
            const reviewText = suggestion.review?.review_text || "";
            const ratingsObj = {};
            if (suggestion.review?.ratings) {
              suggestion.review.ratings.forEach((r) => {
                ratingsObj[r.criteria_id] = r.rating_value;
              });
            }
            setForm({
              name: suggestion.name || "",
              description: suggestion.description || "",
              brand_id: suggestion.brand_id || "",
              new_brand_name: suggestion.new_brand_name || "",
              category_id: suggestion.category_id || "",
              review_text: reviewText,
              ratings: ratingsObj,
              photo: null,
              image_url: suggestion.image_url || "",
              is_new_brand: !suggestion.brand_id && !!suggestion.new_brand_name,
            });
          } else {
            toast.error("Предложение не найдено");
            navigate(isAdmin ? "/admin/suggestions" : "/my-suggestions");
          }
        } catch (err) {
          toast.error("Ошибка при загрузке предложения");
          navigate(isAdmin ? "/admin/suggestions" : "/my-suggestions");
        }
      };
      fetchSuggestion();
    }
  }, [isEditMode, editId, token, navigate, fetchingData, isAdmin]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (file) => {
    setForm((prev) => ({ ...prev, photo: file, image_url: "" }));
  };

  // Обработчики звезд рейтинга (только для пользователя)
  const handleStarClick = (criterionId, rating) => {
    if (isAdmin) return;
    setForm((prev) => ({ ...prev, ratings: { ...prev.ratings, [criterionId]: rating } }));
  };

  const handleStarHover = (criterionId, rating) => {
    if (isAdmin) return;
    setHoveredStars((prev) => ({ ...prev, [criterionId]: rating }));
  };

  const handleStarLeave = (criterionId) => {
    if (isAdmin) return;
    setHoveredStars((prev) => ({ ...prev, [criterionId]: 0 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валидация обязательных полей
    if (!form.name.trim()) {
      toast.error("Название энергетика обязательно");
      return;
    }
    if (!form.category_id) {
      toast.error("Выберите категорию энергетика");
      return;
    }
    if (form.is_new_brand) {
      if (!form.new_brand_name.trim()) {
        toast.error("Введите название нового бренда");
        return;
      }
    } else {
      if (!form.brand_id) {
        toast.error("Выберите бренд из списка или отметьте 'Новый бренд'");
        return;
      }
    }
    
    // Валидация: если есть отзыв, фото или хоть одна оценка - все оценки обязательны
    const hasAnyRating = criteria.some((c) => form.ratings[c.id]);
    const hasReviewOrPhoto = form.review_text.trim() || form.photo;
    
    if (hasReviewOrPhoto || hasAnyRating) {
      const hasAllRatings = criteria.every((c) => form.ratings[c.id]);
      if (!hasAllRatings) {
        toast.error("Если вы оставляете отзыв, фото или оценки, укажите оценки по всем критериям");
        return;
      }
    }

    setLoading(true);
    try {
      // Загружаем фото если есть
      let imageUrl = form.image_url;
      if (form.photo) {
        const result = await uploadFile(form.photo, "/suggestions/upload-image/");
        imageUrl = result;
      }

      // Формируем массив оценок
      const ratings = Object.entries(form.ratings)
        .filter(([_, value]) => value !== "")
        .map(([criteriaId, value]) => ({
          criteria_id: parseInt(criteriaId),
          rating_value: parseFloat(value),
        }));

      const payload = {
        name: form.name,
        description: form.description || null,
        brand_id: form.is_new_brand ? null : Number(form.brand_id),
        new_brand_name: form.is_new_brand ? form.new_brand_name : null,
        category_id: Number(form.category_id),
        review_text: form.review_text || null,
        ratings: ratings.length > 0 ? ratings : null,
        image_url: imageUrl,
      };

      if (isEditMode) {
        await api.put(`/suggestions/${editId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Предложение обновлено!");
      } else {
        await api.post("/suggestions/", payload, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Предложение отправлено на рассмотрение!");
      }
      navigate(isAdmin ? "/admin/suggestions" : "/my-suggestions");
    } catch (err) {
      toast.error("Ошибка: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return <Loader />;
  }

  return (
    <div className="container">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />

      <h1>{isEditMode ? "Редактировать предложение" : "Предложить энергетик"}</h1>

      <Card type="container">
        <h2>{isEditMode ? "Редактировать предложение" : "Новое предложение"}</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="name" value={form.name} onChange={handleInputChange} placeholder="Название энергетика *" maxLength={255} required />

          {/* Выбор бренда */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "8px 0" }}>
            <input type="checkbox" id="is_new_brand" name="is_new_brand" checked={form.is_new_brand} onChange={handleInputChange} style={{ width: "auto" }} />
            <label htmlFor="is_new_brand">Новый бренд</label>
          </div>

          {form.is_new_brand ? (
            <input type="text" name="new_brand_name" value={form.new_brand_name} onChange={handleInputChange} placeholder="Название нового бренда *" maxLength={255} />
          ) : (
            <select name="brand_id" value={form.brand_id} onChange={handleInputChange}>
              <option value="">Выберите бренд *</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          )}

          <select name="category_id" value={form.category_id} onChange={handleInputChange} required>
            <option value="">Выберите категорию *</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          
          <textarea name="description" value={form.description} onChange={handleInputChange} placeholder="Описание энергетика" />

          <h2>Отзыв</h2>
          <textarea name="review_text" value={form.review_text} onChange={handleInputChange} placeholder="Ваш отзыв (необязательно)" />

          {/* Рейтинг по критериям со звездами */}
          {criteria.map((criterion) => (
            <div key={criterion.id} className="card-star-criteria">
              <label>{criterion.name}{isAdmin && " (только просмотр)"}</label>
              <div className={`card-stars-rating ${isAdmin ? "readonly" : ""}`} onMouseLeave={isAdmin ? undefined : () => handleStarLeave(criterion.id)}>
                {[...Array(10)].map((_, index) => {
                  const ratingValue = index + 1;
                  return (
                    <span
                      key={index}
                      className={`card-star-rating ${ratingValue <= (hoveredStars[criterion.id] || form.ratings[criterion.id] || 0) ? "filled" : ""} ${isAdmin ? "readonly" : ""}`}
                      onClick={() => handleStarClick(criterion.id, ratingValue)}
                      onMouseEnter={() => handleStarHover(criterion.id, ratingValue)}
                    >★</span>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Загрузка фото (только для пользователя) */}
          {isAdmin ? (
            form.image_url && (
              <div style={{ marginTop: "12px" }}>
                <p><strong>Фото:</strong></p>
                <img src={`${process.env.REACT_APP_BACKEND_URL}/${form.image_url}`} alt="Фото предложки" style={{ maxWidth: "200px", borderRadius: "8px" }} />
              </div>
            )
          ) : (
            <ImageUpload image={form.photo} imageUrl={form.image_url} onImageChange={handleImageChange} backendUrl={process.env.REACT_APP_BACKEND_URL} />
          )}

          <div>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Отправка..." : isEditMode ? "Сохранить" : "Отправить на рассмотрение"}
            </Button>
            <Button variant="danger" onClick={() => navigate(isAdmin ? "/admin/suggestions" : "/my-suggestions")}>
              Отмена
            </Button>
          </div>

          <UploadProgressComponent />
        </form>
      </Card>
    </div>
  );
};

export default SuggestionForm;
