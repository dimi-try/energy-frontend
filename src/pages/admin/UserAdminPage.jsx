import React, { useState, useEffect } from "react";
import api from "../../hooks/api";
import { formatTimestamp } from "../../hooks/formatDate"; 
import Pagination from "../../components/Pagination";
import "./UserAdminPage.css";

const UserAdminPage = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(() => {
    const savedPage = sessionStorage.getItem("user-admin-page");
    return savedPage ? parseInt(savedPage, 10) : 1;
  });
  const [totalPages, setTotalPages] = useState(1);
  const usersPerPage = 10; // Количество пользователей на странице

  // Загрузка списка пользователей и общего количества
  const fetchUsers = async () => {
    try {
      const [usersResponse, countResponse] = await Promise.all([
        api.get(`/users/?limit=${usersPerPage}&offset=${(page - 1) * usersPerPage}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get(`/users/count/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setUsers(usersResponse.data);
      setTotalPages(Math.ceil(countResponse.data.total / usersPerPage));
    } catch (err) {
      setError("Ошибка при загрузке пользователей: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка данных при монтировании компонента или изменении страницы
  useEffect(() => {
    setIsLoading(true);
    fetchUsers();
  }, [page]);

  // Сохранение текущей страницы
  useEffect(() => {
    sessionStorage.setItem("user-admin-page", page);
  }, [page]);

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
        // Обновляем общее количество страниц
        const countResponse = await api.get(`/users/count/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTotalPages(Math.ceil(countResponse.data.total / usersPerPage));
      } catch (err) {
        setError("Ошибка при удалении пользователя: " + (err.response?.data?.detail || err.message));
        setSuccess(null);
      }
    }
  };

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

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
              <p><strong>Создан:</strong> {formatTimestamp(user.created_at)}</p>
            </div>
            <div className="user-actions">
              <button onClick={() => handleDeleteUser(user.id)}>Удалить</button>
            </div>
          </div>
        ))}
      </div>

      {/* Пагинация */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};

export default UserAdminPage;