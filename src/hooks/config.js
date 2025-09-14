export const IMAGE_UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 МБ
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.heif'], // Разрешенные расширения
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/heif'], // Разрешенные MIME-типы
  ALLOWED_IMAGE_TEXT: 'Фото (необязательно, макс. 10 МБ, форматы: JPG, JPEG, PNG, HEIF): ',
  ERROR_MESSAGES: {
    FILE_TOO_LARGE: 'Файл слишком большой. Максимальный размер: 10 МБ',
    INVALID_FORMAT: 'Недопустимый формат. Разрешены: JPG, JPEG, PNG, HEIF',
  },
  TOAST_CONFIG: {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  },
};