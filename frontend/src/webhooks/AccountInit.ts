import axios from 'axios';

export const syncUserToBackend = async (user: any) => {
    try {
        await axios.post(
            'http://localhost:8080/api/users',
            { id: user.id },
            {
                headers: {
                    'x-api-key': import.meta.env.VITE_BACKEND_API_KEY,
                    'Content-Type': 'application/json',
                },
            }
        );
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 409) {
            console.log('User already exists, ignoring 409');
        } else {
            console.error('Failed to sync user after signup:', error);
        }
    }
};