import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import debounce from "lodash/debounce";

import api from "../../hooks/api";

import Loader from "../../components/Loader";
import Error from "../../components/Error";
import Card from "../../components/Card";
import Button from "../../components/Button";
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
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = sessionStorage.getItem("energy-admin-page");
    return savedPage ? parseInt(savedPage, 10) : 1;
  });
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Загрузка списка энергетиков
  const fetchEnergies = async (page = 1, search = "") => {
    setLoading(true);
    setError(null);
    try {
      const [energiesResponse, countResponse] = await Promise.all([
        api.get("/energies/admin/", {
          params: {
            skip: (page - 1) * itemsPerPage,
            limit: itemsPerPage,
            search_query: search || undefined,
          },
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get("/energies/admin/count/", {
          params: { search_query: search || undefined },
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setEnergies(energiesResponse.data);
      setTotalPages(Math.ceil(countResponse.data.total / itemsPerPage));
    } catch (err) {
      setError("Ошибка при загрузке энергетиков: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Загрузка брендов
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

  // Загрузка брендов для селекта
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

  // Загрузка категорий
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
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchBrands(), fetchBrandsSelect(), fetchCategories()]);
      await fetchEnergies(currentPage, searchQuery);
    };
    loadData();
    return () => debouncedFetchEnergies.cancel();
  }, [token]);

  // Обновление списка энергетиков при изменении страницы или поискового запроса
  useEffect(() => {
    debouncedFetchEnergies(searchQuery);
  }, [searchQuery]);

  // Сохранение текущей страницы
  useEffect(() => {
    sessionStorage.setItem("energy-admin-page", currentPage);
  }, [currentPage]);

  // Обработка изменений формы
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEnergy({ ...newEnergy, [name]: value });
  };

  // Добавление нового энергетика
  const handleAddEnergy = async (e) => {
    e.preventDefault();
    if (!newEnergy.name.trim() || !newEnergy.brand_id) {
      toast.error("Название и бренд обязательны");
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

      await api.post(
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
      await fetchEnergies(currentPage, searchQuery);
      toast.success("Энергетик успешно добавлен");
    } catch (err) {
      toast.error("Ошибка при добавлении энергетика: " + (err.response?.data?.detail || err.message));
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
      toast.error("Название и бренд обязательны");
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

      await api.put(
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
      await fetchEnergies(currentPage, searchQuery);
      toast.success("Энергетик успешно обновлен");
    } catch (err) {
      toast.error("Ошибка при обновлении энергетика: " + (err.response?.data?.detail || err.message));
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
  };

  // Удаление энергетика
  const handleDeleteEnergy = async (energyId) => {
    if (window.confirm("Вы уверены, что хотите удалить этот энергетик?")) {
      try {
        await api.delete(`/energies/${energyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        await fetchEnergies(currentPage, searchQuery);
        toast.success("Энергетик успешно удален");
      } catch (err) {
        toast.error("Ошибка при удалении энергетика: " + (err.response?.data?.detail || err.message));
      }
    }
  };

  // Обработчик повторного запроса данных
  const handleRetry = () => {
    fetchEnergies(currentPage, searchQuery);
    fetchBrands();
    fetchBrandsSelect();
    fetchCategories();
  };

  // Обработчик смены страницы
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchEnergies(page, searchQuery);
  };

  // Обработчик изменения поискового запроса
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
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

      <h1>Управление энергетиками</h1>

      {/* Форма для добавления/редактирования энергетика */}
      <Card type="container">
        <h2>{editingEnergy ? "Редактировать энергетик" : "Добавить энергетик"}</h2>
        <form onSubmit={editingEnergy ? handleSaveEdit : handleAddEnergy}>
          <input
            type="text"
            name="name"
            value={newEnergy.name}
            onChange={handleInputChange}
            placeholder="Название энергетика"
            maxLength={255}
            required
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
          />
          <div>
            <Button type="submit" variant="primary">
              {editingEnergy ? "Сохранить" : "Добавить"}
            </Button>
            {editingEnergy && (
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
          placeholder="Поиск по бренду или энергетику..."
          className="search-input"
        />
      </Card>

      {/* Список энергетиков */}
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
              {energies.length > 0 ? (
                <>
                  {energies.map((energy) => (
                    <Card key={energy.id} type="container" className="energy-card">
                      <div>
                        <div className="energy-image">
                          {energy.image_url ? (
                            <img
                              src={`${process.env.REACT_APP_BACKEND_URL}/${energy.image_url}`}
                              alt={energy.name}
                              loading="lazy"
                            />
                          ) : (
                            <div className="no-image">Нет фото</div>
                          )}
                        </div>
                        <div>
                          <p>
                            <strong>Название: </strong>
                            <Link to={`/energies/${energy.id}`} className="details-link">
                              {energy.brand.name} {energy.name}
                            </Link>
                          </p>
                        </div>
                      </div>
                      <div>
                        <Button variant="primary" onClick={() => handleEditEnergy(energy)}>
                          Редактировать
                        </Button>
                        <Button variant="danger" onClick={() => handleDeleteEnergy(energy.id)}>
                          Удалить
                        </Button>
                      </div>
                    </Card>
                  ))}
                  {/* Компонент пагинации */}
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
                  <Error message="Энергетики не найдены" />
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

export default EnergyAdminPage;