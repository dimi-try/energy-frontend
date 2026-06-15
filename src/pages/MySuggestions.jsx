import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { IoAddOutline } from "react-icons/io5";

import api from "../hooks/api";

import Card from "../components/Card";
import Button from "../components/Button";
import Loader from "../components/Loader";
import Error from "../components/Error";

/**
 * Страница со списком предложок текущего пользователя.
 * Показывает статус каждого предложения (на рассмотрении / отклонено).
 * Позволяет редактировать и удалять предложения.
 */
const MySuggestions = ({ userId, token }) => {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSuggestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/suggestions/me", { headers: { Authorization: `Bearer ${token}` } });
      setSuggestions(response.data);
    } catch (err) {
      setError("Ошибка при загрузке предложений: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSuggestions(); }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Вы уверены, что хотите удалить это предложение?")) return;
    try {
      await api.delete(`/suggestions/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setSuggestions((prev) => prev.filter((p) => p.id !== id));
      toast.success("Предложение удалено");
    } catch (err) {
      toast.error("Ошибка при удалении: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleEdit = (id) => { navigate(`/suggest?edit=${id}`); };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { label: "На рассмотрении", color: "#ff9800" },
      rejected: { label: "Отклонено", color: "#f44336" },
    };
    return configs[status] || { label: status, color: "#999" };
  };

  const canEdit = (status) => status === "pending" || status === "rejected";
  const canDelete = (status) => status === "pending" || status === "rejected";

  return (
    <div className="container">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />

      <div>
        <h1>Предложка</h1>
        <Button variant="primary" onClick={() => navigate("/suggest")}>
          <IoAddOutline style={{ marginRight: "8px" }} />
          Новое предложение
        </Button>
      </div>

      <Card type="container">
        <div className="list-container">
          {loading ? (
            <Loader />
          ) : error ? (
            <Error message={error} />
          ) : suggestions.length === 0 ? (
            <Card type="container">
              <Error message="Вы еще не предложили ни одного энергетика" />
              <Button variant="primary" onClick={() => navigate("/suggest")}>
                <IoAddOutline style={{ marginRight: "8px" }} />
                Предложить энергетик
              </Button>
            </Card>
          ) : (
            suggestions.map((suggestion) => {
              const statusConfig = getStatusConfig(suggestion.status);
              return (
                <Card key={suggestion.id} type="container" className="suggestion-card" style={{ border: `2px solid ${statusConfig.color}` }}>
                  <div style={{ display: "flex", gap: "16px" }}>
                    {/* Фото предложки */}
                    <div className="card-image" style={{ flexShrink: 0 }}>
                      {suggestion.image_url ? (
                        <img
                          src={`${process.env.REACT_APP_BACKEND_URL}/${suggestion.image_url}`}
                          alt={suggestion.name}
                          loading="lazy"
                          style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "4px" }}
                        />
                      ) : (
                        <div className="no-image-card" style={{ width: "80px", height: "80px" }}>Нет фото</div>
                      )}
                    </div>
                    
                    {/* Информация о предложке */}
                    <div style={{ flex: 1 }}>
                      <p><strong>Бренд:</strong> {suggestion.brand?.name || suggestion.new_brand_name || "Не указан"}</p>
                      <p><strong>Название:</strong> {suggestion.name}</p>
                      <p><strong>Категория:</strong> {suggestion.category?.name || "Не указана"}</p>
                      {suggestion.description && (<p><strong>Описание:</strong> {suggestion.description}</p>)}
                      
                      {/* Статус */}
                      <p style={{ marginTop: "8px" }}>
                        <span style={{ color: statusConfig.color, fontWeight: 500 }}>{statusConfig.label}</span>
                      </p>
                      
                      {/* Причина отклонения */}
                      {suggestion.status === "rejected" && suggestion.admin_comment && (
                        <p style={{ color: "#d32f2f", fontSize: "14px" }}>
                          <strong>По причине:</strong> {suggestion.admin_comment}
                        </p>
                      )}
                      
                      {/* Дата */}
                      <p style={{ color: "#999", fontSize: "12px", marginTop: "4px" }}>
                        {new Date(suggestion.created_at).toLocaleDateString("ru-RU")}
                      </p>
                    </div>
                  </div>
                  
                  {/* Кнопки действий */}
                  <div style={{ marginTop: "12px" }}>
                    {canEdit(suggestion.status) && (
                      <Button variant="primary" onClick={() => handleEdit(suggestion.id)}>
                        Редактировать
                      </Button>
                    )}
                    {canDelete(suggestion.status) && (
                      <Button variant="danger" onClick={() => handleDelete(suggestion.id)} style={{ marginLeft: "8px" }}>
                        Удалить
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
};

export default MySuggestions;
