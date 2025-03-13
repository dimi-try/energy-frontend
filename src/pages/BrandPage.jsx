import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const BrandPage = () => {
  const { id } = useParams();
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/brand/${id}`)
      .then((res) => setBrand(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>⏳ Загрузка...</p>;
  if (error) return <p style={{ color: 'red' }}>❌ Ошибка: {error}</p>;

  

  return (
    <div>
      <h1>{brand.name}</h1>
      <p><strong>Средняя оценка:</strong> {brand.average_rating}</p>
      <h2>Энергетики бренда:</h2>
      <ul>
        {brand.energies && brand.energies.length > 0 ? (
          brand.energies.map((energy) => (
            <li key={energy.id}>
              {energy.name} (⭐ {energy.average_rating})
            </li>
          ))
        ) : (
          <p>Нет энергетиков для этого бренда</p>
        )}
      </ul>
    </div>
  );
};

export default BrandPage;
