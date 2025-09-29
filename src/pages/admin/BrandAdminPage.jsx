import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import debounce from "lodash/debounce";

import api from "../../hooks/api";

import Loader from "../../components/Loader";
import Error from "../../components/Error";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Pagination from "../../components/Pagination";

import "./BrandAdminPage.css";

const BrandAdminPage = ({ token }) => {
  const [brands, setBrands] = useState([]);
  const [newBrandName, setNewBrandName] = useState("");
  const [editingBrand, setEditingBrand] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = sessionStorage.getItem("brand-admin-page");
    return savedPage ? parseInt(savedPage, 10) : 1;
  });
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Загрузка списка брендов
  const fetchBrands = async (page = 1, search = "") => {
    setLoading(true);
    setError(null);
    try {
      const [brandsResponse, countResponse] = await Promise.all([
        api.get("/brands/admin/", {
          params: {
            skip: (page - 1) * itemsPerPage,
            limit: itemsPerPage,
            search_query: search || undefined,
          },
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get("/brands/admin/count/", {
          params: { search_query: search || undefined },
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setBrands(brandsResponse.data);
      setTotalPages(Math.ceil(countResponse.data.total / itemsPerPage));
    } catch (err) {
      setError("Ошибка при загрузке брендов: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Дебаунсинг для поиска
  const debouncedFetchBrands = debounce((query) => {
    setCurrentPage(1);
    fetchBrands(1, query);
  }, 300);

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    fetchBrands(currentPage, searchQuery);
    return () => debouncedFetchBrands.cancel();
  }, [token]);

  // Обновление списка брендов при изменении поискового запроса
  useEffect(() => {
    debouncedFetchBrands(searchQuery);
  }, [searchQuery]);

  // Сохранение текущей страницы
  useEffect(() => {
    sessionStorage.setItem("brand-admin-page", currentPage);
  }, [currentPage]);

  // Добавление нового бренда
  const handleAddBrand = async (e) => {
    e.preventDefault();
    if (!newBrandName.trim()) {
      toast.error("Название бренда не может быть пустым");
      return;
    }
    try {
      await api.post(
        "/brands/",
        { name: newBrandName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewBrandName("");
      await fetchBrands(currentPage, searchQuery);
      toast.success("Бренд успешно добавлен");
    } catch (err) {
      toast.error("Ошибка при добавлении бренда: " + (err.response?.data?.detail || err.message));
    }
  };

  // Начало редактирования бренда
  const handleEditBrand = (brand) => {
    setEditingBrand(brand);
    setNewBrandName(brand.name);
  };

  // Сохранение изменений бренда
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!newBrandName.trim()) {
      toast.error("Название бренда не может быть пустым");
      return;
    }
    try {
      await api.put(
        `/brands/${editingBrand.id}`,
        { name: newBrandName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingBrand(null);
      setNewBrandName("");
      await fetchBrands(currentPage, searchQuery);
      toast.success("Бренд успешно обновлен");
    } catch (err) {
      toast.error("Ошибка при обновлении бренда: " + (err.response?.data?.detail || err.message));
    }
  };

  // Отмена редактирования
  const handleCancelEdit = () => {
    setEditingBrand(null);
    setNewBrandName("");
  };

  // Удаление бренда
  const handleDeleteBrand = async (brandId) => {
    if (window.confirm("Вы уверены, что хотите удалить этот бренд?")) {
      try {
        await api.delete(`/brands/${brandId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        await fetchBrands(currentPage, searchQuery);
        toast.success("Бренд успешно удален");
      } catch (err) {
        toast.error("Ошибка при удалении бренда: " + (err.response?.data?.detail || err.message));
      }
    }
  };

  // Обработчик повторного запроса данных
  const handleRetry = () => {
    fetchBrands(currentPage, searchQuery);
  };

  // Обработчик изменения поискового запроса
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Обработчик смены страницы
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchBrands(page, searchQuery);
  };

  return (
    <div className="container">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <h1>Управление брендами</h1>

      {/* Форма для добавления/редактирования бренда */}
      <Card type="container">
        <h2>{editingBrand ? "Редактировать бренд" : "Добавить бренд"}</h2>
        <form onSubmit={editingBrand ? handleSaveEdit : handleAddBrand}>
          <input
            type="text"
            value={newBrandName}
            onChange={(e) => setNewBrandName(e.target.value)}
            placeholder="Название бренда"
            maxLength={255}
            required
          />
          <div>
            <Button type="submit" variant="primary">
              {editingBrand ? "Сохранить" : "Добавить"}
            </Button>
            {editingBrand && (
              <Button variant="danger" onClick={handleCancelEdit}>
                Отмена
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Поле поиска */}
      <Card type="container">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Поиск по названию бренда..."
          className="search-input"
        />
      </Card>

      {/* Список брендов */}
      <Card type="container">
        <div className="list-container">
          {loading ? (
            // Показываем индикатор загрузки
            <Loader />
          ) : error ? (
            // Показываем сообщение об ошибке
            <Error message={error} />
          ) : (
            <>
              {brands.length > 0 ? (
                <>
                  {brands.map((brand) => (
                    <Card key={brand.id} type="container" className="brand-card">
                      <div>
                        <p>
                          <Link to={`/brands/${brand.id}`} className="details-link">
                            {brand.name}
                          </Link>
                        </p>
                      </div>
                      <div>
                        <Button variant="primary" onClick={() => handleEditBrand(brand)}>
                          Редактировать
                        </Button>
                        <Button variant="danger" onClick={() => handleDeleteBrand(brand.id)}>
                          Удалить
                        </Button>
                      </div>
                    </Card>
                  ))}
                  {totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  )}
                </>
              ) : (
                <Card type="container">
                  <Error message="Бренды не найдены" />
                  <Button variant="primary" onClick={handleRetry}>
                    Попробовать снова
                  </Button>
                </Card>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default BrandAdminPage;