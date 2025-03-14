import React from 'react';

const Profile = () => {
  const user = {
    name: "Иван",
    reviews: 12,
    avgRating: 7.8,
    favoriteEnergy: "Monster Ultra",
    favoriteBrand: "Monster",
    reviewsList: [
      { brand: "Red Bull", energy: "Red Bull Original", scores: [8, 9, 7], text: "Хороший энергетик!" },
    ],
  };

  return (
    <div>
      <h1>{user.name}</h1>
      <p>Отзывы: {user.reviews}</p>
      <p>Средняя оценка: {user.avgRating}</p>
      <p>Любимый энергетик: {user.favoriteEnergy}</p>
      <p>Любимый бренд: {user.favoriteBrand}</p>

      <h2>Отзывы</h2>
      {user.reviewsList.map((r, i) => (
        <div key={i}>
          <h3>{r.brand} - {r.energy}</h3>
          {r.scores.map((s, j) => <p key={j}>Критерий {j+1}: {s}</p>)}
          <p>{r.text}</p>
        </div>
      ))}
    </div>
  );
};

export default Profile;
