import React, { useState, useEffect } from "react";
import { useUserId } from "../UserIdContext.tsx";
import axios from "axios";

type Props = {
    osmId: number;
};

const Rating: React.FC<Props> = ({ osmId }) => {
    const userId = useUserId();
    const [rating, setRating] = useState<number | null>(null);

    useEffect(() => {
        const fetchRating = async () => {
            try {
                const response = await axios.get(
                    `https://backend-frosty-lake-2293.fly.dev/api/users/${userId}/ratings?osmID=${osmId}`,
                    {
                        headers: {
                            "x-api-key": import.meta.env.VITE_BACKEND_API_KEY,
                        },
                    }
                );
                setRating(Number(response.data.rating.rating));
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    if (err.response?.status !== 500) {
                        console.error("Error fetching rating:", err);
                    }
                } else {
                    console.error("Unknown error:", err);
                }
            }
        };

        if (userId) {
            fetchRating();
        }
    }, [userId, osmId]);

    const formatRating = (rating: number | null): string => {
        if (rating === null) {
            return "";
        }

        switch (rating) {
            case 0:
                return "📍";
            case -2:
                return "❌";
            case -1:
                return "⚠️";
            case 1:
                return "✅";
            case 2:
                return "🔥";
            default:
                return "";
        }
    };

    return <>{formatRating(rating)}</>;
};

export default Rating;
