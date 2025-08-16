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
      <ul className="user-list">
        {users.map((user) => (
          <li key={user.id}>
            <span>
              ID: {user.id}, Имя: {user.username || "Не указано"}, Премиум: {user.is_premium ? "Да" : "Нет"}, Создан: {new Date(user.created_at).toLocaleString()}
            </span>
            <div>
              <button onClick={() => handleDeleteUser(user.id)}>Удалить</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserAdminPage;