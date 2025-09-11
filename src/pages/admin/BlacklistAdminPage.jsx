import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import api from "../../hooks/api";

import { formatTimestamp } from "../../hooks/formatDate";

import "./BlacklistAdminPage.css";

const BlacklistAdminPage = ({ token }) => {
  const [blacklist, setBlacklist] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [warning, setWarning] = useState(null);
  const [newUserId, setNewUserId] = useState("");
  const [reason, setReason] = useState("");

  // Загрузка списка черного списка
  const fetchBlacklist = async () => {
    try {
      const response = await api.get("/blacklist/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlacklist(response.data);
    } catch (err) {
      setError("Ошибка при загрузке черного списка: " + (err.response?.data?.detail || err.message));
    }
  };

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    fetchBlacklist();
  }, []);

  // Добавление пользователя в черный список
  const handleAddToBlacklist = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(
        "/blacklist/",
        { user_id: newUserId, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBlacklist([...blacklist, response.data]);
      setSuccess("Пользователь добавлен в черный список");
      setError(null);
      if (response.data.warning) {
        setWarning(response.data.warning);
      } else {
        setWarning(null);
      }
      setNewUserId("");
      setReason("");
    } catch (err) {
      setError("Ошибка при добавлении: " + (err.response?.data?.detail || err.message));
      setSuccess(null);
      setWarning(null);
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
        setSuccess("Пользователь удален из черного списка");
        setError(null);
        setWarning(null);
      } catch (err) {
        setError("Ошибка при удалении: " + (err.response?.data?.detail || err.message));
        setSuccess(null);
        setWarning(null);
      }
    }
  };

  return (
    <div className="blacklist-admin-page">
      <h1>Управление черным списком</h1>

      {/* Сообщения об ошибках, успехе и предупреждениях */}
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      {warning && <p className="warning">{warning}</p>}

      {/* Форма для добавления пользователя */}
      <form onSubmit={handleAddToBlacklist} className="add-blacklist-form">
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
        />
        <button type="submit">Добавить в черный список</button>
      </form>

      {/* Список пользователей в черном списке */}
      <ul className="blacklist">
        {blacklist.length === 0 ? (
          <p>Черный список пуст</p>
        ) : (
          blacklist.map((entry) => (
            <li key={entry.id}>
              <div>
                <p><strong>ID записи:</strong> {entry.id}</p>
                <p>
                  <strong>
                    ID пользователя:
                  </strong> 
                  <Link to={`/profile/${entry.user_id}`}>
                    {entry.user_id}
                  </Link>
                </p>
                <p><strong>Пользователь:</strong> {entry.username || "Имя не указано"}</p>
                <p><strong>Причина:</strong> {entry.reason || "Не указана"}</p>
                <p><strong>Добавлен:</strong> {formatTimestamp(entry.created_at)}</p>
              </div>
              <div>
                <button onClick={() => handleRemoveFromBlacklist(entry.user_id)}>Удалить</button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default BlacklistAdminPage;