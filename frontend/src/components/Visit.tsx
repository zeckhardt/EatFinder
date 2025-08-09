import React, {useEffect, useState} from "react";
import axios from "axios";
import {useUserId} from "../UserIdContext.tsx";

type Props = {
    osmId: number;
};

const Visit: React.FC<Props> = ({ osmId }) => {
    const userId = useUserId();
    const [visit, setVisit] = useState<string | null>(null);

    useEffect(() => {
        const fetchVisitStatus = async () => {
            try {
                const response = await axios.get(
                    `https://backend-frosty-lake-2293.fly.dev/api/users/${userId}/visit?osmID=${osmId}`,
                    {
                        headers: {
                            "x-api-key": import.meta.env.VITE_BACKEND_API_KEY,
                        },
                    }
                );
                setVisit(response.data.place);
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
            fetchVisitStatus();
        }
    }, [userId, osmId]);

    const handleAddVisit = async () => {
        try {
            const nowISO = new Date().toISOString();
            const response = await axios.post(
                `https://backend-frosty-lake-2293.fly.dev/api/users/${userId}/visit`,
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
            setVisit(response.data.place.osmID);
        } catch (err) {
            console.error("Failed to mark as visited", err);
        }
    };

    return (
        <div>
            {visit ? (
                <span>📍</span>
            ) : (
                <button onClick={handleAddVisit}>Mark as Visited</button>
            )}
        </div>
    );
}

export default Visit;