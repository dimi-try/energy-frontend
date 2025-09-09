import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import debounce from "lodash/debounce";

import api from "../../hooks/api";

import ImageUpload from "../../components/ImageUpload";
import Pagination from "../../components/Pagination";

import "./EnergyAdminPage.css";

const EnergyAdminPage = ({ token }) => {
  const [energies, setEnergies] = useState([]);
  const [brands, setBrands] = useState([]);
  const [brandsSelect, setBrandsSelect] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newEnergy, setNewEnergy] = useState({
    name: "",
    brand_id: "",
    category_id: "",
    description: "",
    ingredients: "",
    image: null,
    image_url: "",
  });
  const [editingEnergy, setEditingEnergy] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Загрузка списка энергетиков
  const fetchEnergies = async (page = 1, search = "") => {
    try {
      const [energiesResponse, countResponse] = await Promise.all([
        api.get("/energies/admin/", {
          params: {
            skip: (page - 1) * itemsPerPage,
            limit: itemsPerPage,
            search_query: search || undefined,
          },
        }),
        api.get("/energies/admin/count/", {
          params: {
            search_query: search || undefined,
          },
        }),
      ]);
      setEnergies(energiesResponse.data);
      setTotalPages(Math.ceil(countResponse.data.total / itemsPerPage));
    } catch (err) {
      setError("Ошибка при загрузке энергетиков: " + (err.response?.data?.detail || err.message));
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await api.get("/brands/admin/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBrands(response.data);
    } catch (err) {
      setError("Ошибка при загрузке брендов: " + (err.response?.data?.detail || err.message));
    }
  };

  const fetchBrandsSelect = async () => {
    try {
      const response = await api.get("/brands/admin/select", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBrandsSelect(response.data);
    } catch (err) {
      setError("Ошибка при загрузке брендов: " + (err.response?.data?.detail || err.message));
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories/admin/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data);
    } catch (err) {
      setError("Ошибка при загрузке категорий: " + (err.response?.data?.detail || err.message));
    }
  };

  // Дебаунсинг для поиска
  const debouncedFetchEnergies = debounce((query) => {
    setCurrentPage(1);
    fetchEnergies(1, query);
  }, 300);

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    fetchBrands();
    fetchCategories();
    fetchBrandsSelect();
  }, []);

  useEffect(() => {
    debouncedFetchEnergies(searchQuery);
    return () => debouncedFetchEnergies.cancel();
  }, [searchQuery]);

  // Обработка изменений формы
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingEnergy) {
      setNewEnergy({ ...newEnergy, [name]: value });
    } else {
      setNewEnergy({ ...newEnergy, [name]: value });
    }
  };

  // Добавление нового энергетика
  const handleAddEnergy = async (e) => {
    e.preventDefault();
    if (!newEnergy.name.trim() || !newEnergy.brand_id) {
      setError("Название и бренд обязательны");
      return;
    }
    try {
      let imageUrl = null;
      if (newEnergy.image) {
        const formData = new FormData();
        formData.append("file", newEnergy.image);
        const uploadRes = await api.post("/energies/upload-image/", formData, {
          headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
        });
        imageUrl = uploadRes.data.image_url;
      }

      const response = await api.post(
        "/energies/",
        {
          ...newEnergy,
          brand_id: parseInt(newEnergy.brand_id),
          category_id: newEnergy.category_id ? parseInt(newEnergy.category_id) : null,
          image_url: imageUrl,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewEnergy({
        name: "",
        brand_id: "",
        category_id: "",
        description: "",
        ingredients: "",
        image: null,
        image_url: "",
      });
      setSuccess("Энергетик успешно добавлен");
      setError(null);
      fetchEnergies(currentPage, searchQuery); // Обновляем список
    } catch (err) {
      setError("Ошибка при добавлении энергетика: " + (err.response?.data?.detail || err.message));
      setSuccess(null);
    }
  };

  // Начало редактирования энергетика
  const handleEditEnergy = (energy) => {
    setEditingEnergy(energy);
    setNewEnergy({
      name: energy.name,
      brand_id: energy.brand_id,
      category_id: energy.category_id || "",
      description: energy.description || "",
      ingredients: energy.ingredients || "",
      image: null,
      image_url: energy.image_url || "",
    });
  };

  // Сохранение изменений энергетика
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!newEnergy.name.trim() || !newEnergy.brand_id) {
      setError("Название и бренд обязательны");
      return;
    }
    try {
      let imageUrl = newEnergy.image_url;
      if (newEnergy.image) {
        const formData = new FormData();
        formData.append("file", newEnergy.image);
        const uploadRes = await api.post("/energies/upload-image/", formData, {
          headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
        });
        imageUrl = uploadRes.data.image_url;
      }

      const response = await api.put(
        `/energies/${editingEnergy.id}`,
        {
          ...newEnergy,
          brand_id: parseInt(newEnergy.brand_id),
          category_id: newEnergy.category_id ? parseInt(newEnergy.category_id) : null,
          image_url: imageUrl,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingEnergy(null);
      setNewEnergy({
        name: "",
        brand_id: "",
        category_id: "",
        description: "",
        ingredients: "",
        image: null,
        image_url: "",
      });
      setSuccess("Энергетик успешно обновлен");
      setError(null);
      fetchEnergies(currentPage, searchQuery); // Обновляем список
    } catch (err) {
      setError("Ошибка при обновлении энергетика: " + (err.response?.data?.detail || err.message));
      setSuccess(null);
    }
  };

  // Отмена редактирования
  const handleCancelEdit = () => {
    setEditingEnergy(null);
    setNewEnergy({
      name: "",
      brand_id: "",
      category_id: "",
      description: "",
      ingredients: "",
      image: null,
      image_url: "",
    });
    setError(null);
  };

  // Удаление энергетика
  const handleDeleteEnergy = async (energyId) => {
    if (window.confirm("Вы уверены, что хотите удалить этот энергетик?")) {
      try {
        await api.delete(`/energies/${energyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Энергетик успешно удален");
        setError(null);
        fetchEnergies(currentPage, searchQuery); // Обновляем список
      } catch (err) {
        setError("Ошибка при удалении энергетика: " + (err.response?.data?.detail || err.message));
        setSuccess(null);
      }
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchEnergies(page, searchQuery);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="energy-admin-page">
      <h1>Управление энергетиками</h1>

      {/* Форма для добавления/редактирования энергетика */}
      <form onSubmit={editingEnergy ? handleSaveEdit : handleAddEnergy}>
        <input
          type="text"
          name="name"
          value={newEnergy.name}
          onChange={handleInputChange}
          placeholder="Название энергетика"
          maxLength={255}
        />
        <select
          name="brand_id"
          value={newEnergy.brand_id}
          onChange={handleInputChange}
          required
        >
          <option value="">Выберите бренд</option>
          {brandsSelect.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
        <select
          name="category_id"
          value={newEnergy.category_id}
          onChange={handleInputChange}
        >
          <option value="">Без категории</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <textarea
          name="description"
          value={newEnergy.description}
          onChange={handleInputChange}
          placeholder="Описание"
        />
        <textarea
          name="ingredients"
          value={newEnergy.ingredients}
          onChange={handleInputChange}
          placeholder="Ингредиенты"
        />
        <ImageUpload
          image={newEnergy.image}
          imageUrl={newEnergy.image_url}
          onImageChange={(file) => setNewEnergy({ ...newEnergy, image: file, image_url: "" })}
          backendUrl={process.env.REACT_APP_BACKEND_URL}
          error={error}
          setError={setError}
        />
        <button className="energy-admin-page-button" type="submit">{editingEnergy ? "Сохранить" : "Добавить"}</button>
        {editingEnergy && (
          <button className="energy-admin-page-button" type="button" onClick={handleCancelEdit}>
            Отмена
          </button>
        )}
      </form>

      {/* Поле поиска */}
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Поиск по бренду или энергетику..."
        className="search-input"
      />

      {/* Сообщения об ошибках и успехе */}
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      {/* Список энергетиков */}
      <ul className="energy-list">
        {energies.map((energy) => (
          <li key={energy.id}>
            <span>
              <Link to={`/energies/${energy.id}`} className="details-link">
                {energy.brand.name} {energy.name}
              </Link>
            </span>
            <div>
              <button className="energy-admin-page-button" onClick={() => handleEditEnergy(energy)}>Редактировать</button>
              <button className="energy-admin-page-button" onClick={() => handleDeleteEnergy(energy.id)}>Удалить</button>
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

export default EnergyAdminPage;