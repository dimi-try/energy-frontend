import React from 'react';
import { toast } from 'react-toastify';

import api from '../hooks/api';
import { IMAGE_UPLOAD_CONFIG } from '../hooks/config';

import './AvatarUpload.css';

const AvatarUpload = ({ image, imageUrl, onImageChange, backendUrl, userId, token, onAvatarUpdated, isEditable = false  }) => {
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Проверка размера файла
      if (file.size > IMAGE_UPLOAD_CONFIG.MAX_FILE_SIZE) {
        toast.error(IMAGE_UPLOAD_CONFIG.ERROR_MESSAGES.FILE_TOO_LARGE, IMAGE_UPLOAD_CONFIG.TOAST_CONFIG);
        return;
      }

      // Проверка, что файл является изображением
      if (!file.type.startsWith('image/')) {
        toast.error(IMAGE_UPLOAD_CONFIG.ERROR_MESSAGES.INVALID_FORMAT, IMAGE_UPLOAD_CONFIG.TOAST_CONFIG);
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
        toast.success('Аватарка успешно обновлена!', IMAGE_UPLOAD_CONFIG.TOAST_CONFIG);
      } catch (err) {
        // Сбрасываем локальное изображение при ошибке
        onImageChange(null);
        toast.error(err.response?.data?.detail || 'Ошибка при обновлении аватарки', IMAGE_UPLOAD_CONFIG.TOAST_CONFIG);
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
        {isEditable && (
          <label className="avatar-upload-button">
            <span className="upload-icon">+</span>
            <input
              type="file"
              accept={IMAGE_UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES}
              onChange={handleImageChange}
              hidden
            />
          </label>
        )}
      </div>
    </div>
  );
};

export default AvatarUpload;