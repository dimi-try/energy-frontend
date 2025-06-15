import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

import api from "../../hooks/api";

import Loader from "../../components/Loader";
import Error from "../../components/Error";
import Card from "../../components/Card";
import Button from "../../components/Button";

/**
 * Админ-страница для управления предложками энергетиков.
 * Показывает все предложения с возможностью одобрить, отклонить, редактировать или удалить.
 */
const AdminSuggestionPage = ({ token }) => {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Модальное окно отклонения
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [adminComment, setAdminComment] = useState("");

  const fetchSuggestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/suggestions/admin", { headers: { Authorization: `Bearer ${token}` } });
      setSuggestions(response.data);
    } catch (err) {
      setError("Ошибка при загрузке предложений: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSuggestions(); }, [token]);

  // Одобрить предложение
  const handleApprove = async (suggestionId) => {
    try {
      await api.post(`/suggestions/${suggestionId}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Предложение одобрено! Энергетик добавлен в базу.");
      fetchSuggestions();
    } catch (err) {
      toast.error("Ошибка при одобрении: " + (err.response?.data?.detail || err.message));
    }
  };

  // Удалить предложение
  const handleDelete = async (suggestionId) => {
    if (!window.confirm("Вы уверены, что хотите удалить это предложение?")) return;
    try {
      await api.delete(`/suggestions/${suggestionId}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Предложение удалено.");
      fetchSuggestions();
    } catch (err) {
      toast.error("Ошибка при удалении: " + (err.response?.data?.detail || err.message));
    }
  };

  // Открыть модальное окно отклонения
  const handleOpenRejectModal = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setAdminComment("");
    setRejectModalOpen(true);
  };

  // Отклонить предложение
  const handleReject = async () => {
    try {
      await api.post(
        `/suggestions/${selectedSuggestion.id}/reject?comment=${encodeURIComponent(adminComment || "")}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Предложение отклонено.");
      fetchSuggestions();
      setRejectModalOpen(false);
      setSelectedSuggestion(null);
      setAdminComment("");
    } catch (err) {
      toast.error("Ошибка при отклонении: " + (err.response?.data?.detail || err.message));
    }
  };

  // Перейти на страницу редактирования
  const handleEdit = (suggestionId) => { navigate(`/admin/suggestions/edit/${suggestionId}`); };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { label: "На рассмотрении", color: "#ff9800" },
      rejected: { label: "Отклонено", color: "#f44336" },
    };
    return configs[status] || { label: status, color: "#999" };
  };

  return (
    <div className="container">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      <h1>Управление предложками</h1>

      <Card type="container">
        <div className="list-container">
          {loading ? (
            <Loader />
          ) : error ? (
            <Error message={error} />
          ) : suggestions.length > 0 ? (
            suggestions.map((suggestion) => {
              const statusConfig = getStatusConfig(suggestion.status);
              return (
                <Card key={suggestion.id} type="container" className="energy-card" style={{ border: `2px solid ${statusConfig.color}` }}>
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
                      <p><strong>Пользователь:</strong> {suggestion.user?.username || "ID: " + suggestion.user_id}</p>
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
                    <Button variant="primary" onClick={() => handleEdit(suggestion.id)}>Подробнее</Button>
                    
                    {suggestion.status === "pending" && (
                      <>
                        <Button variant="primary" onClick={() => handleApprove(suggestion.id)} style={{ marginLeft: "8px" }}>Одобрить</Button>
                        <Button variant="danger" onClick={() => handleOpenRejectModal(suggestion)} style={{ marginLeft: "8px" }}>Отклонить</Button>
                        <Button variant="danger" onClick={() => handleDelete(suggestion.id)} style={{ marginLeft: "8px" }}>Удалить</Button>
                      </>
                    )}
                    
                    {suggestion.status === "rejected" && (
                      <>
                        <Button variant="primary" onClick={() => handleApprove(suggestion.id)} style={{ marginLeft: "8px" }}>Одобрить</Button>
                        <Button variant="danger" onClick={() => handleDelete(suggestion.id)} style={{ marginLeft: "8px" }}>Удалить</Button>
                      </>
                    )}
                  </div>
                </Card>
              );
            })
          ) : (
            <Card type="container"><Error message="Предложения не найдены" /></Card>
          )}
        </div>
      </Card>

      {/* Модальное окно отклонения */}
      {rejectModalOpen && (
        <div className="modal-overlay" onClick={() => setRejectModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Отклонить предложение</h2>
              <button className="modal-close" onClick={() => setRejectModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <textarea
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                placeholder="Причина отклонения (необязательно)"
                rows={4}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "14px",
                  marginBottom: "12px",
                  boxSizing: "border-box",
                }}
              />
              <div className="modal-actions">
                <Button variant="danger" onClick={handleReject}>Отклонить</Button>
                <Button variant="secondary" onClick={() => setRejectModalOpen(false)}>Отмена</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSuggestionPage;
