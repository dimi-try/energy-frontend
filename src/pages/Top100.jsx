import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import debounce from "lodash/debounce";
import api from "../hooks/api";

import Loader from "../components/Loader";
import Error from "../components/Error";
import Card from "../components/Card";
import Button from "../components/Button";
import Pagination from "../components/Pagination";

import "./Top100.css";

// Компонент страницы Топ 100
const Top100 = () => {
  // Состояние для типа топа (энергетики или бренды)
  const [topType, setTopType] = useState(() => {
    // Загружаем сохраненный тип топа или по умолчанию "energies"
    return sessionStorage.getItem("lastTopType") === "brands" ? "brands" : "energies";
  });
  // Состояние для списка энергетиков
  const [energies, setEnergies] = useState([]);
  // Состояние для списка брендов
  const [brands, setBrands] = useState([]);
  // Состояние для индикации загрузки
  const [loading, setLoading] = useState(false);
  // Состояние для отслеживания ошибок
  const [error, setError] = useState(null);
  // Хук для навигации
  const navigate = useNavigate();
  // Состояние для текущей страницы
  const [page, setPage] = useState(() => {
    const savedPage = sessionStorage.getItem(`page-${topType}`);
    return savedPage ? parseInt(savedPage, 10) : 1;
  });
  // Состояние для общего количества страниц
  const [totalPages, setTotalPages] = useState(1);
  // Количество элементов на странице
  const itemsPerPage = 10;
  // Состояние для видимости панели фильтра
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // Состояние для поискового запроса
  const [searchQuery, setSearchQuery] = useState("");
  // Состояние для диапазона рейтинга
  const [ratingRange, setRatingRange] = useState([0, 10]);

  // Дебаунсинг для поиска
  const debouncedFetchData = debounce((page, query, minRating, maxRating) => {
    fetchData(page, query, minRating, maxRating);
  }, 300);

  // Сохраняем выбранный тип топа
  useEffect(() => {
    sessionStorage.setItem("lastTopType", topType);
  }, [topType]);

  // Функция загрузки данных
  const fetchData = (page, searchQuery, minRating, maxRating) => {
    setLoading(true);
    setError(null);
    const url = `/top/${topType}/?limit=${itemsPerPage}&offset=${
      (page - 1) * itemsPerPage
    }${searchQuery ? `&search_query=${encodeURIComponent(searchQuery)}` : ""}${
      minRating !== 0 ? `&min_rating=${minRating}` : ""
    }${maxRating !== 10 ? `&max_rating=${maxRating}` : ""}`;
    api
      .get(url)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        if (topType === "energies") setEnergies(data);
        else setBrands(data);
      })
      .catch((err) => {
        console.error("API Error:", err);
        setError("Не удалось загрузить данные. Попробуйте позже.");
      })
      .finally(() => setLoading(false));
  };

  // Загружаем общее количество записей
  useEffect(() => {
    api
      .get(
        `/top/${topType}/count/${
          searchQuery || ratingRange[0] > 0 || ratingRange[1] < 10
            ? `?${searchQuery ? `search_query=${encodeURIComponent(searchQuery)}&` : ""}${
                ratingRange[0] > 0 ? `min_rating=${ratingRange[0]}&` : ""
              }${ratingRange[1] < 10 ? `max_rating=${ratingRange[1]}` : ""}`
            : ""
        }`
      )
      .then((res) => {
        const totalItems = res.data.total || 0;
        setTotalPages(Math.ceil(totalItems / itemsPerPage));
      })
      .catch((err) => {
        console.error("API Count Error:", err);
      });
  }, [topType, searchQuery, ratingRange]);

  // Загружаем данные при изменении типа топа, страницы, поиска или рейтинга
  useEffect(() => {
    debouncedFetchData(page, searchQuery, ratingRange[0], ratingRange[1]);
    return () => debouncedFetchData.cancel();
  }, [topType, page, searchQuery, ratingRange]);

  // Сохранение текущей страницы при изменении page или topType
  useEffect(() => {
    sessionStorage.setItem(`page-${topType}`, page);
  }, [page, topType]);

  // Функция для перехода на страницу с сохранением текущей страницы
  const handleNavigate = (path) => {
    sessionStorage.setItem(`page-${topType}`, page); // Сохраняем текущую страницу
    navigate(path); // Переходим по указанному пути
  };

  // Обработчик изменения поискового запроса
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1); // Сбрасываем страницу при новом поиске
  };

  // Обработчик изменения диапазона рейтинга
  const handleRatingChange = (value) => {
    setRatingRange(value);
    setPage(1); // Сбрасываем страницу при изменении рейтинга
  };

  // Обработчик открытия/закрытия фильтра
  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  // Обработчик сброса фильтров
  const resetFilters = () => {
    setSearchQuery("");
    setRatingRange([0, 10]);
    setPage(1);
  };

  return (
    <div className="container">
      {/* Кнопки переключения между типами топа и кнопка фильтра */}
      <div className="toggle-buttons">
        <button
          className={topType === "energies" ? "active" : ""}
          onClick={() => {
            setTopType("energies");
            setPage(() => {
              const savedPage = sessionStorage.getItem(`page-energies`);
              return savedPage ? parseInt(savedPage, 10) : 1;
            });
            setSearchQuery("");
            setRatingRange([0, 10]);
            setIsFilterOpen(false);
          }}
        >
          Топ Энергетиков
        </button>
        <button
          className={topType === "brands" ? "active" : ""}
          onClick={() => {
            setTopType("brands");
            setPage(() => {
              const savedPage = sessionStorage.getItem(`page-brands`);
              return savedPage ? parseInt(savedPage, 10) : 1;
            });
            setSearchQuery("");
            setRatingRange([0, 10]);
            setIsFilterOpen(false);
          }}
        >
          Топ Производителей
        </button>
        <Button variant="primary" onClick={toggleFilter}>
          Фильтр
        </Button>
      </div>

      {/* Панель фильтрации */}
      {isFilterOpen && (
        <Card type="container" className="filter-panel">
          <h3>Фильтры</h3>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={
              topType === "energies"
                ? "Поиск по энергетику или бренду..."
                : "Поиск по бренду..."
            }
            className="search-input"
          />
          <div className="rating-filter">
            <h4>Диапазон рейтинга</h4>
            <Slider
              range
              min={0}
              max={10}
              step={0.1}
              value={ratingRange}
              onChange={handleRatingChange}
              trackStyle={[{ backgroundColor: "var(--primary-color)" }]}
              handleStyle={[
                { borderColor: "var(--primary-color)" },
                { borderColor: "var(--primary-color)" },
              ]}
              railStyle={{ backgroundColor: "var(--card-background)" }}
            />
            <div className="rating-values">
              <span>{ratingRange[0]}</span>
              <span>{ratingRange[1]}</span>
            </div>
          </div>
          <Button variant="danger" onClick={resetFilters}>
            Сбросить фильтры
          </Button>
        </Card>
      )}

      {/* Контейнер для списка */}
      <Card type="container">
        <div className="list-container">
          {loading ? (
            // Показываем индикатор загрузки
            <Loader />
          ) : error ? (
            // Показываем сообщение об ошибке
            <Error message={error} />
          ) : (
            // Отображаем список, если нет ошибок и загрузка завершена
            <div className="cards-grid">
              {topType === "energies" ? (
                energies.length > 0 ? (
                  energies.map((item) => (
                    // Карточка энергетика
                    <Card
                      key={item.id}
                      type="list"
                      rank={item.absolute_rank} // Используем абсолютный ранг
                      onClick={() => handleNavigate(`/energies/${item.id}/`)}
                    >
                      <div className="card-image">
                        {item.image_url ? (
                          <img
                            src={`${process.env.REACT_APP_BACKEND_URL}/${item.image_url}`}
                            alt={item.name}
                          />
                        ) : (
                          <div className="no-image-card">Нет фото</div>
                        )}
                      </div>
                      <div className="card-content">
                        <h2>
                          {item.brand?.name} {item.name}
                        </h2>
                        <p>
                          <span className="star">★</span> {item.average_rating}/10 (
                          {item.review_count} отзывов)
                        </p>
                          <p>{item.category.name}</p>
                      </div>
                    </Card>
                  ))
                ) : (
                    <Error message={"Нет данных об энергетиках"} />
                )
              ) : brands.length > 0 ? (
                brands.map((item) => (
                  // Карточка бренда
                  <Card
                    key={item.id}
                    type="list"
                    rank={item.absolute_rank} // Используем абсолютный ранг
                    onClick={() => handleNavigate(`/brands/${item.id}/`)}
                  >
                    <div className="card-content">
                      <h3>{item.name}</h3>
                      <p>
                        <span className="star">★</span> {item.average_rating}/10 (
                        {item.review_count} отзывов, {item.energy_count} энергетиков)
                      </p>
                    </div>
                  </Card>
                ))
              ) : (
                    <Error message={"Нет данных о брендах"} />
              )}
            </div>
          )}
          {/* Компонент пагинации */}
          {!loading && !error && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </div>
      </Card>
    </div>
  );
};

export default Top100;