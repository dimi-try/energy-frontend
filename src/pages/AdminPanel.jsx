import React from "react";
import { Link } from "react-router-dom";
import "../styles/AdminPanel.css";

const AdminPanel = () => {
  return (
    <div className="admin-panel">
      <h1>Админ-панель</h1>
      <div className="admin-links">
        <Link to="/admin/brands" className="admin-button">
          Бренды
        </Link>
        <Link to="/admin/energies" className="admin-button">
          Энергетики
        </Link>
        <Link to="/admin/criteria" className="admin-button">
          Критерии
        </Link>
        <Link to="/admin/categories" className="admin-button">
          Категории
        </Link>
        <Link to="/admin/users" className="admin-button">
          Пользователи
        </Link>
        <Link to="/admin/reviews" className="admin-button">
          Отзывы
        </Link>
        <Link to="/admin/blacklist" className="admin-button">
          Черный список
        </Link>
      </div>
    </div>
  );
};

export default AdminPanel;