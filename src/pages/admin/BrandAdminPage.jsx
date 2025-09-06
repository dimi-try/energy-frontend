import React, { useState, useEffect } from "react";
import debounce from "lodash/debounce";

import api from "../../hooks/api";

import Pagination from "../../components/Pagination";

import "./BrandAdminPage.css";

const BrandAdminPage = ({ token }) => {
  const [brands, setBrands] = useState([]);
  const [newBrandName, setNewBrandName] = useState("");
  const [editingBrand, setEditingBrand] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Загрузка списка брендов
  const fetchBrands = async (page = 1, search = "") => {
    try {
      const [brandsResponse, countResponse] = await Promise.all([
        api.get("/brands/admin/", {
          params: {
            skip: (page - 1) * itemsPerPage,
            limit: itemsPerPage,
            search_query: search || undefined,
          },
        }),
        api.get("/brands/admin/count/", {
          params: {
            search_query: search || undefined,
          },
        }),
      ]);
      setBrands(brandsResponse.data);
      setTotalPages(Math.ceil(countResponse.data.total / itemsPerPage));
    } catch (err) {
      setError("Ошибка при загрузке брендов: " + (err.response?.data?.detail || err.message));
    }
  };

  // Дебаунсинг для поиска
  const debouncedFetchBrands = debounce((query) => {
    setCurrentPage(1);
    fetchBrands(1, query);
  }, 300);

  useEffect(() => {
    debouncedFetchBrands(searchQuery);
    return () => debouncedFetchBrands.cancel();
  }, [searchQuery]);

  // Добавление нового бренда
  const handleAddBrand = async (e) => {
    e.preventDefault();
    if (!newBrandName.trim()) {
      setError("Название бренда не может быть пустым");
      return;
    }
    try {
      const response = await api.post(
        "/brands/",
        { name: newBrandName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewBrandName("");
      setSuccess("Бренд успешно добавлен");
      setError(null);
      fetchBrands(currentPage, searchQuery); // Обновляем список
    } catch (err) {
      setError("Ошибка при добавлении бренда: " + (err.response?.data?.detail || err.message));
      setSuccess(null);
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
      setError("Название бренда не может быть пустым");
      return;
    }
    try {
      const response = await api.put(
        `/brands/${editingBrand.id}`,
        { name: newBrandName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingBrand(null);
      setNewBrandName("");
      setSuccess("Бренд успешно обновлен");
      setError(null);
      fetchBrands(currentPage, searchQuery); // Обновляем список
    } catch (err) {
      setError("Ошибка при обновлении бренда: " + (err.response?.data?.detail || err.message));
      setSuccess(null);
    }
  };

  // Отмена редактирования
  const handleCancelEdit = () => {
    setEditingBrand(null);
    setNewBrandName("");
    setError(null);
  };

  // Удаление бренда
  const handleDeleteBrand = async (brandId) => {
    if (window.confirm("Вы уверены, что хотите удалить этот бренд?")) {
      try {
        await api.delete(`/brands/${brandId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Бренд успешно удален");
        setError(null);
        fetchBrands(currentPage, searchQuery); // Обновляем список
      } catch (err) {
        setError("Ошибка при удалении бренда: " + (err.response?.data?.detail || err.message));
        setSuccess(null);
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchBrands(page, searchQuery);
  };

  return (
    <div className="brand-admin-page">
      <h1>Управление брендами</h1>
      
      {/* Форма для добавления/редактирования бренда */}
      <form onSubmit={editingBrand ? handleSaveEdit : handleAddBrand}>
        <input
          type="text"
          value={newBrandName}
          onChange={(e) => setNewBrandName(e.target.value)}
          placeholder="Название бренда"
          maxLength={255}
        />
        <button type="submit">{editingBrand ? "Сохранить" : "Добавить"}</button>
        {editingBrand && (
          <button type="button" onClick={handleCancelEdit}>
            Отмена
          </button>
        )}
      </form>

      {/* Поле поиска */}
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Поиск по названию бренда..."
        className="search-input"
      />

      {/* Сообщения об ошибках и успехе */}
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      {/* Список брендов */}
      <ul className="brand-list">
        {brands.map((brand) => (
          <li key={brand.id}>
            <span>{brand.name}</span>
            <div>
              <button onClick={() => handleEditBrand(brand)}>Редактировать</button>
              <button onClick={() => handleDeleteBrand(brand.id)}>Удалить</button>
            </div>
          </li>
        ))}
      </ul>

      {/* Пагинация */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default BrandAdminPage;