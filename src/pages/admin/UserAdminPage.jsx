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

import "./UserAdminPage.css";

const UserAdminPage = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(() => {
    const savedPage = sessionStorage.getItem("user-admin-page");
    return savedPage ? parseInt(savedPage, 10) : 1;
  });
  const [totalPages, setTotalPages] = useState(1);
  const usersPerPage = 10;

  // Загрузка списка пользователей и общего количества
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
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
      setLoading(false);
    }
  };

  // Загрузка данных при монтировании компонента или изменении страницы
  useEffect(() => {
    fetchUsers();
  }, [page, token]);

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
        await fetchUsers(); // Обновляем список пользователей
        toast.success("Пользователь успешно удален!");
      } catch (err) {
        toast.error("Ошибка при удалении пользователя: " + (err.response?.data?.detail || err.message));
      }
    }
  };

  // Обработчик повторного запроса данных
  const handleRetry = () => {
    fetchUsers();
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

      <h1>Управление пользователями</h1>

      <Card type="container">
        <div className="list-container">
          {users.length > 0 ? (
            <>
              {users.map((user) => (
                <Card key={user.id} type="container">
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
                    <p>
                      <strong>ID пользователя: </strong>
                      <Link to={`/profile/${user.id}`} className="details-link">
                        {user.id}
                      </Link>
                    </p>
                    <p><strong>Имя: </strong>{user.username || "Имя не указано"}</p>
                    <p><strong>Премиум: </strong>{user.is_premium ? "Да" : "Нет"}</p>
                    <p><strong>Создан: </strong>{formatTimestamp(user.created_at)}</p>
                  </div>
                  <div className="user-actions">
                    <Button variant="danger" onClick={() => handleDeleteUser(user.id)}>
                      Удалить
                    </Button>
                  </div>
                </Card>
              ))}
              {/* Компонент пагинации */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              )}
            </>
          ) : (
            <Error message="Пользователи не найдены" />
          )}
        </div>
      </Card>
    </div>
  );
};

export default UserAdminPage;