import React from 'react';
import Card from '../../components/EnergiesCard/EnergiesCard';
import useEnergies from '../../../hooks/useEnergies';
import './Energies.css';

// Компонент для отображения списка энергетиков
const EnergyList = () => {
    // Получаем данные из хука
    const { products, loading, error } = useEnergies();

    // Состояние загрузки
    if (loading) {
        return <div>Загрузка...</div>;
    }

    // Обработка ошибок
    if (error) {
        return <div>Ошибка: {error}</div>;
    }

    // Рендер списка
    return (
        <div className="product-list">
            {products.map((product) => (
                <Card 
                    key={product.id}
                    id={product.id} 
                    brand={product.brand} 
                    name={product.name} 
                    // Рейтинг отсутствует в API - требуется доработка бекенда
                    rating={product.rating || 'No rating'} 
                    
                    // Если нужно использовать другие поля из API:
                    description={product.description}
                    category={product.category}
                    image={product.image}
                />
            ))}
        </div>
    );
};

export default EnergyList;