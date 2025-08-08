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
      </div>
    </div>
  );
};

export default AdminPanel;