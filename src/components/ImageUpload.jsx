import React from 'react';
import { toast } from 'react-toastify';

import { IMAGE_UPLOAD_CONFIG } from '../hooks/config';

import './ImageUpload.css';

const ImageUpload = ({ image, imageUrl, onImageChange, backendUrl, error, setError }) => {
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Проверка размера файла
      if (file.size > IMAGE_UPLOAD_CONFIG.MAX_FILE_SIZE) {
        if (setError) {
          setError(IMAGE_UPLOAD_CONFIG.ERROR_MESSAGES.FILE_TOO_LARGE);
        } else {
          toast.error(IMAGE_UPLOAD_CONFIG.ERROR_MESSAGES.FILE_TOO_LARGE, IMAGE_UPLOAD_CONFIG.TOAST_CONFIG);
        }
        return;
      }

      // Проверка, что файл является изображением
      if (!file.type.startsWith('image/')) {
        if (setError) {
          setError(IMAGE_UPLOAD_CONFIG.ERROR_MESSAGES.INVALID_FORMAT);
        } else {
          toast.error(IMAGE_UPLOAD_CONFIG.ERROR_MESSAGES.INVALID_FORMAT, IMAGE_UPLOAD_CONFIG.TOAST_CONFIG);
        }
        return;
      }

      // Сбрасываем ошибку и обновляем состояние
      if (setError) {
        setError(null);
      }
      onImageChange(file);
    }
  };

  return (
    <div className="image-upload">
      <label>{IMAGE_UPLOAD_CONFIG.ALLOWED_IMAGE_TEXT}</label>
      <input
        type="file"
        accept={IMAGE_UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES} // Используем 'image/*'
        onChange={handleImageChange}
      />
      {imageUrl && !image && (
        <div className="current-image">
          <p>Текущее изображение:</p>
          <img src={`${backendUrl}/${imageUrl}`} alt="Текущее" />
        </div>
      )}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default ImageUpload;