import React, { useState, useEffect } from "react";
import api from "../hooks/api";

const Profile = () => {
  // Получаем ID энергетика из URL
  const id = 1;
  // Состояние для данных об энергетике
  const [user, setUser] = useState(null);
  // Состояние для списка отзывов
  const [reviews, setReviews] = useState([]);
  // Состояние для критериев оценки
  const [criteria, setCriteria] = useState([]);
  // Состояние для ошибок
  const [error, setError] = useState(null);

  // Загружаем данные об энергетике, отзывах и критериях
  useEffect(() => {
    setError(null); // Сбрасываем ошибки
    
    const fetchData = async () => {
      try {
        const [userRes, reviewsRes, criteriaRes] = await Promise.all([
          api.get(`/users/${id}/profile`),
          api.get(`/users/${id}`),///reviews/
          api.get(`/criteria/`)
        ]);
  
        setUser(userRes.data); // Сохраняем данные об энергетике
        setReviews(reviewsRes.data); // Сохраняем отзывы
        setCriteria(criteriaRes.data); // Сохраняем критерии
      }
      catch (err) {
        setError(err.message); // Сохраняем ошибку
      }
    };
    fetchData();
  }, [id]);
  
  // const user = {
  //   name: "Иван",
  //   reviews: 12,
  //   avgRating: 7.8,
  //   favoriteEnergy: "Monster Ultra",
  //   favoriteBrand: "Monster",
  //   reviewsList: [
  //     { brand: "Red Bull", energy: "Red Bull Original", scores: [8, 9, 7], text: "Хороший энергетик!" },
  //   ],
  // };

  return (
    <div>
      {reviews.email}
    </div>
    // <div>
    //   <h1>{user.username}</h1>
    //   <p>Отзывы: {user.reviews}</p>
    //   <p>Средняя оценка: {user.avgRating}</p>
    //   <p>Любимый энергетик: {user.favoriteEnergy}</p>
    //   <p>Любимый бренд: {user.favoriteBrand}</p>

    //   <h2>Отзывы</h2>
    //   {user.reviewsList.map((r, i) => (
    //     <div key={i}>
    //       <h3>{r.brand} - {r.energy}</h3>
    //       {r.scores.map((s, j) => <p key={j}>Критерий {j+1}: {s}</p>)}
    //       <p>{r.text}</p>
    //     </div>
    //   ))}
    // </div>
  );
};

export default Profile;
