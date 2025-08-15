import React, { useState, useEffect } from "react";
import api from "../../hooks/api";
import "./CategoryAdminPage.css";

const CategoryAdminPage = ({ token }) => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: "" });
  const [editingCategory, setEditingCategory] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Загрузка списка категорий
  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories/admin/");
      setCategories(response.data);
    } catch (err) {
      setError("Ошибка при загрузке категорий: " + (err.response?.data?.detail || err.message));
    }
  };

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    fetchCategories();
  }, []);

  // Обработка изменений формы
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategory({ ...newCategory, [name]: value });
  };

  // Добавление новой категории
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) {
      setError("Название категории обязательно");
      return;
    }
    try {
      const response = await api.post(
        "/categories/",
        { name: newCategory.name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCategories([...categories, response.data]);
      setNewCategory({ name: "" });
      setSuccess("Категория успешно добавлена");
      setError(null);
    } catch (err) {
      setError("Ошибка при добавлении категории: " + (err.response?.data?.detail || err.message));
      setSuccess(null);
    }
  };

  // Начало редактирования категории
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategory({ name: category.name });
  };

  // Сохранение изменений категории
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) {
      setError("Название категории обязательно");
      return;
    }
    try {
      const response = await api.put(
        `/categories/${editingCategory.id}`,
        { name: newCategory.name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCategories(categories.map((c) => (c.id === editingCategory.id ? response.data : c)));
      setEditingCategory(null);
      setNewCategory({ name: "" });
      setSuccess("Категория успешно обновлена");
      setError(null);
    } catch (err) {
      setError("Ошибка при обновлении категории: " + (err.response?.data?.detail || err.message));
      setSuccess(null);
    }
  };

  // Отмена редактирования
  const handleCancelEdit = () => {
    setEditingCategory(null);
    setNewCategory({ name: "" });
    setError(null);
  };

  return (
    <div className="category-admin-page">
      <h1>Управление категориями</h1>

      {/* Форма для добавления/редактирования категории */}
      <form onSubmit={editingCategory ? handleSaveEdit : handleAddCategory}>
        <input
          type="text"
          name="name"
          value={newCategory.name}
          onChange={handleInputChange}
          placeholder="Название категории"
          maxLength={100}
        />
        <button type="submit">{editingCategory ? "Сохранить" : "Добавить"}</button>
        {editingCategory && (
          <button type="button" onClick={handleCancelEdit}>
            Отмена
          </button>
        )}
      </form>

      {/* Сообщения об ошибках и успехе */}
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      {/* Список категорий */}
      <ul className="category-list">
        {categories.map((category) => (
          <li key={category.id}>
            <span>{category.name}</span>
            <div>
              <button onClick={() => handleEditCategory(category)}>Редактировать</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryAdminPage;