import React from 'react';
import { toast } from 'react-toastify';

import { IMAGE_UPLOAD_CONFIG } from '../hooks/config';

import './ImageUpload.css';

const ImageUpload = ({ image, imageUrl, onImageChange, backendUrl, error, setError }) => {
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Логирование для отладки
      const ext = (file.name.match(/\.([^.]+)$/)?.[1] || '').toLowerCase();
      console.log(`File: ${file.name}, Extension: ${ext}, MIME Type: ${file.type}, Size: ${file.size} bytes`);

      // Проверка размера файла
      if (file.size > IMAGE_UPLOAD_CONFIG.MAX_FILE_SIZE) {
        const errorMsg = IMAGE_UPLOAD_CONFIG.ERROR_MESSAGES.FILE_TOO_LARGE;
        console.log(`Error: ${errorMsg}`);
        if (setError) {
          setError(errorMsg);
        } else {
          toast.error(errorMsg, IMAGE_UPLOAD_CONFIG.TOAST_CONFIG);
        }
        return;
      }

      // Проверка расширения и MIME-типа
      const isValidExtension = IMAGE_UPLOAD_CONFIG.ALLOWED_EXTENSIONS.includes(`.${ext}`);
      const isValidMimeType = IMAGE_UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type);
      if (!isValidExtension && !isValidMimeType) {
        const errorMsg = `${IMAGE_UPLOAD_CONFIG.ERROR_MESSAGES.INVALID_FORMAT} (Обнаружено: ext=${ext}, mime=${file.type})`;
        console.log(`Error: ${errorMsg}`);
        if (setError) {
          setError(errorMsg);
        } else {
          toast.error(errorMsg, IMAGE_UPLOAD_CONFIG.TOAST_CONFIG);
        }
        return;
      }

      // Сбрасываем ошибку и обновляем состояние
      if (setError) {
        setError(null);
      }
      console.log(`File ${file.name} passed validation, proceeding to upload`);
      onImageChange(file);
    }
  };

  return (
    <div className="image-upload">
      <label>{IMAGE_UPLOAD_CONFIG.ALLOWED_IMAGE_TEXT}</label>
      <input
        type="file"
        accept={IMAGE_UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES.join(',')}
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