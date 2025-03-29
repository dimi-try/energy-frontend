import React from 'react';
import { useParams } from 'react-router-dom';
import './Energy.css';
import EnergyCard from '../../components/EnergyCard/EnergyCard';

const ProductDetail = () => {
    const { id } = useParams();

    return (
        <div>
            <EnergyCard id={id} />
        </div>
    );
};

export default ProductDetail;
