import React, {useEffect, useState} from "react";
import '../styles/Table.css';
import axios from 'axios';
import {useUserId} from "../UserIdContext.tsx";
import CreateListModal from "./CreateListModal.tsx";
import { useMapNavigation } from "../views/Home.tsx";

// Import formatChip function from Chips.tsx
const formatChip = (text: string): string => {
    const words = text.split('_');
    const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    return capitalizedWords.join(' ');
};

type Place = {
    osm_id: string;
    osm_type: string;
    long: number;
    lat: number;
};

type OsmPlace = {
    id: number;
    lat: number;
    lon: number;
    tags?: {
        name?: string;
        cuisine?: string;
        website?: string;
    };
};


type List = {
    id: string;
    list_name: string;
    places: Place[];
}

const Table: React.FC = () => {
    const [lists, setLists] = useState<List[]>([]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isRemoveMode, setIsRemoveMode] = useState(false);
    const [expandedLists, setExpandedLists] = useState<Set<string>>(new Set());
    const [placeNames, setPlaceNames] = useState<Map<string, string>>(new Map());
    const [placeLocations, setPlaceLocations] = useState<Map<string, string>>(new Map());
    const userId = useUserId();
    const { navigateToLocation } = useMapNavigation();

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

    const fetchPlaceName = async (osmId: string) => {
        try {
            const overpassQuery = `
                [out:json][timeout:25];
                node(${osmId});
                out;
            `;

            const response = await fetch("https://overpass-api.de/api/interpreter", {
                method: "POST",
                body: overpassQuery,
                headers: { "Content-Type": "text/plain" },
            });

            const data = await response.json();
            if (data.elements && data.elements.length > 0) {
                const place = data.elements[0] as OsmPlace;
                const name = place.tags?.name || `Unknown (${osmId})`;
                setPlaceNames(prev => new Map(prev).set(osmId, name));
            }
        } catch (error) {
            console.error(`Error fetching place name for ${osmId}:`, error);
            setPlaceNames(prev => new Map(prev).set(osmId, `Error loading (${osmId})`));
        }
    };

    const fetchLocationName = async (lat: number, lon: number, osmId: string) => {
        try {
            // Use Nominatim reverse geocoding service
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'EatFinder/1.0'
                    }
                }
            );
            
            const data = await response.json();
            if (data.address) {
                const city = data.address.city || data.address.town || data.address.village || data.address.county || 'Unknown location';
                setPlaceLocations(prev => new Map(prev).set(osmId, city));
            } else {
                setPlaceLocations(prev => new Map(prev).set(osmId, 'Unknown location'));
            }
        } catch (error) {
            console.error(`Error fetching location for ${osmId}:`, error);
            setPlaceLocations(prev => new Map(prev).set(osmId, 'Error loading location'));
        }
    };

    const fetchPlaceDataForList = async (places: Place[]) => {
        const promises = places.map(place => {
            const promises = [];
            
            // Fetch place name if not already cached
            if (!placeNames.has(place.osm_id)) {
                promises.push(fetchPlaceName(place.osm_id));
            }
            
            // Fetch location if not already cached
            if (!placeLocations.has(place.osm_id)) {
                promises.push(fetchLocationName(place.lat, place.long, place.osm_id));
            }
            
            return Promise.all(promises);
        });
        
        await Promise.all(promises);
    };

    const handleLocationClick = (place: Place) => {
        navigateToLocation(place.lat, place.long, parseInt(place.osm_id));
    };

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

    const toggleExpanded = async (listId: string) => {
        const newExpanded = !expandedLists.has(listId);
        setExpandedLists(prev => {
            const newSet = new Set(prev);
            if (newExpanded) {
                newSet.add(listId);
            } else {
                newSet.delete(listId);
            }
            return newSet;
        });

        // Fetch place data when expanding
        if (newExpanded) {
            const list = lists.find(l => l.id === listId);
            if (list && list.places.length > 0) {
                await fetchPlaceDataForList(list.places);
            }
        }
    };

    const isExpanded = (listId: string) => expandedLists.has(listId);

    const getPlaceName = (osmId: string) => {
        return placeNames.get(osmId) || `Loading... (${osmId})`;
    };

    const getPlaceLocation = (osmId: string) => {
        return placeLocations.get(osmId) || 'Loading location...';
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
                            <React.Fragment key={list.id}>
                                <tr className={`list-row ${isExpanded(list.id) ? 'expanded' : ''}`}>
                                    <td>
                                        <div className="list-name-cell">
                                            <button
                                                className={`expand-btn ${isExpanded(list.id) ? 'expanded' : ''}`}
                                                onClick={() => toggleExpanded(list.id)}
                                                aria-label={`${isExpanded(list.id) ? 'Collapse' : 'Expand'} ${list.list_name}`}
                                            >
                                                {isExpanded(list.id) ? '▼' : '▶'}
                                            </button>
                                            <span>{list.list_name}</span>
                                        </div>
                                    </td>
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
                                {isExpanded(list.id) && (
                                    <tr className="places-row">
                                        <td colSpan={isRemoveMode ? 3 : 2}>
                                            <div className="places-container">
                                                {list.places && list.places.length > 0 ? (
                                                    list.places.map((place, index) => (
                                                        <div key={index} className="place-item">
                                                            <button 
                                                                className="place-name-clickable"
                                                                onClick={() => handleLocationClick(place)}
                                                                title="Click to view on map"
                                                            >
                                                                {getPlaceName(place.osm_id)}
                                                            </button>
                                                            <div className="place-cuisine">Cuisine: {formatChip(place.osm_type)}</div>
                                                            <div className="place-location">Location: {getPlaceLocation(place.osm_id)}</div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="no-places">No places in this list yet.</div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
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