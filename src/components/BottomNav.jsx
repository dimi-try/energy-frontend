import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import { IoHomeOutline, IoSettingsOutline, IoPersonOutline } from "react-icons/io5";
import "./BottomNav.css";

const BottomNav = ({ role }) => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  // Определяем элементы навигации
  const navItems = [
    { to: "/", icon: <IoHomeOutline />, label: "Топ 100" },
    ...(role === "admin" ? [{ to: "/admin", icon: <IoSettingsOutline />, label: "Админ-панель" }] : []),
    { to: "/profile", icon: <IoPersonOutline />, label: "Профиль" },
  ];

  // Обработчик свайпов
  const handleSwipe = (direction) => {
    let newIndex = activeIndex;
    if (direction === "left" && activeIndex < navItems.length - 1) {
      newIndex = activeIndex + 1;
    } else if (direction === "right" && activeIndex > 0) {
      newIndex = activeIndex - 1;
    }
    setActiveIndex(newIndex);
    navigate(navItems[newIndex].to);
  };

  // Настройка свайпов с помощью react-swipeable
  const handlers = useSwipeable({
    onSwipedLeft: () => handleSwipe("left"),
    onSwipedRight: () => handleSwipe("right"),
    delta: 80, // Минимальное расстояние для свайпа
    preventScrollOnSwipe: true, // Предотвращаем конфликт с прокруткой
    trackMouse: true, // Поддержка мыши для тестирования
  });

  return (
    <nav className="bottom-nav" {...handlers}>
      <AnimatePresence>
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
                initial={{ scale: 1 }}
                animate={{ scale: activeIndex === index ? 1.1 : 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
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

export default BottomNav;