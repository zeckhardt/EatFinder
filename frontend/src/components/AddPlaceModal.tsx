import React, {useEffect, useState} from "react";
import type {OsmElement} from "../types.ts";
import {useUserId} from "../UserIdContext.tsx";
import axios from 'axios';
import {Button, ListGroup, ListGroupItem, Modal, ModalBody, ModalHeader} from "reactstrap";


type List = {
    id: string;
    list_name: string;
    places: {
        osm_id: string,
        osm_type: string,
        long: number,
        lat: number
    }[];
}

type Props = {
    isOpen: boolean;
    onClose: () => void;
    place: OsmElement;
}

const AddToListModal: React.FC<Props> = ({ isOpen, onClose, place }) => {
    const userId = useUserId();
    const [lists, setLists] = useState<List[]>([]);
    const [loading, setLoading] = useState(false);

    const isAlreadyAdded = (list: List) => {
        return Array.isArray(list.places) && list.places.some((p) => p.osm_id === place.id.toString());
    };

    const fetchLists = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`https://backend-frosty-lake-2293.fly.dev/api/users/${userId}`, {
                headers: {
                    'x-api-key': import.meta.env.VITE_BACKEND_API_KEY,
                },
            });
            setLists(response.data.user.lists || []);
        } catch (err) {
            console.error('Error fetching lists:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (listName: string) => {
        try {
            await axios.post(
                `https://backend-frosty-lake-2293.fly.dev/api/users/${userId}/lists/${listName}`,
                    {
                        osm_id: place.id.toString(),
                        osm_type: place.tags?.cuisine ?? "unknown",
                        long: place.lon,
                        lat: place.lat
                    },
                {
                    headers: {
                        'x-api-key': import.meta.env.VITE_BACKEND_API_KEY,
                        'Content-Type': 'application/json',
                    }
                }
            )

            await fetchLists();
        } catch (err) {
            console.error('Error adding place to list:', err);
        }
    }

    useEffect(() => {
        if (isOpen) {
            fetchLists();
        }
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} toggle={onClose}>
            <ModalHeader toggle={onClose}>Add to List</ModalHeader>
            <ModalBody>
                {loading ? (
                    <p>Loading...</p>
                ) : lists.length === 0 ? (
                    <p>No lists found.</p>
                ) : (
                    <ListGroup>
                        {lists.map((list) => (
                            <ListGroupItem
                                key={list.id}
                                className="d-flex justify-content-between align-items-center"
                            >
                                {list.list_name}
                                {isAlreadyAdded(list) ? (
                                    <span className="text-success">✓</span>
                                ) : (
                                    <Button
                                        color="primary"
                                        size="sm"
                                        onClick={() => handleAdd(list.list_name)}
                                    >
                                        +
                                    </Button>
                                )}
                            </ListGroupItem>
                        ))}
                    </ListGroup>
                )}
            </ModalBody>
        </Modal>
    );
}

export default AddToListModal;