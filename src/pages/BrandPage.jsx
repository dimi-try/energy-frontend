import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import api from "../hooks/api";

import Card from "../components/Card";
import Loader from "../components/Loader";
import Error from "../components/Error";
import Pagination from "../components/Pagination";

import "./BrandPage.css";

// Компонент страницы бренда
const BrandPage = () => {
  // Получаем ID бренда из URL
  const { id } = useParams();
  // Состояние для данных о бренде
  const [brand, setBrand] = useState(null);
  // Состояние для списка энергетиков бренда
  const [energies, setEnergies] = useState([]);
  // Состояние для индикации загрузки
  const [loading, setLoading] = useState(true);
  // Состояние для ошибок
  const [error, setError] = useState(null);
  // Хук для навигации
  const navigate = useNavigate();
  // Состояние для текущей страницы
  const [page, setPage] = useState(() => {
    const savedPage = sessionStorage.getItem(`brand-page-${id}`);
    return savedPage ? parseInt(savedPage, 10) : 1;
  });
  // Состояние для общего количества страниц
  const [totalPages, setTotalPages] = useState(1);
  // Количество энергетиков на странице
  const energiesPerPage = 10;

  // Загружаем данные о бренде, энергетиках и общем количестве энергетиков
  useEffect(() => {
    setLoading(true); // Устанавливаем состояние загрузки
    setError(null); // Сбрасываем ошибки

    const fetchData = async () => {
      try {
        const [brandRes, energiesRes, countRes] = await Promise.all([
          api.get(`/brands/${id}`),
          api.get(`/brands/${id}/energies?limit=${energiesPerPage}&offset=${(page - 1) * energiesPerPage}`),
          api.get(`/brands/${id}/energies/count/`)
        ]);

        setBrand(brandRes.data); // Сохраняем данные о бренде
        setEnergies(energiesRes.data); // Сохраняем энергетики
        setTotalPages(Math.ceil(countRes.data.total / energiesPerPage)); // Устанавливаем общее количество страниц
      } catch (err) {
        setError(err.message); // Сохраняем ошибку
      } finally {
        setLoading(false); // Снимаем состояние загрузки
      }
    };

    fetchData();
  }, [id, page]);

  // Сохранение текущей страницы
  useEffect(() => {
    sessionStorage.setItem(`brand-page-${id}`, page);
  }, [page, id]);

  // Функция для перехода на страницу
  const handleNavigate = (path) => {
    navigate(path); // Переходим по указанному пути
  };

  // Показываем индикатор загрузки
  if (loading) return <Loader />;
  // Показываем сообщение об ошибке
  if (error) return <Error message={error} />;
  // Показываем сообщение, если бренд не найден
  if (!brand) return <Error message="Бренд не найден" />;
  
  return (
    <div className="brand-container container">
      {/* Заголовок страницы */}
      <h1>{brand.name}</h1>
      {/* Информация о бренде */}
      <Card type="container" className="brand-info">
        <p>
          <strong>Оценка:</strong>
          <span className="star">★</span> {brand.average_rating || "0.0"}/10 ({brand.review_count} отзывов)
        </p>
        <p>
          <strong>Отзывов:</strong> {brand.review_count || "0.0"}
        </p>
        <p>
          <strong>Энергетиков:</strong> {brand.energy_count || "0.0"}
        </p>
      </Card>

      {/* Список энергетиков */}
      <Card type="container">
        <h2>Энергетики ({brand.energy_count})</h2>
        <div className="list-container">
          {energies.length > 0 ? (
            <>
              <div className="cards-grid">
                {energies.map((energy, index) => (
                  // Карточка энергетика
                  <Card
                    key={energy.id}
                    type="list"
                    rank={(page - 1) * energiesPerPage + index + 1}
                    onClick={() => handleNavigate(`/energies/${energy.id}/`)}
                  >
                    <div className="card-image">
                      {energy.image_url ? (
                        <img
                          src={`${process.env.REACT_APP_BACKEND_URL}/${energy.image_url}`}
                          alt={energy.name}
                        />
                      ) : (
                        <div className="no-image-card">Нет фото</div>
                      )}
                    </div>
                    <div className="card-content">
                      <h2>{energy.name}</h2>
                      <p>
                        <span className="star">★</span> 
                        {energy.average_rating || "0.0"}/10 
                        ({energy.review_count || 0} отзывов)
                      </p>
                      <p>{energy.category.name}</p>
                    </div>
                  </Card>
                ))}
              </div>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </>
          ) : (
            <Error message="Пока нет энергетиков" />
          )}
        </div>
      </Card>
    </div>
  );
};

export default BrandPage;