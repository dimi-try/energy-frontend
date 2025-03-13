import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const BrandPage = () => {
  const { id } = useParams();
  const [brand, setBrand] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/brands/${id}`).then((res) => setBrand(res.data));
  }, [id]);

  return brand ? (
    <div>
      <h1>{brand.name}</h1>
      <p>Средняя оценка: {brand.avgRating}</p>
      <h2>Энергетики</h2>
      <ul>{brand.energies.map((e) => <li key={e.id}>{e.name}</li>)}</ul>
    </div>
  ) : <p>Загрузка...</p>;
};

export default BrandPage;
