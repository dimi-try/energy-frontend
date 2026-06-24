import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import debounce from "lodash/debounce";
import { IoChevronDown } from "react-icons/io5";

import api from "../hooks/api";

import Loader from "../components/Loader";
import Error from "../components/Error";
import Card from "../components/Card";
import Button from "../components/Button";
import Pagination from "../components/Pagination";

import "./Charts.css";

// Компонент страницы Топ 100
const Charts = () => {
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
  // Состояние для списка категорий
  const [categories, setCategories] = useState([]);
  // Состояние для выбранной категории (null = все напитки)
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Дебаунсинг для поиска
  const debouncedFetchData = debounce((page, query, minRating, maxRating, categoryId) => {
    fetchData(page, query, minRating, maxRating, categoryId);
  }, 300);

  // Сохраняем выбранный тип топа
  useEffect(() => {
    sessionStorage.setItem("lastTopType", topType);
  }, [topType]);

  // Функция загрузки данных
  const fetchData = (page, searchQuery, minRating, maxRating, categoryId) => {
    setLoading(true);
    setError(null);
    const url = `/top/${topType}/?limit=${itemsPerPage}&offset=${
      (page - 1) * itemsPerPage
    }${searchQuery ? `&search_query=${encodeURIComponent(searchQuery)}` : ""}${
      minRating !== 0 ? `&min_rating=${minRating}` : ""
    }${maxRating !== 10 ? `&max_rating=${maxRating}` : ""}${
      categoryId ? `&category_id=${categoryId}` : ""
    }`;
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

  // Загружаем категории при монтировании
  useEffect(() => {
    api
      .get("/categories/")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setCategories(data);
      })
      .catch((err) => {
        console.error("API Categories Error:", err);
      });
  }, []);

  // Загружаем общее количество записей
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("search_query", searchQuery);
    if (ratingRange[0] > 0) params.append("min_rating", ratingRange[0]);
    if (ratingRange[1] < 10) params.append("max_rating", ratingRange[1]);
    if (selectedCategory) params.append("category_id", selectedCategory);
    
    const queryString = params.toString();
    api
      .get(`/top/${topType}/count/${queryString ? `?${queryString}` : ""}`)
      .then((res) => {
        const totalItems = res.data.total || 0;
        setTotalPages(Math.ceil(totalItems / itemsPerPage));
      })
      .catch((err) => {
        console.error("API Count Error:", err);
      });
  }, [topType, searchQuery, ratingRange, selectedCategory]);

  // Загружаем данные при изменении типа топа, страницы, поиска, рейтинга или категории
  useEffect(() => {
    debouncedFetchData(page, searchQuery, ratingRange[0], ratingRange[1], selectedCategory);
    return () => debouncedFetchData.cancel();
  }, [topType, page, searchQuery, ratingRange, selectedCategory]);

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

  // Обработчик изменения категории
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedCategory(value === "" ? null : parseInt(value, 10));
    setPage(1); // Сбрасываем страницу при изменении категории
  };

  // Обработчик открытия/закрытия фильтра
  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  // Обработчик сброса фильтров
  const resetFilters = () => {
    setSearchQuery("");
    setRatingRange([0, 10]);
    setSelectedCategory(null);
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
            setSelectedCategory(null);
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
            setSelectedCategory(null);
            setIsFilterOpen(false);
          }}
        >
          Топ Производителей
        </button>
      </div>

      <div className="filter-toggle" onClick={toggleFilter}>
        Фильтр <IoChevronDown className={`filter-icon ${isFilterOpen ? 'open' : ''}`} />
      </div>
      {/* Панель фильтрации */}
      {isFilterOpen && (
        <Card type="container">
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
          />
          {topType === "energies" && (
            <div className="category-filter">
              <h4>Категория</h4>
              <select
                value={selectedCategory || ""}
                onChange={handleCategoryChange}
                className="category-select"
              >
                <option value="">Все напитки</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}
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
            <>
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
            </>
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

export default Charts;