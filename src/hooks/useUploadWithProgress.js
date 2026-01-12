import { useState } from 'react';
import api from './api';
import '../components/UploadProgress.css';

/**
 * Хук + функция для загрузки файла с отображением прогресса
 * @returns {Object} { uploadFile, UploadProgressComponent, isUploading, progressData }
 */
export const useUploadWithProgress = () => {
  const [progress, setProgress] = useState(null); // null = не загружаем, иначе {progress, loaded, total}

  const uploadFile = async (file, endpoint) => {
    if (!file) return null;

    const totalBytes = file.size;

    // Показываем прогресс с 0%
    setProgress({ progress: 0, loaded: 0, total: totalBytes });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const loaded = e.loaded;
          const total = e.total || totalBytes; // fallback
          const percent = Math.min(100, Math.round((loaded * 100) / total));

          setProgress({ progress: percent, loaded, total });
        },
      });

      // показываем визуализацию загрузки ста процентов чуть дольше
      await new Promise((r) => setTimeout(r, 3000));
      setProgress(null);

      return response.data.image_url || null;
    } catch (err) {
      console.error('Ошибка загрузки файла:', err);
      setProgress(null);
      throw err;
    }
  };

  // Готовый компонент прогресса
  const UploadProgressComponent = () =>
    progress ? (
      <div className="upload-progress-container">
        <p className="upload-progress-text">Пожалуйста, подождите...</p>
        <div className="upload-progress-bar">
          <div
            className="upload-progress-fill"
            style={{ width: `${progress.progress}%` }}
          />
        </div>
        <p className="upload-progress-info">
          {formatBytes(progress.loaded)} из {formatBytes(progress.total)} (
          {progress.progress}%)
        </p>
      </div>
    ) : null;

  // вспомогательная функция форматирования байт
  const formatBytes = (bytes) => {
    if (!bytes) return '0 байт';
    if (bytes < 1024) return `${bytes} байт`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
  };

  return {
    uploadFile,
    UploadProgressComponent,
    isUploading: !!progress,
    progressData: progress,
  };
};