import React, { useState, useEffect } from "react";
import api from "../../hooks/api";
import "./BrandAdminPage.css";

const BrandAdminPage = ({ token }) => {
  const [brands, setBrands] = useState([]);
  const [newBrandName, setNewBrandName] = useState("");
  const [editingBrand, setEditingBrand] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Загрузка списка брендов
  const fetchBrands = async () => {
    try {
      const response = await api.get("/brands/admin/");
      setBrands(response.data);
    } catch (err) {
      setError("Ошибка при загрузке брендов: " + (err.response?.data?.detail || err.message));
    }
  };

  // Загрузка брендов при монтировании компонента
  useEffect(() => {
    fetchBrands();
  }, []);

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
      setBrands([...brands, response.data]);
      setNewBrandName("");
      setSuccess("Бренд успешно добавлен");
      setError(null);
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
      setBrands(brands.map((b) => (b.id === editingBrand.id ? response.data : b)));
      setEditingBrand(null);
      setNewBrandName("");
      setSuccess("Бренд успешно обновлен");
      setError(null);
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
          headers: { Authorization: `Bearer ${token}` } }
        );
        setBrands(brands.filter((b) => b.id !== brandId));
        setSuccess("Бренд успешно удален");
        setError(null);
      } catch (err) {
        setError("Ошибка при удалении бренда: " + (err.response?.data?.detail || err.message));
        setSuccess(null);
      }
    }
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
    </div>
  );
};

export default BrandAdminPage;