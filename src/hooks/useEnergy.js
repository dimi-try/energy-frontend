import { useState, useEffect } from 'react';

const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const useProductDetails = (id) => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`${REACT_APP_BACKEND_URL}/energy/${id}`);
                if (!response.ok) {
                    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
                }
                const data = await response.json();
                setProduct(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    return { product, loading, error };
};

export default useProductDetails;
