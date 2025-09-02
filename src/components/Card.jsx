import React from "react";
import { motion } from "framer-motion";

import "./Card.css";

// Компонент карточки для отображения элементов списка
const Card = ({ children, onClick, rank }) => {
  // Определяем класс для медали в зависимости от ранга
  const medalClass = rank === 1 ? "medal-gold" : rank === 2 ? "medal-silver" : rank === 3 ? "medal-bronze" : "";
  
  return (
    // Используем motion.div для анимации при наведении
    <motion.div
      className="card"
      whileHover={{ scale: 1.02 }} // Легкое увеличение при наведении
      onClick={onClick} // Обработчик клика
      style={{ marginBottom: "10px" }} // Отступ снизу
    >
      {/* Отображаем ранг с соответствующей медалью */}
      {rank && <span className={`rank ${medalClass}`}>{rank}</span>}
      {children}
    </motion.div>
  );
};

export default Card;