import React from 'react';
import { toast } from 'react-toastify';
import './ImageUpload.css';

const ImageUpload = ({ image, imageUrl, onImageChange, backendUrl, error, setError }) => {
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Проверка размера файла (5 МБ)
      if (file.size > 5 * 1024 * 1024) {
        if (setError) {
          setError('Файл слишком большой. Максимальный размер: 5 МБ');
        } else {
          toast.error('Файл слишком большой. Максимальный размер: 5 МБ', {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
        return;
      }

      // Проверка формата файла
      const allowedTypes = ['image/jpeg', 'image/png', 'image/heic'];
      if (!allowedTypes.includes(file.type)) {
        if (setError) {
          setError('Недопустимый формат. Разрешены: JPG, JPEG, PNG, HEIC');
        } else {
          toast.error('Недопустимый формат. Разрешены: JPG, JPEG, PNG, HEIC', {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
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
      <label>Фото (необязательно, макс. 5 МБ, JPG/JPEG/PNG/HEIC):</label>
      <input
        type="file"
        accept="image/jpeg,image/png,image/heic"
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