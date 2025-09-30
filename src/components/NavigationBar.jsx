import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { IoTrophyOutline, IoSettingsOutline, IoPersonOutline } from "react-icons/io5";
import "./NavigationBar.css";

const NavigationBar = ({ role }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Определяем элементы навигации
  const navItems = [
    { to: "/", icon: <IoTrophyOutline />, label: "Чарты и поиск" },
    ...(role === "admin" ? [{ to: "/admin", icon: <IoSettingsOutline />, label: "Админ-панель" }] : []),
    { to: "/profile", icon: <IoPersonOutline />, label: "Профиль" },
  ];

  // Варианты анимации для перетекания
  const variants = {
    active: {
      scale: 1.1,
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    inactive: {
      scale: 1,
      opacity: 0.7,
      y: 5,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    exit: {
      scale: 0.9,
      opacity: 0,
      y: 10,
      transition: { duration: 0.2, ease: "easeInOut" },
    },
  };

  return (
    <nav className="bottom-nav">
      <AnimatePresence mode="wait">
        <div className="nav-container">
          {navItems.map((item, index) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
              onClick={() => setActiveIndex(index)}
            >
              <motion.div
                className="nav-item-content"
                variants={variants}
                initial="inactive"
                animate={activeIndex === index ? "active" : "inactive"}
                exit="exit"
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </motion.div>
            </NavLink>
          ))}
        </div>
      </AnimatePresence>
    </nav>
  );
};

export default NavigationBar;