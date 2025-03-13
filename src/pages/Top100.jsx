import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const Top100 = () => {
  const [topType, setTopType] = useState('energies'); // 'energies' | 'brands'
  const [energies, setEnergies] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);

    axios.get(`${API_URL}/top/${topType}`)
      .then((res) => {
        if (topType === 'energies') {
          setEnergies(res.data || []);
        } else {
          setBrands(res.data || []);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [topType]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <button 
          onClick={() => setTopType('energies')} 
          style={{ marginRight: '10px', padding: '10px', background: topType === 'energies' ? 'lightblue' : 'white' }}>
          🔋 Топ энергетиков
        </button>
        <button 
          onClick={() => setTopType('brands')} 
          style={{ padding: '10px', background: topType === 'brands' ? 'lightblue' : 'white' }}>
          🏢 Топ брендов
        </button>
      </div>

      {loading && <p>⏳ Загрузка...</p>}
      {error && <p style={{ color: 'red' }}>❌ Ошибка: {error}</p>}

      {!loading && !error && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {topType === 'energies' ? (
            energies.length === 0 ? (
              <p>⚠️ Данных пока нет</p>
            ) : (
              energies.map((item) => (
                <li key={item.id} 
                    style={{ padding: '10px', borderBottom: '1px solid #ddd', cursor: 'pointer', color: 'blue' }}
                    onClick={() => navigate(`/energy/${item.id}`)}>
                  <strong>{item.brand?.name || 'Неизвестный бренд'}</strong> - {item.name || 'Без названия'}  
                  <br />
                  ⭐ Средняя оценка: {item.average_rating || 'N/A'} 
                  ({item.votes || 0} оценок)
                </li>
              ))
            )
          ) : (
            brands.length === 0 ? (
              <p>⚠️ Данных пока нет</p>
            ) : (
              brands.map((item) => (
                <li key={item.id} 
                    style={{ padding: '10px', borderBottom: '1px solid #ddd', cursor: 'pointer', color: 'blue' }}
                    onClick={() => navigate(`/brand/${item.id}`)}>
                  <strong>{item.name || 'Неизвестный бренд'}</strong>
                  <br />
                  ⭐ Средняя оценка: {item.average_rating || 'N/A'}  
                  <br />
                  📦 Энергетиков: {item.energies_count || 0}  
                  <br />
                  👥 Оценок: {item.total_votes || 0} 
                </li>
              ))
            )
          )}
        </ul>
      )}
    </div>
  );
};

export default Top100;
