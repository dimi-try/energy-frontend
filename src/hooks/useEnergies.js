import { useState, useEffect } from 'react'; 

const BACKEND_URL = process.env.BACKEND_URL;

// Кастомный хук для получения данных об энергетиках
const useProducts = () => {
    // Состояния: список продуктов, загрузка, ошибки
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Функция для запроса данных с API
        const fetchProducts = async () => {
            try {
                // Запрос к эндпоинту /energies/
                const response = await fetch(`${BACKEND_URL}/energies/`);
                
                // Обработка HTTP-ошибок
                if (!response.ok) {
                    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
                }

                // Парсинг JSON-ответа
                const data = await response.json();

                // Преобразование данных:
                // - Используем brand.name вместо brand_id
                // - Добавляем другие поля из ответа API
                const formattedData = data.map((item) => ({
                    id: item.id,
                    brand: item.brand.name,
                    name: item.name,
                    // Дополнительные поля из эндпоинта (можно раскомментировать при необходимости):
                    description: item.description,
                    category: item.category.name,
                    image: item.image_url,
                    energyType: item.energy_type,
                    brandId: item.brand_id,
                    categoryId: item.category_id
                }));

                setProducts(formattedData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return { products, loading, error };
};

export default useProducts;