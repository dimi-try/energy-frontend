import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";

import api from "../../hooks/api";

import Loader from "../../components/Loader";
import Error from "../../components/Error";
import Card from "../../components/Card";
import Button from "../../components/Button";

import "./CriteriaAdminPage.css";

const CriteriaAdminPage = ({ token }) => {
  const [criteria, setCriteria] = useState([]);
  const [editingCriteria, setEditingCriteria] = useState(null);
  const [newCriteria, setNewCriteria] = useState({ name: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Загрузка списка критериев
  const fetchCriteria = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/criteria/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCriteria(response.data);
    } catch (err) {
      setError("Ошибка при загрузке критериев: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    fetchCriteria();
  }, [token]);

  // Обработка изменений формы
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCriteria({ ...newCriteria, [name]: value });
  };

  // Начало редактирования критерия
  const handleEditCriteria = (criterion) => {
    setEditingCriteria(criterion);
    setNewCriteria({ name: criterion.name });
  };

  // Сохранение изменений критерия
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!newCriteria.name.trim()) {
      toast.error("Название критерия обязательно");
      return;
    }
    try {
      const response = await api.put(
        `/criteria/${editingCriteria.id}`,
        { name: newCriteria.name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCriteria(criteria.map((c) => (c.id === editingCriteria.id ? response.data : c)));
      setEditingCriteria(null);
      setNewCriteria({ name: "" });
      toast.success("Критерий успешно обновлен");
    } catch (err) {
      toast.error("Ошибка при обновлении критерия: " + (err.response?.data?.detail || err.message));
    }
  };

  // Отмена редактирования
  const handleCancelEdit = () => {
    setEditingCriteria(null);
    setNewCriteria({ name: "" });
  };

  // Обработчик повторного запроса данных
  const handleRetry = () => {
    fetchCriteria();
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

      <h1>Управление критериями</h1>

      {/* Форма для редактирования критерия */}
      {editingCriteria && (
        <Card type="container">
          <h2>Редактировать критерий</h2>
          <form onSubmit={handleSaveEdit}>
            <input
              type="text"
              name="name"
              value={newCriteria.name}
              onChange={handleInputChange}
              placeholder="Название критерия"
              maxLength={100}
              required
            />
            <div>
              <Button type="submit" variant="primary">
                Сохранить
              </Button>
              <Button variant="danger" onClick={handleCancelEdit}>
                Отмена
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Список критериев */}
      <Card type="container">
        <div className="list-container">
          {criteria.length > 0 ? (
            criteria.map((criterion) => (
              <Card key={criterion.id} type="container" className="criteria-card">
                <div>
                  {criterion.name}
                </div>
                <div>
                  <Button variant="primary" onClick={() => handleEditCriteria(criterion)}>
                    Редактировать
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <Error message="Критерии не найдены" />
          )}
        </div>
      </Card>
    </div>
  );
};

export default CriteriaAdminPage;