import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

import api from "../../hooks/api";
import { formatTimestamp } from "../../hooks/formatDate";

import Loader from "../../components/Loader";
import Error from "../../components/Error";
import Card from "../../components/Card";
import Button from "../../components/Button";

import "./BlacklistAdminPage.css";

const BlacklistAdminPage = ({ token }) => {
  const [blacklist, setBlacklist] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newUserId, setNewUserId] = useState("");
  const [reason, setReason] = useState("");

  // Загрузка списка черного списка
  const fetchBlacklist = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/blacklist/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlacklist(response.data);
    } catch (err) {
      setError("Ошибка при загрузке черного списка: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    fetchBlacklist();
  }, [token]);

  // Добавление пользователя в черный список
  const handleAddToBlacklist = async (e) => {
    e.preventDefault();
    if (!newUserId.trim()) {
      toast.error("ID пользователя обязателен");
      return;
    }
    try {
      const response = await api.post(
        "/blacklist/",
        { user_id: parseInt(newUserId), reason: reason.trim() || null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBlacklist([...blacklist, response.data]);
      setNewUserId("");
      setReason("");
      toast.success("Пользователь добавлен в черный список");
    } catch (err) {
      toast.error("Ошибка при добавлении: " + (err.response?.data?.detail || err.message));
    }
  };

  // Удаление пользователя из черного списка
  const handleRemoveFromBlacklist = async (userId) => {
    if (window.confirm("Вы уверены, что хотите удалить этого пользователя из черного списка?")) {
      try {
        await api.delete(`/blacklist/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBlacklist(blacklist.filter((entry) => entry.user_id !== userId));
        toast.success("Пользователь удален из черного списка");
      } catch (err) {
        toast.error("Ошибка при удалении: " + (err.response?.data?.detail || err.message));
      }
    }
  };

  // Обработчик повторного запроса данных
  const handleRetry = () => {
    fetchBlacklist();
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

      <h1>Управление черным списком</h1>

      {/* Форма для добавления пользователя */}
      <Card type="container">
        <h2>Добавить пользователя в черный список</h2>
        <form onSubmit={handleAddToBlacklist}>
          <input
            type="number"
            value={newUserId}
            onChange={(e) => setNewUserId(e.target.value)}
            placeholder="ID пользователя"
            required
          />
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Причина (необязательно)"
            maxLength={255}
          />
          <div>
            <Button type="submit" variant="primary">
              Добавить в черный список
            </Button>
          </div>
        </form>
      </Card>

      {/* Список пользователей в черном списке */}
      <Card type="container">
        <div className="list-container">
          {blacklist.length > 0 ? (
            blacklist.map((entry) => (
              <Card key={entry.id} type="container" className="blacklist-card">
                <div>
                  <p>
                    <strong>ID записи: </strong>{entry.id}
                  </p>
                  <p>
                    <strong>ID пользователя: </strong>
                    <Link to={`/profile/${entry.user_id}`} className="details-link">
                      {entry.user_id}
                    </Link>
                  </p>
                  <p>
                    <strong>Пользователь: </strong>{entry.username || "Имя не указано"}
                  </p>
                  <p>
                    <strong>Причина: </strong>{entry.reason || "Не указана"}
                  </p>
                  <p>
                    <strong>Добавлен: </strong>{formatTimestamp(entry.created_at)}
                  </p>
                </div>
                <div>
                  <Button variant="danger" onClick={() => handleRemoveFromBlacklist(entry.user_id)}>
                    Удалить
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <Error message="Черный список пуст" />
          )}
        </div>
      </Card>
    </div>
  );
};

export default BlacklistAdminPage;