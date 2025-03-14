import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const EnergyPage = () => {
  const { id } = useParams();
  const [energy, setEnergy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/energy/${id}`)
      .then((res) => setEnergy(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>⏳ Загрузка...</p>;
  if (error) return <p style={{ color: 'red' }}>❌ Ошибка: {error}</p>;

  return (
    <div>
      <h1>{energy.name}</h1>
      <p><strong>Бренд:</strong> {energy.brand.name}</p>
      <p><strong>Средняя оценка:</strong> {energy.average_rating || "нет"}</p>
      <p><strong>Описание:</strong> {energy.description}</p>
      <p><strong>Категория:</strong> {energy.category.name}</p>
    </div>
  );
};

export default EnergyPage;
