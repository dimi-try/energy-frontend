import React from "react";
import { motion } from "framer-motion";
import Logo from "../images/LoadIcon.png";
import Card from "./Card";
import "./Loader.css";

//компонент загрузки
const Loader = () => {
  return (
    <Card type="container" className="loader">
      {/* логотип загрузки */}
      <motion.img
        src={Logo}
        alt="Loading Logo"
        className="loader-logo"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* текст загрузки */}
      <motion.p
        className="loader-text"
        animate={{ scale: [1, 1.03, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
      >
        Загрузка...
      </motion.p>
      {/* оверлей для эффекта */}
      <div className="loader-overlay" />
    </Card>
  );
};

export default Loader;