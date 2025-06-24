import React, { useState, useEffect } from "react";
import api from "../hooks/api";

const Profile = () => {
  // Получаем ID энергетика из URL
  const id = 1;
  // Состояние для данных пользователя
  const [profile, setProfile] = useState(null);
  // Состояние для списка отзывов
  const [reviews, setReviews] = useState([]);
  // Состояние для ошибок
  const [error, setError] = useState(null);

  // Загружаем данные об энергетике, отзывах и критериях
  useEffect(() => {
    setError(null); // Сбрасываем ошибки
    
    const fetchData = async () => {
      try {
        const [profileRes, reviewsRes] = await Promise.all([
          api.get(`/users/${id}/profile`),
          api.get(`/users/${id}/reviews`)
        ]);
  
        setProfile(profileRes.data); // Сохраняем данные о пользователе
        setReviews(reviewsRes.data); // Сохраняем все отзывы пользователя
      }
      catch (err) {
        setError(err.message); // Сохраняем ошибку
      }
    };
    fetchData();
  }, [id]);
  
  return (
    <div>
      
    </div>
  );
};

export default Profile;
