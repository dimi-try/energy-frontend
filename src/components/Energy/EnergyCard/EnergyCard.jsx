import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useEnergyDetails from '../../../hooks/useEnergyDetails';
import './EnergyCard.css';

const ProductDetail = () => {
    const { id } = useParams();
    const { product, loading, error } = useEnergyDetails(id);

    if (loading) {
        return <div>Загрузка...</div>;
    }

    if (error) {
        return <div>Ошибка: {error}</div>;
    }

    if (!product) {
        return <div>Продукт не найден.</div>;
    }

    return (
        <div className="product-card">
            <h2 className="product-name">{product.name}</h2>
            <p className="product-brand">Бренд: {product.brand.name}</p>
            <p className="product-rating">Рейтинг: {product.rating || 'Нет рейтинга'}</p>
            <div className="product-description">Описание: {product.description}</div>
        </div>
    );
};

export default ProductDetail;
