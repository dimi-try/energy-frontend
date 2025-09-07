import React, { useState, useEffect } from "react";
import api from "../../hooks/api";
import "./UserAdminPage.css";

const UserAdminPage = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Загрузка списка пользователей
  const fetchUsers = async () => {
    try {
      const response = await api.get("/users/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (err) {
      setError("Ошибка при загрузке пользователей: " + (err.response?.data?.detail || err.message));
    }
  };

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    fetchUsers();
  }, []);

  // Удаление пользователя
  const handleDeleteUser = async (userId) => {
    if (window.confirm("Вы уверены, что хотите удалить этого пользователя?")) {
      try {
        await api.delete(`/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(users.filter((user) => user.id !== userId));
        setSuccess("Пользователь успешно удален");
        setError(null);
      } catch (err) {
        setError("Ошибка при удалении пользователя: " + (err.response?.data?.detail || err.message));
        setSuccess(null);
      }
    }
  };

  return (
    <div className="user-admin-page">
      <h1>Управление пользователями</h1>

      {/* Сообщения об ошибках и успехе */}
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      {/* Список пользователей */}
      <div className="user-list">
        {users.map((user) => (
          <div key={user.id} className="user-card">
            <div className="user-avatar-container">
              {user.image_url ? (
                <img
                  src={`${process.env.REACT_APP_BACKEND_URL}/${user.image_url}`}
                  alt={user.username || "Пользователь"}
                  className="user-avatar"
                  loading="lazy"
                />
              ) : (
                <span className="user-placeholder">👤</span>
              )}
            </div>
            <div className="user-info">
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Имя:</strong> {user.username || "Не указано"}</p>
              <p><strong>Премиум:</strong> {user.is_premium ? "Да" : "Нет"}</p>
              <p><strong>Создан:</strong> {new Date(user.created_at).toLocaleString('ru-RU')}</p>
            </div>
            <div className="user-actions">
              <button onClick={() => handleDeleteUser(user.id)}>Удалить</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserAdminPage;