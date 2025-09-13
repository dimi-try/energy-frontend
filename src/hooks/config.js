export const IMAGE_UPLOAD_CONFIG = {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 МБ в байтах
    ALLOWED_IMAGE_TYPES: ['image/*'],
    ALLOWED_IMAGE_TEXT: 'Фото (необязательно, макс. 10 МБ, любой формат изображения): ',
    ERROR_MESSAGES: {
      FILE_TOO_LARGE: 'Файл слишком большой. Максимальный размер: 5 МБ',
      INVALID_FORMAT: 'Недопустимый формат. Разрешены: JPG, JPEG, PNG, HEIC, HEIF',
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