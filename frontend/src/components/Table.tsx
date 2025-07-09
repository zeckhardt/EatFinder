import React, {useEffect, useState} from "react";
import '../styles/Table.css';
import axios from 'axios';
import {useUserId} from "../UserIdContext.tsx";

type List = {
    id: string;
    list_name: string;
    places: never[];
}

const Table: React.FC = () => {
    const [lists, setLists] = useState<List[]>([]);
    const userId = useUserId();

    const getLists = async (id: string) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/users/${id}`, {
                headers: {
                    'x-api-key': import.meta.env.VITE_BACKEND_API_KEY,
                    'Content-Type': 'application/json',
                },
            });

            const userLists = response.data.user.lists;

            if (Array.isArray(userLists)) {
                setLists(userLists);
            } else {
                setLists([]);
            }

        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                console.error("Axios error:", {
                    message: error.message,
                    status: error.response?.status,
                    data: error.response?.data,
                    url: error.config?.url,
                });
            } else {
                console.error("Unexpected error:", error);
            }
        }
    }

    useEffect(() => {
        if (userId) {
            getLists(userId);
        }
    }, [userId]);

    return(
        <div className='table-container'>
            <h2>Lists</h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Entries</th>
                    </tr>
                </thead>
                <tbody>
                    {lists.length > 0 ? (
                        lists.map((list, index) => (
                            <tr key={index}>
                                <td>{list.list_name}</td>
                                <td>{list.places?.length ?? 0}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={2}>No lists found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default Table;