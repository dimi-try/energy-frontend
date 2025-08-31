import React from 'react';
import { toast } from 'react-toastify';
import api from '../hooks/api';
import './AvatarUpload.css';

const AvatarUpload = ({ image, imageUrl, onImageChange, backendUrl, userId, token, onAvatarUpdated }) => {
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Проверка размера файла (5 МБ)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Файл слишком большой. Максимальный размер: 5 МБ', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }

      // Проверка формата файла
      const allowedTypes = ['image/jpeg', 'image/png', 'image/heic'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Недопустимый формат. Разрешены: JPG, JPEG, PNG, HEIC', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }

      // Устанавливаем локальное изображение для предпросмотра
      onImageChange(file);

      try {
        // Загрузка изображения на сервер
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await api.post('/users/upload-image/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });

        let { image_url } = uploadRes.data;
        console.log('Загруженный image_url:', image_url); // Логирование для отладки

        // Удаляем начальные слеши для корректного формирования URL
        image_url = image_url.replace(/^\/+/, '');

        // Обновление профиля с новым image_url
        const updateRes = await api.put(`/users/${userId}/profile`, { image_url });

        console.log('Обновленный профиль:', updateRes.data); // Логирование для отладки

        // Вызываем onAvatarUpdated для обновления профиля
        onAvatarUpdated(updateRes.data);
        toast.success('Аватарка успешно обновлена!', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } catch (err) {
        // Сбрасываем локальное изображение при ошибке
        onImageChange(null);
        toast.error(err.response?.data?.detail || 'Ошибка при обновлении аватарки', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        console.error('Ошибка загрузки:', err.response?.data || err.message); // Логирование ошибки
      }
    }
  };

  // Формируем URL для отображения изображения
  const displayImageUrl = imageUrl ? `${backendUrl}/${imageUrl.replace(/^\/+/, '')}` : null;

  return (
    <div className="avatar-upload">
      <div className="avatar-container">
        {image || imageUrl ? (
          <img
            src={image ? URL.createObjectURL(image) : displayImageUrl}
            alt="Аватар"
            className="avatar-image"
          />
        ) : (
          <div className="avatar-placeholder">
            
          </div>
        )}
        <label className="avatar-upload-button">
          <span className="upload-icon">+</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/heic"
            onChange={handleImageChange}
            hidden
          />
        </label>
      </div>
    </div>
  );
};

export default AvatarUpload;