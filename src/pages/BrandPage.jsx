import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const BrandPage = () => {
  const { id } = useParams();
  const [brand, setBrand] = useState(null);
  const [energies, setEnergies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Загружаем информацию о бренде
    axios.get(`${API_URL}/brand/${id}`)
      .then((res) => setBrand(res.data))
      .catch((err) => setError(err.message));

    // Загружаем список энергетиков бренда
    axios.get(`${API_URL}/brands/${id}/energies/`)
      .then((res) => setEnergies(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>⏳ Загрузка...</p>;
  if (error) return <p style={{ color: 'red' }}>❌ Ошибка: {error}</p>;

  if (!brand) return <p>⚠️ Информация о бренде не найдена</p>;

  return (
    <div>
      <h1>{brand.name}</h1>
      <p><strong>Средняя оценка:</strong> {brand.average_rating}</p>
      <p><strong>Количество энергетиков:</strong> {energies.length}</p>

      <h2>Энергетики бренда:</h2>
      {energies.length > 0 ? (
        <ul>
          {energies.map((energy) => (
            <li key={energy.id}>
              <Link to={`/energy/${energy.id}`}>
                {energy.name} (⭐ {energy.average_rating})
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>Нет энергетиков для этого бренда</p>
      )}
    </div>
  );
};

export default BrandPage;
