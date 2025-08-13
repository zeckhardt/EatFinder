import React, {useEffect, useState} from "react";
import axios from "axios";
import {useUserId} from "../UserIdContext.tsx";

type Props = {
    osmId: number;
};

const Watch: React.FC<Props> = ({ osmId }) => {
    const userId = useUserId();
    const [watch, setWatch] = useState<string | null>(null);

    useEffect(() => {
        const fetchWatchStatus = async () => {
            try {
                const response = await axios.get(
                    `https://backend-frosty-lake-2293.fly.dev/api/users/${userId}/watch?osmID=${osmId}`,
                    {
                        headers: {
                            "x-api-key": import.meta.env.VITE_BACKEND_API_KEY,
                        },
                    }
                );
                setWatch(response.data.place);
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    if (err.response?.status !== 500) {
                        console.error("Error fetching rating:", err);
                    }
                } else {
                    console.error("Unknown error:", err);
                }
            }
        }
        if (userId) {
            fetchWatchStatus();
        }
    }, [userId, osmId]);

    const handleAddWatch = async () => {
        try {
            const nowISO = new Date().toISOString();
            const response = await axios.post(
                `https://backend-frosty-lake-2293.fly.dev/api/users/${userId}/watch`,
                {
                    osmID: osmId.toString(),
                    tags: [],
                    rating: 0,
                    visitedAt: nowISO,
                    ratedAt: nowISO,
                },
                {
                    headers: {
                        "x-api-key": import.meta.env.VITE_BACKEND_API_KEY,
                    },
                }
            );
            setWatch(response.data.place.osmID);
        } catch (err) {
            console.error("Failed to mark as watched", err);
        }
    };

    return (
        <div>
            {watch ? (
                <span>
                    <img src="/src/assets/watched_icon.jpg" alt="Watch" width="20" height="20"/>
                </span>
            ) : (
                <button onClick={handleAddWatch} style={{ color: '#000' }}>
                    <img src="/src/assets/watch_icon.jpg" alt="Watch" width="20" height="20"/>
                </button>
            )}
        </div>
    );
}

export default Watch;