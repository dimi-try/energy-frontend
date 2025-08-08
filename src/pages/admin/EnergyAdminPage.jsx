import React, { useState, useEffect } from "react";
import api from "../../hooks/api";
import "../../styles/EnergyAdminPage.css";

const EnergyAdminPage = ({ token }) => {
  const [energies, setEnergies] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newEnergy, setNewEnergy] = useState({
    name: "",
    brand_id: "",
    category_id: "",
    description: "",
    ingredients: "",
    image_url: "",
  });
  const [editingEnergy, setEditingEnergy] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Загрузка списка энергетиков, брендов и категорий
  const fetchEnergies = async () => {
    try {
      const response = await api.get("/energies/");
      setEnergies(response.data);
    } catch (err) {
      setError("Ошибка при загрузке энергетиков: " + (err.response?.data?.detail || err.message));
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await api.get("/energies/brands-for-select", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBrands(response.data);
    } catch (err) {
      setError("Ошибка при загрузке брендов: " + (err.response?.data?.detail || err.message));
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/energies/categories-for-select", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data);
    } catch (err) {
      setError("Ошибка при загрузке категорий: " + (err.response?.data?.detail || err.message));
    }
  };

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    fetchEnergies();
    fetchBrands();
    fetchCategories();
  }, []);

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
      const response = await api.post(
        "/energies/",
        {
          ...newEnergy,
          brand_id: parseInt(newEnergy.brand_id),
          category_id: newEnergy.category_id ? parseInt(newEnergy.category_id) : null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEnergies([...energies, response.data]);
      setNewEnergy({
        name: "",
        brand_id: "",
        category_id: "",
        description: "",
        ingredients: "",
        image_url: "",
      });
      setSuccess("Энергетик успешно добавлен");
      setError(null);
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
      const response = await api.put(
        `/energies/${editingEnergy.id}`,
        {
          ...newEnergy,
          brand_id: parseInt(newEnergy.brand_id),
          category_id: newEnergy.category_id ? parseInt(newEnergy.category_id) : null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEnergies(energies.map((e) => (e.id === editingEnergy.id ? response.data : e)));
      setEditingEnergy(null);
      setNewEnergy({
        name: "",
        brand_id: "",
        category_id: "",
        description: "",
        ingredients: "",
        image_url: "",
      });
      setSuccess("Энергетик успешно обновлен");
      setError(null);
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
        setEnergies(energies.filter((e) => e.id !== energyId));
        setSuccess("Энергетик успешно удален");
        setError(null);
      } catch (err) {
        setError("Ошибка при удалении энергетика: " + (err.response?.data?.detail || err.message));
        setSuccess(null);
      }
    }
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
          {brands.map((brand) => (
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
        <input
          type="text"
          name="image_url"
          value={newEnergy.image_url}
          onChange={handleInputChange}
          placeholder="URL изображения"
          maxLength={255}
        />
        <button type="submit">{editingEnergy ? "Сохранить" : "Добавить"}</button>
        {editingEnergy && (
          <button type="button" onClick={handleCancelEdit}>
            Отмена
          </button>
        )}
      </form>

      {/* Сообщения об ошибках и успехе */}
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      {/* Список энергетиков */}
      <ul className="energy-list">
        {energies.map((energy) => (
          <li key={energy.id}>
            <span>{energy.name} (Бренд: {energy.brand.name}, Категория: {energy.category?.name || "Без категории"})</span>
            <div>
              <button onClick={() => handleEditEnergy(energy)}>Редактировать</button>
              <button onClick={() => handleDeleteEnergy(energy.id)}>Удалить</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EnergyAdminPage;