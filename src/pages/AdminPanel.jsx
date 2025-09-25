import React from "react";
import { Link } from "react-router-dom";

import Button from "../components/Button";

import "./AdminPanel.css";

const AdminPanel = () => {
  return (
    <div className="container">
      <h1>Админ-панель</h1>
      <div className="admin-links">
        <Link to="/admin/brands">
          <Button variant="primary">Бренды</Button>
        </Link>
        <Link to="/admin/energies">
          <Button variant="primary">Энергетики</Button>
        </Link>
        <Link to="/admin/criteria">
          <Button variant="primary">Критерии</Button>
        </Link>
        <Link to="/admin/categories">
          <Button variant="primary">Категории</Button>
        </Link>
        <Link to="/admin/users">
          <Button variant="primary">Пользователи</Button>
        </Link>
        <Link to="/admin/reviews">
          <Button variant="primary">Отзывы</Button>
        </Link>
        <Link to="/admin/blacklist">
          <Button variant="primary">Черный список</Button>
        </Link>
      </div>
    </div>
  );
};

export default AdminPanel;