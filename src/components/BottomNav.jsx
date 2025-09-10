import React from "react";
import { NavLink } from "react-router-dom";
import "./BottomNav.css";

// Компонент нижней навигационной панели
const BottomNav = ({ role }) => (
  <nav className="bottom-nav">
    {/* Ссылка на страницу Топ 100 */}
    <NavLink to="/" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
      <span>🏆</span> Топ 100
    </NavLink>
    {/* Ссылка на админ-панель, только для админов */}
    {role === "admin" && (
      <NavLink to="/admin" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
        <span>🛠️</span> Админ-панель
      </NavLink>
    )}
    {/* Ссылка на страницу профиля */}
    <NavLink to="/profile" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
      <span>👤</span> Профиль
    </NavLink>
  </nav>
);

export default BottomNav;