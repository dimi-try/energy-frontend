import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";

import api from "../../hooks/api";

import Loader from "../../components/Loader";
import Error from "../../components/Error";
import Card from "../../components/Card";
import Button from "../../components/Button";

import "./CategoryAdminPage.css";

const CategoryAdminPage = ({ token }) => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: "" });
  const [editingCategory, setEditingCategory] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Загрузка списка категорий
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/categories/admin/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data);
    } catch (err) {
      setError("Ошибка при загрузке категорий: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    fetchCategories();
  }, [token]);

  // Обработка изменений формы
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategory({ ...newCategory, [name]: value });
  };

  // Добавление новой категории
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) {
      toast.error("Название категории обязательно");
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
      toast.success("Категория успешно добавлена");
    } catch (err) {
      toast.error("Ошибка при добавлении категории: " + (err.response?.data?.detail || err.message));
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
      toast.error("Название категории обязательно");
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
      toast.success("Категория успешно обновлена");
    } catch (err) {
      toast.error("Ошибка при обновлении категории: " + (err.response?.data?.detail || err.message));
    }
  };

  // Отмена редактирования
  const handleCancelEdit = () => {
    setEditingCategory(null);
    setNewCategory({ name: "" });
  };

  // Обработчик повторного запроса данных
  const handleRetry = () => {
    fetchCategories();
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <Card type="container">
        <Error message={error} />
        <Button variant="primary" onClick={handleRetry}>
          Попробовать снова
        </Button>
      </Card>
    );
  }

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

      <h1>Управление категориями</h1>

      {/* Форма для добавления/редактирования категории */}
      <Card type="container">
        <h2>{editingCategory ? "Редактировать категорию" : "Добавить категорию"}</h2>
        <form onSubmit={editingCategory ? handleSaveEdit : handleAddCategory}>
          <input
            type="text"
            name="name"
            value={newCategory.name}
            onChange={handleInputChange}
            placeholder="Название категории"
            maxLength={100}
            required
          />
          <div>
            <Button type="submit" variant="primary">
              {editingCategory ? "Сохранить" : "Добавить"}
            </Button>
            {editingCategory && (
              <Button variant="danger" onClick={handleCancelEdit}>
                Отмена
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Список категорий */}
      <Card type="container">
        <div className="list-container">
          {categories.length > 0 ? (
            categories.map((category) => (
              <Card key={category.id} type="container" className="category-card">
                <div>
                  {category.name}
                </div>
                <div>
                  <Button variant="primary" onClick={() => handleEditCategory(category)}>
                    Редактировать
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <Error message="Категории не найдены" />
          )}
        </div>
      </Card>
    </div>
  );
};

export default CategoryAdminPage;