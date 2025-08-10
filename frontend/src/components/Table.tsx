import React, {useEffect, useState} from "react";
import '../styles/Table.css';
import axios from 'axios';
import {useUserId} from "../UserIdContext.tsx";
import CreateListModal from "./CreateListModal.tsx";

type List = {
    id: string;
    list_name: string;
    places: never[];
}

const Table: React.FC = () => {
    const [lists, setLists] = useState<List[]>([]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isRemoveMode, setIsRemoveMode] = useState(false);
    const userId = useUserId();

    const getLists = async (id: string) => {
        try {
            const apiKey = import.meta.env.VITE_BACKEND_API_KEY;
            const response = await axios.get(`https://backend-frosty-lake-2293.fly.dev/api/users/${id}`, {
                headers: {
                    'x-api-key': apiKey,
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
                    code: error.code,
                    cause: error.cause,
                });
            } else {
                console.error("Unexpected error:", error);
            }
        }
    }

    const handleCreateList = async (name: string) => {
        if (!userId) return;
        try {
            const apiKey = import.meta.env.VITE_BACKEND_API_KEY;
            const id: string = crypto.randomUUID();
            await axios.post(
                `https://backend-frosty-lake-2293.fly.dev/api/users/${userId}/lists`,
                {
                    id: id,
                    list_name: name,
                    places: []
                },
                {
                    headers: {
                        'x-api-key': apiKey,
                        'Content-Type': 'application/json',
                    }
                }
            );
            setIsCreateOpen(false);
            await getLists(userId);
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                console.error("Axios error:", error.message);
            } else {
                console.error("Unexpected error:", error);
            }
        }
    };

    const handleDelete = async (listName: string) => {
        if (!userId) return;
        const confirmed = confirm('Are you sure you want to delete this list?');
        if (!confirmed) return;
        try {
            const apiKey = import.meta.env.VITE_BACKEND_API_KEY;
            await axios.delete(`https://backend-frosty-lake-2293.fly.dev/api/users/${userId}/lists?name=${encodeURIComponent(listName)}`,
                {
                    headers: {
                        'x-api-key': apiKey,
                        'Content-Type': 'application/json',
                    },
                }
            );
            await getLists(userId);
        } catch (error) {
            console.error('Error deleting list:', error);
        }
    };

    useEffect(() => {
        if (userId) {
            getLists(userId);
        }
    }, [userId]);

    return(
        <div className='table-container'>
            <div className="table-header-row">
                <h2>Lists</h2>
                <div className="table-header-actions">
                    <button
                        className="icon-btn icon-btn--primary"
                        aria-label="Add list"
                        title="Add list"
                        onClick={() => setIsCreateOpen(true)}
                    >
                        +
                    </button>
                    <button
                        className={`icon-btn icon-btn--danger ${isRemoveMode ? 'is-active' : ''}`}
                        aria-pressed={isRemoveMode}
                        aria-label="Toggle remove mode"
                        title="Toggle remove mode"
                        onClick={() => setIsRemoveMode(prev => !prev)}
                    >
                        −
                    </button>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Entries</th>
                        {isRemoveMode && <th className="actions-col" aria-label="Actions"></th>}
                    </tr>
                </thead>
                <tbody>
                    {lists.length > 0 ? (
                        lists.map((list) => (
                            <tr key={list.id}>
                                <td>{list.list_name}</td>
                                <td>{list.places?.length ?? 0}</td>
                                {isRemoveMode && (
                                    <td className="actions-col">
                                        <button
                                            className="icon-btn icon-btn--danger"
                                            aria-label={`Remove ${list.list_name}`}
                                            title="Remove list"
                                            onClick={() => handleDelete(list.list_name)}
                                        >
                                            −
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={isRemoveMode ? 3 : 2}>No lists found.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <CreateListModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSubmit={handleCreateList}
            />
        </div>
    );
}

export default Table;