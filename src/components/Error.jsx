import React from "react";
import { motion } from "framer-motion";
import Card from "./Card";
import "./Error.css";

//компонент ошибки
const Error = ({ message }) => {
  return (
    <Card type="container" className="error">
      {/* иконка ошибки */}
      <motion.div
        className="error-icon"
        animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        ❌
      </motion.div>
      {/* текст ошибки */}
      <motion.p
        className="error-text"
        animate={{ scale: [1, 1.03, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
      >
        {message}
      </motion.p>
      {/* оверлей для эффекта */}
      <div className="error-overlay" />
    </Card>
  );
};

export default Error;