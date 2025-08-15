import React, { useState, useEffect } from "react";
import api from "../../hooks/api";
import "./CriteriaAdminPage.css";

const CriteriaAdminPage = ({ token }) => {
  const [criteria, setCriteria] = useState([]);
  const [editingCriteria, setEditingCriteria] = useState(null);
  const [newCriteria, setNewCriteria] = useState({ name: "" });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Загрузка списка критериев
  const fetchCriteria = async () => {
    try {
      const response = await api.get("/criteria/");
      setCriteria(response.data);
    } catch (err) {
      setError("Ошибка при загрузке критериев: " + (err.response?.data?.detail || err.message));
    }
  };

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    fetchCriteria();
  }, []);

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
      setError("Название критерия обязательно");
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
      setSuccess("Критерий успешно обновлен");
      setError(null);
    } catch (err) {
      setError("Ошибка при обновлении критерия: " + (err.response?.data?.detail || err.message));
      setSuccess(null);
    }
  };

  // Отмена редактирования
  const handleCancelEdit = () => {
    setEditingCriteria(null);
    setNewCriteria({ name: "" });
    setError(null);
  };

  return (
    <div className="criteria-admin-page">
      <h1>Управление критериями</h1>

      {/* Форма для редактирования критерия */}
      {editingCriteria && (
        <form onSubmit={handleSaveEdit}>
          <input
            type="text"
            name="name"
            value={newCriteria.name}
            onChange={handleInputChange}
            placeholder="Название критерия"
            maxLength={100}
          />
          <button type="submit">Сохранить</button>
          <button type="button" onClick={handleCancelEdit}>
            Отмена
          </button>
        </form>
      )}

      {/* Сообщения об ошибках и успехе */}
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      {/* Список критериев */}
      <ul className="criteria-list">
        {criteria.map((criterion) => (
          <li key={criterion.id}>
            <span>{criterion.name}</span>
            <div>
              <button onClick={() => handleEditCriteria(criterion)}>Редактировать</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CriteriaAdminPage;