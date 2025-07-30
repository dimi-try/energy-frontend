import React from "react";
import { NavLink } from "react-router-dom";
import "./BottomNav.css";

// Компонент нижней навигационной панели
const BottomNav = () => (
  <nav className="bottom-nav">
    {/* Ссылка на страницу Топ 100 */}
    <NavLink to="/" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
      <span>🏆</span> Топ 100
    </NavLink>
    {/* Ссылка на страницу поиска */}
    <NavLink to="/search" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
      <span>🔍</span> Поиск
    </NavLink>
    {/* Ссылка на страницу профиля */}
    <NavLink to="/profile" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
      <span>👤</span> Профиль
    </NavLink>
  </nav>
);

export default BottomNav;