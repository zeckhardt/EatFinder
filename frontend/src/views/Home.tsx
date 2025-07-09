import '../styles/Home.css'
import AppNavBar from "../components/NavBar.tsx";
import Map from "../components/Map.tsx";
import Table from '../components/Table.tsx';
import React, {useState} from "react";
import axios from 'axios'
import CreateListModal from "../components/CreateListModal.tsx";
import {useUserId} from "../UserIdContext.tsx";
import RemoveListModal from "../components/RemoveListModal.tsx";


const Home: React.FC = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
    const userId = useUserId();

    const handleCreateList = async (name: string) => {
        try {
            const id: string = crypto.randomUUID();
            await axios.post(
                `http://localhost:8080/api/users/${userId}/lists`,
                {
                    id: id,
                    list_name: name,
                    places: []
                },
                {
                    headers: {
                        'x-api-key': import.meta.env.VITE_BACKEND_API_KEY,
                        'Content-Type': 'application/json',
                    }
                }
            );
            window.location.reload();
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

    return (
        <div>
            <AppNavBar />
            <CreateListModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateList}
            />
            <RemoveListModal
                isOpen={isRemoveModalOpen}
                onClose={() => setIsRemoveModalOpen(false)}
            />
            <div className='main-content'>
                <div className='table-wrapper'>
                    <div className='list-button-group'>
                        <button className='add-button button-outline' onClick={() => setIsCreateModalOpen(true)}>+ Add List</button>
                        <button className='remove-button button-outline' onClick={() => setIsRemoveModalOpen(true)}>- Remove List</button>
                    </div>
                    <Table />
                </div>
                <div className='map-wrapper'>
                    <Map />
                </div>
            </div>
        </div>
    )
}

export default Home;