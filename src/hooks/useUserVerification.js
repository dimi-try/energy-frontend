import { useState } from 'react';

const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const useUserVerification = (telegram) => {
    const [result, setResult] = useState(null);

    const verifyUser = async (authorizationData) => {
        try {
            const response = await fetch(`${REACT_APP_BACKEND_URL}/auth/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(authorizationData),
            });

            const data = await response.json();
            if (data.success) {
                setResult('Verification successful!');
            } else {
                setResult(`Verification failed: ${data.message}`);
            }
        } catch (error) {
            console.error('Error during verification:', error);
            setResult('An error occurred during verification.');
        }
    };

    return { result, verifyUser };
};
