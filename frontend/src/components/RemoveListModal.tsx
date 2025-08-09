import React, {useEffect, useState} from 'react';
import {Button, ListGroup, ListGroupItem, Modal, ModalBody, ModalHeader, Spinner} from "reactstrap";
import {useUserId} from "../UserIdContext.tsx";
import axios from 'axios';

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

type List = {
    id: string;
    list_name: string;
    places: never[];
}


const RemoveListModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {

    const userId = useUserId();
    const [lists, setLists] = useState<List[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchLists = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`https://backend-frosty-lake-2293.fly.dev/api/users/${userId}`, {
                headers: {
                    'x-api-key': import.meta.env.VITE_BACKEND_API_KEY,
                },
            });
            setLists(response.data.user.lists || []);
        } catch (error) {
            console.error('Error fetching lists:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (listName: string) => {
        const confirmed = confirm('Are you sure you want to delete this list?');
        if (!confirmed) return;

        try {
            await axios.delete(`https://backend-frosty-lake-2293.fly.dev/api/users/${userId}/lists?name=${listName}`, {
                headers: {
                    'x-api-key': import.meta.env.VITE_BACKEND_API_KEY,
                },
            });
            await fetchLists(); // refresh after deletion
        } catch (error) {
            console.error('Error deleting list:', error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchLists();
        }
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} toggle={onClose}>
            <ModalHeader toggle={onClose}>Remove a List</ModalHeader>
            <ModalBody>
                {loading ? (
                    <div className="d-flex justify-content-center py-3">
                        <Spinner color="primary" />
                    </div>
                ) : lists.length === 0 ? (
                    <p>No lists found.</p>
                ) : (
                    <ListGroup>
                        {lists.map((list) => (
                            <ListGroupItem key={list.id} className="d-flex justify-content-between align-items-center">
                                {list.list_name}
                                <Button color="danger" size="sm" onClick={() => handleDelete(list.list_name)}>
                                    &minus;
                                </Button>
                            </ListGroupItem>
                        ))}
                    </ListGroup>
                )}
            </ModalBody>
        </Modal>
    );
};

export default RemoveListModal;